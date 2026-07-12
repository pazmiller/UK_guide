import Link from 'next/link';
import { ArrowRight, Utensils, Building } from 'lucide-react';
import EditorialRibbon from '@/components/EditorialRibbon';
import { londonAttractions } from '@/data/london/attractions';
import { londonRestaurants } from '@/data/london/restaurants';
import { londonCafes } from '@/data/london/cafes';

export default function LondonPage()
{
  const foodPlacesCount = londonRestaurants.length + londonCafes.length;
  const londonFacts = [
    {
      stat: '£1.75',
      label: 'Bus hopper',
      title: '伦敦公交不收现金，而且一小时内可以无限换乘',
      body: (
        <>
          伦敦公交车只能使用 Oyster、银行卡或手机感应支付，不能上车后拿现金买票。成人单程目前是 £1.75；首次刷卡后的一小时内，可以无限换乘其他公交车和有轨电车，仍只收一次费用。这使得大伦敦的巴士费用，意外地成了英国城市里非常便宜的一档。
        </>
      ),
    },
    {
      stat: '5 min',
      label: 'Walk or Tube',
      title: '在伦敦，走路有时比坐车还快',
      body: (
        <>
          伦敦因为城市设计过早，交通非常糟。有时候叫 Uber 真不如 Tube 快；在市中心，走路甚至可能比坐地铁更快。地铁线路图主要为了清晰展示换乘关系，并不是按真实地理距离绘制。很多站实际非常近，例如 Monument 到 London Bridge 约 5 分钟，可能比坐地铁快约 12 分钟。
        </>
      ),
    },
    {
      stat: 'FREE',
      label: 'Museums',
      title: '伦敦很贵，但很多博物馆免费',
      body: (
        <>
          伦敦是世界上生活成本最高的城市之一，但大英博物馆、国家美术馆、自然历史博物馆、科学博物馆、V&amp;A 等大型国家级博物馆，永久展览通常免费。想看具体推荐可以去{' '}
          <Link href="/london/attractions" className="font-bold text-[#F4A261] underline-offset-4 hover:underline">
            Attractions 页面
          </Link>
          。
        </>
      ),
    },
    {
      stat: '300+',
      label: 'Languages',
      title: '伦敦居民日常使用超过 300 种语言',
      body: (
        <>
          伦敦每天都有人使用的语言超过 300 种，属于世界上语言最丰富的城市之一。2021 Census 中，White 总体只有 50% 出头，White British 约 36.8%，所以它不是一个单一文化城市，而是一座把世界压缩到同一张地铁图上的城市。
        </>
      ),
    },
    {
      stat: '195',
      label: 'Food map',
      title: '真的是美食荒漠吗？',
      body: (
        <>
          伦敦拥有来自 195 个国家和地区菜系的餐厅。中餐这几年也发展得很快，从江浙菜、西安菜、潮汕火锅，到云南菜都有，奶茶连锁店也在扩张。“英国，伦敦没有好吃的”是一个长久的迷思。当然，在外面吃饭不便宜，毕竟人力有着最低 £12/h 左右的底线。
        </>
      ),
    },
  ];

  return (
    <div className="relative pt-16 overflow-hidden bg-[#FBF8F1]">
      {/* ── HERO ── */}
      <section className="relative py-14 md:py-20 bg-[#FBF8F1] border-b border-[#1D3557]/10">
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-[1fr_0.82fr] gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-6xl md:text-8xl font-black text-[#1D3557] tracking-tight mb-4">
                LONDON
              </h1>
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                <span className="h-[3px] w-12 bg-[#E63946]" />
                <span className="text-[#1D3557]/60 text-sm font-semibold uppercase tracking-widest">
                  The UK inside The UK
                </span>
                <span className="h-[3px] w-12 bg-[#E63946]" />
              </div>
              <p className="text-lg text-[#1D3557]/70 max-w-xl leading-relaxed mx-auto lg:mx-0">
                它是欧洲最好的城市。它是欧洲最糟的城市。
              </p>
            </div>

            <div className="relative h-[280px] md:h-[360px] overflow-hidden rounded-lg border border-[#1D3557]/10 bg-white shadow-sm">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: 'url(/bg2.jpg)' }}
              />
              <div className="absolute inset-0 bg-[#1D3557]/10" />
              <EditorialRibbon className="absolute -bottom-2 left-0 h-20 w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-16 bg-[#E63946]">
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            Ready to Explore?
          </h2>
          <p className="text-white/80 mb-8">
            选择一个分类开始你的伦敦之旅
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/london/restaurants" className="bg-white text-[#E63946] font-bold px-8 py-3 rounded-lg hover:bg-[#1D3557] hover:text-white transition-colors">
              Restaurants
            </Link>
            <Link href="/london/attractions" className="bg-white text-[#E63946] font-bold px-8 py-3 rounded-lg hover:bg-[#1D3557] hover:text-white transition-colors">
              Attractions
            </Link>
          </div>
        </div>
      </section>

      {/* ── INTRODUCTION ── */}
      <section className="relative py-16 bg-[#FBF8F1]">
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <div className="grid md:grid-cols-[0.78fr_1fr] gap-6 items-stretch">
            {/* Circle accent */}
            <div className="flex justify-center">
              <div className="w-full rounded-lg bg-white flex items-center justify-center shadow-sm border border-[#1D3557]/10 py-12">
                <div className="text-center text-white px-8">
                  <div className="text-5xl font-black mb-2 text-[#E63946]">
                    {foodPlacesCount + londonAttractions.length}
                  </div>
                  <div className="text-sm font-semibold uppercase tracking-widest text-[#1D3557]/55">
                    Places to Discover
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white border border-[#1D3557]/10 p-8 shadow-sm">
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
                <span className="inline-block px-4 py-2 bg-[#1D3557] text-white text-sm font-semibold rounded-md">
                  {foodPlacesCount} Restaurants
                </span>
                <span className="inline-block px-4 py-2 bg-[#E63946] text-white text-sm font-semibold rounded-md">
                  {londonAttractions.length} Attractions
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── LONDON FACTS ── */}
      <section className="relative py-16 bg-[#1D3557]">
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr] lg:gap-8 lg:items-stretch">
            <div className="relative min-h-[320px] overflow-hidden rounded-xl border border-white/10 bg-white/[0.05] shadow-[0_24px_60px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.12)] lg:min-h-[680px]">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: 'url(/others/london1.png)' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1D3557]/50 via-[#1D3557]/5 to-transparent" />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
            </div>

            <div className="grid gap-4">
              {londonFacts.map( ( item, index ) => (
                <article
                  key={item.title}
                  className="group rounded-xl border border-white/10 bg-white/[0.08] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-[background-color,border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-[#F4A261]/55 hover:bg-white/[0.12]"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <div className="flex items-center gap-3 sm:w-36 sm:shrink-0">
                      <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#E63946] text-sm font-black text-white">
                        {String( index + 1 ).padStart( 2, '0' )}
                      </span>
                      <div>
                        <div className="text-xl font-black text-[#F4A261] leading-none">{item.stat}</div>
                        <div className="mt-1 text-[11px] font-bold uppercase tracking-widest text-white/45">{item.label}</div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white mb-2">{item.title}</h3>
                      <p className="text-sm leading-7 text-white/70">{item.body}</p>
                    </div>
                  </div>
                </article>
              ) )}
            </div>
          </div>
        </div>
      </section>

      {/* ── RESTAURANTS ── */}
      <section className="relative py-16 bg-white">
        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 bg-[#F4A261] text-[#1D3557] text-xs font-bold uppercase tracking-widest rounded-md mb-4">
              Food &amp; Drink
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-[#1D3557] mb-4">
              Taste the World in London
            </h2>
            <p className="text-[#1D3557]/70 max-w-xl mx-auto">
              从伦敦到意大利，途径波斯国，回到川菜，路过寿司店，又到东南亚。伦敦存在有近200个国家的菜系。
            </p>
          </div>

          <div className="grid gap-8">
            {/* Restaurants card */}
            <Link href="/london/restaurants" className="group">
              <div className="bg-white rounded-xl p-8 shadow-sm ring-1 ring-[#1D3557]/10 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
                <div className="w-16 h-16 rounded-lg bg-[#1D3557] flex items-center justify-center mb-6">
                  <Utensils className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-black text-[#1D3557] mb-3">Restaurants</h3>
                <p className="text-gray-500 mb-6 leading-relaxed">
                  {foodPlacesCount} 家精选吃喝推荐，涵盖中餐、东南亚、地中海、波斯菜、咖啡甜品等多种选择
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {[ 'Chinese', 'Thai', 'Malaysian', 'Italian', 'Persian' ].map( c => (
                    <span key={c} className="text-xs bg-[#F1FAEE] text-[#1D3557] px-3 py-1 rounded-full font-medium">
                      {c}
                    </span>
                  ) )}
                  <span className="text-xs bg-gradient-to-r from-[#2A9D8F] to-[#F4A261] text-white px-3 py-1 rounded-full font-bold shadow-sm ring-1 ring-white/60">
                    喝的和小甜甜
                  </span>
                  <span className="text-xs bg-[#F4A261]/20 text-[#1D3557] px-3 py-1 rounded-full font-semibold border border-[#F4A261]/40">
                    Drinks
                  </span>
                  <span className="text-xs bg-[#F4A261]/20 text-[#1D3557] px-3 py-1 rounded-full font-semibold border border-[#F4A261]/40">
                    Desert
                  </span>
                  <span className="text-xs text-gray-400">+more</span>
                </div>
                <span className="inline-flex items-center gap-2 text-[#E63946] font-bold group-hover:gap-3 transition-all">
                  Explore All <ArrowRight className="w-5 h-5" />
                </span>
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* ── ATTRACTIONS ── */}
      <section className="relative py-16 bg-[#FBF8F1]">
        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 bg-[#E63946] text-white text-xs font-bold uppercase tracking-widest rounded-md mb-4">
              Attractions
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-[#1D3557] mb-4">
              See London
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              免费博物馆、皇家公园与城市观景台，各种各样值得探索的，不会踩雷的景点（大概）
            </p>
          </div>

          <Link href="/london/attractions" className="group block">
            <div className="bg-[#1D3557] rounded-xl overflow-hidden shadow-sm ring-1 ring-[#1D3557]/10 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="grid md:grid-cols-2">
                {/* Left: attraction image grid */}
                <div className="p-8 grid grid-cols-3 gap-4">
                  {londonAttractions.slice( 0, 6 ).map( ( a ) => (
                    <div key={a.id} className="aspect-square rounded-lg overflow-hidden">
                      <div
                        className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                        style={{ backgroundImage: `url(${a.images[ 0 ]})` }}
                      />
                    </div>
                  ) )}
                </div>

                {/* Right: info */}
                <div className="p-8 flex flex-col justify-center">
                  <div className="w-14 h-14 rounded-lg bg-[#E63946] flex items-center justify-center mb-6">
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

    </div>
  );
}
