import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { build } from 'esbuild';
import { requiresApprovedChange } from '../lib/contributions/schema';
import { approvedRequest } from './contribution-evaluation.test.mjs';

const harness = {
  submission: { type: 'restaurant', intent: 'add' },
  writes: [] as Array<{ url: string; body: Record<string, unknown> }>,
  approvals: 0,
};
(globalThis as unknown as { dispatchHarness: typeof harness }).dispatchHarness = harness;
const bundle = await build( {
  stdin: { resolveDir: process.cwd(), contents: "export { POST } from './app/api/admin/contributions/[issueNumber]/route'; export { listContributionIssues } from './lib/server/githubApp';" }, bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external',
  plugins: [{ name: 'offline-admin', setup( b ) {
    b.onResolve( { filter: /^(server-only|next\/server|@octokit\/auth-app)$/ }, args => ({ path: args.path, namespace: 'stub' }) );
    b.onLoad( { filter: /.*/, namespace: 'stub' }, args => ({ contents: args.path === 'next/server' ? 'export const NextResponse=Response;' : args.path === 'server-only' ? '' : 'export const createAppAuth=()=>async()=>({token:"test-token"});' }) );
    b.onLoad( { filter: /\/auth\.ts$/ }, () => ({ contents: 'export const auth=async()=>({user:{githubLogin:"editor"}});' }) );
    b.onLoad( { filter: /\/manualContributionReview\.ts$/ }, () => ({ contents: 'export class ReviewConflict extends Error {} export const loadManualReview=async()=>null; export const manuallyApproveContribution=async()=>{}; export const reevaluateContribution=async()=>{};' }) );
    b.onLoad( { filter: /\/approvedChanges\.ts$/ }, () => ({ contents: 'export const prepareChange=async()=>({}); export const approveChange=async(_id,change)=>{globalThis.dispatchHarness.approvals++;return change;};' }) );
  } }],
} );
const bundledModule = { exports: {} };
new Function( 'require', 'module', 'exports', bundle.outputFiles[0].text )( createRequire( import.meta.url ), bundledModule, bundledModule.exports );
const { POST } = bundledModule.exports as typeof import('../app/api/admin/contributions/[issueNumber]/route');
const { listContributionIssues } = bundledModule.exports as typeof import('../lib/server/githubApp');

test( 'ready contributions link to their actual public PR, including university/guide without Judge reports', async () => {
  const originalFetch = globalThis.fetch;
  const environment = { CONTRIBUTION_GITHUB_REPOSITORY: 'owner/private', PUBLIC_GITHUB_REPOSITORY: 'owner/public', GITHUB_APP_ID: '123', GITHUB_APP_INSTALLATION_ID: '456', GITHUB_APP_PRIVATE_KEY: 'test-key' };
  const old = Object.fromEntries( Object.keys( environment ).map( key => [key, process.env[key]] ) );
  Object.assign( process.env, environment );
  const variants = [
    ['restaurant', 'status:ready'], ['university', 'status:ready'], ['tip', 'status:ready'],
    ['restaurant', 'status:manual-ready'], ['restaurant', 'status:failed'], ['restaurant', 'status:draft-pr'],
    ['restaurant', 'status:ready'], ['restaurant', 'status:ready'], ['restaurant', 'status:ready'],
  ];
  const queried: number[] = [];
  globalThis.fetch = async ( input, init = {} ) => {
    assert.equal( init.method ?? 'GET', 'GET', 'Listing must never merge or mutate GitHub' );
    const url = new URL( String( input ) );
    if ( url.pathname.endsWith( '/issues' ) ) return Response.json( variants.map( ([type, status], i) => ({ number: i + 26, title: `Entry ${i}`, html_url: `https://github.com/owner/private/issues/${i + 26}`, created_at: '2026-09-22T00:00:00Z', labels: i % 2 ? [status] : [{ name: status }], body: `<!-- contribution-data:${Buffer.from( JSON.stringify( { type, intent: 'add' } ) ).toString( 'base64url' )} -->` }) ) );
    assert.equal( url.pathname, '/repos/owner/public/pulls' );
    assert.equal( url.searchParams.get( 'state' ), 'open' );
    const head = url.searchParams.get( 'head' )!;
    assert.match( head, /^owner:agent\/submission-\d+$/ );
    const issueNumber = Number( head.split( '-' ).at( -1 ) ); queried.push( issueNumber );
    if ( issueNumber === 32 ) return Response.json( [{ draft: true, html_url: 'https://github.com/owner/public/pull/232' }] );
    if ( issueNumber === 33 ) return Response.json( [] );
    if ( issueNumber === 34 ) return Response.json( {}, { status: 503 } );
    return Response.json( [{ draft: false, html_url: `https://github.com/owner/public/pull/${issueNumber + 200}` }] );
  };
  try {
    const issues = await listContributionIssues();
    assert.deepEqual( issues.map( issue => issue.readyPrUrl ), [226, 227, 228, 229, null, null, null, null, null].map( number => number ? `https://github.com/owner/public/pull/${number}` : null ) );
    assert.deepEqual( queried.sort(), [26, 27, 28, 29, 32, 33, 34] );
  } finally {
    globalThis.fetch = originalFetch;
    for ( const [key, value] of Object.entries( old ) ) { if ( value === undefined ) delete process.env[key]; else process.env[key] = value; }
  }
} );

