import nextEnv from '@next/env';
import { Client } from 'langsmith';
import { evaluate, type EvaluatorT } from 'langsmith/evaluation';
import { LANGSMITH_RAG_DATASET_NAME } from '../evals/ragDataset';

const { loadEnvConfig } = nextEnv;

loadEnvConfig( process.cwd() );

if ( !process.env.LANGSMITH_API_KEY )
{
  throw new Error( 'LANGSMITH_API_KEY is required to run the LangSmith RAG evaluation.' );
}

if ( !process.env.DEEPSEEK_API_KEY )
{
  throw new Error( 'DEEPSEEK_API_KEY is required to run answer-quality evaluation against DeepSeek.' );
}

process.env.LANGSMITH_TRACING = 'true';
process.env.LANGSMITH_TRACING_BACKGROUND = 'false';

const { answerRagQuestion } = await import( '../lib/server/ragChat' );
const client = new Client();

type EvaluationValues = Record<string, unknown>;
type EvaluationArgs = {
  outputs: EvaluationValues;
  referenceOutputs?: EvaluationValues;
};

const evaluators: EvaluatorT[] = [
  ( { outputs, referenceOutputs }: EvaluationArgs ) =>
  {
    const expectedTitles = Array.isArray( referenceOutputs?.expected_source_titles )
      ? referenceOutputs.expected_source_titles.filter( ( title: unknown ): title is string => typeof title === 'string' )
      : [];
    const sourceTitles = Array.isArray( outputs.source_titles )
      ? outputs.source_titles.filter( ( title: unknown ): title is string => typeof title === 'string' )
      : [];
    const matchedTitles = expectedTitles.filter( title => sourceTitles.includes( title ) );

    return {
      key: 'expected_source_recall',
      score: expectedTitles.length === 0 ? 1 : matchedTitles.length / expectedTitles.length,
      comment: `Matched: ${matchedTitles.join( ', ' ) || 'none' }; expected: ${expectedTitles.join( ', ' ) || 'none' }.`,
    };
  },
  ( { outputs, referenceOutputs }: EvaluationArgs ) =>
  {
    const expectedTitles = Array.isArray( referenceOutputs?.expected_source_titles )
      ? referenceOutputs.expected_source_titles.filter( ( title: unknown ): title is string => typeof title === 'string' )
      : [];
    const answer = typeof outputs.answer === 'string' ? outputs.answer : '';
    const missingTitles = expectedTitles.filter( title => !answer.includes( title ) );

    return {
      key: 'answer_mentions_expected_source',
      score: expectedTitles.length === 0 ? 1 : ( expectedTitles.length - missingTitles.length ) / expectedTitles.length,
      comment: `Missing from answer: ${missingTitles.join( ', ' ) || 'none' }.`,
    };
  },
  ( { outputs }: EvaluationArgs ) => ( {
    key: 'llm_answer_available',
    score: outputs.mode === 'llm' ? 1 : 0,
    comment: outputs.mode === 'llm'
      ? 'DeepSeek produced an answer.'
      : `RAG fell back locally: ${typeof outputs.llm_error === 'string' ? outputs.llm_error : 'unknown error'}.`,
  } ),
];

const results = await evaluate(
  async ( { question }: { question: string } ): Promise<EvaluationValues> =>
  {
    const result = await answerRagQuestion( question );

    return {
      answer: result.llmAnswer ?? '',
      source_titles: result.chunks.map( chunk => chunk.title ),
      mode: result.llmAnswer ? 'llm' : 'local-fallback',
      llm_error: result.llmError ?? null,
    };
  },
  {
    client,
    data: LANGSMITH_RAG_DATASET_NAME,
    experimentPrefix: 'uk-website-rag',
    description: 'Runs the production RAG pipeline against the 20-case UK and Europe travel dataset.',
    maxConcurrency: 2,
    metadata: {
      evaluatorVersion: 'v1',
      source: 'scripts/evaluate-langsmith-rag.mts',
    },
    evaluators,
  },
);

for await ( const result of results )
{
  // Iteration waits for every target run and evaluator result to finish.
  void result;
}

console.log( `Completed ${results.length} cases in experiment ${results.experimentName}.` );
console.log( await client.getProjectUrl( { projectName: results.experimentName } ) );
