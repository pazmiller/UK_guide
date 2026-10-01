import assert from 'node:assert/strict';
import test from 'node:test';
import { build } from 'esbuild';
import { REPORT_PREFIX } from '../lib/contributions/evaluation';
import { report, approvedRequest, submissionPayload } from './contribution-evaluation.test.mjs';
import { CHANGE_PREFIX } from '../lib/contributions/change-contract';
import { createHash } from 'node:crypto';

const requests: Array<{ path: string; body: string }> = [];
let state: ReturnType<typeof fixture>;
function fixture() {
  return {
    report: structuredClone( report ), approval: structuredClone( approvedRequest ), appId: 123, label: 'status:manual-review', runStatus: 'completed', changeDuringApproval: false, reviseDuringApproval: false,
    submissionPayload,
    pr: { number: 26, node_id: 'PR_test', draft: true, state: 'open', merged: false, head: { sha: report.headSha, ref: 'agent/submission-24', repo: { full_name: 'owner/public' } }, base: { sha: report.baseSha, ref: 'master', repo: { full_name: 'owner/public' } } },
  };
}
const harness = {
  request: async ( path: string, init: RequestInit = {} ) => {
    const body = String( init.body ?? '' );
    requests.push( { path, body } );
    if ( path.includes( '/comments?' ) ) return [{ id:1, performed_via_github_app:{id:state.appId}, body:`${REPORT_PREFIX}${JSON.stringify(state.report)} -->` }, { id: 2, performed_via_github_app: { id: state.appId }, body: `${CHANGE_PREFIX}${JSON.stringify( state.approval )} -->` }];
    if ( path.endsWith( '/comments' ) ) return {};
    if ( path.endsWith( '/pulls/26' ) ) return structuredClone( state.pr );
    if ( path.includes( '/pulls?state=open' ) ) return new URL( `https://api.github.com${path}` ).searchParams.get( 'head' ) === `owner:${state.pr.head.ref}` ? [structuredClone(state.pr)] : [];
    if ( path.includes( '/actions/runs/' ) ) return {status:state.runStatus};
    if ( path.endsWith( '/issues/24' ) ) return {state:'open',labels:[{name:state.label}],body: `<!-- contribution-data:${Buffer.from( state.submissionPayload ).toString( 'base64url' )} -->`};
    if ( path === '/graphql' ) {
      state.pr.draft = body.includes( 'convertPullRequestToDraft' );
      if ( state.changeDuringApproval ) state.pr.head.sha = 'c'.repeat(40);
      if ( state.reviseDuringApproval && !state.pr.draft ) state.submissionPayload = JSON.stringify( { ...JSON.parse( state.submissionPayload ), revision: 3 } );
      return {data:{ok:true}};
    }
    throw new Error( `Unexpected network request: ${path}` );
  },
  status: async ( _issue: number, status: string ) => {state.label=status;},
  dispatch: async ( event: string, payload: Record<string, unknown> ) => {requests.push({path:'dispatch',body:JSON.stringify({event,payload})});},
};
(globalThis as unknown as {reviewTestHarness: typeof harness}).reviewTestHarness = harness;
const bundled = await build({
  entryPoints:['lib/server/manualContributionReview.ts'], bundle:true, write:false, platform:'node', format:'esm',
  plugins:[{name:'offline-github',setup(builder){
    builder.onResolve({filter:/^server-only$/},()=>({path:'empty',namespace:'test'}));
    builder.onLoad({filter:/.*/,namespace:'test'},()=>({contents:''}));
    builder.onLoad({filter:/lib\/server\/githubApp\.ts$/},()=>({contents:`
      export const githubRequest = (...args) => globalThis.reviewTestHarness.request(...args);
      export const getContributionRepository = () => ({fullName:'owner/private'});
      export const replaceStatusLabel = (...args) => globalThis.reviewTestHarness.status(...args);
      export const dispatchContributionWorkflow = (...args) => globalThis.reviewTestHarness.dispatch(...args);
      export const parseSubmissionFromIssue = body => JSON.parse(Buffer.from(body.match(/contribution-data:([A-Za-z0-9_-]+)/)[1], 'base64url').toString('utf8'));
      export class GitHubRequestError extends Error {}
      export const describeGitHubReadFailure = () => 'GitHub 审核读取失败';
    `}));
  }}],
});
const service = await import(`data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString('base64')}`) as typeof import('../lib/server/manualContributionReview');

