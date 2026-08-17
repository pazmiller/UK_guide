import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookOpen, Building, Globe, MapPin } from 'lucide-react';
import Hero from '@/components/Hero';
import ClickableRestaurantGrid from '@/components/ClickableRestaurantGrid';
import CreditsSection from '@/components/CreditsSection';
import { londonRestaurants } from '@/data/london/restaurants';
import millerIcon from '@/src/img/miller_icon.png';

export default function Home()
{
  const featuredRestaurants = londonRestaurants.slice( 0, 3 );

  return (
    <>
      <Hero />



      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(220px,0.65fr)_minmax(0,2fr)] xl:grid-cols-[280px_minmax(0,768px)_1fr]">
            <aside className="furcon-in mx-auto flex max-w-[280px] flex-col items-center" aria-label="兽聚日期与兽展资讯">
              <div className="relative rounded-2xl border-2 border-[#1D3557] bg-[#FFF9EC] px-5 py-4 text-left shadow-[5px_6px_0_#1D3557]">
                <span className="absolute -bottom-[9px] left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-[#1D3557] bg-[#FFF9EC]" aria-hidden="true" />
                <p className="text-[15px] font-bold leading-6 text-[#1D3557]">
                  想要了解最近英国的兽聚是几号，周边国家有什么兽展吗？
                </p>
                <a
                  href="https://ukeu.vercel.app/furcon"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#E63946] px-4 py-2 text-sm font-black text-white transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-[#C62A36] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#E63946]"
                >
                  想！
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>

              <div className="mt-5 overflow-hidden rounded-full border-4 border-white bg-white shadow-[0_0_0_3px_#F4A261,0_10px_25px_rgba(29,53,87,0.22)]">
                <Image
                  src={millerIcon}
                  alt="米勒头像"
                  className="h-28 w-28 object-cover [image-rendering:pixelated]"
                />
              </div>
            </aside>

            <div className="max-w-3xl text-center">
              <h2 className="text-4xl font-bold text-[#1D3557] mb-6">
                欢迎！ <span className="text-[#E63946]">by UK CFFA群主与群成员们</span>
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                无论你是刚来英国上学的新人，还是已经就读工作多年，UKCFFA会一直与你分享英国与欧陆。
              </p>
              <Link href="/contribute" className="btn-primary inline-flex items-center gap-2">
                出一份力！ <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          <section className="relative mt-16 overflow-hidden border border-[#1D3557]/15 bg-[#FCFBF7] shadow-[0_18px_42px_rgba(29,53,87,0.12)]">
            <div className="absolute inset-0 opacity-60" aria-hidden="true" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 31px, rgba(29,53,87,0.045) 32px)' }} />
            <div className="absolute inset-y-0 left-0 w-2 bg-[#E63946]" aria-hidden="true" />
            <div className="relative grid lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
              <div className="px-7 py-8 sm:px-10 sm:py-10">
                <div className="flex items-center gap-3 text-xs font-bold uppercase text-[#1D3557]/65">
                  <BookOpen className="h-4 w-4 text-[#E63946]" />
                  <span>UK Arrival Notes</span>
                  <span className="h-px w-10 bg-[#1D3557]/20" />
                  <span>Before & After Landing</span>
                </div>

                <h3 className="mt-6 max-w-xl text-3xl font-black leading-tight text-[#1D3557] sm:text-4xl">
                  CFFA UK Onboarding
                </h3>
                <p className="mt-4 max-w-xl text-base leading-8 text-[#1D3557]/70 sm:text-lg">
                  从落地后的第一张手机卡，到体验NHS医疗，各种指南与逼坑，尽在CFFA出版的带英十一诫里！第一次来英国也不用慌nia
                </p>

                <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-[#1D3557]/75">
                  <span>手机卡与诈骗的关系</span>
                  <span className="text-[#E63946]" aria-hidden="true">/</span>
                  <span>日常出行</span>
                  <span className="text-[#E63946]" aria-hidden="true">/</span>
                  <span>NHS</span>
                </div>
              </div>

              <div className="relative flex min-h-[230px] flex-col justify-between border-t border-dashed border-[#1D3557]/25 px-7 py-8 sm:px-10 lg:min-h-0 lg:border-l lg:border-t-0">
                <span className="pointer-events-none absolute right-5 top-2 text-[9rem] font-black leading-none text-[#1D3557]/[0.055] sm:right-8 sm:text-[11rem]" aria-hidden="true">
                  11
                </span>
                <div className="relative">
                  <p className="text-sm font-bold uppercase text-[#E63946]">Eleven Teachings</p>
                  <p className="mt-2 max-w-[16rem] text-xl font-black leading-snug text-[#1D3557]">
                    一次读完，之后需要时随手翻开。
                  </p>
                </div>
                <Link
                  href="/guide"
                  className="relative inline-flex w-fit items-center gap-3 border-b-2 border-[#1D3557] pb-2 text-base font-black text-[#1D3557] transition-colors hover:border-[#E63946] hover:text-[#E63946] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E63946]"
                >
                  打开赴英指南
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </section>
        </div>
      </section>

      {/* Explore + Featured Restaurants — shared animated background */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/bg2.jpg)' }} />
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
                    <p className="text-white/80 text-sm">York, Glasgow, Edinburgh, Nottingham + more</p>
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
      <CreditsSection />
    </>
  );
}
