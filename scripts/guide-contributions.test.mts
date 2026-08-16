import assert from 'node:assert/strict';
import { test } from 'node:test';
import { contributionSubmissionSchema } from '../lib/contributions/schema';
import {
  materializeGuideContribution,
  parseGuideContributionData,
  upsertGuideContribution,
} from '../lib/guideContributions';

function tipSubmission()
{
  return contributionSubmissionSchema.parse( {
    version: 1,
    type: 'tip',
    intent: 'add',
    region: 'uk',
    name: '雨天进博物馆的小技巧',
    city: 'London',
    details: '热门博物馆下雨时排队更长，提前预约并准备防水外套。',
    sourceUrl: 'https://example.com/booking',
    imageKeys: [ 'incoming/guide/rain.jpg' ],
    imageRightsConfirmed: true,
  } );
}

test( 'materializes a routed Guide entry without rewriting it', () =>
{
  const submission = tipSubmission();
  const guide = materializeGuideContribution( submission, 51 );
  assert.equal( guide.title, submission.name );
  assert.equal( guide.body, submission.details );
  assert.equal( guide.sourceUrl, submission.sourceUrl );
  assert.deepEqual( guide.images, [ '/contributions/51/1.webp' ] );
} );

test( 're-running an Issue replaces the same Guide entry', () =>
{
  const original = materializeGuideContribution( tipSubmission(), 52 );
  const current = upsertGuideContribution(
    parseGuideContributionData( { schemaVersion: 1, guides: [] } ),
    original,
  );
  const updated = { ...original, body: '更新后的审核内容。' };
  const next = upsertGuideContribution( current, updated );
  assert.equal( next.guides.length, 1 );
  assert.equal( next.guides[ 0 ].body, '更新后的审核内容。' );
} );