const hash = ( value: string ) => createHash( 'sha256' ).update( value ).digest( 'hex' );
function revisionFixture( intent: 'add' | 'update' = 'add' ) {
  const value = fixture();
  value.submissionPayload = JSON.stringify( { version: 1, revision: 2, type: 'attraction', intent, details: '管理员已更正的内容' } );
  value.pr.head.ref = 'agent/submission-24-r2';
  value.report.submissionRevision = 2;
  value.report.submissionHash = hash( value.submissionPayload );
  value.report.fidelity = undefined;
  if ( intent === 'update' ) {
    value.approval.submissionHash = value.report.submissionHash;
    value.approval.fields[0].after = '管理员已更正的内容';
    value.report.fidelity = { ...report.fidelity!, submissionHash: value.report.submissionHash, requestHash: hash( JSON.stringify( value.approval ) ), fields: value.approval.fields };
  }
  return value;
}

test( 'revised submissions reject old or unbound scores and retain exact-field approval requirements', async () => {
  const oldRepo = process.env.PUBLIC_GITHUB_REPOSITORY, oldId = process.env.GITHUB_APP_ID;
  process.env.PUBLIC_GITHUB_REPOSITORY = 'owner/public'; process.env.GITHUB_APP_ID = '123';
  try {
    for ( const mutate of [
      () => { state.report.submissionRevision = undefined; },
      () => { state.report.submissionRevision = 1; },
      () => { state.report.submissionHash = undefined; },
      () => { state.report.submissionHash = 'c'.repeat( 64 ); },
      () => { state.pr.head.ref = 'agent/submission-24'; },
    ] ) {
      state = revisionFixture(); requests.length = 0; mutate();
      assert.equal( ( await service.loadManualReview( 24 ) ).eligible, false );
      await assert.rejects( service.manuallyApproveContribution( 24, report.headSha, 'Reviewed', 'admin' ) );
      assert.equal( requests.some( request => request.path === '/graphql' ), false );
      assert.equal( state.label, 'status:manual-review' );
    }
    state = revisionFixture(); state.report.submissionRevision = 1; requests.length = 0;
    const outdated = await service.loadManualReview( 24 );
    assert.equal( outdated.report, null, 'Old scores must not appear as the revised submission assessment' );
    assert.ok( requests.some( request => request.path.includes( 'owner%3Aagent%2Fsubmission-24-r2' ) ), 'PR lookup uses the current revision, not the old report branch' );
    for ( const intent of ['add', 'update'] as const ) {
      state = revisionFixture( intent ); requests.length = 0;
      assert.equal( ( await service.loadManualReview( 24 ) ).eligible, true );
      await service.manuallyApproveContribution( 24, report.headSha, 'Reviewed revised contribution', 'admin' );
      assert.equal( state.pr.draft, false ); assert.equal( state.label, 'status:manual-ready' );
      assert.equal( requests.some( request => request.path.includes( '/merge' ) || request.body.includes( 'mergePullRequest' ) ), false );
    }
    state = revisionFixture( 'update' ); state.approval = structuredClone( approvedRequest ); requests.length = 0;
    await assert.rejects( service.manuallyApproveContribution( 24, report.headSha, 'Old approval must fail', 'admin' ) );
    assert.equal( requests.some( request => request.path === '/graphql' ), false );
    state = revisionFixture(); state.reviseDuringApproval = true; requests.length = 0;
    await assert.rejects( service.manuallyApproveContribution( 24, report.headSha, 'Concurrent edit', 'admin' ), /发生变化/ );
    assert.equal( state.pr.draft, true, 'An edit while marking Ready withdraws that Ready state' );
    assert.equal( state.label, 'status:manual-review' );
  } finally {
    if ( oldRepo === undefined ) delete process.env.PUBLIC_GITHUB_REPOSITORY; else process.env.PUBLIC_GITHUB_REPOSITORY = oldRepo;
    if ( oldId === undefined ) delete process.env.GITHUB_APP_ID; else process.env.GITHUB_APP_ID = oldId;
  }
} );

