import 'server-only';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { candidates, type Files } from '@/lib/contributions/change-engine';
import type { ExistingEntry } from '@/lib/contributions/existing';
import { getUkCities, getEuropaDestinations } from './cities';

export async function getContributionEntries(): Promise<ExistingEntry[]> {
  const dataRoot = path.join( process.cwd(), 'data' );
  const paths: string[] = [];
  for ( const file of await readdir( dataRoot ) ) if ( /^[\w-]+\.ts$/.test( file ) ) paths.push( file );
  for ( const file of await readdir( path.join( dataRoot, 'europa' ) ) ) if ( /^[\w-]+\.ts$/.test( file ) ) paths.push( 'europa/' + file );
  const files: Files = {
    'src/DATA.md': await readFile( path.join( process.cwd(), 'src/DATA.md' ), 'utf8' ),
    'src/DATA.json': await readFile( path.join( process.cwd(), 'src/DATA.json' ), 'utf8' ),
    ...Object.fromEntries( await Promise.all( paths.map( async file => ['data/' + file, await readFile( path.join( dataRoot, file ), 'utf8' )] ) ) ),
  };
  const cities = [...getUkCities(), ...getEuropaDestinations()];
  return candidates( files ).flatMap( candidate => {
    const city = cities.find( item => item.slug === candidate.target.city && item.country === candidate.target.region );
    const list = candidate.target.category === 'attraction' ? city?.attractions : candidate.target.category === 'cafe' ? city?.cafes : city?.restaurants;
    const entry = list?.find( item => item.id === candidate.target.id && item.name === candidate.target.name );
    if ( !city || !entry ) return [];
    const display = Object.fromEntries( Object.entries( entry ).filter( ([key, value]) => !['id', 'slug', 'name', 'images'].includes( key ) && ( typeof value === 'string' || Array.isArray( value ) ) ).map( ([key, value]) => [key, Array.isArray( value ) ? value.join( '、' ) : String( value )] ) );
    return [{ ...candidate, cityName: city.nameEn, display, images: entry.images ?? [] }];
  } );
}
