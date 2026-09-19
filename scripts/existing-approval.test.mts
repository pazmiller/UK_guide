import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { build } from 'esbuild';
import { candidates } from '../lib/contributions/change-engine';
import { completeFields } from '../lib/contributions/existing';
import type { ChangeRequest } from '../lib/contributions/change-contract';

const files = Object.fromEntries( ['src/DATA.md', 'src/DATA.json', 'data/nottingham.ts'].map( file => [file, readFileSync( file, 'utf8' )] ) );
const tilt = candidates( files ).find( item => item.target.id === 'no-r3' )!;
const submission = {version: 1, type: 'restaurant', intent: 'update', region: 'uk', name: 'Tilt', city: 'nottingham', details: 'structured', imageKeys: [], imageRightsConfirmed: false, existingEdit: {target: tilt.target, before: completeFields( tilt.fields ), changes: [{field: 'notes', after: '用户确认的新正文'}]}};
const hash = createHash( 'sha256' ).update( JSON.stringify( submission ) ).digest( 'hex' );
const writes: unknown[] = [];
const harness = { submission, files, writes, async request( url: string, options?: {method?: string; body?: string} ) {
  if ( options?.method === 'POST' ) { writes.push( JSON.parse( options.body! ) ); return {}; }
  if ( url.endsWith( '/issues/42' ) ) return {state: 'open', labels: [{name: 'status:submitted'}], body: `<!-- contribution-data:${Buffer.from( JSON.stringify( submission ) ).toString( 'base64url' )} -->`};
  if ( url.includes( '/commits/' ) ) return {sha: 'a'.repeat( 40 )};
  if ( url.includes( '/git/trees/' ) ) return {truncated: false, tree: Object.keys( files ).map( path => ( {path, type: 'blob'} ) )};
  if ( url.includes( '/contents/' ) ) return {encoding: 'base64', content: Buffer.from( files[url.split( '/contents/' )[1].split( '?' )[0]] ).toString( 'base64' )};
  throw new Error( 'Unexpected external request: ' + url );
}};
(globalThis as unknown as {approvalHarness: typeof harness}).approvalHarness = harness;
const bundled = await build( {entryPoints: ['lib/server/approvedChanges.ts'], bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external', plugins: [{name: 'offline-approval', setup( b ) {
  b.onResolve( {filter: /^server-only$/}, () => ( {path: 'marker', namespace: 'empty'} ) );
  b.onLoad( {filter: /.*/, namespace: 'empty'}, () => ( {contents: ''} ) );
  b.onLoad( {filter: /\/manualContributionReview\.ts$/}, () => ( {contents: 'export class ReviewConflict extends Error {}'} ) );
  b.onLoad( {filter: /\/githubApp\.ts$/}, () => ( {contents: `export const getContributionRepository=()=>({fullName:'owner/private'}); export const parseSubmissionFromIssue=()=>globalThis.approvalHarness.submission; export const githubRequest=(...args)=>globalThis.approvalHarness.request(...args);`} ) );
}}]} );
const testModule = {exports: {}};
new Function( 'require', 'module', 'exports', bundled.outputFiles[0].text )( createRequire( import.meta.url ), testModule, testModule.exports );
const {prepareChange, approveChange} = testModule.exports as typeof import('../lib/server/approvedChanges');
test( 'Admin is bound to contributor target and exact field change; stale preview cannot write approval', async () => {
  const env = process.env.PUBLIC_GITHUB_REPOSITORY;
  process.env.PUBLIC_GITHUB_REPOSITORY = 'owner/public';
  try {
    const preview = await prepareChange( 42 );
    assert.equal( preview.candidates.length, 1 );
    assert.equal( preview.candidates[0].target.id, 'no-r3' );
    const approved: ChangeRequest = {version: 1, issueNumber: 42, submissionHash: hash, baseSha: 'a'.repeat( 40 ), actor: 'spoofed', approvedAt: new Date().toISOString(), target: tilt.target, operation: 'update', fields: [{field: 'notes', before: tilt.fields.notes!, after: '用户确认的新正文'}]};
    assert.equal( ( await approveChange( 42, approved, 'real-admin' ) ).actor, 'real-admin' );
    assert.equal( writes.length, 1 );
    await assert.rejects( approveChange( 42, {...approved, target: {...approved.target, id: 'wrong'}}, 'real-admin' ), /不能更换/ );
    await assert.rejects( approveChange( 42, {...approved, fields: [{...approved.fields[0], after: 'AI 擅自改写'}]}, 'real-admin' ), /必须与用户/ );
    await assert.rejects( approveChange( 42, {...approved, fields: [...approved.fields, {field: 'address', before: tilt.fields.address!, after: 'Wrong address'}]}, 'real-admin' ), /必须与用户/ );
    await assert.rejects( approveChange( 42, {...approved, submissionHash: 'b'.repeat( 64 )}, 'real-admin' ), /已变化/ );
    await assert.rejects( approveChange( 42, {...approved, baseSha: 'b'.repeat( 40 )}, 'real-admin' ), /版本已更新/ );
    const old = files['src/DATA.md'];
    files['src/DATA.md'] = old.replace( tilt.fields.address!, 'Changed address since submission' );
    await assert.rejects( prepareChange( 42 ), /原资料已变化/ );
    await assert.rejects( approveChange( 42, approved, 'real-admin' ), /原资料已变化/ );
    files['src/DATA.md'] = old;
    assert.equal( writes.length, 1, 'No rejected request may write an approval' );
  } finally { if ( env === undefined ) delete process.env.PUBLIC_GITHUB_REPOSITORY; else process.env.PUBLIC_GITHUB_REPOSITORY = env; }
} );
