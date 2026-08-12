import { retrieveKnowledge } from '../lib/ragKnowledge';
import { runtimeRagEvaluationCases } from '../evals/runtimeRagDataset';
import { writeFile } from 'node:fs/promises';

const failures: string[] = [];
let matchedSources = 0;
let expectedSources = 0;
const evaluationCases = runtimeRagEvaluationCases();
const dynamicCaseId = process.env.RAG_EVAL_DYNAMIC_CASE
  ? evaluationCases.at( -1 )?.id
  : undefined;
let dynamicCasePassed = !dynamicCaseId;

for ( const testCase of evaluationCases )
{
  const results = retrieveKnowledge( testCase.question, { limit: 3 } );
  const titles = results.map( result => result.title );
  const missingTitles = testCase.expectedSourceTitles.filter( title => !titles.includes( title ) );
  expectedSources += testCase.expectedSourceTitles.length;
  matchedSources += testCase.expectedSourceTitles.length - missingTitles.length;

  if ( missingTitles.length === 0 )
  {
    if ( testCase.id === dynamicCaseId ) dynamicCasePassed = true;
    console.log( `PASS  ${testCase.id}` );
    continue;
  }

  failures.push(
    `${testCase.id}: missing ${missingTitles.join( ', ' )}; received ${titles.join( ', ' ) || 'no results'}`,
  );
}

const sourceRecall = expectedSources === 0 ? 1 : matchedSources / expectedSources;
const report = {
  cases: evaluationCases.length,
  passedCases: evaluationCases.length - failures.length,
  expectedSources,
  matchedSources,
  sourceRecall,
  dynamicCaseId,
  dynamicCasePassed,
  failures,
};

if ( process.env.RAG_EVAL_OUTPUT )
{
  await writeFile( process.env.RAG_EVAL_OUTPUT, `${JSON.stringify( report, null, 2 )}\n`, 'utf8' );
}

console.log( `\nSource recall: ${( sourceRecall * 100 ).toFixed( 1 )}% (${matchedSources}/${expectedSources})` );

if ( sourceRecall < 0.8 || !dynamicCasePassed )
{
  console.error( `\nRetrieval gate failed; ${failures.length} case(s) missed expected sources:` );
  for ( const failure of failures ) console.error( `- ${failure}` );
  process.exitCode = 1;
} else
{
  console.log( `\nRetrieval gate passed (${evaluationCases.length - failures.length}/${evaluationCases.length} cases fully matched).` );
}
