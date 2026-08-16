import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { materializeUniversityReview, upsertUniversityReview } from '../lib/universities/materializeReview';
import { parseUniversityReviewData } from '../lib/universities/reviews';

function argument( name: string )
{
  const index = process.argv.indexOf( name );
  return index >= 0 ? process.argv[ index + 1 ] : undefined;
}

const submissionPath = argument( '--submission' );
const issueNumber = Number( argument( '--issue-number' ) );
const dataPath = resolve( argument( '--data' ) ?? 'data/universities/reviews.json' );

if ( !submissionPath || !Number.isInteger( issueNumber ) || issueNumber <= 0 )
{
  throw new Error( 'Usage: materialize-university-review --submission <json> --issue-number <number> [--data <reviews.json>]' );
}

const submission = JSON.parse( await readFile( resolve( submissionPath ), 'utf8' ) );
const current = parseUniversityReviewData( JSON.parse( await readFile( dataPath, 'utf8' ) ) );
const materialized = materializeUniversityReview( submission, issueNumber );
const next = upsertUniversityReview( current, materialized.universitySlug, materialized.review );

await writeFile( dataPath, `${JSON.stringify( next, null, 2 )}\n`, 'utf8' );
process.stdout.write( `${JSON.stringify( {
  universitySlug: materialized.universitySlug,
  reviewId: materialized.review.id,
  imageDestinations: materialized.imageDestinations,
} )}\n` );
