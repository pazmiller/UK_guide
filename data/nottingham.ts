import { CityData } from './types';

export const nottinghamData: CityData = {
  name: '诺丁汉',
  nameEn: 'Nottingham',
  slug: 'nottingham',
  description: '英格兰中部城市，以罗宾汉传说、诺丁汉大学，咕咕和活跃的酒吧文化闻名。',
  heroImage: '/contributions/3/1.webp',
  country: 'uk',
  restaurants: [
    {
      id: 'no-r1',
      slug: 'canalhouse',
      name: 'Canalhouse',
      cuisine: 'Pub',
      shortDescription: '运河边的精酿啤酒酒吧',
      description: '主打精酿，也不定时会有限定鸡尾酒。从中午营业到晚上 11 点，周末会开到凌晨。平常室外座位很多，周末会很满；点餐主要是在吧台完成，再告诉工作人员桌号。',
      address: '48-52 Canal Street, Nottingham, NG1 7EH',
      website: 'https://www.castlerockbrewery.co.uk/pubs/canalhouse/',
      images: [
        '/contributions/3/1.webp',
        '/contributions/3/2.webp',
        '/contributions/3/3.webp',
        '/contributions/3/4.webp',
      ],
      mustTry: [],
    },
  ],
};
