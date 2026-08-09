import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { findGeneratedCity, parseGeneratedCities } from '../data/generatedCityData';
import { countCityRecommendations, mergeCityRegistry } from '../data/cityRegistry';
import { colchesterData } from '../data/colchester';
import { edinburghData } from '../data/edinburgh';
import { glasgowData } from '../data/glasgow';
import { nottinghamData } from '../data/nottingham';
import { southamptonData } from '../data/southampton';
import { swanseaData } from '../data/swansea';
import { yorkData } from '../data/york';
import { copenhagenData } from '../data/europa/copenhagen';
import { icelandData } from '../data/europa/iceland';
import { kolnData } from '../data/europa/koln';
import { parisData } from '../data/europa/paris';
import { polandData } from '../data/europa/poland';
import { stockholmData } from '../data/europa/stockholm';

const generatedContent = JSON.parse( await readFile( 'src/DATA.json', 'utf8' ) );
const cities = parseGeneratedCities( generatedContent );

test( 'York maps from generated content into the city page data shape', () =>
{
  const york = findGeneratedCity( cities, 'york' );

  assert.ok( york );
  assert.equal( york.name, '约克' );
  assert.equal( york.nameEn, 'York' );
  assert.equal( york.heroImage, '/locations/york.png' );
  assert.equal( york.restaurants.length, 12 );
  assert.equal( york.restaurants[ 0 ].name, 'Bettys Café Tea Rooms' );
  assert.equal( york.restaurants[ 0 ].cuisine, 'British' );
  assert.equal( york.restaurants[ 0 ].images[ 0 ], "/Betty's Tea.png" );
  assert.deepEqual(
    york.restaurants.find( restaurant => restaurant.slug === 'corner-grill-house' )?.mustTry,
    [ '20oz T骨牛排（£59/份，适合2人）' ],
  );
  assert.equal(
    york.restaurants.find( restaurant => restaurant.name === '一品香' )?.slug,
    'yi-pin-xiang',
  );
} );

test( 'unknown city slugs do not map to a city page', () =>
{
  assert.equal( findGeneratedCity( cities, 'not-a-real-city' ), undefined );
} );

test( 'the dynamic registry resolves every existing Other Cities slug', () =>
{
  const registry = mergeCityRegistry( cities, [
    yorkData,
    glasgowData,
    southamptonData,
    swanseaData,
    colchesterData,
    nottinghamData,
    edinburghData,
  ] );

  assert.deepEqual(
    registry.map( city => city.slug ).sort(),
    [ 'colchester', 'edinburgh', 'glasgow', 'nottingham', 'southampton', 'swansea', 'york' ],
  );
  assert.equal( registry.find( city => city.slug === 'york' )?.restaurants[ 0 ].id, 'york-restaurant-bettys-cafe-tea-rooms' );
  assert.equal( registry.find( city => city.slug === 'nottingham' )?.restaurants.length, 8 );
  assert.equal( countCityRecommendations( registry.find( city => city.slug === 'nottingham' )! ), 8 );
  assert.equal( countCityRecommendations( registry.find( city => city.slug === 'swansea' )! ), 8 );
} );

test( 'the dynamic registry resolves every existing Europa slug', () =>
{
  const registry = mergeCityRegistry(
    cities.filter( city => city.country === 'europa' ),
    [ icelandData, polandData, stockholmData, copenhagenData, parisData, kolnData ],
  );

  assert.deepEqual(
    registry.map( destination => destination.slug ),
    [ 'iceland', 'poland', 'stockholm', 'copenhagen', 'paris', 'koln' ],
  );
  assert.equal( countCityRecommendations( registry.find( destination => destination.slug === 'iceland' )! ), 4 );
  assert.equal( countCityRecommendations( registry.find( destination => destination.slug === 'copenhagen' )! ), 2 );
  assert.equal( countCityRecommendations( registry.find( destination => destination.slug === 'koln' )! ), 1 );
} );
