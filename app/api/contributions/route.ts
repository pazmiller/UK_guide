import { NextRequest, NextResponse } from 'next/server';
import { contributionRequestSchema, contributionSubmissionSchema } from '@/lib/contributions/schema';
import { createContributionIssue } from '@/lib/server/githubApp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_REQUESTS = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function getClientId( request: NextRequest )
{
  return request.headers.get( 'x-forwarded-for' )?.split( ',' )[ 0 ]?.trim()
    || request.headers.get( 'x-real-ip' )?.trim()
    || request.headers.get( 'cf-connecting-ip' )?.trim()
    || 'anonymous';
}

function checkRateLimit( clientId: string )
{
  const now = Date.now();
  const existing = rateLimitStore.get( clientId );
  if ( !existing || existing.resetAt <= now )
  {
    rateLimitStore.set( clientId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS } );
    return { allowed: true, retryAfterSeconds: 0 };
  }
  if ( existing.count >= MAX_REQUESTS )
  {
    return { allowed: false, retryAfterSeconds: Math.ceil( ( existing.resetAt - now ) / 1000 ) };
  }

  existing.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

export async function POST( request: NextRequest )
{
  const rateLimit = checkRateLimit( getClientId( request ) );
  if ( !rateLimit.allowed )
  {
    return NextResponse.json(
      { error: '投稿太频繁，请稍后再试。' },
      { status: 429, headers: { 'Retry-After': String( rateLimit.retryAfterSeconds ) } },
    );
  }

  let body: unknown;
  try
  {
    body = await request.json();
  } catch
  {
    return NextResponse.json( { error: '投稿格式不正确，请重新提交。' }, { status: 400 } );
  }

  const honeypot = typeof body === 'object' && body && 'website' in body ? String( body.website ?? '' ) : '';
  if ( honeypot.trim() ) return NextResponse.json( { message: '已进入待审核队列。' }, { status: 202 } );

  const parsed = contributionRequestSchema.safeParse( body );
  if ( !parsed.success )
  {
    return NextResponse.json( { error: parsed.error.issues[ 0 ]?.message ?? '请检查投稿内容。' }, { status: 400 } );
  }

  const submission = contributionSubmissionSchema.parse( {
    ...parsed.data,
    submitterName: parsed.data.type === 'university' && !parsed.data.discloseSubmitterName
      ? ''
      : parsed.data.submitterName,
    studyYear: parsed.data.type === 'university'
      ? `${parsed.data.studyStartYear}–${parsed.data.studyEndYear}`
      : '',
    imageCaptions: parsed.data.type === 'university' ? parsed.data.imageCaptions : [],
    customCuisine: parsed.data.type === 'restaurant' && parsed.data.cuisine === 'Other'
      ? parsed.data.customCuisine
      : '',
    ...( parsed.data.type === 'restaurant' ? {} : {
      cuisine: '',
      price: '',
      recommendReason: '',
      recommendSignatures: '',
    } ),
    ...( parsed.data.type === 'university' ? {} : {
      universitySlug: '',
      studyYear: '',
      studyStartYear: '',
      studyEndYear: '',
      studyStage: '',
      studyProgram: '',
      rating: null,
      discloseSubmitterName: false,
    } ),
  } );
  try
  {
    await createContributionIssue( submission );
    return NextResponse.json( { message: '已进入待审核队列，谢谢你出的一份力！' }, { status: 201 } );
  } catch ( error )
  {
    console.error( '[api/contributions] Failed to create private GitHub issue.', error );
    return NextResponse.json( { error: '投稿暂时没有送达，请稍后再试。' }, { status: 503 } );
  }
}
