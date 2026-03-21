import { CityData } from '../types';

export const kolnData: CityData = {
  name: '科隆（德国）',
  nameEn: 'Köln',
  slug: 'koln',
  description: '德国第四大城市，科隆大教堂所在地。',
  heroImage: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1920&q=80',
  country: 'europa',
  restaurants: [
    {
      id: 'de-r1',
      slug: 'punto-pasta',
      name: 'Punto Pasta',
      cuisine: 'Italian',
      shortDescription: '性价比超高的手工意面',
      description: '就在科隆教堂附近，一份意面价格很实惠，老板自己手工做的面和酱，白酱用的猪脸肉味道很正宗，是科隆德意志银行员工的食堂。',
      priceRange: '~15€/人',
      images: [ '/Punto Pasta.jpeg' ],
      mustTry: [ '各种意面' ],
    },
  ],
};
