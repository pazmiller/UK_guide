import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { build } from 'esbuild';
import { contributionSubmissionSchema, type ContributionSubmission } from '../lib/contributions/schema';
import { adminSubmissionEditsSchema, type AdminSubmissionEdits } from '../lib/contributions/admin-edit';
import { candidates } from '../lib/contributions/change-engine';
import { completeFields } from '../lib/contributions/existing';

const files = Object.fromEntries( ['src/DATA.md', 'src/DATA.json', 'data/nottingham.ts'].map( path => [path, readFileSync( path, 'utf8' )] ) );
( globalThis as unknown as { editSources: unknown } ).editSources = { files };
const output = await build( {
  stdin: { resolveDir: process.cwd(), contents: "export * from './lib/server/submissionEdits'; export {buildIssueBody,parseSubmissionFromIssue,submissionHashFromIssue} from './lib/server/githubApp';" },
  bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external',
  plugins: [{ name: 'offline-edit', setup( b ) {
    b.onResolve( { filter: /^(server-only|@octokit\/auth-app)$/ }, args => ( { path: args.path, namespace: 'stub' } ) );
    b.onLoad( { filter: /.*/, namespace: 'stub' }, args => ( { contents: args.path === 'server-only' ? '' : 'export const createAppAuth=()=>async()=>({token:"fake-token"});' } ) );
    b.onLoad( { filter: /\/manualContributionReview\.ts$/ }, () => ( { contents: 'export class ReviewConflict extends Error {} export const loadManualReview=async()=>null;' } ) );
    b.onLoad( { filter: /\/approvedChanges\.ts$/ }, () => ( { contents: 'export const currentChangeSources=async()=>globalThis.editSources;' } ) );
  } }],
} );
const bundled = { exports: {} };
new Function( 'require', 'module', 'exports', output.outputFiles[0].text )( createRequire( import.meta.url ), bundled, bundled.exports );
const { saveSubmissionEdits, buildIssueBody, parseSubmissionFromIssue, submissionHashFromIssue } = bundled.exports as typeof import('../lib/server/submissionEdits') & typeof import('../lib/server/githubApp');
const restaurant = contributionSubmissionSchema.parse( {
  type: 'restaurant', intent: 'add', city: 'Lodon', name: 'Gina Street food', details: '巴勒斯坦风味餐厅',
  cuisine: 'Other', customCuisine: 'Palestinian', price: '£8-20', recommendReason: '味道可以', recommendSignatures: 'Today’s Platter',
  submitterName: '二十', imageKeys: ['incoming/26/photo.webp'], imageRightsConfirmed: true,
} );
const previousPr = { number: 30, node_id: 'PR_30', state: 'open', draft: false, merged_at: null as string | null, html_url: 'https://github.com/owner/public/pull/30' };

async function scenario( run: ( h: ReturnType<typeof fixture> ) => Promise<void>, submission = restaurant ) {
  const env = { CONTRIBUTION_GITHUB_REPOSITORY: 'owner/private', PUBLIC_GITHUB_REPOSITORY: 'owner/public', GITHUB_APP_ID: '123', GITHUB_APP_INSTALLATION_ID: '456', GITHUB_APP_PRIVATE_KEY: 'fake-key' };
  const old = Object.fromEntries( Object.keys( env ).map( key => [key, process.env[key]] ) );
  const fetch = globalThis.fetch; Object.assign( process.env, env );
  const h = fixture( submission ); globalThis.fetch = h.fetch;
  try { await run( h ); }
  finally { globalThis.fetch = fetch; for ( const [key, value] of Object.entries( old ) ) { if ( value === undefined ) delete process.env[key]; else process.env[key] = value; } }
}
function fixture( submission: ContributionSubmission ) {
  const h = {
    issue: { body: buildIssueBody( submission ), state: 'open', labels: ['status:failed', 'type:restaurant', 'intent:add', 'routing:agent', 'custom:keep'] },
    prs: [] as typeof previousPr[], writes: [] as Array<{ path: string; method: string; body: Record<string, unknown> }>,
    heads: [] as string[], closeFails: false, draftFails: false, gets: 0, changeDuringSave: false,
    fetch: async ( input: RequestInfo | URL, init: RequestInit = {} ) => {
      const url = new URL( String( input ) ); const method = init.method ?? 'GET'; const path = url.pathname;
      if ( method === 'GET' ) {
        if ( path === '/repos/owner/private/issues/26' ) {
          h.gets++;
          if ( h.changeDuringSave && h.gets === 2 ) h.issue.labels = ['status:accepted'];
          return Response.json( h.issue );
        }
        assert.equal( path, '/repos/owner/public/pulls' );
        assert.equal( url.searchParams.get( 'state' ), 'all' );
        h.heads.push( url.searchParams.get( 'head' )! ); return Response.json( h.prs );
      }
      const body = JSON.parse( String( init.body ) ); h.writes.push( { path, method, body } );
      if ( path === '/graphql' ) return Response.json( h.draftFails ? { errors: [{ message: 'denied' }] } : { data: { convertPullRequestToDraft: { pullRequest: { id: 'PR_30' } } } } );
      if ( path === '/repos/owner/private/issues/26/comments' ) return Response.json( {} );
      if ( path === '/repos/owner/private/issues/26' && method === 'PATCH' ) { Object.assign( h.issue, body ); return Response.json( h.issue ); }
      assert.equal( path, '/repos/owner/public/pulls/30' ); assert.equal( body.state, 'closed' );
      assert.equal( parseSubmissionFromIssue( h.issue.body )!.revision, ( submission.revision ?? 1 ) + 1, 'Save the new revision before closing the old PR' );
      return Response.json( {}, { status: h.closeFails ? 403 : 200 } );
    },
  };
  return h;
}
const save = ( h: ReturnType<typeof fixture>, edits: AdminSubmissionEdits = { city: 'London' } ) => saveSubmissionEdits( 26, submissionHashFromIssue( h.issue.body ), edits, 'editor' );

