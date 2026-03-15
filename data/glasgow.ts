import { CityData } from './types';

export const glasgowData: CityData = {
  name: '格拉斯哥',
  nameEn: 'Glasgow',
  slug: 'glasgow',
  description: '苏格兰最大城市，充满活力的文化与音乐之都。',
  heroImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1920&q=80',
  country: 'uk',
  restaurants: [
    {
      id: 'gl-r1', slug: 'non-viet', name: 'Non Viet',
      cuisine: 'Vietnamese', shortDescription: '越南菜（Pho/春卷）',
      description: '越南河粉和夏卷很好吃，到国内都还挂念着的店。',
      images: ['https://images.unsplash.com/photo-1576577445504-6af96477db52?w=800'],
      mustTry: ['Pho', '夏卷'],
    },
    {
      id: 'gl-r2', slug: 'celinos-partick', name: "Celino's Partick",
      cuisine: 'Italian', shortDescription: '意大利菜',
      description: '特别好吃且价格相对味道来说便宜，性价比蛮高。而且服务比较及时，经常回来巡视。但是意式甜品比较一般，提拉米苏也不是很好吃。',
      priceRange: '~£30/人',
      images: ["/Celino's Partick.png"],
      mustTry: ['披萨', '意大利面（比如Scoglio Bianco）'],
    },
    {
      id: 'gl-r3', slug: 'by-chance', name: 'by chance',
      cuisine: 'Bubble Tea', shortDescription: '奶茶店（Partick）',
      description: '不出名但比喜茶都好喝很多。',
      priceRange: '~£4/杯',
      images: ['https://images.unsplash.com/photo-1558857563-b371033873b8?w=800'],
      mustTry: ['奶茶'],
    },
    {
      id: 'gl-r4', slug: 'largus-fish-and-chips', name: 'Largus 海边 Fish & Chips',
      cuisine: 'British', shortDescription: '海边炸鱼薯条',
      description: '很好吃的 Fish & Chips。',
      images: ['https://images.unsplash.com/photo-1579208030886-b1f5b7f6960c?w=800'],
      mustTry: ['Fish & Chips'],
    },
  ],
};
