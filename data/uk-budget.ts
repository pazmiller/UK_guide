import { Restaurant } from './types';

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
