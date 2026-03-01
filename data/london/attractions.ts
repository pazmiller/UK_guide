import { Attraction, AvoidItem } from '../types';

export const londonAttractions: Attraction[] = [
  {
    id: 'lon-a1',
    slug: 'westminster-abbey',
    name: 'Westminster Abbey',
    category: 'Historical',
    shortDescription: '英国之魂，如同大不列颠的先贤祠',
    description: 'Westminster Abbey 是英国最重要的哥特式建筑之一，也是英国君主加冕和安葬之地。这里长眠着牛顿、达尔文、狄更斯等众多伟大人物，被誉为大不列颠的先贤祠。',
    images: ['https://images.unsplash.com/photo-1582547399655-11ebac868e8f?w=800'],
  },
  {
    id: 'lon-a2',
    slug: 'kew-garden',
    name: 'Kew Garden',
    category: 'Parks',
    shortDescription: '皇家植物园',
    description: '世界级皇家植物园，拥有超过 50,000 种植物。温室建筑本身就是一大看点。',
    images: ['https://images.unsplash.com/photo-1585938389612-a552a28c6914?w=800'],
  },
  {
    id: 'lon-a3',
    slug: 'richmond-park',
    name: 'Richmond Park',
    category: 'Parks',
    shortDescription: '伦敦最大皇家公园',
    description: '伦敦最大的皇家公园，可以近距离观赏自由漫步的鹿群，是逃离城市喧嚣的绝佳去处。',
    images: ['https://images.unsplash.com/photo-1580238053495-b9720401fd45?w=800'],
  },
  {
    id: 'lon-a4',
    slug: 'victoria-and-albert-museum',
    name: 'Victoria and Albert Museum',
    category: 'Museums',
    shortDescription: '世界最大装饰艺术博物馆',
    description: '全球最大的装饰艺术与设计博物馆，收藏跨越 5,000 年的人类创造力。免费入场。',
    images: ['https://images.unsplash.com/photo-1590068036568-2b77c4f1a445?w=800'],
  },
  {
    id: 'lon-a5',
    slug: 'natural-history-museum',
    name: 'Natural History Museum',
    category: 'Museums',
    shortDescription: '自然历史博物馆',
    description: '壮观的罗马式建筑内展示着超过 8,000 万件自然标本，从恐龙骨架到蓝鲸模型。免费入场。',
    images: ['https://images.unsplash.com/photo-1572953109213-3be62398eb95?w=800'],
  },
  {
    id: 'lon-a6',
    slug: 'imperial-war-museum',
    name: 'Imperial War Museum',
    category: 'Museums',
    shortDescription: '帝国战争博物馆',
    description: '记录从一战至今的战争与冲突历史，展品震撼人心。免费入场。',
    images: ['https://images.unsplash.com/photo-1580130379624-3a069adbffc5?w=800'],
  },
  {
    id: 'lon-a7',
    slug: 'london-transport-museum',
    name: 'London Transport Museum',
    category: 'Museums',
    shortDescription: '伦敦交通博物馆',
    description: '展示伦敦公共交通 200 多年的发展史，从马车到地铁，互动展品丰富。',
    images: ['https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=800'],
  },
  {
    id: 'lon-a8',
    slug: 'tate-modern',
    name: 'Tate Modern',
    category: 'Museums',
    shortDescription: '现代艺术馆',
    description: '坐落于泰晤士河南岸的前发电站内，是全球最重要的现代艺术馆之一。免费入场。',
    images: ['https://images.unsplash.com/photo-1574958269340-fa927503f3dd?w=800'],
  },
  {
    id: 'lon-a9',
    slug: 'tate-britain',
    name: 'Tate Britain',
    category: 'Museums',
    shortDescription: '英国艺术馆',
    description: '收藏从 1500 年至今的英国艺术，是了解英国艺术史的最佳去处。免费入场。',
    images: ['https://images.unsplash.com/photo-1580130379624-3a069adbffc5?w=800'],
  },
  {
    id: 'lon-a10',
    slug: 'national-gallery',
    name: 'National Gallery',
    category: 'Museums',
    shortDescription: '国家美术馆',
    description: '位于特拉法加广场，收藏 2,300 余幅 13 至 20 世纪的欧洲绘画杰作。免费入场。',
    images: ['https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?w=800'],
  },
  {
    id: 'lon-a11',
    slug: 'horizon-22',
    name: 'Horizon 22',
    category: 'Landmarks',
    shortDescription: '免费高空观景台',
    description: '位于 22 Bishopsgate 的免费高空观景台，可俯瞰整个伦敦城，体验远超 London Eye。',
    images: ['https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800'],
  },
  {
    id: 'lon-a12',
    slug: 'sky-garden',
    name: 'Sky Garden',
    category: 'Landmarks',
    shortDescription: '免费空中花园',
    description: '位于对讲机大楼顶层的免费空中花园，拥有壮观的伦敦全景和热带植物。需要提前预约。',
    images: ['https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800'],
  },
];

export const londonAvoids: AvoidItem[] = [
  {
    name: 'London Eye',
    reason: '排队时间过长，价格过高，体验感不如免费的 Horizon 22 和 Sky Garden。',
  },
  {
    name: '福尔摩斯博物馆 Sherlock Holmes Museum',
    reason: '少数要花较贵门票费的博物馆，而且很小。',
  },
  {
    name: '杜莎夫人蜡像馆 Madame Tussauds',
    reason: '太典了。',
  },
  {
    name: '巨石阵 Stonehenge',
    reason: '排了几个小时也只能远远看一下。如果能回到上世纪能走到面前甚至爬上去的时候，那还是蛮值得的。',
  },
  {
    name: '粉丝 LED 三轮车',
    reason: '会被宰客。',
  },
];

export function getLondonAttractionBySlug(slug: string) {
  return londonAttractions.find(a => a.slug === slug);
}
