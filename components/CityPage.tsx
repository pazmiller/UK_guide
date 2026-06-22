import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import RestaurantFilteredGrid from './RestaurantFilteredGrid';
import ClickableAttractionGrid from './ClickableAttractionGrid';
import AvoidSection from './AvoidSection';
import TipsSection from './TipsSection';
import EditorialRibbon from './EditorialRibbon';
import { CityData } from '@/data/types';

interface CityPageProps {
  data: CityData;
  backLink: string;
  backLabel: string;
}

const COUNTRY_LABELS: Record<string, string> = {
  Iceland: 'Iceland',
  Poland: 'Poland',
  Stockholm: 'Stockholm Sweden',
  København: 'Copenhagen Denmark',
  Paris: 'Paris France',
  Köln: 'Köln Germany',
};

function getLocationHint(data: CityData): string {
  if (data.country === 'europa') {
    return COUNTRY_LABELS[data.nameEn] ?? `${data.nameEn}`;
  }
  // UK cities
  return `${data.nameEn} UK`;
}

export default function CityPage({ data, backLink, backLabel }: CityPageProps) {
  const locationHint = getLocationHint(data);
  return (
    <div className="pt-16 bg-[#FBF8F1]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#FBF8F1] py-14 md:py-20 border-b border-[#1D3557]/10">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1fr_0.82fr] gap-10 items-center">
            <div className="text-center lg:text-left">
              <div className="mb-4">
                <Link
                  href={backLink}
                  className="inline-flex items-center gap-2 text-[#1D3557]/55 hover:text-[#1D3557] text-sm transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> {backLabel}
                </Link>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#1D3557] mb-4">
                {data.name} <span className="text-[#1D3557]/55 text-2xl md:text-3xl">{data.nameEn}</span>
              </h1>
              <p className="text-lg text-[#1D3557]/70 max-w-2xl mx-auto lg:mx-0">
                {data.description}
              </p>
            </div>
            <div className="relative h-[260px] md:h-[340px] overflow-hidden rounded-lg border border-[#1D3557]/10 bg-white shadow-sm">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${data.heroImage})` }}
              />
              <div className="absolute inset-0 bg-[#1D3557]/10" />
              <EditorialRibbon className="absolute -bottom-2 left-0 h-20 w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Restaurants */}
      {data.restaurants.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-[#1D3557]">
                推荐餐厅
              </h2>
            </div>
            <RestaurantFilteredGrid restaurants={data.restaurants} locationHint={locationHint} />
          </div>
        </section>
      )}

      {/* Cafes */}
      {data.cafes && data.cafes.length > 0 && (
        <section className="py-16 bg-[#FBF8F1]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-[#1D3557] mb-8">
              甜品 / 咖啡 / 饮品
            </h2>
            <RestaurantFilteredGrid restaurants={data.cafes} locationHint={locationHint} />
          </div>
        </section>
      )}

      {/* Attractions */}
      {data.attractions && data.attractions.length > 0 && (
        <section className="py-16 bg-[#FBF8F1]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-[#1D3557] mb-8">
              景点推荐
            </h2>
            <ClickableAttractionGrid attractions={data.attractions} locationHint={locationHint} />
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
