import Link from 'next/link';
import { ArrowRight, Building, Utensils, Coffee, Crown, MapPin } from 'lucide-react';
import { londonAttractions } from '@/data/london/attractions';
import { londonRestaurants } from '@/data/london/restaurants';
import { londonCafes } from '@/data/london/cafes';

export default function LondonPage()
{
  return (
    <div className="pt-16">
      {/* Hero */}
      <section
        className="relative h-[50vh] min-h-[360px] flex items-center justify-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-[#1D3557]/70" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">London</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            It is the best of cities, it is the worst of cities. It is where the old and the new collide in a vibrant tapestry of culture, history, diversity, and also phone mugging.
          </p>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            所以记得保护好你的手机！
          </p>
        </div>
      </section>

      {/* Navigation Cards */}
      <section className="py-20 bg-[#F1FAEE]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#1D3557] text-center mb-12">
            Explore London
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Attractions Card */}
            <Link href="/london/attractions" className="group">
              <div className="relative overflow-hidden rounded-3xl shadow-xl h-72 cursor-pointer">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=800&q=80)',
                  }}
                />
                <div className="absolute inset-0 bg-[#1D3557]/60 group-hover:bg-[#1D3557]/50 transition-colors" />
                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-8">
                  <Building className="w-12 h-12 text-white mb-4" />
                  <h3 className="text-3xl font-bold text-white mb-2">Attractions</h3>
                  <p className="text-white/80 mb-6">
                    {londonAttractions.length} 个景点推荐 + 避雷
                  </p>
                  <span className="inline-flex items-center gap-2 bg-white text-[#1D3557] font-semibold px-6 py-2 rounded-full group-hover:bg-[#E63946] group-hover:text-white transition-colors">
                    Explore <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>

            {/* Restaurants Card */}
            <Link href="/london/restaurants" className="group">
              <div className="relative overflow-hidden rounded-3xl shadow-xl h-72 cursor-pointer">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80)',
                  }}
                />
                <div className="absolute inset-0 bg-[#1D3557]/60 group-hover:bg-[#1D3557]/50 transition-colors" />
                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-8">
                  <Utensils className="w-12 h-12 text-white mb-4" />
                  <h3 className="text-3xl font-bold text-white mb-2">Restaurants</h3>
                  <p className="text-white/80 mb-6">
                    {londonRestaurants.length} 家推荐餐厅
                  </p>
                  <span className="inline-flex items-center gap-2 bg-white text-[#1D3557] font-semibold px-6 py-2 rounded-full group-hover:bg-[#E63946] group-hover:text-white transition-colors">
                    Discover <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>

            {/* Cafes Card */}
            <Link href="/london/cafes" className="group">
              <div className="relative overflow-hidden rounded-3xl shadow-xl h-72 cursor-pointer">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80)',
                  }}
                />
                <div className="absolute inset-0 bg-[#1D3557]/60 group-hover:bg-[#1D3557]/50 transition-colors" />
                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-8">
                  <Coffee className="w-12 h-12 text-white mb-4" />
                  <h3 className="text-3xl font-bold text-white mb-2">Cafes</h3>
                  <p className="text-white/80 mb-6">
                    {londonCafes.length} 家甜品 / 咖啡 / 饮品
                  </p>
                  <span className="inline-flex items-center gap-2 bg-white text-[#1D3557] font-semibold px-6 py-2 rounded-full group-hover:bg-[#E63946] group-hover:text-white transition-colors">
                    Browse <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-[#E63946] rounded-2xl p-6 text-white text-center">
              <Building className="w-8 h-8 mx-auto mb-3" />
              <div className="text-2xl font-bold">{londonAttractions.length}</div>
              <div className="text-white/80 text-sm">景点推荐</div>
            </div>
            <div className="bg-[#1D3557] rounded-2xl p-6 text-white text-center">
              <Utensils className="w-8 h-8 mx-auto mb-3" />
              <div className="text-2xl font-bold">{londonRestaurants.length}</div>
              <div className="text-white/80 text-sm">推荐餐厅</div>
            </div>
            <div className="bg-[#2A9D8F] rounded-2xl p-6 text-white text-center">
              <Coffee className="w-8 h-8 mx-auto mb-3" />
              <div className="text-2xl font-bold">{londonCafes.length}</div>
              <div className="text-white/80 text-sm">甜品饮品</div>
            </div>
            <div className="bg-[#F4A261] rounded-2xl p-6 text-[#1D3557] text-center">
              <Crown className="w-8 h-8 mx-auto mb-3" />
              <div className="text-2xl font-bold">Royal</div>
              <div className="text-[#1D3557]/80 text-sm">Heritage</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
