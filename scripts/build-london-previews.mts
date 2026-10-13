import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { londonEditorialFood, londonEditorialSights } from '../data/london/editorial';

// Run with: node --import tsx scripts/build-london-previews.mts
const output = path.resolve( 'public/london-editorial' );
await mkdir( output, { recursive: true } );
for ( const place of [ ...londonEditorialFood, ...londonEditorialSights ] )
{
  const image = place.images[ 0 ];
  if ( !image.startsWith( '/' ) ) throw new Error( `Expected local preview source: ${place.slug}` );
  const result = await sharp( path.resolve( 'public', image.slice( 1 ) ) )
    .rotate().resize( { width: 720, height: 720, fit: 'inside', withoutEnlargement: true } )
    .webp( { quality: 78 } ).toFile( path.join( output, `${place.slug}.webp` ) );
  console.log( `${place.slug}: ${( result.size / 1024 ).toFixed( 1 )} KiB` );
}
