import assert from 'node:assert/strict';
import test from 'node:test';
import { hasStandaloneShop, shopHref, SHOP_SLUGS, SHOP_NAMES, SHOP_SLOTS, SHOP_STYLES, STREET_LOOP_SECONDS, STREET_SEGMENT_LENGTH } from '../components/londonStreet/storefronts';
import { londonRestaurants } from '../data/london/restaurants';
import { londonCafes } from '../data/london/cafes';

test( 'every animated shop links to a real unique London restaurant or cafe', () =>
{
  const places = [ ...londonRestaurants, ...londonCafes ];
  assert.equal( SHOP_SLUGS.length, SHOP_NAMES.length );
  assert.equal( new Set( SHOP_SLUGS ).size, SHOP_NAMES.length );
  SHOP_SLUGS.forEach( ( slug, index ) =>
  {
    assert.equal( places.filter( place => place.slug === slug ).length, 1, slug );
    assert.equal( shopHref( index ), `/london/restaurants?restaurant=${slug}` );
  } );
} );

test( 'only the requested shop buildings are removed in their own segment', () =>
{
  const bays = [ [ -1, 0 ], [ 1, 0 ], [ 1, 2 ], [ -1, 4 ], [ 1, 4 ], [ -1, 6 ], [ -1, 7 ] ];
  assert.deepEqual( bays.filter( ( [ side, bay ] ) => hasStandaloneShop( 0, side, bay ) ),
    [ [ -1, 0 ], [ -1, 4 ], [ -1, 6 ], [ -1, 7 ] ] );
  assert.deepEqual( bays.filter( ( [ side, bay ] ) => hasStandaloneShop( 1, side, bay ) ),
    [ [ 1, 2 ], [ -1, 7 ] ] );
} );

test( 'two streets contain all eighteen requested shops exactly once', () =>
{
  assert.equal( SHOP_NAMES.length, 18 );
  assert.equal( new Set( SHOP_NAMES ).size, 18 );
  assert.equal( SHOP_SLOTS.length * 2, SHOP_NAMES.length );
  assert.deepEqual( [ ...SHOP_NAMES ], [ 'Kopitiam', 'Kilin', 'CERU', 'YiQi', 'Lahpet', 'Vasiniko', 'ZIMA', 'Crudo', '遇见云南', '东园', 'Dishroom', 'Cheli', 'Arôme Bakery', 'Truedan', 'Gelupo', 'Nostos Coffee', 'Madura Kichen', 'Chef Javad Persian' ] );
} );

test( 'styles alternate evenly and shops occupy only ordinary building bays', () =>
{
  const ordinaryBays = new Set( [ '-1:0', '-1:4', '-1:6', '-1:7', '1:0', '1:2', '1:4' ] );
  for ( const slot of SHOP_SLOTS ) assert.ok( ordinaryBays.has( `${slot.side}:${slot.bay}` ) );
  for ( const style of SHOP_STYLES )
    assert.equal( SHOP_NAMES.filter( ( _, i ) => SHOP_STYLES[ i % 3 ] === style ).length, 6 );
} );

test( 'longer loop preserves six world units per second', () =>
{
  assert.equal( STREET_LOOP_SECONDS, 36 );
  assert.equal( STREET_SEGMENT_LENGTH * 2 / STREET_LOOP_SECONDS, 6 );
} );
