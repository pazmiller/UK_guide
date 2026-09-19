import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { candidates, expectedFiles, expectedFrontendValues, validateGeneratedFields } from '../lib/contributions/change-engine';
import { existingEditSchema, type ChangeRequest } from '../lib/contributions/change-contract';
import { completeFields, validateExistingEdit, type ExistingEntry } from '../lib/contributions/existing';
import { contributionSubmissionSchema } from '../lib/contributions/schema';
import { buildKnowledgeBase } from './build-rag-kb.mjs';

const files = Object.fromEntries( ['src/DATA.md', 'src/DATA.json', 'data/nottingham.ts'].map( file => [file, readFileSync( file, 'utf8' )] ) );
const tilt = candidates( files ).find( item => item.target.name === 'Tilt' && item.target.city === 'nottingham' )!;
const entry: ExistingEntry = { ...tilt, cityName: 'Nottingham', display: {}, images: [] };
const edit = existingEditSchema.parse( { target: tilt.target, before: completeFields( tilt.fields ), changes: [{ field: 'notes', after: tilt.fields.notes + ' 测试新正文。' }] } );
const validate = ( value = edit, intent = 'update', imageCount = 0 ) => validateExistingEdit( value, entry, intent, 'restaurant', 'uk', 'Tilt', 'nottingham', imageCount );

test( 'real Nottingham Tilt resolves by stable legacy ID and preserves every untouched field', () => {
  assert.equal( tilt.target.id, 'no-r3' );
  assert.equal( tilt.target.sourcePath, 'data/nottingham.ts' );
  validate();
  const request: ChangeRequest = { version: 1, issueNumber: 100, baseSha: 'a'.repeat( 40 ), submissionHash: 'b'.repeat( 64 ), actor: 'test', approvedAt: new Date().toISOString(), target: tilt.target, operation: 'update', fields: edit.changes.map( item => ( { ...item, before: edit.before[item.field] } ) ) };
  const next = expectedFiles( files, request );
  next['src/DATA.json'] = JSON.stringify( buildKnowledgeBase( next['src/DATA.md'] ) );
  validateGeneratedFields( next, files, request );
  assert.match( next['data/nottingham.ts'], /测试新正文。/ );
  assert.match( next['data/nottingham.ts'], /cuisine: 'Cocktail Bar'/ );
  assert.match( next['data/nottingham.ts'], /9 Pelham St, Nottingham, NG1 2EH/ );
} );
test( 'stale snapshots, wrong IDs, no-op changes and forbidden fields are rejected', () => {
  assert.throws( () => validate( { ...edit, before: { ...edit.before, address: 'wrong' } } ), /已更新/ );
  assert.throws( () => validate( { ...edit, target: { ...edit.target, id: 'another' } } ), /不一致/ );
  assert.throws( () => validate( { ...edit, changes: [] } ), /至少一项/ );
  assert.throws( () => validate( { ...edit, changes: [{field: 'notes', after: edit.before.notes}] } ), /未改变/ );
  assert.equal( existingEditSchema.safeParse( { ...edit, changes: [{field: 'images', after: ''}] } ).success, false );
} );
test( 'image-only needs uploads, prohibits text changes and round-trips the exact edit snapshot', () => {
  const image = { ...edit, changes: [] };
  validate( image, 'image', 1 );
  assert.throws( () => validate( image, 'image', 0 ), /上传/ );
  assert.throws( () => validate( edit, 'image', 1 ), /不能修改文字/ );
  const payload = contributionSubmissionSchema.parse( { version: 1, type: 'restaurant', intent: 'update', city: 'nottingham', name: 'Tilt', details: '结构化修改', existingEdit: edit } );
  assert.deepEqual( payload.existingEdit, edit );
  const cleared = { ...edit, changes: [{field: 'notes' as const, after: ''}] };
  validate( cleared );
} );
test( 'Tilt image append retains three existing legacy-only images', () => {
  const request: ChangeRequest = { version: 1, issueNumber: 100, baseSha: 'a'.repeat( 40 ), submissionHash: 'b'.repeat( 64 ), actor: 'test', approvedAt: new Date().toISOString(), target: tilt.target, operation: 'image', fields: [{ field: 'images', before: tilt.fields.images ?? '', after: '/contributions/100/1.webp' }] };
  const next = expectedFiles( files, request );
  next['src/DATA.json'] = JSON.stringify( buildKnowledgeBase( next['src/DATA.md'] ) );
  validateGeneratedFields( next, files, request );
  const expected = ['/contributions/5/1.webp', '/contributions/5/2.webp', '/contributions/5/3.webp', '/contributions/100/1.webp'];
  assert.deepEqual( expectedFrontendValues( request, files ).images, expected );
  for ( const image of expected ) assert.ok( next['data/nottingham.ts'].includes( image ) );
  assert.equal( expectedFiles( files, request )['data/nottingham.ts'], next['data/nottingham.ts'] );
} );
test( 'clearing generated address ignores key order but still rejects changed values and array order', () => {
  const target = candidates( files ).find( item => item.target.city === 'wiltshire' )!;
  const request: ChangeRequest = { version: 1, issueNumber: 100, baseSha: 'a'.repeat( 40 ), submissionHash: 'b'.repeat( 64 ), actor: 'test', approvedAt: new Date().toISOString(), target: target.target, operation: 'update', fields: [{field: 'address', before: target.fields.address!, after: ''}] };
  const next = expectedFiles( files, request );
  next['src/DATA.json'] = JSON.stringify( buildKnowledgeBase( next['src/DATA.md'] ) );
  validateGeneratedFields( next, files, request );
  const changed = JSON.parse( next['src/DATA.json'] );
  changed.cities.reverse();
  assert.throws( () => validateGeneratedFields( {...next, 'src/DATA.json': JSON.stringify( changed )}, files, request ), /other fields/ );
  changed.cities.reverse();
  changed.cities[0].description += 'unauthorized';
  assert.throws( () => validateGeneratedFields( {...next, 'src/DATA.json': JSON.stringify( changed )}, files, request ), /other fields/ );
} );
