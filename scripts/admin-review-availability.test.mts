import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { build } from 'esbuild';
import { REPORT_PREFIX } from '../lib/contributions/evaluation';
import { CHANGE_PREFIX } from '../lib/contributions/change-contract';
import { approvedRequest, report, submissionPayload } from './contribution-evaluation.test.mjs';

const privateMarker = 'private-response-body-must-not-leak';
const token = 'test-installation-token-must-not-leak';
let session: { user: { githubLogin: string } } | null = { user: { githubLogin: 'editor' } };
( globalThis as unknown as { availabilityAuth: () => typeof session } ).availabilityAuth = () => session;
const output = await build( {
  stdin: { resolveDir: process.cwd(), contents: "export { POST } from './app/api/admin/contributions/[issueNumber]/route'; export { listContributionIssues, githubRequest, GitHubRequestError } from './lib/server/githubApp'; export { loadManualReview } from './lib/server/manualContributionReview';" },
  bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external',
  plugins: [{ name: 'offline-auth-only', setup( builder ) {
    builder.onResolve( { filter: /^(server-only|@octokit\/auth-app|@\/auth|next\/server)$/ }, args => ( { path: args.path, namespace: 'stub' } ) );
    builder.onLoad( { filter: /.*/, namespace: 'stub' }, args => ( { contents:
      args.path === 'server-only' ? ''
        : args.path === 'next/server' ? 'export const NextResponse = Response;'
          : args.path === '@/auth' ? 'export const auth = async () => globalThis.availabilityAuth();'
            : `export const createAppAuth = () => async () => ({ token: '${token}' });`,
    } ) );
  } }],
} );
const bundled = { exports: {} };
new Function( 'require', 'module', 'exports', output.outputFiles[0].text )( createRequire( import.meta.url ), bundled, bundled.exports );
const service = bundled.exports as typeof import('../lib/server/githubApp') & typeof import('../lib/server/manualContributionReview') & typeof import('../app/api/admin/contributions/[issueNumber]/route');

function fixture() {
  const h = {
    report: structuredClone( report ), appId: 123, label: 'status:manual-review', runStatus: 'completed',
    failurePath: '/repos/owner/private/actions/runs/123', failureStatus: 0, failureError: null as Error | null,
    reads: [] as string[], writes: [] as string[], logs: [] as unknown[][],
    pr: { number: 26, node_id: 'PR_26', draft: true, state: 'open', merged: false, head: { sha: report.headSha, ref: 'agent/submission-24', repo: { full_name: 'owner/public' } }, base: { sha: report.baseSha, ref: 'master', repo: { full_name: 'owner/public' } } },
    fetch: async ( input: RequestInfo | URL, init: RequestInit = {} ) => {
      const url = new URL( String( input ) );
      const path = url.pathname;
      assert.equal( url.origin, 'https://api.github.com' );
      assert.equal( new Headers( init.headers ).get( 'authorization' ), `Bearer ${token}` );
      if ( ( init.method ?? 'GET' ) !== 'GET' ) {
        h.writes.push( path );
        throw new Error( `Unexpected write: ${path}` );
      }
      h.reads.push( path );
      if ( path === h.failurePath ) {
        if ( h.failureError ) throw h.failureError;
        if ( h.failureStatus ) return Response.json( { message: privateMarker, token }, { status: h.failureStatus } );
      }
      const issue = { number: 24, title: '[投稿] test', body: `<!-- contribution-data:${Buffer.from( submissionPayload ).toString( 'base64url' )} -->`, state: 'open', labels: [{ name: h.label }], html_url: 'https://github.com/owner/private/issues/24', created_at: report.evaluatedAt };
      if ( path === '/repos/owner/private/issues' ) return Response.json( [issue] );
      if ( path === '/repos/owner/private/issues/24' ) return Response.json( issue );
      if ( path === '/repos/owner/private/issues/24/comments' ) return Response.json( [
        { id: 1, performed_via_github_app: { id: h.appId }, body: `${REPORT_PREFIX}${JSON.stringify( h.report )} -->` },
        { id: 2, performed_via_github_app: { id: h.appId }, body: `${CHANGE_PREFIX}${JSON.stringify( approvedRequest )} -->` },
      ] );
      if ( path === '/repos/owner/public/pulls/26' ) return Response.json( h.pr );
      if ( path === '/repos/owner/public/pulls' ) return Response.json( [h.pr] );
      if ( path === '/repos/owner/private/actions/runs/123' ) return Response.json( { status: h.runStatus } );
      throw new Error( `Unexpected read: ${path}` );
    },
  };
  return h;
}

async function scenario( run: ( h: ReturnType<typeof fixture> ) => Promise<void> ) {
  const env = { CONTRIBUTION_GITHUB_REPOSITORY: 'owner/private', PUBLIC_GITHUB_REPOSITORY: 'owner/public', GITHUB_APP_ID: '123', GITHUB_APP_INSTALLATION_ID: '456', GITHUB_APP_PRIVATE_KEY: 'test-private-key-must-not-leak', ADMIN_GITHUB_LOGINS: 'editor' };
  const old = Object.fromEntries( Object.keys( env ).map( key => [key, process.env[key]] ) );
  const originalFetch = globalThis.fetch, originalWarn = console.warn;
  const h = fixture();
  Object.assign( process.env, env ); globalThis.fetch = h.fetch;
  console.warn = ( ...args: unknown[] ) => { h.logs.push( args ); };
  session = { user: { githubLogin: 'editor' } };
  try { await run( h ); }
  finally {
    globalThis.fetch = originalFetch; console.warn = originalWarn;
    for ( const [key, value] of Object.entries( old ) ) { if ( value === undefined ) delete process.env[key]; else process.env[key] = value; }
  }
}

