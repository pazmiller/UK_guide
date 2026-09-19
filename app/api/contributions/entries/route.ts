import { NextResponse } from 'next/server';
import { getContributionEntries } from '@/lib/server/contributionEntries';

export const runtime = 'nodejs';
export async function GET() {
  try { return NextResponse.json( { entries: await getContributionEntries() }, { headers: { 'Cache-Control': 'no-store' } } ); }
  catch { return NextResponse.json( { error: '暂时无法载入现有资料，请稍后重试。' }, { status: 503 } ); }
}
