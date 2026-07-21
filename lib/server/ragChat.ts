import {
  buildRagContextFromChunks,
  retrieveKnowledge,
  type RetrievedChunk,
} from '@/lib/ragKnowledge';
import { generateRagAnswer } from '@/lib/server/deepseekChat';
import { traceable } from 'langsmith/traceable';

type TracedDocument = {
  page_content: string;
  type: 'Document';
  metadata: Omit<RetrievedChunk, 'content'>;
};

export type RagChatResult = {
  chunks: RetrievedChunk[];
  llmAnswer: string | null;
  llmError?: string;
};

function toTracedDocument( chunk: RetrievedChunk ): TracedDocument
{
  const { content, ...metadata } = chunk;

  return {
    page_content: content,
    type: 'Document',
    metadata,
  };
}

function toRetrievedChunk( document: TracedDocument ): RetrievedChunk
{
  return {
    ...document.metadata,
    content: document.page_content,
  };
}

const retrieveRagDocuments = traceable(
  async ( { question, limit }: { question: string; limit: number } ) =>
  {
    return retrieveKnowledge( question, { limit } ).map( toTracedDocument );
  },
  {
    name: 'Retrieve UK guide knowledge',
    run_type: 'retriever',
  },
);

const runRagChat = traceable(
  async ( { question }: { question: string } ): Promise<RagChatResult> =>
  {
    const documents = await retrieveRagDocuments( { question, limit: 8 } );
    const chunks = documents.map( toRetrievedChunk );
    const context = buildRagContextFromChunks( chunks );

    try
    {
      return {
        chunks,
        llmAnswer: await generateRagAnswer( question, context ),
      };
    } catch ( error )
    {
      return {
        chunks,
        llmAnswer: null,
        llmError: error instanceof Error ? error.message : 'Unknown chat error',
      };
    }
  },
  {
    name: 'UK website RAG chat',
    run_type: 'chain',
    processOutputs: ( output ) => ( {
      answer: output.llmAnswer,
      llmError: output.llmError,
      mode: output.llmAnswer ? 'llm' : 'local-fallback',
      retrievedChunkIds: output.chunks.map( chunk => chunk.id ),
    } ),
  },
);

export async function answerRagQuestion( question: string )
{
  return runRagChat( { question } );
}
