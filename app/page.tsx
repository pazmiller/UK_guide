import Link from 'next/link';
import { ArrowRight, MapPin, Utensils, Building, Crown } from 'lucide-react';
import Hero from '@/components/Hero';
import AttractionCard from '@/components/AttractionCard';
import RestaurantCard from '@/components/RestaurantCard';
import { attractions } from '@/data/attractions';
import { restaurants } from '@/data/restaurants';

export default function Home() {
  const featuredAttractions = attractions.slice(0, 3);
  const featuredRestaurants = restaurants.slice(0, 3);

  return (
    <>
      <Hero />

      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-[#1D3557] mb-6">
                Welcome to <span className="text-[#E63946]">London</span>
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                London, the capital of England and the United Kingdom, is a 21st-century city
                with history stretching back to Roman times. At its centre stand the imposing
                Houses of Parliament, the iconic Big Ben clock tower and Westminster Abbey,
                site of British monarch coronations.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                From world-class museums and galleries to vibrant markets and Michelin-starred
                restaurants, London offers an unparalleled mix of culture, history, and
                modern innovation.
              </p>
              <Link href="/about" className="btn-primary inline-flex items-center gap-2">
                Learn More <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#E63946] rounded-2xl p-6 text-white">
                <Building className="w-10 h-10 mb-4" />
                <h3 className="text-2xl font-bold mb-2">2000+</h3>
                <p className="text-white/80">Years of History</p>
              </div>
              <div className="bg-[#1D3557] rounded-2xl p-6 text-white">
                <MapPin className="w-10 h-10 mb-4" />
                <h3 className="text-2xl font-bold mb-2">300+</h3>
                <p className="text-white/80">Attractions</p>
              </div>
              <div className="bg-[#2A9D8F] rounded-2xl p-6 text-white">
                <Utensils className="w-10 h-10 mb-4" />
                <h3 className="text-2xl font-bold mb-2">70+</h3>
                <p className="text-white/80">Michelin Stars</p>
              </div>
              <div className="bg-[#F4A261] rounded-2xl p-6 text-[#1D3557]">
                <Crown className="w-10 h-10 mb-4" />
                <h3 className="text-2xl font-bold mb-2">Royal</h3>
                <p className="text-[#1D3557]/80">Heritage</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Attractions */}
      <section className="py-20 bg-[#F1FAEE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold text-[#1D3557] mb-2">
                Top Attractions
              </h2>
              <p className="text-gray-600">
                Discover London&apos;s most iconic landmarks and must-visit places
              </p>
            </div>
            <Link
              href="/attractions"
              className="mt-4 md:mt-0 text-[#E63946] font-semibold flex items-center gap-2 hover:gap-3 transition-all"
            >
              View All Attractions <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredAttractions.map((attraction) => (
              <AttractionCard key={attraction.id} attraction={attraction} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Restaurants */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold text-[#1D3557] mb-2">
                Best Restaurants
              </h2>
              <p className="text-gray-600">
                From traditional British fare to world cuisines
              </p>
            </div>
            <Link
              href="/restaurants"
              className="mt-4 md:mt-0 text-[#E63946] font-semibold flex items-center gap-2 hover:gap-3 transition-all"
            >
              View All Restaurants <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#1D3557]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Explore London?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Start planning your adventure today. Discover hidden gems, iconic landmarks,
            and unforgettable dining experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/attractions" className="btn-primary text-lg">
              Browse Attractions
            </Link>
            <Link
              href="/restaurants"
              className="bg-white text-[#1D3557] px-7 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-lg"
            >
              Find Restaurants
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
