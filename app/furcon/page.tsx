import type { Metadata } from 'next';
import FurconIndex from '@/components/FurconIndex';

export const metadata: Metadata = {
  title: '兽展讯息汇合｜FURCON INDEX 2026／2027',
  description: '收录 2026 年 7 月至 2027 年 7 月已公布日期的全球兽展，可按月份、地区及名称筛选。',
};

export default function FurconPage()
{
  return <FurconIndex />;
}
