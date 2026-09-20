import assert from 'node:assert/strict';
import fs from 'node:fs';
import { build } from 'esbuild';

// The CLI reads the same registry as the page. Only Next's server-only marker is stubbed.
const bundle = await build( { entryPoints: ['lib/server/contributionCities.ts'], bundle: true, write: false, platform: 'node', format: 'esm', plugins: [{ name: 'server-marker', setup( builder ) {
  builder.onResolve( { filter: /^server-only$/ }, () => ( { path: 'server-only', namespace: 'marker' } ) );
  builder.onLoad( { filter: /.*/, namespace: 'marker' }, () => ( { contents: '' } ) );
} }] } );
const { getContributionCities } = await import( `data:text/javascript;base64,${Buffer.from( bundle.outputFiles[0].text ).toString( 'base64' )}` ) as typeof import( '../lib/server/contributionCities' );

const { target, values } = JSON.parse( process.env.APPROVED_FRONTEND_CHECK || '{}' );
if ( !target || !values ) throw new Error( 'Missing approved frontend check.' );
const cities = getContributionCities().filter( city => city.country === target.region );
const matchedCities = cities.filter( city => city.slug === target.city );
assert.equal( matchedCities.length, 1, 'Frontend city must resolve uniquely.' );
const city = matchedCities[0];
const list = target.category === 'attraction' ? city.attractions : target.category === 'cafe' ? city.cafes : city.restaurants;
const entries = ( list || [] ).filter( entry => entry.id === target.id );
assert.equal( entries.length, 1, 'Frontend entry ID must resolve uniquely.' );
assert.equal( entries[0].name, target.name );
for ( const [field, value] of Object.entries( values ) ) assert.deepEqual( ( entries[0] as unknown as Record<string, unknown> )[field] ?? '', value, 'Frontend field mismatch: ' + field );
if ( target.sourcePath === 'src/DATA.json' ) {
  const generated = JSON.parse( fs.readFileSync( 'src/DATA.json', 'utf8' ) );
  const generatedCity = generated.cities.find( ( item: { slug: string } ) => item.slug === target.city );
  const generatedList = generatedCity[target.category === 'attraction' ? 'attractions' : target.category === 'cafe' ? 'cafes' : 'restaurants'];
  assert.deepEqual( generatedList.find( ( item: { id: string } ) => item.id === target.id ), entries[0], 'Generated and page data differ.' );
}
console.log( 'Approved fields match the actual frontend registry.' );
