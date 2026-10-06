import assert from 'node:assert/strict';
import test from 'node:test';
import { FORTUNES, fortuneDay, fortuneFromTicket, parseFortune } from '../lib/dailyFortune';

test( 'all 100 tickets exactly match the seven requested probabilities', () => {
  const counts = new Map<string, number>();
  for ( let ticket = 0; ticket < 100; ticket++ )
  {
    const { label } = fortuneFromTicket( ticket );
    counts.set( label, ( counts.get( label ) ?? 0 ) + 1 );
  }
  assert.deepEqual( Object.fromEntries( counts ), { '中下': 12, '下': 5, '中': 35, '上': 35, '上上': 11, 'Ultra Pro 上上上': 1, shite: 1 } );
  assert.equal( FORTUNES.reduce( ( sum, item ) => sum + item.weight, 0 ), 100 );
  for ( const ticket of [ -1, 100, .5, NaN, Infinity ] ) assert.throws( () => fortuneFromTicket( ticket ) );
} );

test( 'the date changes at London midnight, including BST and winter time', () => {
  for ( const [ instant, day ] of [
    [ '2026-09-08T22:59:59Z', '2026-09-08' ],
    [ '2026-09-08T23:00:00Z', '2026-09-09' ],
    [ '2026-12-08T23:59:59Z', '2026-12-08' ],
    [ '2026-12-09T00:00:00Z', '2026-12-09' ],
    [ '2026-03-29T01:00:00Z', '2026-03-29' ],
    [ '2026-10-25T01:00:00Z', '2026-10-25' ],
  ] ) assert.equal( fortuneDay( new Date( instant ) ), day );
} );

test( 'only recognized, valid fortune records can be restored', () => {
  for ( const fortune of FORTUNES )
  {
    const record = { version: 1, date: '2026-09-08', result: fortune.id };
    assert.deepEqual( parseFortune( JSON.stringify( record ) ), record );
  }
  for ( const raw of [ null, '', 'broken', 'null', '[]', '{}', ' '.repeat( 1001 ),
    JSON.stringify( { version: 2, date: '2026-09-08', result: 'high' } ),
    JSON.stringify( { version: 1, date: '2026-02-30', result: 'high' } ),
    JSON.stringify( { version: 1, date: '2026-13-99', result: 'high' } ),
    JSON.stringify( { version: 1, date: '2026-09-08', result: 'invented' } ),
  ] ) assert.equal( parseFortune( raw ), null );
} );
