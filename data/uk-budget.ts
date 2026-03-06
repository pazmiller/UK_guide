import { Restaurant } from './types';

export const ukRecommendedChains: Restaurant[] = [
  {
    id: 'uk-r1', slug: 'honest-burgers', name: 'Honest Burgers',
    cuisine: 'Burgers', shortDescription: '英国连锁汉堡',
    description: '汉堡可选熟度，各方面都进入了 Artisan Burger 的入门水平，连锁品控还不错，价位也算合理。',
    images: ['https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800'],
    priceRange: '£10–20/人',
    mustTry: ['经典汉堡', '洋葱圈'],
  },
];

export const ukBudgetChains: Restaurant[] = [
  {
    id: 'uk-b1', slug: 'greggs', name: 'Greggs',
    cuisine: 'Fast Food', shortDescription: '英国连锁烘焙快餐',
    description: '可能有 £1.99 晚间 meal deal（不确定现在是否还有）；不算好吃但管饱；Monzo 有时有优惠。',
    images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800'],
    mustTry: ['meal deal（披萨+饮品）'],
  },
  {
    id: 'uk-b2', slug: 'wasabi', name: 'Wasabi',
    cuisine: 'Japanese Fast Food', shortDescription: '日式快餐（可当中餐平替）',
    description: '饭更符合国内胃口；Monzo / Unidays 有时有优惠。',
    images: ['https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800'],
    mustTry: [],
  },
  {
    id: 'uk-b3', slug: 'leon', name: 'Leon',
    cuisine: 'Fast Food', shortDescription: '轻食连锁',
    description: '口味不算重；米饭颗粒感明显（部分人会介意）；Monzo 有时有优惠。',
    images: ['https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800'],
    mustTry: [],
  },
];