test( 'admin dispatch restores legacy intents and tip routing without bypassing update/image approval', async () => {
  const originalFetch = globalThis.fetch;
  const environment = { ADMIN_GITHUB_LOGINS: 'editor', CONTRIBUTION_GITHUB_REPOSITORY: 'owner/private', GITHUB_APP_ID: '123', GITHUB_APP_INSTALLATION_ID: '456', GITHUB_APP_PRIVATE_KEY: 'test-key' };
  const old = Object.fromEntries( Object.keys( environment ).map( key => [key, process.env[key]] ) );
  Object.assign( process.env, environment );
  globalThis.fetch = async ( input, init = {} ) => {
    const url = String( input );
    if ( !init.method || init.method === 'GET' ) return Response.json( { labels: [{ name: 'status:submitted' }, { name: `type:${harness.submission.type}` }], body: `<!-- contribution-data:${Buffer.from( JSON.stringify( harness.submission ) ).toString( 'base64url' )} -->` } );
    harness.writes.push( { url, body: JSON.parse( String( init.body ) ) } );
    return Response.json( {} );
  };
  const request = ( extra: Record<string, unknown> = {} ) => POST( new Request( 'https://site.test/api/admin/contributions/24', { method: 'POST', headers: { origin: 'https://site.test', 'content-type': 'application/json' }, body: JSON.stringify( { action: 'accept', ...extra } ) } ), { params: Promise.resolve( { issueNumber: '24' } ) } );
  try {
    for ( const type of ['restaurant', 'attraction', 'university', 'avoid', 'tip'] ) {
      for ( const intent of ['add', 'update', 'image', 'closure', 'other'] ) {
        harness.submission = { type, intent }; harness.writes.length = 0; harness.approvals = 0;
        const needsFields = requiresApprovedChange( harness.submission as Parameters<typeof requiresApprovedChange>[0] );
        const extra = type === 'tip' ? { tipRouting: 'guide' } : {};
        const result = await request( extra );
        assert.equal( result.status, needsFields ? 503 : 200, `${type}/${intent}` );
        assert.equal( harness.approvals, 0 );
        if ( needsFields ) {
          assert.equal( harness.writes.length, 0 );
          assert.equal( ( await request( { change: { ...approvedRequest, operation: intent, fields: intent === 'image' ? [{ field: 'images', before: '', after: '/contributions/24/1.webp' }] : approvedRequest.fields } } ) ).status, 200 );
          assert.equal( harness.approvals, 1 );
        }
        const labels = harness.writes.at( -1 )!.body.labels as string[];
        assert.ok( labels.includes( 'status:accepted' ) );
        assert.equal( labels.includes( 'routing:guide' ), type === 'tip' );
      }
    }
    harness.submission = { type: 'tip', intent: 'add' }; harness.writes.length = 0;
    assert.equal( ( await request() ).status, 503 );
    assert.equal( harness.writes.length, 0 );
    assert.equal( ( await request( { tipRouting: 'agent' } ) ).status, 200 );
    assert.ok( ( harness.writes.at( -1 )!.body.labels as string[] ).includes( 'routing:agent' ) );
  } finally {
    globalThis.fetch = originalFetch;
    for ( const [key, value] of Object.entries( old ) ) { if ( value === undefined ) delete process.env[key]; else process.env[key] = value; }
  }
} );
