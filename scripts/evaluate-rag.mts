import { retrieveKnowledge } from '../lib/ragKnowledge';
import { RAG_EVALUATION_CASES } from '../evals/ragDataset';
import { writeFile } from 'node:fs/promises';

const failures: string[] = [];
let matchedSources = 0;
let expectedSources = 0;

for ( const testCase of RAG_EVALUATION_CASES )
{
  const results = retrieveKnowledge( testCase.question, { limit: 3 } );
  const titles = results.map( result => result.title );
  const missingTitles = testCase.expectedSourceTitles.filter( title => !titles.includes( title ) );
  expectedSources += testCase.expectedSourceTitles.length;
  matchedSources += testCase.expectedSourceTitles.length - missingTitles.length;

  if ( missingTitles.length === 0 )
  {
    console.log( `PASS  ${testCase.id}` );
    continue;
  }

  failures.push(
    `${testCase.id}: missing ${missingTitles.join( ', ' )}; received ${titles.join( ', ' ) || 'no results'}`,
  );
}

const sourceRecall = expectedSources === 0 ? 1 : matchedSources / expectedSources;
const report = {
  cases: RAG_EVALUATION_CASES.length,
  passedCases: RAG_EVALUATION_CASES.length - failures.length,
  expectedSources,
  matchedSources,
  sourceRecall,
  failures,
};

if ( process.env.RAG_EVAL_OUTPUT )
{
  await writeFile( process.env.RAG_EVAL_OUTPUT, `${JSON.stringify( report, null, 2 )}\n`, 'utf8' );
}

console.log( `\nSource recall: ${( sourceRecall * 100 ).toFixed( 1 )}% (${matchedSources}/${expectedSources})` );

if ( failures.length > 0 )
{
  console.error( `\n${failures.length} retrieval regression case(s) failed:` );
  for ( const failure of failures ) console.error( `- ${failure}` );
  process.exitCode = 1;
} else
{
  console.log( `\nAll ${RAG_EVALUATION_CASES.length} retrieval regression cases passed.` );
}
