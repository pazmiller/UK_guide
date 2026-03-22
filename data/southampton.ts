import { CityData } from './types';

export const southamptonData: CityData = {
  name: '南安普顿',
  nameEn: 'Southampton',
  slug: 'southampton',
  description: '英格兰南部港口城市，泰坦尼克号的出发地。',
  heroImage: 'https://images.unsplash.com/photo-1588580261662-5f63ee7e7f42?w=1920&q=80',
  country: 'uk',
  restaurants: [
    {
      id: 'so-r1', slug: 'red-dog-saloon', name: 'Red Dog Saloon',
      cuisine: 'BBQ', shortDescription: '酒吧式烤肉/烟熏肉餐厅',
      description: '肉类爱好者天堂；烤肠不错（可问服务员哪些套餐含烤肠）；适合偶尔来。',
      address: 'SO15 1DE',
      images: ['/Red Dog Saloon.jpg'],
      mustTry: ['Platters: USS Texas', 'USS Kentucky', '烤肠'],
    },
    {
      id: 'so-r2', slug: 'new-panda', name: 'New Panda 熊记',
      cuisine: 'Chinese', shortDescription: '中餐',
      description: '同学非常喜欢他们家的辣子鸡。',
      address: 'SO15 2DB',
      images: ['/熊记.jpg'],
      mustTry: ['辣子鸡'],
    },
    {
      id: 'so-r3', slug: 'yipinju-lanzhou-noodle', name: 'Yipinju Lanzhou Noodle Bar 一品居兰州拉面',
      cuisine: 'Chinese', shortDescription: '兰州拉面/牛肉面',
      description: '南安网红拉面店；一般，但牛肉给得多、分量大。',
      address: 'SO16 3AY',
      images: ['/Yipinju Lanzhou Noodle Bar.jpg'],
      mustTry: ['牛肉面'],
    },
  ],
};
