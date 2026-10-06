import 'server-only';
import { unstable_cache } from 'next/cache';
import { parseBbcFeed } from '@/lib/news/parseBbcFeed';
import { NEWS_REFRESH_MS, type NewsSnapshot } from '@/lib/news/types';

export const getBbcNews = unstable_cache( async (): Promise<NewsSnapshot> => {
  const response = await fetch( 'https://feeds.bbci.co.uk/news/rss.xml', {
    headers: { Accept: 'application/rss+xml, application/xml, text/xml' },
    cache: 'no-store',
    signal: AbortSignal.timeout( 8000 ),
  } );
  if ( !response.ok ) throw new Error( `BBC RSS returned HTTP ${response.status}.` );
  const feed = parseBbcFeed( await response.text() );
  return { ...feed, fetchedAt: new Date().toISOString() };
}, [ 'bbc-top-stories-reader-v2' ], { revalidate: NEWS_REFRESH_MS / 1000 } );
