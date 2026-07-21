import nextEnv from '@next/env';
import { Client } from 'langsmith';
import {
  LANGSMITH_RAG_DATASET_NAME,
  RAG_EVALUATION_CASES,
} from '../evals/ragDataset';

const { loadEnvConfig } = nextEnv;

loadEnvConfig( process.cwd() );

if ( !process.env.LANGSMITH_API_KEY )
{
  throw new Error( 'LANGSMITH_API_KEY is required to sync the RAG evaluation dataset.' );
}

const client = new Client();

if ( !( await client.hasDataset( { datasetName: LANGSMITH_RAG_DATASET_NAME } ) ) )
{
  await client.createDataset( LANGSMITH_RAG_DATASET_NAME, {
    description: 'Twenty real UK and Europe travel questions for UKCFFA RAG retrieval and answer evaluation.',
    dataType: 'kv',
    metadata: {
      owner: 'uk-website',
      purpose: 'rag-evaluation',
      caseCount: RAG_EVALUATION_CASES.length,
    },
  } );
}

const existingExamples = new Map<string, string>();
for await ( const example of client.listExamples( { datasetName: LANGSMITH_RAG_DATASET_NAME } ) )
{
  const caseId = typeof example.metadata?.caseId === 'string' ? example.metadata.caseId : undefined;
  if ( caseId ) existingExamples.set( caseId, example.id);
}

for ( const testCase of RAG_EVALUATION_CASES )
{
  const example = {
    inputs: { question: testCase.question },
    outputs: {
      answer: testCase.referenceAnswer,
      expected_source_titles: testCase.expectedSourceTitles,
    },
    metadata: {
      caseId: testCase.id,
      scenario: testCase.scenario,
    },
    split: 'test',
  };
  const existingId = existingExamples.get( testCase.id );

  if ( existingId )
  {
    await client.updateExample( { id: existingId, ...example } );
  } else
  {
    await client.createExample( { dataset_name: LANGSMITH_RAG_DATASET_NAME, ...example } );
  }
}

console.log( `Synced ${RAG_EVALUATION_CASES.length} cases to ${LANGSMITH_RAG_DATASET_NAME}.` );
console.log( await client.getDatasetUrl( { datasetName: LANGSMITH_RAG_DATASET_NAME } ) );
