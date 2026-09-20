import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { build } from 'esbuild';
import { completeFields, type ExistingEntry } from '../lib/contributions/existing';
import type { ContributionSubmission } from '../lib/contributions/schema';
import { londonAttractions } from '../data/london/attractions';

const harness = { writes: [] as ContributionSubmission[] };
(globalThis as unknown as { existingRouteHarness: typeof harness }).existingRouteHarness = harness;
// Exercise actual schema, catalog/filesystem and route; only external writes are stubbed.
async function load( entryPoint: string ) {
  const bundle = await build( { entryPoints: [entryPoint], bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external', plugins: [{name: 'offline', setup( b ) {
    b.onResolve( {filter: /^server-only$/}, () => ( {path: 'marker', namespace: 'empty'} ) );
    b.onResolve( {filter: /^next\/server$/}, () => ( {path: 'next', namespace: 'next'} ) );
    b.onLoad( {filter: /.*/, namespace: 'empty'}, () => ( {contents: ''} ) );
    b.onLoad( {filter: /.*/, namespace: 'next'}, () => ( {contents: 'export const NextResponse = Response;'} ) );
    b.onLoad( {filter: /\/githubApp\.ts$/}, () => ( {contents: 'export async function createContributionIssue(value) { globalThis.existingRouteHarness.writes.push(value); }'} ) );
  }}] } );
  const testModule = { exports: {} };
  new Function( 'require', 'module', 'exports', bundle.outputFiles[0].text )( createRequire( import.meta.url ), testModule, testModule.exports );
  return testModule.exports as { POST: ( request: Request ) => Promise<Response>; GET: () => Promise<Response> };
}
const { GET } = await load( 'app/api/contributions/entries/route.ts' );
const { POST } = await load( 'app/api/contributions/route.ts' );
const catalogResponse = await GET();
assert.equal( catalogResponse.status, 200 );
const catalog = ( await catalogResponse.json() ).entries as ExistingEntry[];
const tilt = catalog.find( entry => entry.target.name === 'Tilt' && entry.target.city === 'nottingham' )!;
const attraction = catalog.find( entry => entry.target.city === 'wiltshire' && entry.target.category === 'attraction' )!;
const payload = ( entry = tilt, intent = 'update' ) => ( { version: 1, type: entry.target.category === 'attraction' ? 'attraction' : 'restaurant', intent, region: entry.target.region, city: entry.target.city, name: entry.target.name, details: '结构化修改', existingEdit: { target: entry.target, before: completeFields( entry.fields ), changes: intent === 'image' ? [] : [{field: 'summary', after: '完整新简介：2号巨石阵 / test'}] }, imageKeys: [] as string[], imageRightsConfirmed: false } );
let client = 0;
async function submit( value: unknown, ip = `test-${client++}` ) {
  return POST( new Request( 'https://site.test/api/contributions', { method: 'POST', headers: {'content-type': 'application/json', 'x-forwarded-for': ip}, body: JSON.stringify( value ) } ) );
}
test( 'real catalog includes Tilt current page details and legacy images; no internal credentials', () => {
  for ( const category of ['restaurant', 'cafe', 'attraction'] ) assert.ok( catalog.some( item => item.target.city === 'london' && item.target.category === category ), 'London category available: ' + category );
  assert.equal( tilt.target.id, 'no-r3' );
  assert.equal( tilt.display.cuisine, 'Cocktail Bar' );
  assert.equal( tilt.images.length, 3 );
  assert.ok( tilt.fields.notes?.includes( '门头很小' ) );
  assert.equal( catalogResponse.headers.get( 'cache-control' ), 'no-store' );
  for ( const item of catalog ) assert.deepEqual( Object.keys( item ).sort(), ['cityName', 'display', 'fields', 'images', 'target'] );
} );
test( 'all 14 London attractions are selectable with their original stable IDs', () => {
  const entries = catalog.filter( item => item.target.city === 'london' && item.target.category === 'attraction' );
  assert.equal( entries.length, 14 );
  assert.deepEqual( entries.map( item => item.target.id ).sort(), londonAttractions.map( item => item.id ).sort() );
  for ( const original of londonAttractions.slice( 1, 10 ) ) {
    const candidate = entries.find( item => item.target.id === original.id )!;
    assert.equal( candidate.fields.summary, original.shortDescription );
    assert.equal( candidate.fields.notes, original.description );
    assert.equal( candidate.fields.images, original.images.join( ', ' ) );
    assert.deepEqual( candidate.images, original.images );
    assert.equal( candidate.target.sourcePath, 'data/london/attractions.ts' );
  }
} );
test( 'real POST accepts exact restaurant/attraction changes and preserves complete before/after payload', async () => {
  for ( const entry of [tilt, attraction] ) {
    const value = payload( entry );
    assert.equal( ( await submit( value ) ).status, 201 );
    assert.deepEqual( harness.writes.at( -1 )!.existingEdit, value.existingEdit );
  }
} );
test( 'POST rejects missing/wrong target, stale unedited fields, category/region/city/name spoofing and no-op', async () => {
  const start = harness.writes.length;
  for ( const mutate of [
    ( p: ReturnType<typeof payload> ) => ( {...p, existingEdit: undefined} ),
    ( p: ReturnType<typeof payload> ) => ( {...p, existingEdit: {...p.existingEdit, target: {...p.existingEdit.target, id: 'wrong'}}} ),
    ( p: ReturnType<typeof payload> ) => ( {...p, existingEdit: {...p.existingEdit, before: {...p.existingEdit.before, address: 'stale'}}} ),
    ( p: ReturnType<typeof payload> ) => ( {...p, type: 'attraction'} ),
    ( p: ReturnType<typeof payload> ) => ( {...p, region: 'europa'} ),
    ( p: ReturnType<typeof payload> ) => ( {...p, city: 'York'} ),
    ( p: ReturnType<typeof payload> ) => ( {...p, name: 'Other'} ),
    ( p: ReturnType<typeof payload> ) => ( {...p, existingEdit: {...p.existingEdit, changes: []}} ),
  ] ) assert.equal( ( await submit( mutate( payload() ) ) ).status, 409 );
  assert.equal( harness.writes.length, start );
} );
test( 'POST enforces image-only semantics, uploaded-key format and rights', async () => {
  const valid = { ...payload( tilt, 'image' ), imageKeys: ['incoming/test/image.png'], imageRightsConfirmed: true };
  assert.equal( ( await submit( valid ) ).status, 201 );
  const start = harness.writes.length;
  assert.equal( ( await submit( payload( tilt, 'image' ) ) ).status, 409 );
  assert.equal( ( await submit( {...valid, existingEdit: payload().existingEdit} ) ).status, 409 );
  assert.equal( ( await submit( {...valid, imageRightsConfirmed: false} ) ).status, 400 );
  assert.equal( ( await submit( {...valid, imageKeys: ['../../etc/passwd']} ) ).status, 400 );
  assert.equal( harness.writes.length, start );
} );
test( 'malformed fields and honeypot never create Issues; rate limit still enforced', async () => {
  const start = harness.writes.length;
  const value = payload();
  assert.equal( ( await submit( {...value, existingEdit: {...value.existingEdit, changes: [...value.existingEdit.changes, ...value.existingEdit.changes]}} ) ).status, 400 );
  assert.equal( ( await submit( {...value, existingEdit: {...value.existingEdit, changes: [{field: 'images', after: 'https://evil.test'}]}} ) ).status, 400 );
  assert.equal( ( await submit( {...value, website: 'bot'} ) ).status, 202 );
  for ( let i = 0; i < 5; i++ ) await submit( {}, 'rate-limit-test' );
  assert.equal( ( await submit( value, 'rate-limit-test' ) ).status, 429 );
  assert.equal( harness.writes.length, start );
} );
