import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { z } from 'zod';
import type { NewsItem } from './types';

const itemSchema = z.object( {
  title: z.string().trim().min( 1 ).max( 1000 ),
  link: z.string().url(),
  pubDate: z.string(),
} );

function isoDate( value: unknown ): string | null
{
  if ( typeof value !== 'string' || !value.trim() ) return null;
  const timestamp = Date.parse( value );
  return Number.isFinite( timestamp ) ? new Date( timestamp ).toISOString() : null;
}

function thumbnailUrl( thumbnails: unknown ): string | undefined
{
  if ( !Array.isArray( thumbnails ) ) return undefined;
  for ( const thumbnail of thumbnails )
  {
    const result = z.object( { '@_url': z.string().url() } ).safeParse( thumbnail );
    if ( !result.success ) continue;
    const url = new URL( result.data[ '@_url' ] );
    if ( url.protocol === 'https:' && url.hostname === 'ichef.bbci.co.uk'
      && !url.username && !url.password && !url.port ) return url.href;
  }
  return undefined;
}

export function parseBbcFeed( xml: string )
{
  if ( xml.length > 1_000_000 || /<!DOCTYPE|<!ENTITY/i.test( xml ) || XMLValidator.validate( xml ) !== true )
  {
    throw new Error( 'Invalid BBC RSS document.' );
  }

  const parser = new XMLParser( {
    ignoreAttributes: false,
    parseTagValue: false,
    isArray: tagName => tagName === 'item' || tagName === 'media:thumbnail',
  } );
  const parsed = parser.parse( xml );
  const channel = parsed?.rss?.channel;
  if ( !channel || !Array.isArray( channel.item ) ) throw new Error( 'BBC RSS has no news items.' );

  const items: NewsItem[] = [];
  const seen = new Set<string>();
  for ( const rawItem of channel.item )
  {
    const result = itemSchema.safeParse( rawItem );
    if ( !result.success ) continue;
    const { title, link, pubDate } = result.data;
    const url = new URL( link );
    const publishedAt = isoDate( pubDate );
    if ( url.protocol !== 'https:' || ![ 'www.bbc.co.uk', 'www.bbc.com' ].includes( url.hostname )
      || url.username || url.password || url.port || !publishedAt || seen.has( link ) ) continue;
    seen.add( link );
    const imageUrl = thumbnailUrl( rawItem[ 'media:thumbnail' ] );
    // RSS descriptions are optional. Render plain text, never feed-supplied HTML.
    const description = typeof rawItem.description === 'string'
      ? rawItem.description.replace( /<[^>]*>/g, '' ).replace( /\s+/g, ' ' ).trim().slice( 0, 800 )
      : undefined;
    items.push( { title, url: link, publishedAt, ...( imageUrl ? { imageUrl } : {} ), ...( description ? { description } : {} ) } );
  }
  if ( !items.length ) throw new Error( 'BBC RSS has no valid news items.' );

  return {
    items: items.toSorted( ( a, b ) => Date.parse( b.publishedAt ) - Date.parse( a.publishedAt ) ).slice( 0, 12 ),
    feedUpdatedAt: isoDate( channel.lastBuildDate ),
  };
}
