import assert from 'node:assert/strict';
import test from 'node:test';
import { build } from 'esbuild';
import { REPORT_PREFIX } from '../lib/contributions/evaluation';
import { report, approvedRequest, submissionPayload } from './contribution-evaluation.test.mjs';
import { CHANGE_PREFIX } from '../lib/contributions/change-contract';

const requests: Array<{ path: string; body: string }> = [];
let state: ReturnType<typeof fixture>;
function fixture() {
  return {
    report: structuredClone( report ), appId: 123, label: 'status:manual-review', runStatus: 'completed', changeDuringApproval: false,
    submissionPayload,
    pr: { number: 26, node_id: 'PR_test', draft: true, state: 'open', merged: false, head: { sha: report.headSha, ref: 'agent/submission-24', repo: { full_name: 'owner/public' } }, base: { sha: report.baseSha, ref: 'master', repo: { full_name: 'owner/public' } } },
  };
}
const harness = {
  request: async ( path: string, init: RequestInit = {} ) => {
    const body = String( init.body ?? '' );
    requests.push( { path, body } );
    if ( path.includes( '/comments?' ) ) return [{ id:1, performed_via_github_app:{id:state.appId}, body:`${REPORT_PREFIX}${JSON.stringify(state.report)} -->` }, { id: 2, performed_via_github_app: { id: state.appId }, body: `${CHANGE_PREFIX}${JSON.stringify( approvedRequest )} -->` }];
    if ( path.endsWith( '/comments' ) ) return {};
    if ( path.endsWith( '/pulls/26' ) ) return structuredClone( state.pr );
    if ( path.includes( '/pulls?state=open' ) ) return [structuredClone(state.pr)];
    if ( path.includes( '/actions/runs/' ) ) return {status:state.runStatus};
    if ( path.endsWith( '/issues/24' ) ) return {state:'open',labels:[{name:state.label}],body: `<!-- contribution-data:${Buffer.from( state.submissionPayload ).toString( 'base64url' )} -->`};
    if ( path === '/graphql' ) {
      state.pr.draft = body.includes( 'convertPullRequestToDraft' );
      if ( state.changeDuringApproval ) state.pr.head.sha = 'c'.repeat(40);
      return {data:{ok:true}};
    }
    throw new Error( `Unexpected network request: ${path}` );
  },
  status: async ( _issue: number, status: string ) => {state.label=status;},
  dispatch: async () => {requests.push({path:'dispatch',body:''});},
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
    `}));
  }}],
});
const service = await import(`data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString('base64')}`) as typeof import('../lib/server/manualContributionReview');

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
