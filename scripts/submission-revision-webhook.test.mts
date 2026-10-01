import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import test from 'node:test';
import { build } from 'esbuild';

const harness = {
  revision: 2 as number | undefined,
  reads: [] as string[],
  invalidations: [] as number[][],
  dispatches: [] as Array<{ event: string; payload: Record<string, unknown> }>,
  request: async ( path: string ) => {
    harness.reads.push( path );
    assert.equal( path, '/repos/owner/private/issues/26' );
    return { body: `<!-- contribution-data:${Buffer.from( JSON.stringify( { version: 1, revision: harness.revision, type: 'restaurant', intent: 'add', name: 'Gina Street food', city: 'London' } ) ).toString( 'base64url' )} -->` };
  },
};
( globalThis as unknown as { revisionWebhookHarness: typeof harness } ).revisionWebhookHarness = harness;
const bundle = await build( {
  entryPoints: ['app/api/github/webhook/route.ts'], bundle: true, write: false, platform: 'node', format: 'esm',
  plugins: [{ name: 'offline-webhook', setup( builder ) {
    builder.onResolve( { filter: /^next\/server$/ }, () => ( { path: 'next', namespace: 'stub' } ) );
    builder.onLoad( { filter: /.*/, namespace: 'stub' }, () => ( { contents: 'export const NextResponse = Response;' } ) );
    builder.onLoad( { filter: /\/githubApp\.ts$/ }, () => ( { contents: `
      export const getContributionRepository = () => ({fullName:'owner/private'});
      export const githubRequest = (...args) => globalThis.revisionWebhookHarness.request(...args);
      export const parseSubmissionFromIssue = body => JSON.parse(Buffer.from(body.match(/contribution-data:([A-Za-z0-9_-]+)/)[1], 'base64url').toString('utf8'));
      export const dispatchContributionWorkflow = async(event,payload) => {globalThis.revisionWebhookHarness.dispatches.push({event,payload});};
    ` } ) );
    builder.onLoad( { filter: /\/manualContributionReview\.ts$/ }, () => ( { contents: 'export const invalidateManualReview = async(...args) => {globalThis.revisionWebhookHarness.invalidations.push(args);};' } ) );
  } }],
} );
const { POST } = await import( `data:text/javascript;base64,${Buffer.from( bundle.outputFiles[0].text ).toString( 'base64' )}` ) as typeof import('../app/api/github/webhook/route');

test( 'signed PR webhooks ignore old revisions and dispatch the current branch/version, including closes', async () => {
  const originalSecret = process.env.GITHUB_WEBHOOK_SECRET, originalRepo = process.env.PUBLIC_GITHUB_REPOSITORY;
  process.env.GITHUB_WEBHOOK_SECRET = 'offline-webhook-secret'; process.env.PUBLIC_GITHUB_REPOSITORY = 'owner/public';
  const request = ( action: string, branch: string, merged = false, invalidSignature = false ) => {
    const body = JSON.stringify( { action, repository: { full_name: 'owner/public' }, pull_request: { number: 30, merged, head: { ref: branch, sha: 'a'.repeat( 40 ) } } } );
    const signature = createHmac( 'sha256', invalidSignature ? 'wrong' : process.env.GITHUB_WEBHOOK_SECRET! ).update( body ).digest( 'hex' );
    return POST( new Request( 'https://site.test/api/github/webhook', { method: 'POST', headers: { 'x-github-event': 'pull_request', 'x-hub-signature-256': `sha256=${signature}` }, body } ) );
  };
  const reset = () => { harness.reads.length = 0; harness.invalidations.length = 0; harness.dispatches.length = 0; };
  try {
    harness.revision = 2;
    for ( const action of ['synchronize', 'reopened', 'closed'] ) {
      reset();
      for ( const merged of action === 'closed' ? [false, true] : [false] ) {
        const response = await request( action, 'agent/submission-26', merged );
        assert.equal( response.status, 200 ); assert.deepEqual( await response.json(), { ignored: true } );
      }
      assert.equal( harness.invalidations.length, 0, 'Old PR events must not clear the new revision review' );
      assert.equal( harness.dispatches.length, 0, 'Old closed/merged PRs must not dispatch a newer issue close' );
    }
    reset();
    const rejected = await request( 'synchronize', 'agent/submission-26-r2', false, true );
    assert.equal( rejected.status, 401 ); assert.equal( harness.reads.length, 0 ); assert.equal( harness.dispatches.length, 0 );
    for ( const action of ['synchronize', 'reopened', 'closed'] ) {
      reset();
      const response = await request( action, 'agent/submission-26-r2', action === 'closed' );
      assert.equal( response.status, 200 ); assert.deepEqual( await response.json(), { accepted: true } );
      assert.deepEqual( harness.invalidations, action === 'closed' ? [] : [[26, 30]] );
      assert.deepEqual( harness.dispatches, [{ event: action === 'closed' ? 'content-pr-closed' : 'content-pr-updated', payload: {
        issueNumber: 26, submissionRevision: 2, branchName: 'agent/submission-26-r2', pullRequestNumber: 30, headSha: 'a'.repeat( 40 ), merged: action === 'closed',
      } }] );
    }
    reset(); harness.revision = undefined;
    assert.deepEqual( await ( await request( 'synchronize', 'agent/submission-26' ) ).json(), { accepted: true } );
    assert.equal( harness.dispatches[0].payload.submissionRevision, 1, 'Original unversioned issues retain their existing branch behavior' );
    assert.equal( harness.dispatches[0].payload.branchName, 'agent/submission-26' );
    reset();
    assert.deepEqual( await ( await request( 'closed', 'agent/submission-26-r2' ) ).json(), { ignored: true } );
    assert.equal( harness.dispatches.length, 0 );
  } finally {
    if ( originalSecret === undefined ) delete process.env.GITHUB_WEBHOOK_SECRET; else process.env.GITHUB_WEBHOOK_SECRET = originalSecret;
    if ( originalRepo === undefined ) delete process.env.PUBLIC_GITHUB_REPOSITORY; else process.env.PUBLIC_GITHUB_REPOSITORY = originalRepo;
  }
} );
