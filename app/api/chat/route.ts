import { NextRequest, NextResponse } from 'next/server';
import {
  buildRagContext,
  RetrievedChunk,
} from '@/lib/ragKnowledge';
import { generateRagAnswer } from '@/lib/server/deepseekChat';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ChatRequest = {
  question?: unknown;
};

type ChatSource = {
  id: string;
  title: string;
  city: string;
  category: string;
  source: string;
  score: number;
};

const MAX_QUESTION_LENGTH = 500;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 20;

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

function normalizeQuestion( value: unknown )
{
  return typeof value === 'string' ? value.trim() : '';
}

function toSources( chunks: RetrievedChunk[] ): ChatSource[]
{
  return chunks.map( chunk => ( {
    id: chunk.id,
    title: chunk.title,
    city: chunk.city,
    category: chunk.category,
    source: chunk.source,
    score: chunk.score,
  } ) );
}

function getClientId( request: NextRequest )
{
  const forwardedFor = request.headers.get( 'x-forwarded-for' )?.split( ',' )[ 0 ]?.trim();
  const realIp = request.headers.get( 'x-real-ip' )?.trim();
  const cfIp = request.headers.get( 'cf-connecting-ip' )?.trim();

  return forwardedFor || realIp || cfIp || 'anonymous';
}

function checkRateLimit( clientId: string )
{
  const now = Date.now();
  const existing = rateLimitStore.get( clientId );

  if ( !existing || existing.resetAt <= now )
  {
    rateLimitStore.set( clientId, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    } );
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if ( existing.count >= RATE_LIMIT_MAX_REQUESTS )
  {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil( ( existing.resetAt - now ) / 1000 ),
    };
  }

  existing.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

function buildFallbackAnswer( question: string, chunks: RetrievedChunk[] )
{
  if ( chunks.length === 0 )
  {
    return '目前资料里没有写到和这个问题直接相关的内容。';
  }

  const suggestions = chunks.slice( 0, 5 ).map( ( chunk, index ) =>
  {
    const reason = chunk.content
      .split( '\n' )
      .find( line => line.startsWith( '推荐原因：' ) || line.startsWith( '避雷原因：' ) || line.startsWith( '原因：' ) );
    const price = chunk.content
      .split( '\n' )
      .find( line => line.startsWith( '价位：' ) || line.startsWith( '价格：' ) );

    return [
      `${index + 1}. ${chunk.title}（${chunk.city} / ${chunk.category}）`,
      reason,
      price,
    ].filter( Boolean ).join( '\n' );
  } );

  return [
    `我先根据知识库帮你检索了「${question}」相关内容。`,
    '',
    ...suggestions,
    '',
    '提示：当前没有配置 DEEPSEEK_API_KEY，所以这是后端用 RAG chunks 生成的本地 fallback；配置 key 后会由 LLM 组织成更自然的回答。',
  ].join( '\n' );
}

export async function POST( request: NextRequest )
{
  const rateLimit = checkRateLimit( getClientId( request ) );
  if ( !rateLimit.allowed )
  {
    return NextResponse.json(
      { error: 'Too many chat requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String( rateLimit.retryAfterSeconds ),
        },
      },
    );
  }

  let body: ChatRequest;

  try
  {
    body = await request.json() as ChatRequest;
  } catch
  {
    return NextResponse.json(
      { error: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }

  const question = normalizeQuestion( body.question );

  if ( !question )
  {
    return NextResponse.json(
      { error: 'Question is required.' },
      { status: 400 },
    );
  }

  if ( question.length > MAX_QUESTION_LENGTH )
  {
    return NextResponse.json(
      { error: `Question must be ${MAX_QUESTION_LENGTH} characters or fewer.` },
      { status: 400 },
    );
  }

  const { chunks, context } = buildRagContext( question, { limit: 8 } );
  const sources = toSources( chunks );

  try
  {
    const llmAnswer = await generateRagAnswer( question, context );
    const answer = llmAnswer ?? buildFallbackAnswer( question, chunks );

    return NextResponse.json( {
      answer,
      sources,
      mode: llmAnswer ? 'llm' : 'local-fallback',
    } );
  } catch ( error )
  {
    const message = error instanceof Error ? error.message : 'Unknown chat error';
    console.error( '[api/chat] LLM request failed, using local fallback:', message );

    return NextResponse.json(
      {
        answer: buildFallbackAnswer( question, chunks ),
        sources,
        mode: 'local-fallback',
        warning: 'LLM request failed. Used local RAG fallback.',
      },
      { status: 200 },
    );
  }
}
