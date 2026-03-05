import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import RestaurantFilteredGrid from './RestaurantFilteredGrid';
import ClickableAttractionGrid from './ClickableAttractionGrid';
import AvoidSection from './AvoidSection';
import TipsSection from './TipsSection';
import { CityData } from '@/data/types';

interface CityPageProps {
  data: CityData;
  backLink: string;
  backLabel: string;
}

export default function CityPage({ data, backLink, backLabel }: CityPageProps) {
  return (
    <div className="pt-16">
      {/* Hero */}
      <section
        className="relative h-[40vh] min-h-[300px] flex items-center justify-center"
        style={{
          backgroundImage: `url(${data.heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-[#1D3557]/70" />
        <div className="relative z-10 text-center px-4">
          <div className="mb-4">
            <Link
              href={backLink}
              className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> {backLabel}
            </Link>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {data.name} <span className="text-white/70 text-2xl md:text-3xl">{data.nameEn}</span>
          </h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            {data.description}
          </p>
        </div>
      </section>

      {/* Restaurants */}
      {data.restaurants.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-[#1D3557] mb-8">
              推荐餐厅
            </h2>
            <RestaurantFilteredGrid restaurants={data.restaurants} />
          </div>
        </section>
      )}

      {/* Cafes */}
      {data.cafes && data.cafes.length > 0 && (
        <section className="py-16 bg-[#F1FAEE]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-[#1D3557] mb-8">
              甜品 / 咖啡 / 饮品
            </h2>
            <RestaurantFilteredGrid restaurants={data.cafes} />
          </div>
        </section>
      )}

      {/* Attractions */}
      {data.attractions && data.attractions.length > 0 && (
        <section className="py-16 bg-[#F1FAEE]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-[#1D3557] mb-8">
              景点推荐
            </h2>
            <ClickableAttractionGrid attractions={data.attractions} />
          </div>
        </section>
      )}

      {/* Avoid */}
      {data.avoids && data.avoids.length > 0 && (
        <AvoidSection items={data.avoids} />
      )}

      {/* Tips */}
      {data.tips && data.tips.length > 0 && (
        <TipsSection tips={data.tips} />
      )}
    </div>
  );
}
