import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import EditorialRibbon from '@/components/EditorialRibbon';
import { countCityRecommendations } from '@/data/cityRegistry';
import { getEuropaDestinations } from '@/lib/server/cities';

export default function EuropaPage()
{
  const destinations = getEuropaDestinations();

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
                style={{ backgroundImage: `url(${destinations[ 0 ].heroImage})` }}
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
                    style={{ backgroundImage: `url(${dest.heroImage})` }}
                  />
                  <div className="p-5">
                    <h3 className="text-2xl font-bold text-[#1D3557] mb-1">{dest.name} {dest.nameEn}</h3>
                    <p className="text-[#1D3557]/60 text-sm mb-3">{dest.description}</p>
                    <span className="inline-flex items-center gap-2 text-[#E63946] font-semibold text-sm group-hover:gap-3 transition-all">
                      {countCityRecommendations( dest )} 家推荐 <ArrowRight className="w-4 h-4" />
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
