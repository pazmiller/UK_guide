import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import { buildKnowledgeBase } from './build-rag-kb.mjs';
import { candidates, expectedFiles, readFields, validateExactFiles, validateGeneratedFields, type Files } from '../lib/contributions/change-engine';
import { changeRequestSchema, type ChangeRequest } from '../lib/contributions/change-contract';

const old = '比起那个众所周知的巨石阵，这个40分钟外的另一个巨石阵 is just as impressive。';
const updated = '比起那个众所周知的巨石阵，这是一个40分钟外的2号巨石阵 is just as impressive。';
const markdown = `Wiltshire｜威尔特郡（景点）\n城市标识： wiltshire\n城市描述： 英格兰西南。\n城市封面： /cover.webp\n国家： uk\n导航顺序： 20\nAvebury 巨石阵\n条目标识： avebury\n图片： /contributions/23/1.webp\n简介： ${old}\n地址： Avebury, SN8 1RD\n\nYork｜约克（景点）\n城市标识： york\n城市描述： 城市。\n城市封面： /cover.webp\n国家： uk\n导航顺序： 21\nAvebury 巨石阵\n条目标识： avebury\n简介： 另一个城市中的同名条目。\n`;
const files: Files = { 'src/DATA.md': markdown, 'src/DATA.json': JSON.stringify( buildKnowledgeBase( markdown ) ) };
const target = candidates( files ).find( item => item.target.city === 'wiltshire' )!.target;
export const request: ChangeRequest = { version: 1, issueNumber: 24, submissionHash: 'a'.repeat( 64 ), baseSha: 'b'.repeat( 40 ), actor: 'editor', approvedAt: '2026-09-14T00:00:00.000Z', target, operation: 'update', fields: [{ field: 'summary', before: old, after: updated }] };
function generate( value: Files ): Files { return { ...value, 'src/DATA.json': JSON.stringify( buildKnowledgeBase( value['src/DATA.md'] ) ) }; }

test( '#24 changes only approved description; postcode, old images and same-name city survive', () => {
  const result = generate( expectedFiles( files, request ) );
  assert.match( result['src/DATA.md'], /2号巨石阵/ );
  assert.match( result['src/DATA.md'], /SN8 1RD/ );
  assert.doesNotMatch( result['src/DATA.md'], /免费进入/ );
  validateExactFiles( result, expectedFiles( files, request ) );
  validateGeneratedFields( result, files, request );
  assert.throws( () => validateExactFiles( { ...result, 'src/DATA.md': result['src/DATA.md'].replace( 'SN8 1RD', 'SN8 1RF' ) }, expectedFiles( files, request ) ), /Unauthorized/ );
  assert.throws( () => validateGeneratedFields( generate( { ...result, 'src/DATA.md': result['src/DATA.md'].replace( updated, old + '免费进入。' ) } ), files, request ), /lost or rewrote/ );
} );
test( 'wrong ID, concurrent changes and duplicate fields fail closed', () => {
  assert.throws( () => expectedFiles( files, { ...request, target: { ...target, id: 'wrong' } } ), /uniquely/ );
  assert.throws( () => expectedFiles( generate( { ...files, 'src/DATA.md': markdown.replace( old, 'Someone edited this.' ) } ), request ), /old value changed/ );
  assert.equal( changeRequestSchema.safeParse( { ...request, fields: [...request.fields, ...request.fields] } ).success, false );
} );
test( 'image appends preserve order, reject duplicates and produce repeatable output', () => {
  const imageRequest: ChangeRequest = { ...request, operation: 'image', fields: [{ field: 'images', before: '/contributions/23/1.webp', after: '/contributions/23/1.webp, /contributions/24/1.webp' }] };
  const result = generate( expectedFiles( files, imageRequest ) );
  validateGeneratedFields( result, files, imageRequest );
  assert.equal( expectedFiles( files, imageRequest )['src/DATA.md'], result['src/DATA.md'] );
  assert.equal( readFields( result['src/DATA.md'], target ).images, imageRequest.fields[0].after );
  assert.throws( () => expectedFiles( files, { ...imageRequest, fields: [{ ...imageRequest.fields[0], after: '/contributions/24/1.webp' }] } ), /preserve/ );
  assert.throws( () => expectedFiles( files, { ...imageRequest, fields: [{ ...imageRequest.fields[0], after: '/contributions/23/1.webp\n/contributions/23/1.webp' }] } ), /unique/ );
} );
test( 'legacy data uses exact ID and only changes mapped literal properties', () => {
  const md = 'Swansea｜斯旺西\nPlace A\n简介： Old\n菜系： Chinese\n推荐原因： Good\n推荐菜： Noodles\n价位： 10\n';
  const source = `export const city = { slug: 'swansea', nameEn: 'Swansea', country: 'uk', restaurants: [{ id: 'sw-r1', name: 'Place A', description: 'Old', shortDescription: 'Old', address: 'Keep' }, { id: 'sw-r2', name: 'Place B', description: 'Other' }] };`;
  const legacy = generate( { 'src/DATA.md': md, 'data/swansea.ts': source } );
  const candidate = candidates( legacy )[0];
  assert.ok( candidate );
  const approved = { ...request, target: candidate.target, fields: [{ field: 'summary' as const, before: 'Old', after: 'New' }] };
  const result = generate( expectedFiles( legacy, approved ) );
  assert.match( result['data/swansea.ts'], /description: "New"/ );
  assert.match( result['data/swansea.ts'], /address: 'Keep'/ );
  assert.match( result['data/swansea.ts'], /description: 'Other'/ );
  validateGeneratedFields( result, legacy, approved );
} );
test( 'generator whitespace rewriting is caught rather than silently normalized', () => {
  const approved = { ...request, fields: [{ ...request.fields[0], after: 'two  spaces' }] };
  assert.throws( () => validateGeneratedFields( generate( expectedFiles( files, approved ) ), files, approved ), /lost or rewrote/ );
} );
test( 'contracts and engines stay synchronized across independent repositories', () => {
  if ( !fs.existsSync( '.agent-automation/src/change-contract.ts' ) ) return;
  assert.equal( fs.readFileSync( 'lib/contributions/change-contract.ts', 'utf8' ), fs.readFileSync( '.agent-automation/src/change-contract.ts', 'utf8' ) );
  assert.equal( fs.readFileSync( 'lib/contributions/change-engine.ts', 'utf8' ).replace( "'./change-contract'", "'./change-contract.js'" ).replace( "from 'typescript'", "from 'typescript-parser'" ).trim(), fs.readFileSync( '.agent-automation/src/change-engine.ts', 'utf8' ).trim() );
} );
