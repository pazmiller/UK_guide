import Link from 'next/link';
import { ArrowRight, Utensils, Coffee, Building } from 'lucide-react';
import LondonRibbon from '@/components/LondonRibbon';
import { londonAttractions } from '@/data/london/attractions';
import { londonRestaurants } from '@/data/london/restaurants';
import { londonCafes } from '@/data/london/cafes';

export default function LondonPage()
{
  return (
    <div className="relative pt-16 overflow-hidden">
      {/* Tricolor ribbon weaving through the entire page */}
      <LondonRibbon />

      {/* ── HERO ── */}
      <section className="relative min-h-[520px] flex items-center">
        {/* Split background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-1/2 h-full bg-[#F4A261]" />
          <div className="absolute top-0 right-0 w-1/2 h-full bg-[#1D3557]" />
        </div>

        {/* Large circle — flat design accent */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] md:w-[480px] md:h-[480px] rounded-full overflow-hidden border-[6px] border-white/20 shadow-2xl">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: 'url(https://cdn.britannica.com/01/94501-050-7C939333/Big-Ben-London.jpg)' }}
          />
          <div className="absolute inset-0 bg-[#457B9D]/40" />
        </div>

        {/* Hero text */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-24 flex flex-col items-center text-center">
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tight mb-4 drop-shadow-lg">
            LONDON
          </h1>
          <div className="flex items-center gap-3 mb-6">
            <span className="h-[3px] w-12 bg-[#E63946]" />
            <span className="text-white/80 text-sm font-semibold uppercase tracking-widest">
              The UK inside The UK
            </span>
            <span className="h-[3px] w-12 bg-[#E63946]" />
          </div>
          <p className="text-lg text-blue-100 max-w-xl leading-relaxed">
            它是欧洲最好的城市。它是欧洲最糟的城市。
          </p>
        </div>
      </section>

      {/* ── INTRODUCTION ── */}
      <section className="relative py-24 bg-[#F1FAEE]">
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Circle accent */}
            <div className="flex justify-center">
              <div className="w-64 h-64 md:w-80 md:h-80 rounded-full bg-[#E63946] flex items-center justify-center shadow-xl">
                <div className="text-center text-white px-8">
                  <div className="text-5xl font-black mb-2">
                    {londonRestaurants.length + londonCafes.length + londonAttractions.length}
                  </div>
                  <div className="text-sm font-semibold uppercase tracking-widest opacity-90">
                    Places to Discover
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-4xl font-black text-[#1D3557] mb-6">
                Welcome to Our London Guide
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                无论你是刚来英国上学的新人，还是已经工作多年，这份由 UKCFFA 群主与群成员们整理的伦敦指南，
                涵盖了餐厅、咖啡甜品、景点推荐与避雷信息。
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                所以记得保护好你的手机！
              </p>
              <div className="flex gap-3 flex-wrap">
                <span className="inline-block px-4 py-2 bg-[#1D3557] text-white text-sm font-semibold rounded-full">
                  {londonRestaurants.length} Restaurants
                </span>
                <span className="inline-block px-4 py-2 bg-[#2A9D8F] text-white text-sm font-semibold rounded-full">
                  {londonCafes.length} Cafes
                </span>
                <span className="inline-block px-4 py-2 bg-[#E63946] text-white text-sm font-semibold rounded-full">
                  {londonAttractions.length} Attractions
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HISTORY ── */}
      <section className="relative py-24 bg-[#1D3557]">
        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block px-3 py-1 bg-[#E63946] text-white text-xs font-bold uppercase tracking-widest rounded-full mb-4">
                History
              </span>
              <h2 className="text-4xl font-black text-white mb-6">
                Two Thousand Years of Stories
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                从罗马人建立 Londinium，到中世纪的伦敦塔，再到维多利亚时代的大英帝国全盛期——伦敦的每一条街道都在讲述着历史。
              </p>
              <p className="text-white/70 leading-relaxed mb-4">
                如今的伦敦是全球最多元化的城市之一，超过 300 种语言在这里交汇，东西方的美食文化在此碰撞。
                这也正是为什么伦敦的餐厅推荐如此丰富——从正宗川菜到秘鲁海鲜，从潮汕火锅到那不勒斯披萨。
              </p>
              <p className="text-white/70 leading-relaxed">
                免费的世界级博物馆、皇家公园、和隐藏在小巷中的咖啡馆——伦敦永远有新的角落等你探索。
              </p>
            </div>

            {/* Timeline */}
            <div className="space-y-6">
              {[
                { year: '43 AD', title: 'Londinium', desc: '罗马人建城' },
                { year: '1066', title: 'Tower of London', desc: '诺曼征服，伦敦塔建造' },
                { year: '1666', title: 'Great Fire', desc: '伦敦大火，浴火重生' },
                { year: '1863', title: 'The Tube', desc: '世界第一条地铁开通' },
                { year: 'Now', title: 'Global City', desc: '300+种语言的多元之都' },
              ].map( ( item ) => (
                <div key={item.year} className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#F4A261] flex items-center justify-center shrink-0">
                    <span className="text-[#1D3557] font-black text-xs">{item.year}</span>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{item.title}</h3>
                    <p className="text-white/60 text-sm">{item.desc}</p>
                  </div>
                </div>
              ) )}
            </div>
          </div>
        </div>
      </section>

      {/* ── RESTAURANTS ── */}
      <section className="relative py-24 bg-[#F4A261]">
        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 bg-[#1D3557] text-white text-xs font-bold uppercase tracking-widest rounded-full mb-4">
              Food &amp; Drink
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-[#1D3557] mb-4">
              Taste the World in London
            </h2>
            <p className="text-[#1D3557]/70 max-w-xl mx-auto">
              从伦敦到意大利，途径波斯国，回到川菜，路过寿司店，又到东南亚。伦敦存在有近200个国家的菜系。
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Restaurants card */}
            <Link href="/london/restaurants" className="group">
              <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 h-full">
                <div className="w-16 h-16 rounded-full bg-[#1D3557] flex items-center justify-center mb-6">
                  <Utensils className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-black text-[#1D3557] mb-3">Restaurants</h3>
                <p className="text-gray-500 mb-6 leading-relaxed">
                  {londonRestaurants.length} 家精选餐厅，涵盖中餐、东南亚、地中海、波斯菜等多种菜系
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {[ 'Chinese', 'Thai', 'Malaysian', 'Italian', 'Persian' ].map( c => (
                    <span key={c} className="text-xs bg-[#F1FAEE] text-[#1D3557] px-3 py-1 rounded-full font-medium">
                      {c}
                    </span>
                  ) )}
                  <span className="text-xs text-gray-400">+more</span>
                </div>
                <span className="inline-flex items-center gap-2 text-[#E63946] font-bold group-hover:gap-3 transition-all">
                  Explore All <ArrowRight className="w-5 h-5" />
                </span>
              </div>
            </Link>

            {/* Cafes card */}
            <Link href="/london/cafes" className="group">
              <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 h-full">
                <div className="w-16 h-16 rounded-full bg-[#2A9D8F] flex items-center justify-center mb-6">
                  <Coffee className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-black text-[#1D3557] mb-3">Cafes &amp; Desserts</h3>
                <p className="text-gray-500 mb-6 leading-relaxed">
                  {londonCafes.length} 家甜品店、咖啡馆与饮品店——从法式 Bakery 到台式手摇奶茶
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {[ 'Bakery', 'Gelato', 'Coffee', 'Bubble Tea' ].map( c => (
                    <span key={c} className="text-xs bg-[#F1FAEE] text-[#1D3557] px-3 py-1 rounded-full font-medium">
                      {c}
                    </span>
                  ) )}
                </div>
                <span className="inline-flex items-center gap-2 text-[#E63946] font-bold group-hover:gap-3 transition-all">
                  Browse All <ArrowRight className="w-5 h-5" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── ATTRACTIONS ── */}
      <section className="relative py-24 bg-white">
        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 bg-[#E63946] text-white text-xs font-bold uppercase tracking-widest rounded-full mb-4">
              Attractions
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-[#1D3557] mb-4">
              See London
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              免费博物馆、皇家公园与城市观景台——伦敦最值得探索的景点
            </p>
          </div>

          <Link href="/london/attractions" className="group block">
            <div className="bg-[#1D3557] rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="grid md:grid-cols-2">
                {/* Left: attraction image grid */}
                <div className="p-8 grid grid-cols-3 gap-4">
                  {londonAttractions.slice( 0, 6 ).map( ( a ) => (
                    <div key={a.id} className="aspect-square rounded-2xl overflow-hidden">
                      <div
                        className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                        style={{ backgroundImage: `url(${a.images[ 0 ]})` }}
                      />
                    </div>
                  ) )}
                </div>

                {/* Right: info */}
                <div className="p-8 flex flex-col justify-center">
                  <div className="w-14 h-14 rounded-full bg-[#E63946] flex items-center justify-center mb-6">
                    <Building className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-3">
                    {londonAttractions.length} Attractions
                  </h3>
                  <p className="text-white/60 mb-4 leading-relaxed">
                    伦敦这么多地方，哪些真的好，哪些不值得去，这里有答案。
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {[ 'Museums', 'Parks', 'Landmarks', 'Historical' ].map( c => (
                      <span key={c} className="text-xs bg-white/10 text-white/80 px-3 py-1 rounded-full">
                        {c}
                      </span>
                    ) )}
                  </div>
                  <span className="inline-flex items-center gap-2 text-[#F4A261] font-bold group-hover:gap-3 transition-all">
                    View All Attractions <ArrowRight className="w-5 h-5" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ── CTA FOOTER ── */}
      <section className="relative py-16 bg-[#E63946]">
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            Ready to Explore?
          </h2>
          <p className="text-white/80 mb-8">
            选择一个分类开始你的伦敦之旅
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/london/restaurants" className="bg-white text-[#E63946] font-bold px-8 py-3 rounded-full hover:bg-[#1D3557] hover:text-white transition-colors">
              Restaurants
            </Link>
            <Link href="/london/cafes" className="bg-white text-[#E63946] font-bold px-8 py-3 rounded-full hover:bg-[#1D3557] hover:text-white transition-colors">
              Cafes
            </Link>
            <Link href="/london/attractions" className="bg-white text-[#E63946] font-bold px-8 py-3 rounded-full hover:bg-[#1D3557] hover:text-white transition-colors">
              Attractions
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
