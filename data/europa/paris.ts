import { CityData } from '../types';

export const parisData: CityData = {
  name: '巴黎',
  nameEn: 'Paris',
  slug: 'paris',
  description: '法兰西的心脏，浪漫与美食之都。',
  heroImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1920&q=80',
  country: 'europa',
  restaurants: [
    {
      id: 'fr-r1',
      slug: 'la-tour-montlhery',
      name: 'La Tour Montlhéry',
      cuisine: 'French',
      shortDescription: '法国菜，牛排',
      description: '经典地道的巴黎菜肴，餐厅历史悠久，服务员也是爷爷奶奶们（英语不太好但很热情），卢浮宫附近靠近Châtelet换乘站和LV总部\n需要订位，不建议walk-in',
      priceRange: '~40€+/人',
      images: ['/La Tour Montlhéry.jpeg'],
      mustTry: ['牛排'],
    },
    {
      id: 'fr-r2',
      slug: 'josephine-chez-dumonet',
      name: 'Joséphine Chez Dumonet',
      cuisine: 'French',
      shortDescription: '传统法国菜',
      description: '就在荣军院外不远处，一家19世纪末开到现在，由同一家族经营的百年老法兰西小馆。慢雅，悠哉（上菜当然也慢啦），精炼的传统味道，除了价格较贵外没有什么缺点了。有的店员英文可能不大好？',
      priceRange: '~60€+/人',
      images: ['/Joséphine Chez Dumonet.jpg'],
      mustTry: ['Souffle Grand Marnier（白兰地舒芙蕾）', 'Duck Confit', '白葡萄Foie Gras', '勃艮第牛肉（加上配套意面分量还蛮大的）'],
    },
  ],
};