test( 'partial edit schema does not inject defaults into untouched fields', () => {
  assert.deepEqual( adminSubmissionEditsSchema.parse( { city: 'London' } ), { city: 'London' } );
  assert.deepEqual( adminSubmissionEditsSchema.parse( {} ), {} );
  for ( const year of ['abcd', '123', '2100'] ) assert.equal( adminSubmissionEditsSchema.safeParse( { studyStartYear: year } ).success, false );
  assert.deepEqual( adminSubmissionEditsSchema.parse( { studyStartYear: '2024', studyEndYear: '至今' } ), { studyStartYear: '2024', studyEndYear: '至今' } );
  for ( const field of ['revision', 'type', 'intent', 'imageKeys', 'imageRightsConfirmed', 'submitterName', 'existingEdit'] ) assert.equal( adminSubmissionEditsSchema.safeParse( { [field]: 'changed' } ).success, false );
} );
test( 'corrects city in the same Issue, preserves other information and resets status without dispatch', () => scenario( async h => {
  const oldHash = submissionHashFromIssue( h.issue.body );
  assert.deepEqual( await save( h, adminSubmissionEditsSchema.parse( { city: 'London' } ) ), { ok: true, revision: 2 } );
  assert.deepEqual( parseSubmissionFromIssue( h.issue.body ), { ...restaurant, city: 'London', revision: 2 } );
  assert.notEqual( submissionHashFromIssue( h.issue.body ), oldHash );
  assert.deepEqual( h.issue.labels, ['type:restaurant', 'intent:add', 'custom:keep', 'status:submitted'] );
  assert.deepEqual( h.heads, ['owner:agent/submission-26'] );
  assert.equal( h.writes.length, 2 );
  assert.match( String( h.writes[0].body.body ), /@editor/ );
  assert.match( String( h.writes[0].body.body ), /"before": "Lodon"/ );
  assert.match( String( h.writes[0].body.body ), /"after": "London"/ );
  assert.equal( h.writes[1].body.title, '[投稿] Gina Street food · London' );
} ) );
test( 'corrects the actual no-image Gina submission without requiring new uploads', () => scenario( async h => {
  await save( h );
  const next = parseSubmissionFromIssue( h.issue.body )!;
  assert.equal( next.city, 'London' ); assert.deepEqual( next.imageKeys, [] ); assert.equal( next.imageRightsConfirmed, false );
}, { ...restaurant, imageKeys: [], imageRightsConfirmed: false } ) );
test( 'AI manual-review can save every restaurant content field while preserving images and contributor permissions', () => scenario( async h => {
  h.issue.labels = ['status:manual-review', 'type:restaurant', 'intent:add'];
  h.prs = [{ ...previousPr, draft: true }];
  const edits = adminSubmissionEditsSchema.parse( {
    name: 'Hiba Street Food', city: 'London', region: 'uk', details: '管理员更正的简介', cuisine: 'Other',
    customCuisine: 'Palestinian', price: '£10-20', recommendReason: '甜品美味，性价比高',
    recommendSignatures: "Today's Platter\nBaklawa, mint tea", sourceUrl: 'https://example.com/hiba',
  } );
  await save( h, edits );
  assert.deepEqual( parseSubmissionFromIssue( h.issue.body ), { ...restaurant, ...edits, revision: 2 } );
  assert.ok( h.issue.labels.includes( 'status:submitted' ) );
  assert.equal( h.writes.at( -1 )!.body.state, 'closed' );
  assert.equal( h.writes.some( write => write.path.includes( 'dispatch' ) || write.path.includes( 'merge' ) ), false );
} ) );
test( 'Ready PR is made Draft, then Issue revision saved, then old PR closed; next edit selects r2 only', () => scenario( async h => {
  h.prs = [previousPr]; await save( h );
  assert.deepEqual( h.writes.map( w => w.path ), ['/graphql', '/repos/owner/private/issues/26/comments', '/repos/owner/private/issues/26', '/repos/owner/public/pulls/30'] );
  h.prs = []; await save( h, { price: '£9-20' } );
  assert.deepEqual( h.heads, ['owner:agent/submission-26', 'owner:agent/submission-26-r2'] );
  assert.equal( parseSubmissionFromIssue( h.issue.body )!.revision, 3 );
} ) );
test( 'existing Draft is closed without converting again; failed close returns saved warning', () => scenario( async h => {
  h.prs = [{ ...previousPr, draft: true }]; h.closeFails = true;
  const result = await save( h );
  assert.equal( result.revision, 2 ); assert.match( result.warning!, /新版已保存/ );
  assert.equal( h.writes.some( w => w.path === '/graphql' ), false );
} ) );
test( 'busy, closed, merged, stale, no-op and protected-field edits do not save', () => scenario( async h => {
  for ( const status of ['accepted', 'agent-running', 'draft-pr', 'merged', 'closed'] ) {
    h.issue.labels = [`status:${status}`]; await assert.rejects( save( h ), /不能编辑/ );
  }
  h.issue.labels = ['status:failed']; h.issue.state = 'closed'; await assert.rejects( save( h ), /不能编辑/ ); h.issue.state = 'open';
  await assert.rejects( saveSubmissionEdits( 26, 'a'.repeat( 64 ), { city: 'London' }, 'editor' ), /已被其他管理员修改/ );
  await assert.rejects( save( h, { city: ' Lodon ' } ), /没有变化/ );
  await assert.rejects( save( h, { rating: 5 } ), /不能更改/ );
  h.prs = [{ ...previousPr, merged_at: '2026-09-23T00:00:00Z' }]; await assert.rejects( save( h ), /已合并/ );
  assert.equal( h.writes.length, 0 );
} ) );
test( 'failure to withdraw old Ready PR or status changing during save leaves Issue body unchanged', () => scenario( async h => {
  const original = h.issue.body; h.prs = [previousPr]; h.draftFails = true;
  await assert.rejects( save( h ), /无法撤回/ ); assert.equal( h.issue.body, original );
  h.prs = []; h.changeDuringSave = true; h.gets = 0; h.writes.length = 0;
  await assert.rejects( save( h ), /保存期间/ ); assert.equal( h.issue.body, original ); assert.equal( h.writes.length, 0 );
} ) );
test( 'structured edits preserve the selected target and before snapshot; changed published data requires rechecking', async () => {
  const tilt = candidates( files ).find( item => item.target.id === 'no-r3' )!;
  const submission = contributionSubmissionSchema.parse( { ...restaurant, name: tilt.target.name, city: tilt.target.city, intent: 'update', existingEdit: { target: tilt.target, before: completeFields( tilt.fields ), changes: [{ field: 'notes', after: '用户的新内容' }] } } );
  await scenario( async h => {
    await assert.rejects( save( h, { city: 'London' } ), /不能更改/ );
    await save( h, { existingChanges: [{ field: 'notes', after: '管理员确认的新内容' }] } );
    const next = parseSubmissionFromIssue( h.issue.body )!;
    assert.deepEqual( next.existingEdit, { ...submission.existingEdit, changes: [{ field: 'notes', after: '管理员确认的新内容' }] } );
    const old = files['src/DATA.md']; files['src/DATA.md'] = old.replace( tilt.fields.address!, 'changed address' );
    try { await assert.rejects( save( h, { existingChanges: [{ field: 'notes', after: '新的' }] } ), /原资料已更新/ ); }
    finally { files['src/DATA.md'] = old; }
  }, submission );
} );
test( 'university review updates derived study period but does not permit changing school or identity', async () => {
  const university = contributionSubmissionSchema.parse( { type: 'university', intent: 'add', name: 'Exeter', universitySlug: 'university-of-exeter', details: '整体评价', studyStartYear: '2024', studyEndYear: '2025', studyYear: '2024–2025', studyStage: '硕士', studyProgram: 'CS', rating: 4, submitterName: '学生', discloseSubmitterName: true } );
  await scenario( async h => {
    await assert.rejects( save( h, { name: 'London' } ), /不能更改/ );
    await save( h, { studyEndYear: '至今', universityPros: '环境好', rating: 4.5 } );
    assert.deepEqual( parseSubmissionFromIssue( h.issue.body ), { ...university, studyEndYear: '至今', studyYear: '2024–至今', universityPros: '环境好', rating: 4.5, revision: 2 } );
  }, university );
} );
