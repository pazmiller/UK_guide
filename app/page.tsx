import Link from 'next/link';
import { ArrowRight, MapPin, Building, Globe } from 'lucide-react';
import Hero from '@/components/Hero';
import BlindsTransition from '@/components/BlindsTransition';
import ClickableRestaurantGrid from '@/components/ClickableRestaurantGrid';
import { londonRestaurants } from '@/data/london/restaurants';

export default function Home()
{
  const featuredRestaurants = londonRestaurants.slice( 0, 3 );

  return (
    <>
      <Hero />

      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-[#1D3557] mb-6">
              欢迎！ <span className="text-[#E63946]">by UK CFFA群主与群成员们</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              无论你是刚来英国上学的新人，还是已经就读工作多年，UKCFFA会一直与你分享英国与欧陆。
            </p>
            <Link href="/about" className="btn-primary inline-flex items-center gap-2">
              Learn More <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Explore + Featured Restaurants — shared animated background */}
      <div className="relative overflow-hidden">
        <BlindsTransition
          fill
          front="/bg1.jpg"
          back="/bg2.jpg"
          slats={12}
          duration={1000}
          pauseMs={2000}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-[#1D3557]/55 pointer-events-none" />

        {/* Explore */}
        <section className="relative z-10 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-white text-center mb-12 drop-shadow">
              Explore
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {/* London */}
              <Link href="/london" className="group">
                <div className="relative overflow-hidden rounded-2xl shadow-xl h-64">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80)' }}
                  />
                  <div className="absolute inset-0 bg-[#1D3557]/60 group-hover:bg-[#1D3557]/50 transition-colors" />
                  <div className="relative z-10 h-full flex flex-col justify-end p-6">
                    <MapPin className="w-8 h-8 text-[#F4A261] mb-2" />
                    <h3 className="text-2xl font-bold text-white mb-1">London</h3>
                    <p className="text-white/80 text-sm">餐厅、景点、甜品饮品</p>
                  </div>
                </div>
              </Link>

              {/* Other Cities */}
              <Link href="/othercities" className="group">
                <div className="relative overflow-hidden rounded-2xl shadow-xl h-64">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1505761671935-60b3a7427bad?w=800&q=80)' }}
                  />
                  <div className="absolute inset-0 bg-[#1D3557]/60 group-hover:bg-[#1D3557]/50 transition-colors" />
                  <div className="relative z-10 h-full flex flex-col justify-end p-6">
                    <Building className="w-8 h-8 text-[#F4A261] mb-2" />
                    <h3 className="text-2xl font-bold text-white mb-1">Other Cities</h3>
                    <p className="text-white/80 text-sm">York, Glasgow, Southampton, Swansea</p>
                  </div>
                </div>
              </Link>

              {/* Europa */}
              <Link href="/europa" className="group">
                <div className="relative overflow-hidden rounded-2xl shadow-xl h-64">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=800&q=80)' }}
                  />
                  <div className="absolute inset-0 bg-[#1D3557]/60 group-hover:bg-[#1D3557]/50 transition-colors" />
                  <div className="relative z-10 h-full flex flex-col justify-end p-6">
                    <Globe className="w-8 h-8 text-[#F4A261] mb-2" />
                    <h3 className="text-2xl font-bold text-white mb-1">Europa</h3>
                    <p className="text-white/80 text-sm">Iceland, Poland</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Restaurants */}
        <section className="relative z-10 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
              <div>
                <h2 className="text-4xl font-bold text-white mb-2 drop-shadow">
                  London 推荐餐厅
                </h2>
                <p className="text-white/80">
                  精选伦敦美食推荐
                </p>
              </div>
              <Link
                href="/london/restaurants"
                className="mt-4 md:mt-0 text-[#F4A261] font-semibold flex items-center gap-2 hover:gap-3 transition-all"
              >
                View All <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <ClickableRestaurantGrid restaurants={featuredRestaurants} />
          </div>
        </section>
      </div>

      {/* CTA Section */}
      <section className="py-20 bg-[#1D3557]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Explore?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            从伦敦到欧陆，发现更多美食与精彩景点。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/london" className="btn-primary text-lg">
              Explore London
            </Link>
            <Link
              href="/othercities"
              className="bg-white text-[#1D3557] px-7 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-lg"
            >
              Other Cities
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
