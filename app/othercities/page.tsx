import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import RestaurantCard from '@/components/RestaurantCard';
import { ukBudgetChains } from '@/data/uk-budget';

const cities = [
  {
    name: '约克 York',
    slug: 'york',
    description: '中世纪古城，贝蒂茶屋与丰富美食',
    image: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=800&q=80',
    count: 12,
  },
  {
    name: '格拉斯哥 Glasgow',
    slug: 'glasgow',
    description: '苏格兰最大城市，充满活力的文化之都',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80',
    count: 4,
  },
  {
    name: '南安普顿 Southampton',
    slug: 'southampton',
    description: '英格兰南部港口城市',
    image: 'https://images.unsplash.com/photo-1588580261662-5f63ee7e7f42?w=800&q=80',
    count: 3,
  },
  {
    name: '斯旺西 Swansea',
    slug: 'swansea',
    description: '威尔士海滨小镇，安静朴素',
    image: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=800&q=80',
    count: 7,
  },
];

export default function OtherCitiesPage() {
  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative h-[35vh] min-h-[280px] flex items-center justify-center bg-[#1D3557]">
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Other Cities
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            探索英国其他城市的美食与生活
          </p>
        </div>
      </section>

      {/* City Cards */}
      <section className="py-16 bg-[#F1FAEE]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {cities.map((city) => (
              <Link key={city.slug} href={`/othercities/${city.slug}`} className="group">
                <div className="relative overflow-hidden rounded-2xl shadow-xl h-56">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url(${city.image})` }}
                  />
                  <div className="absolute inset-0 bg-[#1D3557]/60 group-hover:bg-[#1D3557]/50 transition-colors" />
                  <div className="relative z-10 h-full flex flex-col justify-end p-6">
                    <h3 className="text-2xl font-bold text-white mb-1">{city.name}</h3>
                    <p className="text-white/80 text-sm mb-3">{city.description}</p>
                    <span className="inline-flex items-center gap-2 text-[#F4A261] font-semibold text-sm group-hover:gap-3 transition-all">
                      {city.count} 家推荐 <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* UK Budget Chains */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#1D3557] mb-2">UK 性价比快餐</h2>
          <p className="text-gray-600 mb-8">维持生命用 — 全英连锁</p>
          <div className="grid md:grid-cols-3 gap-6">
            {ukBudgetChains.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
