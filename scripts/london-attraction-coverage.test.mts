import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { londonAttractions } from '../data/london/attractions';
import { candidates, expectedFiles, validateGeneratedFields, legacyObjects } from '../lib/contributions/change-engine';
import type { ChangeRequest } from '../lib/contributions/change-contract';
import { buildKnowledgeBase } from './build-rag-kb.mjs';

const files = Object.fromEntries( ['src/DATA.md', 'src/DATA.json', 'data/london/attractions.ts'].map( file => [file, readFileSync( file, 'utf8' )] ) );
const entries = candidates( files ).filter( item => item.target.city === 'london' && item.target.category === 'attraction' );
for ( const original of londonAttractions.slice( 1, 10 ) ) test( `${original.name}: exact source text, scoped edit and image append`, () => {
  const entry = entries.find( item => item.target.id === original.id )!;
  assert.ok( entry );
  const request: ChangeRequest = {version: 1, issueNumber: 9876, submissionHash: 'a'.repeat( 64 ), baseSha: 'b'.repeat( 40 ), actor: 'test', approvedAt: new Date().toISOString(), target: entry.target, operation: 'update', fields: [{field: 'notes', before: original.description, after: original.description + ' 测试修改。'}]};
  for ( const proposal of [request, {...request, operation: 'image' as const, fields: [{field: 'images' as const, before: entry.fields.images!, after: entry.fields.images + ', /contributions/9876/1.webp'}]}] ) {
    const result = expectedFiles( files, proposal );
    result['src/DATA.json'] = JSON.stringify( buildKnowledgeBase( result['src/DATA.md'] ) );
    validateGeneratedFields( result, files, proposal );
    const before = legacyObjects( files['data/london/attractions.ts'] );
    const after = legacyObjects( result['data/london/attractions.ts'] );
    assert.equal( before.length, after.length );
    let changed = 0;
    for ( let i = 0; i < before.length; i++ ) if ( before[i].getText() !== after[i].getText() ) {
      changed++;
      assert.ok( before[i].getText().includes( `'${original.id}'` ) );
      for ( const image of original.images ) assert.ok( after[i].getText().includes( image ) );
    }
    assert.equal( changed, 1 );
    assert.equal( expectedFiles( files, proposal )['data/london/attractions.ts'], result['data/london/attractions.ts'] );
  }
} );
