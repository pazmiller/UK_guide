import { contributionSubmissionSchema, type ContributionSubmission } from '@/lib/contributions/schema';
import { getUniversityBySlug } from '@/lib/universities/catalog';
import {
  parseUniversityReviewData,
  publicUniversityReviewSchema,
  type PublicUniversityReview,
  type UniversityReviewData,
} from '@/lib/universities/reviews';

export type MaterializedUniversityReview = {
  universitySlug: string;
  review: PublicUniversityReview;
  imageDestinations: string[];
};

export function materializeUniversityReview( input: ContributionSubmission, sourceIssueNumber: number ): MaterializedUniversityReview
{
  const submission = contributionSubmissionSchema.parse( input );
  if ( submission.type !== 'university' ) throw new Error( 'Only university submissions can be materialized as university reviews.' );
  if ( submission.universitySlug === 'other' || !getUniversityBySlug( submission.universitySlug ) )
  {
    throw new Error( 'University submission needs a catalog-backed universitySlug before it can be processed.' );
  }
  if ( !Number.isInteger( sourceIssueNumber ) || sourceIssueNumber <= 0 ) throw new Error( 'A positive GitHub Issue number is required.' );

  const reviewId = `review-${sourceIssueNumber}`;
  const imageDestinations = submission.imageKeys.map(
    ( _, index ) => `/contributions/universities/${submission.universitySlug}/${reviewId}/${index + 1}.webp`,
  );
  const review = publicUniversityReviewSchema.parse( {
    id: reviewId,
    sourceIssueNumber,
    author: submission.discloseSubmitterName
      ? { kind: 'named', displayName: submission.submitterName }
      : { kind: 'anonymous' },
    studyStartYear: submission.studyStartYear,
    studyEndYear: submission.studyEndYear,
    studyStage: submission.studyStage,
    studyProgram: submission.studyProgram,
    rating: submission.rating,
    body: submission.details,
    images: imageDestinations.map( ( src, index ) => ( {
      src,
      caption: submission.imageCaptions[ index ] ?? '',
    } ) ),
  } );

  return { universitySlug: submission.universitySlug, review, imageDestinations };
}
export function upsertUniversityReview( input: UniversityReviewData, universitySlug: string, review: PublicUniversityReview )
{
  const current = parseUniversityReviewData( input );
  const universities = Object.fromEntries(
    Object.entries( current.universities ).map( ( [ slug, reviews ] ) => [
      slug,
      reviews.filter( existing => existing.sourceIssueNumber !== review.sourceIssueNumber ),
    ] ),
  );
  universities[ universitySlug ] = [ ...( universities[ universitySlug ] ?? [] ), review ];
  return parseUniversityReviewData( { ...current, universities } );
}
