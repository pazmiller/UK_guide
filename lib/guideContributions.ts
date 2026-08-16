import { z } from 'zod';
import type { ContributionSubmission } from '@/lib/contributions/schema';

const publicImagePath = z.string().regex( /^\/contributions\/[1-9][0-9]*\/[1-5]\.webp$/ );
const optionalSourceUrl = z.union( [ z.literal( '' ), z.string().url().max( 500 ) ] );

export const guideContributionSchema = z.object( {
  id: z.string().regex( /^guide-[1-9][0-9]*$/ ),
  sourceIssueNumber: z.number().int().positive(),
  title: z.string().min( 1 ).max( 120 ),
  body: z.string().min( 1 ).max( 4000 ),
  city: z.string().max( 100 ),
  region: z.enum( [ 'uk', 'europa' ] ),
  sourceUrl: optionalSourceUrl,
  images: z.array( publicImagePath ).max( 5 ),
} ).strict();

export const guideContributionDataSchema = z.object( {
  schemaVersion: z.literal( 1 ),
  guides: z.array( guideContributionSchema ),
} ).superRefine( ( data, context ) => {
  const ids = new Set<string>();
  const issueNumbers = new Set<number>();
  data.guides.forEach( ( guide, index ) => {
    if ( ids.has( guide.id ) ) context.addIssue( { code: 'custom', path: [ 'guides', index, 'id' ], message: 'Guide IDs must be unique.' } );
    if ( issueNumbers.has( guide.sourceIssueNumber ) ) context.addIssue( { code: 'custom', path: [ 'guides', index, 'sourceIssueNumber' ], message: 'Source Issue numbers must be unique.' } );
    ids.add( guide.id );
    issueNumbers.add( guide.sourceIssueNumber );
  } );
} );

export type GuideContribution = z.infer<typeof guideContributionSchema>;
export type GuideContributionData = z.infer<typeof guideContributionDataSchema>;

export function parseGuideContributionData( value: unknown )
{
  return guideContributionDataSchema.parse( value );
}

export function materializeGuideContribution( submission: ContributionSubmission, sourceIssueNumber: number )
{
  if ( submission.type !== 'tip' ) throw new Error( 'Only helpful-tip submissions can become Guide entries.' );
  if ( !Number.isInteger( sourceIssueNumber ) || sourceIssueNumber <= 0 ) throw new Error( 'A positive GitHub Issue number is required.' );

  return guideContributionSchema.parse( {
    id: `guide-${sourceIssueNumber}`,
    sourceIssueNumber,
    title: submission.name,
    body: submission.details,
    city: submission.city,
    region: submission.region,
    sourceUrl: submission.sourceUrl,
    images: submission.imageKeys.map( ( _, index ) => `/contributions/${sourceIssueNumber}/${index + 1}.webp` ),
  } );
}

export function upsertGuideContribution( data: GuideContributionData, guide: GuideContribution )
{
  const current = parseGuideContributionData( data );
  return parseGuideContributionData( {
    ...current,
    guides: [
      ...current.guides.filter( existing => existing.sourceIssueNumber !== guide.sourceIssueNumber ),
      guide,
    ],
  } );
}
