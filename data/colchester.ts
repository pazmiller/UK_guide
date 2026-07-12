import { CityData } from './types';

export const colchesterData: CityData = {
  name: '科尔切斯特',
  nameEn: 'Colchester',
  slug: 'colchester',
  description: '位于伦敦东北、距离伦敦约 90 公里的近海城市，是英国有历史记载最古老的城镇和市场，Essex 大学所在地，也是英国陆军驻军营地之一。',
  heroImage: '/locations/Colchester.png',
  country: 'uk',
  restaurants: [
    {
      id: 'co-r1',
      slug: 'north-hill-noodle-bar',
      name: 'North Hill Noodle Bar',
      cuisine: 'Southeast Asian',
      shortDescription: '东南亚菜',
      description: '4.7 分。比较欧式的东南亚菜，但味道高于平均水平；品质和装修明显比一般餐厅高级。在小城镇里能有这个水平，而且相对物美价廉，很推荐。重点是不收服务费。',
      priceRange: '£20-30/人',
      images: [ '/North Hill Noodle Bar.png' ],
      mustTry: [ 'green curry duck rice', 'chicken laksa' ],
      tags: [ '不收服务费', '物美价廉' ],
    },
  ],
  attractions: [
    {
      id: 'co-a1',
      slug: 'colchester-zoo',
      name: 'Colchester Zoo',
      category: 'Zoo',
      shortDescription: '内容很丰富、很大很好逛的动物园',
      description: 'Colchester Zoo 很大，内容非常丰富，地形也比较复杂，有很多可以探索的地方。比起名气更大、历史更久的 London Zoo，推荐者更推荐这里；推荐者是动物学和动物园研究相关 PhD，这个推荐很有分量。',
      images: [ '/Colchester1.png', '/Colchester2.png' ],
    },
  ],
};