function approve( origin = 'https://site.test' ) {
  return service.POST( new Request( 'https://site.test/api/admin/contributions/24', {
    method: 'POST', headers: { 'content-type': 'application/json', origin },
    body: JSON.stringify( { action: 'manual-approve', headSha: report.headSha, reason: 'Reviewed actual diff' } ),
  } ), { params: Promise.resolve( { issueNumber: '24' } ) } );
}

test( 'Actions 403 retains validated scores and PR in the listing, but manual approve returns 409 without writes', () => scenario( async h => {
  h.failureStatus = 403;
  const [item] = await service.listContributionIssues();
  assert.deepEqual( item.review?.report, report );
  assert.equal( item.review?.prUrl, 'https://github.com/owner/public/pull/26' );
  assert.equal( item.review?.eligible, false );
  assert.match( item.review!.message, /Actions: Read-only/ );
  assert.match( item.review!.message, /安装页面批准/ );
  const response = await approve();
  assert.equal( response.status, 409 );
  assert.match( ( await response.json() ).error, /Actions: Read-only/ );
  assert.deepEqual( h.writes, [] );
  assert.ok( h.logs.some( args => JSON.stringify( args ).includes( '"status":403' ) && JSON.stringify( args ).includes( 'actions-run' ) ) );
  const surfaced = JSON.stringify( { item, logs: h.logs } );
  for ( const secret of [privateMarker, token, 'test-private-key-must-not-leak'] ) assert.equal( surfaced.includes( secret ), false );
} ) );

test( 'missing, unavailable, and network-failed Actions runs retain evidence but cannot grant an override', () => scenario( async h => {
  for ( const [status, expected] of [[404, /运行记录（404）/], [503, /服务暂时不可用（503）/], [429, /服务暂时不可用（429）/], [401, /身份验证失败（401）/]] as const ) {
    h.failureStatus = status;
    const review = await service.loadManualReview( 24 );
    assert.deepEqual( review.report, report ); assert.equal( review.eligible, false );
    assert.equal( review.prUrl, 'https://github.com/owner/public/pull/26' ); assert.match( review.message, expected );
    assert.equal( ( await approve() ).status, 409 );
  }
  h.failureStatus = 0; h.failureError = new TypeError( privateMarker );
  const review = await service.loadManualReview( 24 );
  assert.deepEqual( review.report, report ); assert.equal( review.eligible, false ); assert.match( review.message, /网络/ );
  assert.equal( ( await approve() ).status, 409 ); assert.deepEqual( h.writes, [] );
  assert.equal( JSON.stringify( h.logs ).includes( privateMarker ), false );
} ) );

test( 'failed report reads produce sanitized diagnostics instead of silently blanking the review', () => scenario( async h => {
  h.failurePath = '/repos/owner/private/issues/24/comments'; h.failureStatus = 403;
  const [item] = await service.listContributionIssues();
  assert.equal( item.review?.report, null ); assert.equal( item.review?.eligible, false );
  assert.match( item.review!.message, /403/ ); assert.match( item.review!.message, /仓库访问权限/ );
  assert.doesNotMatch( item.review!.message, /Actions/ );
  h.failureStatus = 0; h.failureError = new Error( `${privateMarker}: ${token}` );
  const [unexpected] = await service.listContributionIssues();
  assert.match( unexpected.review!.message, /服务器日志/ );
  const surfaced = JSON.stringify( { unexpected, logs: h.logs } );
  assert.equal( surfaced.includes( privateMarker ), false ); assert.equal( surfaced.includes( token ), false );
  assert.deepEqual( h.writes, [] );
} ) );

test( 'HTTP error preserves safe status and endpoint metadata, not response bodies or query secrets', () => scenario( async h => {
  h.failureStatus = 403;
  await assert.rejects( service.githubRequest( `${h.failurePath}?token=${privateMarker}` ), error => {
    assert.ok( error instanceof service.GitHubRequestError );
    assert.equal( error.status, 403 ); assert.equal( error.path, h.failurePath );
    assert.equal( JSON.stringify( error ).includes( privateMarker ), false );
    assert.equal( String( error ).includes( token ), false );
    return true;
  } );
} ) );

test( 'successful run checks retain deterministic, trust, and current-commit gates', () => scenario( async h => {
  assert.equal( ( await service.loadManualReview( 24 ) ).eligible, true );
  h.runStatus = 'in_progress'; assert.equal( ( await service.loadManualReview( 24 ) ).eligible, false );
  h.runStatus = 'completed'; h.report.deterministicPassed = false;
  assert.equal( ( await service.loadManualReview( 24 ) ).eligible, false );
  h.report.deterministicPassed = true; h.pr.head.sha = 'c'.repeat( 40 );
  assert.equal( ( await service.loadManualReview( 24 ) ).eligible, false );
  h.pr.head.sha = report.headSha; h.appId = 999;
  assert.equal( ( await service.loadManualReview( 24 ) ).report, null );
  assert.deepEqual( h.writes, [] );
} ) );

test( 'manual override route still rejects anonymous, non-admin, and cross-origin requests before GitHub', () => scenario( async h => {
  session = null; assert.equal( ( await approve() ).status, 401 );
  session = { user: { githubLogin: 'outsider' } }; assert.equal( ( await approve() ).status, 403 );
  session = { user: { githubLogin: 'editor' } }; assert.equal( ( await approve( 'https://other.test' ) ).status, 403 );
  assert.deepEqual( h.reads, [] ); assert.deepEqual( h.writes, [] );
} ) );
