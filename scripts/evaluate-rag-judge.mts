import { writeFile } from 'node:fs/promises';
import { runtimeRagEvaluationCases } from '../evals/runtimeRagDataset';
import { buildRagContextFromChunks } from '../lib/ragKnowledge';
import { answerRagQuestion } from '../lib/server/ragChat';
import { judgeRagAnswer } from '../lib/server/deepseekChat';

const MAX_ATTEMPTS = 3;

async function judgeWithRetry( input: Parameters<typeof judgeRagAnswer>[ 0 ] )
{
  let lastError: unknown;

  for ( let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1 )
  {
    try
    {
      return await judgeRagAnswer( input );
    } catch ( error )
    {
      lastError = error;
      if ( attempt < MAX_ATTEMPTS ) await new Promise( resolve => setTimeout( resolve, attempt * 1_000 ) );
    }
  }

  throw lastError;
}

const results = [];
const evaluationCases = runtimeRagEvaluationCases();

for ( const testCase of evaluationCases )
{
  const ragResult = await answerRagQuestion( testCase.question );
  if ( !ragResult.llmAnswer )
  {
    throw new Error( `${testCase.id}: RAG answer failed: ${ragResult.llmError ?? 'empty answer'}` );
  }

  const judgment = await judgeWithRetry( {
    question: testCase.question,
    referenceAnswer: testCase.referenceAnswer,
    answer: ragResult.llmAnswer,
    context: buildRagContextFromChunks( ragResult.chunks ),
  } );
  const score = judgment.factualCorrectness
    + judgment.groundedness
    + judgment.relevance
    + judgment.hallucinationControl;

  results.push( {
    id: testCase.id,
    score,
    judgment,
  } );
  console.log( `${testCase.id}: ${score.toFixed( 1 )}` );
}

const averageScore = results.reduce( ( total, result ) => total + result.score, 0 ) / results.length;
const report = {
  model: process.env.DEEPSEEK_JUDGE_MODEL ?? 'deepseek-v4-pro',
  averageScore,
  results,
};

if ( process.env.RAG_JUDGE_OUTPUT )
{
  await writeFile( process.env.RAG_JUDGE_OUTPUT, `${JSON.stringify( report, null, 2 )}\n`, 'utf8' );
}

console.log( `\nJudge average: ${averageScore.toFixed( 2 )}%` );
