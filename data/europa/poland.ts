import { CityData } from '../types';

export const polandData: CityData = {
  name: '波兰（格但斯克）',
  nameEn: 'Poland (Gdańsk)',
  slug: 'poland',
  description: '格但斯克，波兰北部波罗的海沿岸的历史名城。',
  heroImage: 'https://images.unsplash.com/photo-1519197924294-4ba991a11128?w=1920&q=80',
  country: 'europa',
  restaurants: [
    {
      id: 'pl-r1', slug: 'pierogarnia-mandu', name: 'Pierogarnia Mandu Gdańsk Śródmieście',
      cuisine: 'Polish', shortDescription: '波兰饺子馆（本地人都会排长队）',
      description: '离市中心近但排大队；网上波兰前三排名的饺子馆。',
      priceRange: '~50 PLN/人（约£15）',
      images: ['https://images.unsplash.com/photo-1587049016823-69ef9d68f92a?w=800'],
      mustTry: ['蓝莓饺子', '巧克力炸香蕉饺子', '传统饺子（像猪肉大葱）'],
    },
  ],
};
