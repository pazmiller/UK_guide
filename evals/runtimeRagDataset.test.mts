import assert from 'node:assert/strict';
import test from 'node:test';
import { RAG_EVALUATION_CASES } from './ragDataset';
import { runtimeRagEvaluationCases } from './runtimeRagDataset';

test( 'appends one submission-specific runtime case without mutating the fixed dataset', () =>
{
  const previous = process.env.RAG_EVAL_DYNAMIC_CASE;
  process.env.RAG_EVAL_DYNAMIC_CASE = JSON.stringify( {
    id: 'submission-42',
    question: 'Brighton 的 Test Kitchen 怎么样？',
    referenceAnswer: '应依据知识库回答。',
    expectedSourceTitles: [ 'Test Kitchen' ],
    scenario: '投稿专项检索',
  } );

  try
  {
    const cases = runtimeRagEvaluationCases();
    assert.equal( cases.length, RAG_EVALUATION_CASES.length + 1 );
    assert.equal( cases.at( -1 )?.id, 'submission-42' );
    assert.equal( RAG_EVALUATION_CASES.length, 20 );
  } finally
  {
    if ( previous === undefined ) delete process.env.RAG_EVAL_DYNAMIC_CASE;
    else process.env.RAG_EVAL_DYNAMIC_CASE = previous;
  }
} );
