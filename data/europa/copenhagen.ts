import { CityData } from '../types';

export const copenhagenData: CityData = {
  name: '哥本哈根（丹麦首都）',
  nameEn: 'København',
  slug: 'copenhagen',
  description: '丹麦首都，童话王国的心脏。',
  heroImage: 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=1920&q=80',
  country: 'europa',
  restaurants: [
    {
      id: 'dk-r1',
      slug: 'det-lille-apotek',
      name: 'Det Lille Apotek',
      cuisine: 'Danish',
      shortDescription: '最传统丹麦菜',
      description: '哥本哈根现存最古老的餐厅，安徒生的最爱，位于市中心步行街之中，可以品尝丹麦的国菜。',
      priceRange: '200-300DKK/人',
      images: ['/Det Lille Apotek.jpeg'],
      mustTry: ['炸猪五花肉', '烤猪颈肉', '烤鸭'],
    },
    {
      id: 'dk-r2',
      slug: 'restaurant-klubben',
      name: 'Restaurant Klubben',
      cuisine: 'Danish',
      shortDescription: '传统丹麦菜',
      description: '丹麦式家庭餐厅，有着悠久的历史，本地居民常光顾\n夏天去的话可以选择坐在露天的庭院里。',
      priceRange: '150-200DKK/人',
      images: ['/Restaurant Klubben.jpg'],
      mustTry: ['自助的炸五花肉', '炸猪排', '丹麦本地啤酒'],
    },
  ],
};
