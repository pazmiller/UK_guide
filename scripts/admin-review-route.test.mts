import assert from 'node:assert/strict';
import test from 'node:test';
import { build } from 'esbuild';

const harness = { session: null as null | { user: { githubLogin: string } }, calls: [] as unknown[][], conflict: false };
(globalThis as unknown as {routeTestHarness: typeof harness}).routeTestHarness=harness;
const bundle=await build({entryPoints:['app/api/admin/contributions/[issueNumber]/route.ts'],bundle:true,write:false,platform:'node',format:'esm',plugins:[{name:'offline-auth',setup(b){
  b.onResolve({filter:/^next\/server$/},()=>({path:'next',namespace:'stub'}));
  b.onLoad({filter:/.*/,namespace:'stub'},()=>({contents:'export const NextResponse = Response;'}));
  b.onLoad({filter:/\/auth\.ts$/},()=>({contents:'export const auth = async () => globalThis.routeTestHarness.session;'}));
  b.onLoad({filter:/\/githubApp\.ts$/},()=>({contents:'export const acceptContributionIssue = async()=>{}; export const replaceStatusLabel=async()=>{};'}));
  b.onLoad({filter:/\/approvedChanges\.ts$/},()=>({contents:'export const prepareChange=async()=>({}); export const approveChange=async()=>({});'}));
  b.onLoad({filter:/\/submissionEdits\.ts$/},()=>({contents:`import {ReviewConflict} from './manualContributionReview'; export async function saveSubmissionEdits(...args) { if(globalThis.routeTestHarness.conflict) throw new ReviewConflict('投稿已变化'); globalThis.routeTestHarness.calls.push(args); return {ok:true,revision:2}; }`}));
  b.onLoad({filter:/\/manualContributionReview\.ts$/},()=>({contents:`
    export class ReviewConflict extends Error {}
    export const reevaluateContribution=async()=>{};
    export async function manuallyApproveContribution(...args) { if(globalThis.routeTestHarness.conflict) throw new ReviewConflict('PR 已变化'); globalThis.routeTestHarness.calls.push(args); }
  `}));
}}]});
const {POST}=await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`) as typeof import('../app/api/admin/contributions/[issueNumber]/route');

test('manual approval requires current admin allowlist, same origin, SHA and nonempty reason',async()=>{
  const old=process.env.ADMIN_GITHUB_LOGINS; process.env.ADMIN_GITHUB_LOGINS='editor';
  const data={action:'manual-approve',headSha:'a'.repeat(40),reason:'Reviewed'};
  const request=(body:unknown=data,origin='https://site.test')=>POST(new Request('https://site.test/api/admin/contributions/24',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(body)}),{params:Promise.resolve({issueNumber:'24'})});
  try {
    assert.equal((await request()).status,401);
    harness.session={user:{githubLogin:'removed-admin'}}; assert.equal((await request()).status,403);
    harness.session={user:{githubLogin:'editor'}}; assert.equal((await request(data,'https://evil.test')).status,403);
    assert.equal((await request({...data,reason:'  '})).status,400);
    assert.equal((await request({...data,headSha:'old'})).status,400);
    assert.equal(harness.calls.length,0);
    assert.equal((await request({...data,actor:'spoofed-admin'})).status,200);
    assert.deepEqual(harness.calls,[[24,data.headSha,'Reviewed','editor']]);
    harness.conflict=true; assert.equal((await request()).status,409);
  }finally{if(old===undefined) delete process.env.ADMIN_GITHUB_LOGINS; else process.env.ADMIN_GITHUB_LOGINS=old;}
});

test( 'submission editing requires admin, same origin and a current hash; only submitted fields reach the service', async () => {
  const previous = process.env.ADMIN_GITHUB_LOGINS; process.env.ADMIN_GITHUB_LOGINS = 'editor';
  harness.session = null; harness.conflict = false; harness.calls.length = 0;
  const data = { action: 'save-submission', submissionHash: 'b'.repeat( 64 ), edits: { city: 'London' } };
  const request = ( body: unknown = data, origin = 'https://site.test' ) => POST( new Request( 'https://site.test/api/admin/contributions/26', { method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: JSON.stringify( body ) } ), { params: Promise.resolve( { issueNumber: '26' } ) } );
  try {
    assert.equal( ( await request() ).status, 401 );
    harness.session = { user: { githubLogin: 'removed-admin' } }; assert.equal( ( await request() ).status, 403 );
    harness.session = { user: { githubLogin: 'Editor' } }; assert.equal( ( await request( data, 'https://evil.test' ) ).status, 403 );
    assert.equal( ( await request( { ...data, actor: 'spoofed' } ) ).status, 400 );
    assert.equal( ( await request( { ...data, edits: { imageRightsConfirmed: true } } ) ).status, 400 );
    assert.equal( ( await request( { ...data, submissionHash: 'old' } ) ).status, 400 );
    assert.equal( harness.calls.length, 0 );
    const response = await request(); assert.equal( response.status, 200 );
    assert.deepEqual( await response.json(), { ok: true, revision: 2 } );
    assert.deepEqual( harness.calls, [[26, data.submissionHash, { city: 'London' }, 'editor']] );
    harness.conflict = true; assert.equal( ( await request() ).status, 409 );
  } finally { if ( previous === undefined ) delete process.env.ADMIN_GITHUB_LOGINS; else process.env.ADMIN_GITHUB_LOGINS = previous; }
} );
