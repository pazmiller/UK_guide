import type { Metadata } from 'next';
import FurconIndex from '@/components/FurconIndex';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '兽聚日程｜CFFA UK',
  description: '收录 2026 年 7 月至 2027 年 7 月已公布日期的全球兽展，可按月份、地区及名称筛选。',
};

export default function FurconPage()
{
  const today = new Intl.DateTimeFormat( 'en-CA', { timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit' } ).format( new Date() );
  return <FurconIndex initialTodayIso={today} />;
}
