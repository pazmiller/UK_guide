import { CityData } from '../types';

export const icelandData: CityData = {
  name: '冰岛',
  nameEn: 'Iceland',
  slug: 'iceland',
  description: '冰与火之国，壮丽的自然景观和独特的北欧美食。',
  heroImage: 'https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=1920&q=80',
  country: 'europa',
  restaurants: [
    {
      id: 'is-r1', slug: 'skal', name: 'Skál!',
      cuisine: 'Icelandic', shortDescription: '雷克雅未克餐厅（冲星潜力）',
      description: '菜单常换；招牌羊肩肉外酥里嫩且不腥不膻，火候极强。',
      priceRange: '8000–12000 冰岛克朗/人',
      images: ['https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800'],
      mustTry: ['羊肩肉', '鲟鱼子酱配面包', '传统鱼肉拌土豆泥'],
    },
    {
      id: 'is-r2', slug: 'messinn-selfossi', name: 'Messinn Selfossi',
      cuisine: 'Seafood', shortDescription: '鱼料理餐厅（量大）',
      description: '鱼煎得特别香；份量大到一份基本够一个人。',
      priceRange: '~5500 冰岛克朗/人（约£20–30）',
      images: ['https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=800'],
      mustTry: ['蜂蜜坚果碎三文鱼', '白汁北极鲑'],
    },
    {
      id: 'is-r3', slug: 'osinn-restaurant', name: 'Ósinn Restaurant at Hotel Höfn',
      cuisine: 'Seafood', shortDescription: '赫本海鲜餐厅（适合吃北极鳌虾）',
      description: '海鲜套餐很实诚；虾肉鲜甜。',
      priceRange: '~5000 冰岛克朗/人',
      images: ['https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800'],
      mustTry: ['海鲜套餐', '龙虾披萨', '龙虾天妇罗'],
    },
    {
      id: 'is-r4', slug: 'apotek', name: 'apotek',
      cuisine: 'Fine Dining', shortDescription: '雷克雅未克精致餐厅（漂亮饭）',
      description: '可点 7 道菜 set，份量大但生肉较多（看接受度）；鸭胸和鹅肝特别出色。',
      priceRange: '10000–18000 冰岛克朗/人',
      images: ['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800'],
      mustTry: ['鸭胸肉', '鹅肝', '烤扇贝配鱼子', '生金枪鱼+腌西瓜'],
    },
  ],
};