test( 'reevaluation dispatches the current revision and old PR events cannot invalidate it', async () => {
  const oldRepo = process.env.PUBLIC_GITHUB_REPOSITORY;
  process.env.PUBLIC_GITHUB_REPOSITORY = 'owner/public';
  try {
    state = revisionFixture(); state.label = 'status:failed'; requests.length = 0;
    await service.reevaluateContribution( 24 );
    assert.equal( state.label, 'status:agent-running' );
    assert.deepEqual( JSON.parse( requests.find( request => request.path === 'dispatch' )!.body ), {
      event: 'content-pr-updated', payload: { issueNumber: 24, pullRequestNumber: 26, submissionRevision: 2, branchName: 'agent/submission-24-r2' },
    } );
    state = revisionFixture(); state.label = 'status:failed'; state.pr.head.ref = 'agent/submission-24'; requests.length = 0;
    await assert.rejects( service.reevaluateContribution( 24 ), /没有唯一/ );
    assert.equal( requests.some( request => request.path === '/graphql' || request.path === 'dispatch' ), false );
    state = revisionFixture(); state.label = 'status:manual-ready'; state.pr.draft = false; state.pr.head.ref = 'agent/submission-24'; requests.length = 0;
    await service.invalidateManualReview( 24, 26 );
    assert.equal( state.label, 'status:manual-ready' ); assert.equal( state.pr.draft, false );
    assert.equal( requests.some( request => request.path === '/graphql' ), false );
    state.pr.head.ref = 'agent/submission-24-r2';
    await service.invalidateManualReview( 24, 26 );
    assert.equal( state.label, 'status:agent-running' ); assert.equal( state.pr.draft, true );
  } finally {
    if ( oldRepo === undefined ) delete process.env.PUBLIC_GITHUB_REPOSITORY; else process.env.PUBLIC_GITHUB_REPOSITORY = oldRepo;
  }
} );
test( 'manual review rejects forged, stale, incomplete and running assessments; never merges', async () => {
  const oldRepo = process.env.PUBLIC_GITHUB_REPOSITORY;
  const oldId = process.env.GITHUB_APP_ID;
  process.env.PUBLIC_GITHUB_REPOSITORY='owner/public'; process.env.GITHUB_APP_ID='123';
  try {
    for ( const mutate of [
      () => {state.appId=999;},
      () => {state.pr.head.sha='c'.repeat(40);},
      () => {state.pr.base.sha='c'.repeat(40);},
      () => {state.report.deterministicPassed=false;},
      () => {state.report.dynamicCasePassed=false;},
      () => {state.report.failures.push('Judge run 2: timeout');},
      () => {state.runStatus='in_progress';},
      () => {state.label='status:closed';},
      () => {state.report.fidelity=undefined;},
    ] ) {
      state=fixture(); requests.length=0; mutate();
      await assert.rejects(service.manuallyApproveContribution(24,report.headSha,'Reviewed','admin'));
      assert.equal(requests.some(r=>r.path==='/graphql'),false);
    }
    state=fixture(); requests.length=0;
    await service.manuallyApproveContribution(24,report.headSha,'Reviewed the actual diff','admin');
    assert.equal(state.pr.draft,false); assert.equal(state.label,'status:manual-ready');
    assert.ok(requests.some(r=>r.body.includes('Reviewed the actual diff') && r.body.includes(report.headSha)));
    assert.equal(requests.some(r=>r.path.includes('/merge') || r.body.includes('mergePullRequest')),false);
    state=fixture(); requests.length=0;
    state.submissionPayload=JSON.stringify({version:1,type:'restaurant',intent:'add'});
    state.report.fidelity=undefined;
    await service.manuallyApproveContribution(24,report.headSha,'Reviewed new restaurant','admin');
    assert.equal(state.pr.draft,false); assert.equal(state.label,'status:manual-ready');
    state=fixture(); requests.length=0; state.changeDuringApproval=true;
    await assert.rejects(service.manuallyApproveContribution(24,report.headSha,'Reviewed','admin'),/发生变化/);
    assert.equal(state.pr.draft,true);
    state=fixture(); state.label='status:manual-ready'; state.pr.draft=false;
    await service.invalidateManualReview(24,26);
    assert.equal(state.pr.draft,true); assert.equal(state.label,'status:agent-running');
  } finally {
    if(oldRepo===undefined) delete process.env.PUBLIC_GITHUB_REPOSITORY; else process.env.PUBLIC_GITHUB_REPOSITORY=oldRepo;
    if(oldId===undefined) delete process.env.GITHUB_APP_ID; else process.env.GITHUB_APP_ID=oldId;
  }
});
