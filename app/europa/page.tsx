import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const destinations = [
  {
    name: '冰岛 Iceland',
    slug: 'iceland',
    description: '冰与火之国，壮丽自然与独特北欧美食',
    image: 'https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=800&q=80',
    count: 4,
  },
  {
    name: '波兰 Poland',
    slug: 'poland',
    description: '格但斯克，波罗的海沿岸的历史名城',
    image: 'https://images.unsplash.com/photo-1519197924294-4ba991a11128?w=800&q=80',
    count: 1,
  },
];

export default function EuropaPage() {
  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative h-[35vh] min-h-[280px] flex items-center justify-center bg-[#1D3557]">
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Europa
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            探索欧洲大陆的美食与文化
          </p>
        </div>
      </section>

      {/* Destination Cards */}
      <section className="py-16 bg-[#F1FAEE]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {destinations.map((dest) => (
              <Link key={dest.slug} href={`/europa/${dest.slug}`} className="group">
                <div className="relative overflow-hidden rounded-2xl shadow-xl h-64">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url(${dest.image})` }}
                  />
                  <div className="absolute inset-0 bg-[#1D3557]/60 group-hover:bg-[#1D3557]/50 transition-colors" />
                  <div className="relative z-10 h-full flex flex-col justify-end p-6">
                    <h3 className="text-2xl font-bold text-white mb-1">{dest.name}</h3>
                    <p className="text-white/80 text-sm mb-3">{dest.description}</p>
                    <span className="inline-flex items-center gap-2 text-[#F4A261] font-semibold text-sm group-hover:gap-3 transition-all">
                      {dest.count} 家推荐 <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
