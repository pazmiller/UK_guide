import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import RestaurantFilteredGrid from '@/components/RestaurantFilteredGrid';
import AvoidSection from '@/components/AvoidSection';
import { londonRestaurants, londonRestaurantAvoids } from '@/data/london/restaurants';

export default function LondonRestaurantsPage() {
  return (
    <div className="pt-16">
      {/* Hero */}
      <section
        className="relative h-[40vh] min-h-[300px] flex items-center justify-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-[#1D3557]/70" />
        <div className="relative z-10 text-center px-4">
          <div className="mb-4">
            <Link
              href="/london"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> London
            </Link>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            London Restaurants
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            从潮汕火锅到波斯菜，伦敦最值得探索的餐厅推荐
          </p>
        </div>
      </section>

      {/* Restaurants Grid */}
      <section className="py-16 bg-[#F1FAEE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RestaurantFilteredGrid restaurants={londonRestaurants} />
        </div>
      </section>

      {/* Restaurant Avoids */}
      <AvoidSection items={londonRestaurantAvoids} title="伦敦餐厅避雷" />
    </div>
  );
}
