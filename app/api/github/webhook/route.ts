import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { dispatchContributionWorkflow } from '@/lib/server/githubApp';

export const runtime = 'nodejs';

type PullRequestWebhook = {
  action?: string;
  repository?: { full_name?: string };
  pull_request?: {
    number?: number;
    merged?: boolean;
    head?: { ref?: string; sha?: string };
  };
};

function validSignature( body: string, signature: string | null )
{
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if ( !secret || !signature?.startsWith( 'sha256=' ) ) return false;
  const expected = `sha256=${createHmac( 'sha256', secret ).update( body ).digest( 'hex' )}`;
  const actualBuffer = Buffer.from( signature );
  const expectedBuffer = Buffer.from( expected );
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual( actualBuffer, expectedBuffer );
}

export async function POST( request: Request )
{
  const body = await request.text();
  if ( !validSignature( body, request.headers.get( 'x-hub-signature-256' ) ) )
  {
    return NextResponse.json( { error: 'Invalid webhook signature.' }, { status: 401 } );
  }

  if ( request.headers.get( 'x-github-event' ) !== 'pull_request' )
  {
    return NextResponse.json( { ignored: true } );
  }

  let payload: PullRequestWebhook;
  try
  {
    payload = JSON.parse( body ) as PullRequestWebhook;
  } catch
  {
    return NextResponse.json( { error: 'Invalid webhook payload.' }, { status: 400 } );
  }

  const allowedActions = new Set( [ 'synchronize', 'reopened', 'closed' ] );
  const branch = payload.pull_request?.head?.ref ?? '';
  const branchMatch = branch.match( /^agent\/submission-(\d+)$/ );
  if (
    !allowedActions.has( payload.action ?? '' )
    || payload.repository?.full_name !== process.env.PUBLIC_GITHUB_REPOSITORY
    || !branchMatch
  )
  {
    return NextResponse.json( { ignored: true } );
  }

  try
  {
    await dispatchContributionWorkflow( payload.action === 'closed' ? 'content-pr-closed' : 'content-pr-updated', {
      issueNumber: Number( branchMatch[ 1 ] ),
      pullRequestNumber: payload.pull_request?.number,
      headSha: payload.pull_request?.head?.sha,
      merged: payload.pull_request?.merged === true,
    } );
    return NextResponse.json( { accepted: true } );
  } catch ( error )
  {
    console.error( '[api/github/webhook] Failed to dispatch private workflow.', error );
    return NextResponse.json( { error: 'Workflow dispatch failed.' }, { status: 503 } );
  }
}
