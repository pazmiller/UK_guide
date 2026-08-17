import assert from 'node:assert/strict';
import { test } from 'node:test';
import { contributionSubmissionSchema, type ContributionSubmission } from '../lib/contributions/schema';
import { materializeUniversityReview, upsertUniversityReview } from '../lib/universities/materializeReview';
import { getUniversityBySlug, UNIVERSITY_CATALOG } from '../lib/universities/catalog';
import { calculateAverageRating, displayReviewAuthor, parseUniversityReviewData } from '../lib/universities/reviews';

function submission( overrides: Partial<ContributionSubmission> ): ContributionSubmission
{
  return contributionSubmissionSchema.parse( {
    version: 1,
    type: 'university',
    intent: 'add',
    region: 'uk',
    name: 'University College London',
    city: '',
    details: '真实的整体评价。',
    universitySlug: 'ucl',
    studyYear: '2022–2025',
    studyStartYear: '2022',
    studyEndYear: '2025',
    studyStage: '硕士',
    studyProgram: 'MSc Testing',
    universityPros: '图书馆和导师资源充足。',
    universityCons: '行政回复速度偏慢。',
    rating: 4.5,
    discloseSubmitterName: true,
    submitterName: 'Miller',
    imageKeys: [],
    imageCaptions: [],
    imageRightsConfirmed: false,
    ...overrides,
  } );
}

test( 'every university has a Chinese display name for its dossier', () =>
{
  assert.equal( UNIVERSITY_CATALOG.length, 75 );
  UNIVERSITY_CATALOG.forEach( university => assert.match( university.chineseName, /\p{Script=Han}/u ) );
  assert.equal( getUniversityBySlug( 'exeter' )?.chineseName, '埃克塞特大学' );
} );

test( 'three accepted submissions retain attribution and calculate an equal-weight average', () =>
{
  const accepted = [
    materializeUniversityReview( submission( {} ), 41 ),
    materializeUniversityReview( submission( {
      rating: 3.5,
      discloseSubmitterName: false,
      submitterName: '',
      studyStage: '本科',
      studyProgram: 'Architecture',
    } ), 42 ),
    materializeUniversityReview( submission( {
      rating: 5,
      submitterName: 'Alice',
      studyStartYear: '2020',
      studyEndYear: '2023',
      studyYear: '2020–2023',
      studyStage: '博士',
      studyProgram: 'PhD Testing',
    } ), 43 ),
  ];

  const data = accepted.reduce(
    ( current, item ) => upsertUniversityReview( current, item.universitySlug, item.review ),
    parseUniversityReviewData( { schemaVersion: 1, universities: {} } ),
  );
  const reviews = data.universities.ucl;

  assert.equal( reviews.length, 3 );
  assert.equal( calculateAverageRating( reviews ), 4.3 );
  assert.deepEqual( reviews.map( displayReviewAuthor ), [ 'Miller', '匿名投稿者', 'Alice' ] );
  assert.deepEqual( reviews.map( review => review.rating ), [ 4.5, 3.5, 5 ] );
  assert.deepEqual( reviews[ 1 ].author, { kind: 'anonymous' } );
} );
test( 'materialization keeps image captions paired with deterministic public paths', () =>
{
  const result = materializeUniversityReview( submission( {
    imageKeys: [ 'incoming/2026-08-16/example.jpg' ],
    imageCaptions: [ '图书馆二楼自习区' ],
    imageRightsConfirmed: true,
  } ), 44 );

  assert.deepEqual( result.imageDestinations, [ '/contributions/universities/ucl/review-44/1.webp' ] );
  assert.deepEqual( result.review.images, [ {
    src: '/contributions/universities/ucl/review-44/1.webp',
    caption: '图书馆二楼自习区',
  } ] );
} );

test( 'materialization preserves the good, bad, and overall review sections', () =>
{
  const result = materializeUniversityReview( submission( {} ), 47 );

  assert.equal( result.review.pros, '图书馆和导师资源充足。' );
  assert.equal( result.review.cons, '行政回复速度偏慢。' );
  assert.equal( result.review.body, '真实的整体评价。' );
} );

test( 're-running one Issue replaces its review instead of changing the average twice', () =>
{
  const original = materializeUniversityReview( submission( { rating: 3.5 } ), 45 );
  const updated = materializeUniversityReview( submission( { rating: 4.5 } ), 45 );
  const empty = parseUniversityReviewData( { schemaVersion: 1, universities: {} } );
  const once = upsertUniversityReview( empty, original.universitySlug, original.review );
  const twice = upsertUniversityReview( once, updated.universitySlug, updated.review );

  assert.equal( twice.universities.ucl.length, 1 );
  assert.equal( twice.universities.ucl[ 0 ].rating, 4.5 );
} );

test( 'an anonymous public author cannot contain a display name', () =>
{
  assert.throws( () => parseUniversityReviewData( {
    schemaVersion: 1,
    universities: {
      ucl: [ {
        ...materializeUniversityReview( submission( { discloseSubmitterName: false, submitterName: '' } ), 46 ).review,
        author: { kind: 'anonymous', displayName: 'should not leak' },
      } ],
    },
  } ) );
} );
