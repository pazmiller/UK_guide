import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import EditorialRibbon from '@/components/EditorialRibbon';

const destinations = [
  {
    name: '冰岛 Iceland',
    slug: 'iceland',
    description: '冰与火之国',
    image: 'https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=800&q=80',
    count: 4,
  },
  {
    name: '波兰 Poland',
    slug: 'poland',
    description: '格但斯克，波罗的海沿岸的历史名城，前伟大的汉莎同盟的成员之一。',
    image: 'https://images.unsplash.com/photo-1519197924294-4ba991a11128?w=800&q=80',
    count: 3,
  },
  {
    name: '斯德哥尔摩 Stockholm',
    slug: 'stockholm',
    description: '瑞典首都啦',
    image: 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=800&q=80',
    count: 3,
  },
  {
    name: '哥本哈根 København',
    slug: 'copenhagen',
    description: '大学不错',
    image: 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=800&q=80',
    count: 2,
  },
  {
    name: '巴黎 Paris',
    slug: 'paris',
    description: '与带英相杀七百余年，如今勉强算是盟友的欧洲友邦的首都。',
    image: '/locations/paris.png',
    count: 2,
  },
  {
    name: '科隆 Köln',
    slug: 'koln',
    description: '科隆大教堂在这里，古龙水也在这里。',
    image: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80',
    count: 1,
  },
];

export default function EuropaPage()
{
  return (
    <div className="pt-16 bg-[#FBF8F1]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#FBF8F1] py-14 md:py-20 border-b border-[#1D3557]/10">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1fr_0.82fr] gap-10 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl font-bold text-[#1D3557] mb-4">
                Europa
              </h1>
              <p className="text-xl text-[#1D3557]/70 max-w-2xl mx-auto lg:mx-0">
                探索欧洲大陆的美食与文化
              </p>
            </div>
            <div className="relative h-[260px] md:h-[340px] overflow-hidden rounded-lg border border-[#1D3557]/10 bg-white shadow-sm">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${destinations[ 0 ].image})` }}
              />
              <div className="absolute inset-0 bg-[#1D3557]/10" />
              <EditorialRibbon className="absolute -bottom-2 left-0 h-20 w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Destination Cards */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {destinations.map( ( dest ) => (
              <Link key={dest.slug} href={`/europa/${dest.slug}`} className="group">
                <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-[#1D3557]/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                  <div
                    className="h-44 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url(${dest.image})` }}
                  />
                  <div className="p-5">
                    <h3 className="text-2xl font-bold text-[#1D3557] mb-1">{dest.name}</h3>
                    <p className="text-[#1D3557]/60 text-sm mb-3">{dest.description}</p>
                    <span className="inline-flex items-center gap-2 text-[#E63946] font-semibold text-sm group-hover:gap-3 transition-all">
                      {dest.count} 家推荐 <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ) )}
          </div>
        </div>
      </section>
    </div>
  );
}
