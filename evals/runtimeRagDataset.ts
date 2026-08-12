import { RAG_EVALUATION_CASES, type RagEvaluationCase } from './ragDataset';

function parseDynamicCase( value: string ): RagEvaluationCase
{
  const parsed = JSON.parse( value ) as Partial<RagEvaluationCase>;
  if ( !parsed.id || !parsed.question || !parsed.referenceAnswer || !parsed.scenario
    || !Array.isArray( parsed.expectedSourceTitles ) || parsed.expectedSourceTitles.length === 0 )
  {
    throw new Error( 'RAG_EVAL_DYNAMIC_CASE is invalid.' );
  }
  return parsed as RagEvaluationCase;
}

export function runtimeRagEvaluationCases()
{
  const dynamicCase = process.env.RAG_EVAL_DYNAMIC_CASE;
  return dynamicCase
    ? [ ...RAG_EVALUATION_CASES, parseDynamicCase( dynamicCase ) ]
    : RAG_EVALUATION_CASES;
}
