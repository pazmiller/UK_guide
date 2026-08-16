import type { Metadata } from 'next';
import guideContributionData from '@/data/guide-contributions.json';
import { parseGuideContributionData } from '@/lib/guideContributions';
import GuideBookPage from './GuideBookPage';

export const metadata: Metadata = {
  title: '赴英指北｜英国留学生到达指南',
  description: '英国留学生初到英国必看：手机卡、交通、超市、防诈骗、手机防抢、eVisa、NHS、银行卡、租房和校园规则提醒。',
};

export default function GuidePage()
{
  const contributions = parseGuideContributionData( guideContributionData ).guides;
  return <GuideBookPage contributions={contributions} />;
}
