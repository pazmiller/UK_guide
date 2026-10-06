import assert from 'node:assert/strict';
import test from 'node:test';
import { parseBbcFeed } from '../lib/news/parseBbcFeed';

const item = ( title = 'Test headline', url = 'https://www.bbc.co.uk/news/articles/test', date = 'Sun, 06 Sep 2026 10:00:00 GMT' ) =>
  `<item><title>${title}</title><link>${url}</link><pubDate>${date}</pubDate></item>`;
const feed = ( items: string, metadata = '' ) => `<rss><channel>${metadata}${items}</channel></rss>`;

test( 'parses single items, CDATA and escaped URLs without altering the headline', () => {
  const result = parseBbcFeed( feed( item( '<![CDATA[Trains & travel: what’s changing?]]>', 'https://www.bbc.co.uk/news/articles/test?at_medium=RSS&amp;at_campaign=rss' ), '<lastBuildDate>Sun, 06 Sep 2026 11:00:00 GMT</lastBuildDate>' ) );
  assert.deepEqual( result, {
    items: [ { title: 'Trains & travel: what’s changing?', url: 'https://www.bbc.co.uk/news/articles/test?at_medium=RSS&at_campaign=rss', publishedAt: '2026-09-06T10:00:00.000Z' } ],
    feedUpdatedAt: '2026-09-06T11:00:00.000Z',
  } );
} );

test( 'returns up to twelve recent items for reading mode, newest first', () => {
  const result = parseBbcFeed( feed( Array.from( { length: 15 }, ( _, index ) => item( `Headline ${index}`, `https://www.bbc.com/news/articles/${index}`, `2026-09-06T${String( index ).padStart( 2, '0' )}:00:00Z` ) ).join( '' ) ) );
  assert.deepEqual( result.items.map( entry => entry.title ), Array.from( { length: 12 }, ( _, index ) => `Headline ${14 - index}` ) );
  assert.equal( result.feedUpdatedAt, null );
} );

test( 'preserves BBC summaries as bounded plain text without requiring a description', () => {
  const withDescription = ( description: string ) => feed( item().replace( '</item>', `<description>${description}</description></item>` ) );
  assert.equal( parseBbcFeed( withDescription( '<![CDATA[A short <b>BBC</b> summary.]]>' ) ).items[ 0 ].description, 'A short BBC summary.' );
  assert.equal( parseBbcFeed( withDescription( 'Travel &amp; weather updates' ) ).items[ 0 ].description, 'Travel & weather updates' );
  assert.equal( parseBbcFeed( withDescription( 'a'.repeat( 900 ) ) ).items[ 0 ].description?.length, 800 );
  for ( const description of [ '', '   ', '<unexpected>Not plain text</unexpected>' ] )
  {
    const result = parseBbcFeed( withDescription( description ) );
    assert.equal( result.items.length, 1 );
    assert.equal( result.items[ 0 ].description, undefined );
  }
  assert.equal( parseBbcFeed( feed( item() ) ).items[ 0 ].description, undefined );
} );

test( 'drops duplicates, invalid dates and non-BBC or unsafe links', () => {
  const invalidUrls = [ 'javascript:alert(1)', 'https://www.bbc.co.uk.evil.test/news', 'https://evil.test', 'http://www.bbc.com/news', 'https://user:pass@www.bbc.com/news', 'https://www.bbc.com:8080/news' ];
  const result = parseBbcFeed( feed( item() + item() + item( 'Bad date', 'https://www.bbc.com/news/bad', 'not a date' ) + invalidUrls.map( url => item( 'Unsafe', url ) ).join( '' ) ) );
  assert.equal( result.items.length, 1 );
} );

test( 'decodes XML text entities and skips non-text fields', () => {
  const result = parseBbcFeed( feed( item( 'Weather &amp; travel' ) + item( '<nested>Invalid title</nested>' ) ) );
  assert.equal( result.items[ 0 ].title, 'Weather & travel' );
  assert.equal( result.items.length, 1 );
} );

test( 'rejects malformed, oversized, empty and entity-declaring documents', () => {
  for ( const xml of [ '<rss>', '<html>Not RSS</html>', feed( '' ), feed( item( '' ) ), ' '.repeat( 1_000_001 ), '<!DOCTYPE rss [<!ENTITY x "boom">]>' + feed( item() ) ] )
  {
    assert.throws( () => parseBbcFeed( xml ) );
  }
} );

test( 'reads BBC thumbnails, preserving escaped query parameters', () => {
  const xml = item().replace( '</item>', '<media:thumbnail width="240" height="135" url="https://ichef.bbci.co.uk/news/test.jpg?a=1&amp;b=2"/></item>' );
  assert.equal( parseBbcFeed( feed( xml ) ).items[ 0 ].imageUrl, 'https://ichef.bbci.co.uk/news/test.jpg?a=1&b=2' );
} );

test( 'missing or unsafe thumbnails do not remove otherwise valid stories', () => {
  for ( const url of [ 'javascript:alert(1)', 'https://ichef.bbci.co.uk.evil.test/a.jpg', 'http://ichef.bbci.co.uk/a.jpg', 'https://user:pass@ichef.bbci.co.uk/a.jpg', 'https://ichef.bbci.co.uk:8080/a.jpg', '' ] )
  {
    const xml = item().replace( '</item>', `<media:thumbnail url="${url}"/></item>` );
    const result = parseBbcFeed( feed( xml ) );
    assert.equal( result.items.length, 1 );
    assert.equal( result.items[ 0 ].imageUrl, undefined );
  }
  assert.equal( parseBbcFeed( feed( item() ) ).items[ 0 ].imageUrl, undefined );
} );

test( 'selects a valid BBC image when multiple thumbnails are supplied', () => {
  const xml = item().replace( '</item>', '<media:thumbnail url="https://example.com/no.jpg"/><media:thumbnail url="https://ichef.bbci.co.uk/yes.jpg"/></item>' );
  assert.equal( parseBbcFeed( feed( xml ) ).items[ 0 ].imageUrl, 'https://ichef.bbci.co.uk/yes.jpg' );
} );
