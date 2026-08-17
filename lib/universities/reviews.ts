import { z } from 'zod';
import rawReviewData from '@/data/universities/reviews.json';

const namedAuthorSchema = z.object( {
  kind: z.literal( 'named' ),
  displayName: z.string().trim().min( 1 ).max( 80 ),
} ).strict();

const anonymousAuthorSchema = z.object( {
  kind: z.literal( 'anonymous' ),
} ).strict();

export const publicUniversityReviewSchema = z.object( {
  id: z.string().regex( /^review-[a-z0-9-]+$/ ),
  sourceIssueNumber: z.number().int().positive(),
  author: z.discriminatedUnion( 'kind', [ namedAuthorSchema, anonymousAuthorSchema ] ),
  studyStartYear: z.string().regex( /^\d{4}$/ ),
  studyEndYear: z.union( [ z.string().regex( /^\d{4}$/ ), z.literal( '至今' ) ] ),
  studyStage: z.enum( [ '本科', '硕士', '博士', '博士后', '教职' ] ),
  studyProgram: z.string().trim().min( 1 ).max( 160 ),
  rating: z.number().min( 1 ).max( 5 ).multipleOf( .5 ),
  pros: z.string().trim().max( 2000 ).default( '' ),
  cons: z.string().trim().max( 2000 ).default( '' ),
  body: z.string().trim().min( 1 ).max( 4000 ),
  images: z.array( z.object( {
    src: z.string().regex( /^\/contributions\/universities\/[a-z0-9-]+\/review-[a-z0-9-]+\/[1-5]\.webp$/ ),
    caption: z.string().trim().max( 200 ),
  } ).strict() ).max( 5 ),
} ).strict();

export const universityReviewDataSchema = z.object( {
  schemaVersion: z.literal( 1 ),
  universities: z.record( z.string().regex( /^[a-z0-9-]+$/ ), z.array( publicUniversityReviewSchema ) ),
} ).strict().superRefine( ( data, context ) => {
  const reviewIds = new Set<string>();
  const sourceIssues = new Set<number>();
  Object.values( data.universities ).flat().forEach( ( review, index ) => {
    if ( reviewIds.has( review.id ) )
    {
      context.addIssue( { code: 'custom', path: [ 'universities', index, 'id' ], message: `重复的评价 ID：${review.id}` } );
    }
    if ( sourceIssues.has( review.sourceIssueNumber ) )
    {
      context.addIssue( { code: 'custom', path: [ 'universities', index, 'sourceIssueNumber' ], message: `Issue #${review.sourceIssueNumber} 已经处理过。` } );
    }
    reviewIds.add( review.id );
    sourceIssues.add( review.sourceIssueNumber );
  } );
} );

export type PublicUniversityReview = z.infer<typeof publicUniversityReviewSchema>;
export type UniversityReviewData = z.infer<typeof universityReviewDataSchema>;

export function parseUniversityReviewData( value: unknown )
{
  return universityReviewDataSchema.parse( value );
}
export function calculateAverageRating( reviews: PublicUniversityReview[] )
{
  if ( reviews.length === 0 ) return null;
  const average = reviews.reduce( ( total, review ) => total + review.rating, 0 ) / reviews.length;
  return Math.round( average * 10 ) / 10;
}

export function displayReviewAuthor( review: PublicUniversityReview )
{
  return review.author.kind === 'anonymous' ? '匿名投稿者' : review.author.displayName;
}

const reviewData = parseUniversityReviewData( rawReviewData );

export function getUniversityReviews( universitySlug: string )
{
  return reviewData.universities[ universitySlug ] ?? [];
}

export function getUniversitySlugsWithReviews()
{
  return new Set( Object.entries( reviewData.universities ).filter( ( [ , reviews ] ) => reviews.length > 0 ).map( ( [ slug ] ) => slug ) );
}
