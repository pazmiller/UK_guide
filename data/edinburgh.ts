import { CityData } from './types';

export const edinburghData: CityData = {
  name: '爱丁堡',
  nameEn: 'Edinburgh',
  slug: 'edinburgh',
  description: '苏格兰首都，城堡之城。',
  heroImage: 'https://images.unsplash.com/photo-1501699169021-3759ee435d66?w=1920&q=80',
  country: 'uk',
  restaurants: [
    {
      id: 'ed-r1',
      slug: 'la-sal',
      name: 'La Sal',
      cuisine: 'Spanish',
      shortDescription: '西班牙菜',
      description: '价格相对实惠的西班牙菜，tapas 相对之前吃过的其他西班牙菜量都要稍大，海鲜饭很好吃，里面的鱼虾的很鲜甜，没有腥味。',
      priceRange: '~£30/人',
      address: '22 Union Pl, Edinburgh EH1 3NQ',
      images: ['/La Sal.png'],
      mustTry: ['De Marisco Paella', 'Calamares', 'Padron Peppers'],
    },
  ],
};
