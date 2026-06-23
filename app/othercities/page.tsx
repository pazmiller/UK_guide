import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ClickableRestaurantGrid from '@/components/ClickableRestaurantGrid';
import EditorialRibbon from '@/components/EditorialRibbon';
import { ukRecommendedChains } from '@/data/uk-budget';

const cities = [
  {
    name: '约克 York',
    slug: 'york',
    description: '中世纪古城，贝蒂茶屋与丰富美食',
    image: '/locations/york.png',
    count: 12,
  },
  {
    name: '格拉斯哥 Glasgow',
    slug: 'glasgow',
    description: '苏格兰最大城市，充满活力的文化之都',
    image: '/locations/glassgow.png',
    count: 4,
  },
  {
    name: '南安普顿 Southampton',
    slug: 'southampton',
    description: '英格兰南部港口城市',
    image: '/locations/southampton.png',
    count: 3,
  },
  {
    name: '斯旺西 Swansea',
    slug: 'swansea',
    description: '威尔士海滨小镇，安静朴素',
    image: '/locations/swansea.png',
    count: 7,
  },
  {
    name: '爱丁堡 Edinburgh',
    slug: 'edinburgh',
    description: '苏格兰首都，城堡之城',
    image: 'https://images.unsplash.com/photo-1501699169021-3759ee435d66?w=800&q=80',
    count: 1,
  },
];

export default function OtherCitiesPage() {
  return (
    <div className="pt-16 bg-[#FBF8F1]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#FBF8F1] py-14 md:py-20 border-b border-[#1D3557]/10">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1fr_0.82fr] gap-10 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl font-bold text-[#1D3557] mb-4">
                Other Cities
              </h1>
              <p className="text-xl text-[#1D3557]/70 max-w-2xl mx-auto lg:mx-0">
                探索英国其他城市的美食与生活
              </p>
            </div>
            <div className="relative h-[260px] md:h-[340px] overflow-hidden rounded-lg border border-[#1D3557]/10 bg-white shadow-sm">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${cities[0].image})` }}
              />
              <div className="absolute inset-0 bg-[#1D3557]/10" />
              <EditorialRibbon className="absolute -bottom-2 left-0 h-20 w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* City Cards */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-5">
            {cities.map((city) => (
              <Link key={city.slug} href={`/othercities/${city.slug}`} className="group">
                <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-[#1D3557]/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                  <div
                    className="h-44 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url(${city.image})` }}
                  />
                  <div className="p-5">
                    <h3 className="text-2xl font-bold text-[#1D3557] mb-1">{city.name}</h3>
                    <p className="text-[#1D3557]/60 text-sm mb-3">{city.description}</p>
                    <span className="inline-flex items-center gap-2 text-[#E63946] font-semibold text-sm group-hover:gap-3 transition-all">
                      {city.count} 家推荐 <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* UK Recommended Chains */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#1D3557] mb-2">UK 还不错的快餐</h2>
          <p className="text-gray-600 mb-8">连锁品控稳定，值得一试</p>
          <ClickableRestaurantGrid restaurants={ukRecommendedChains} locationHint="UK" variant="editorial" />
        </div>
      </section>

    </div>
  );
}
