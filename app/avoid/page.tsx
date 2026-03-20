'use client';

import { useState, useEffect, useRef } from 'react';
import { Skull, Bomb, ShieldAlert, MapPin, Utensils, ChevronDown } from 'lucide-react';
import { allAvoids, AvoidEntry } from '@/data/avoids';

type Filter = 'all' | 'restaurant' | 'attraction';
type CityFilter = 'all' | string;

/* ── little floating mine icon for the background ── */
function FloatingMine( { delay, left, size }: { delay: number; left: number; size: number } )
{
  return (
    <div
      className="absolute pointer-events-none select-none opacity-[0.06] animate-float"
      style={{
        left: `${left}%`,
        top: -40,
        fontSize: size,
        animationDelay: `${delay}s`,
        animationDuration: `${12 + Math.random() * 10}s`,
      }}
    >
      <Bomb className="w-full h-full" />
    </div>
  );
}

/* ── avoid card with reveal animation ── */
function AvoidCard( { item, index }: { item: AvoidEntry; index: number } )
{
  const [ revealed, setRevealed ] = useState( false );
  const cardRef = useRef<HTMLDivElement>( null );

  useEffect( () =>
  {
    const el = cardRef.current;
    if ( !el ) return;
    const obs = new IntersectionObserver(
      ( [ entry ] ) =>
      {
        if ( entry.isIntersecting )
        {
          setTimeout( () => setRevealed( true ), index * 60 );
          obs.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    obs.observe( el );
    return () => obs.disconnect();
  }, [ index ] );

  const isRestaurant = item.type === 'restaurant';

  return (
    <div
      ref={cardRef}
      className={`group relative bg-white/95 backdrop-blur border-2 rounded-2xl p-5 transition-all duration-500 cursor-default
        ${revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        ${isRestaurant ? 'border-red-200 hover:border-red-400' : 'border-amber-200 hover:border-amber-400'}
        hover:shadow-xl hover:-translate-y-1`}
    >
      {/* Boom stamp on hover */}
      <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-black
        opacity-0 group-hover:opacity-100 scale-0 group-hover:scale-100 transition-all duration-300
        bg-gradient-to-br from-red-500 to-orange-500 rotate-12 group-hover:rotate-0 shadow-lg"
      >
        <Bomb className="w-5 h-5" />
      </div>

      {/* Tags */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full
          ${isRestaurant ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}
        >
          {isRestaurant ? <Utensils className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
          {isRestaurant ? '餐厅' : '景点'}
        </span>
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          {item.city}
        </span>
      </div>

      {/* Name */}
      <h3 className="font-bold text-[#1D3557] text-lg mb-2 leading-tight">{item.name}</h3>

      {/* Reason with strikethrough animation */}
      <p className="text-gray-600 text-sm leading-relaxed">{item.reason}</p>
    </div>
  );
}

export default function AvoidPage()
{
  const [ filter, setFilter ] = useState<Filter>( 'all' );
  const [ cityFilter, setCityFilter ] = useState<CityFilter>( 'all' );
  const [ showCityDropdown, setShowCityDropdown ] = useState( false );

  const cities = Array.from( new Set( allAvoids.map( ( a ) => a.city ) ) );

  const filtered = allAvoids.filter( ( item ) =>
  {
    if ( filter !== 'all' && item.type !== filter ) return false;
    if ( cityFilter !== 'all' && item.city !== cityFilter ) return false;
    return true;
  } );

  const restaurantCount = allAvoids.filter( ( a ) => a.type === 'restaurant' ).length;
  const attractionCount = allAvoids.filter( ( a ) => a.type === 'attraction' ).length;

  return (
    <>
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0) rotate(0deg); opacity: 0.06; }
          50% { opacity: 0.1; }
          100% { transform: translateY(105vh) rotate(360deg); opacity: 0; }
        }
        .animate-float { animation: float linear infinite; }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-3px) rotate(-1deg); }
          75% { transform: translateX(3px) rotate(1deg); }
        }
        .shake-hover:hover { animation: shake 0.4s ease-in-out; }
      `}</style>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] pt-32 pb-20">
        {/* Floating mines background */}
        {[ ...Array( 8 ) ].map( ( _, i ) => (
          <FloatingMine
            key={i}
            delay={i * 1.5}
            left={5 + ( i * 13 ) % 90}
            size={20 + ( i % 3 ) * 12}
          />
        ) )}

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Animated warning icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/20 mb-6 shake-hover">
            <div className="w-14 h-14 rounded-full bg-red-500/30 flex items-center justify-center">
              <ShieldAlert className="w-8 h-8 text-red-400" />
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight">
            <span className="text-red-400">Chanmei</span> ZONE
          </h1>
          <p className="text-lg text-white/60 mb-2">
            踩雷区
          </p>
          <p className="text-white/40 text-sm max-w-xl mx-auto mb-10">
            前人踩雷，后人避坑。这里收录了各地群友们亲身体验后不推荐的餐厅和景点，帮你省下时间和钱包
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-8">
            <div className="text-center">
              <div className="text-3xl font-black text-red-400">{allAvoids.length}</div>
              <div className="text-xs text-white/40 uppercase tracking-wider mt-1">Total Avoids</div>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <div className="text-3xl font-black text-orange-400">{restaurantCount}</div>
              <div className="text-xs text-white/40 uppercase tracking-wider mt-1">Restaurants</div>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <div className="text-3xl font-black text-amber-400">{attractionCount}</div>
              <div className="text-xs text-white/40 uppercase tracking-wider mt-1">Attractions</div>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full">
            <path d="M0 60V30C240 0 480 60 720 30C960 0 1200 60 1440 30V60H0Z" fill="#FEF2F2" />
          </svg>
        </div>
      </section>

      {/* Content */}
      <section className="bg-red-50/50 py-12 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-10">
            {/* Type filter */}
            <div className="flex bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden">
              {( [
                { key: 'all', label: '全部', icon: Skull },
                { key: 'restaurant', label: '餐厅', icon: Utensils },
                { key: 'attraction', label: '景点', icon: MapPin },
              ] as const ).map( ( { key, label, icon: Icon } ) => (
                <button
                  key={key}
                  onClick={() => setFilter( key )}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer
                    ${filter === key
                      ? 'bg-[#E63946] text-white shadow-inner'
                      : 'text-gray-500 hover:text-[#E63946] hover:bg-red-50'}`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ) )}
            </div>

            {/* City filter dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowCityDropdown( !showCityDropdown )}
                className="flex items-center gap-2 bg-white rounded-xl shadow-sm border border-red-100 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-[#E63946] transition-colors cursor-pointer"
              >
                <MapPin className="w-4 h-4" />
                {cityFilter === 'all' ? '所有城市' : cityFilter}
                <ChevronDown className={`w-4 h-4 transition-transform ${showCityDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showCityDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-red-100 overflow-hidden z-20 min-w-[140px]">
                  <button
                    onClick={() => { setCityFilter( 'all' ); setShowCityDropdown( false ); }}
                    className={`block w-full text-left px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer
                      ${cityFilter === 'all' ? 'bg-red-50 text-[#E63946]' : 'text-gray-600 hover:bg-red-50'}`}
                  >
                    所有城市
                  </button>
                  {cities.map( ( city ) => (
                    <button
                      key={city}
                      onClick={() => { setCityFilter( city ); setShowCityDropdown( false ); }}
                      className={`block w-full text-left px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer
                        ${cityFilter === city ? 'bg-red-50 text-[#E63946]' : 'text-gray-600 hover:bg-red-50'}`}
                    >
                      {city}
                    </button>
                  ) )}
                </div>
              )}
            </div>

            {/* Result count */}
            <span className="text-sm text-gray-400 ml-auto">
              {filtered.length} 个避雷
            </span>
          </div>

          {/* Grid */}
          {filtered.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map( ( item, i ) => (
                <AvoidCard key={`${item.city}-${item.name}`} item={item} index={i} />
              ) )}
            </div>
          ) : (
            <div className="text-center py-20">
              <Skull className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400">没有找到匹配的避雷项目</p>
            </div>
          )}

          {/* Disclaimer */}
          <div className="mt-16 text-center">
            <p className="text-xs text-gray-400 max-w-lg mx-auto leading-relaxed">
              以上避雷内容均来自 UKCFFA 群友的真实体验与主观感受，仅供参考。
              每个人的口味和偏好不同，欢迎自行体验后得出自己的结论。
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
