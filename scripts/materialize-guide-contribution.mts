import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { contributionSubmissionSchema } from '../lib/contributions/schema';
import {
  materializeGuideContribution,
  parseGuideContributionData,
  upsertGuideContribution,
} from '../lib/guideContributions';

function argument( name: string )
{
  const index = process.argv.indexOf( name );
  return index >= 0 ? process.argv[ index + 1 ] : undefined;
}

const submissionPath = argument( '--submission' );
const issueNumber = Number( argument( '--issue-number' ) );
const dataPath = resolve( argument( '--data' ) ?? 'data/guide-contributions.json' );

if ( !submissionPath || !Number.isInteger( issueNumber ) || issueNumber <= 0 )
{
  throw new Error( 'Usage: materialize-guide-contribution --submission <json> --issue-number <number> [--data <guide-contributions.json>]' );
}

const submission = contributionSubmissionSchema.parse( JSON.parse( await readFile( resolve( submissionPath ), 'utf8' ) ) );
const current = parseGuideContributionData( JSON.parse( await readFile( dataPath, 'utf8' ) ) );
const guide = materializeGuideContribution( submission, issueNumber );
const next = upsertGuideContribution( current, guide );

await writeFile( dataPath, `${JSON.stringify( next, null, 2 )}\n`, 'utf8' );
process.stdout.write( `${JSON.stringify( { guideId: guide.id, imageDestinations: guide.images } )}\n` );
