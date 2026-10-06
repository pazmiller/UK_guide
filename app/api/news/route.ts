import { NextResponse } from 'next/server';
import { getBbcNews } from '@/lib/server/bbcNews';

export async function GET()
{
  try
  {
    return NextResponse.json( await getBbcNews(), { headers: { 'Cache-Control': 'no-store' } } );
  }
  catch
  {
    console.warn( '[BBC News] RSS fetch or validation failed.' );
    return NextResponse.json( { error: 'News temporarily unavailable.' }, {
      status: 503,
      headers: { 'Cache-Control': 'no-store', 'Retry-After': '60' },
    } );
  }
}
