'use client';

import { useState, useMemo, useId } from 'react';
import { matchesRestaurant } from '@/lib/restaurantSearch';
import { useRestaurantQuery } from './useRestaurantQuery';
import RestaurantCard from './RestaurantCard';
import DetailModal from './DetailModal';
import { Restaurant } from '@/data/types';

interface Props {
  restaurants: Restaurant[];
  locationHint?: string;
  variant?: 'classic' | 'editorial';
  initialSlug?: string;
  queryScope?: string;
}

const CAFE_CUISINE = '喝的和小甜甜';
const CAFE_SUB_TAGS = [ 'Drinks', 'Desert' ];

export default function RestaurantFilteredGrid({ restaurants, locationHint, variant = 'editorial', initialSlug, queryScope = '' }: Props) {
  const filters = useRestaurantQuery( queryScope );
  const active = filters.cuisine;
  const searchId = useId();
  const [selected, setSelected] = useState<Restaurant | null>(() => restaurants.find( item => item.slug === initialSlug ) ?? null);

  const cuisines = useMemo(() => {
    const seen = new Set<string>();
    const cuisineList: string[] = [];
    const tagList: string[] = [];
    for (const r of restaurants) {
      if (!seen.has(r.cuisine)) {
        seen.add(r.cuisine);
        cuisineList.push(r.cuisine);
      }
      for ( const tag of r.tags ?? [] )
      {
        if ( !seen.has( tag ) )
        {
          seen.add( tag );
          tagList.push( tag );
        }
      }
    }
    return [
      ...cuisineList.sort(),
      ...tagList.sort( ( a, b ) => CAFE_SUB_TAGS.indexOf( a ) - CAFE_SUB_TAGS.indexOf( b ) ),
    ];
  }, [restaurants]);

  const filtered = restaurants.filter( r => matchesRestaurant( r, filters.query, active ) );
  const search = <form role="search" aria-label="餐厅搜索" className="mb-6 text-[#1D3557]" onSubmit={event => {
    event.preventDefault();
    filters.update( String( new FormData( event.currentTarget ).get( 'query' ) ?? '' ), active );
  }}>
    <label htmlFor={searchId} className="mb-2 block text-sm font-semibold">搜索店名、菜系或标签</label>
    <div className="flex gap-2">
      <input key={filters.query} id={searchId} name="query" type="search" defaultValue={filters.query} placeholder="例如 Kiln、云南、Thai" className="min-h-11 min-w-0 flex-1 rounded-md border border-[#1D3557]/25 bg-white px-4 focus-visible:outline-2 focus-visible:outline-[#315BEA]" />
      <button className="min-h-11 rounded-md bg-[#1D3557] px-5 font-semibold text-white" type="submit">搜索</button>
      {(filters.query || active !== 'All') && <button type="button" onClick={() => filters.update( '', 'All' )} className="min-h-11 px-2 text-sm underline underline-offset-4">清空条件</button>}
    </div>
    <p role="status" className="mt-3 text-sm text-[#1D3557]/65">找到 {filtered.length} 家{filters.query ? ` · “${filters.query}”` : ''}{filtered.length === 0 ? '，试试其他关键词或清空条件。' : ''}</p>
  </form>;

  // Only show the filter bar if there are multiple cuisines
  if (cuisines.length <= 1) {
    return (
      <>
        {search}
        <div className={`grid md:grid-cols-2 lg:grid-cols-3 ${variant === 'editorial' ? 'gap-5' : 'gap-6'}`}>
          {filtered.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} onClick={() => setSelected(r)} variant={variant} />
          ))}
        </div>
        <DetailModal
          item={selected ? { type: 'restaurant', data: selected } : null}
          onClose={() => setSelected(null)}
          locationHint={locationHint}
        />
      </>
    );
  }

  return (
    <div>
      {search}
      {/* Filter bar */}
      <div className="flex gap-2 flex-wrap mb-8">
        {['All', ...cuisines].map((c) => {
          const isCafe = c === CAFE_CUISINE;
          const isCafeSubTag = CAFE_SUB_TAGS.includes( c );
          const isActive = active === c;
          const shape = variant === 'editorial' ? 'rounded-md' : 'rounded-full';
          const normalClass = isActive
            ? 'bg-[#E63946] text-white shadow-sm'
            : 'bg-white text-[#1D3557] border border-[#1D3557]/20 hover:border-[#E63946] hover:text-[#E63946]';
          const cafeClass = isActive
            ? 'bg-gradient-to-r from-[#2A9D8F] to-[#F4A261] text-white shadow-md ring-1 ring-[#F4A261]/50'
            : 'bg-[#2A9D8F]/10 text-[#1D3557] border border-[#2A9D8F]/35 hover:bg-gradient-to-r hover:from-[#2A9D8F] hover:to-[#F4A261] hover:text-white hover:border-transparent';
          const cafeSubTagClass = isActive
            ? 'bg-[#1D3557] text-white shadow-sm'
            : 'bg-[#F4A261]/15 text-[#1D3557] border border-[#F4A261]/45 hover:bg-[#F4A261] hover:text-[#1D3557] hover:border-[#F4A261]';

          return (
            <button
              key={c}
              type="button"
              aria-pressed={isActive}
              onClick={() => filters.update( filters.query, c )}
              className={`px-4 py-1.5 ${shape} text-sm font-medium transition-colors whitespace-nowrap ${
                isCafe ? cafeClass : isCafeSubTag ? cafeSubTagClass : normalClass
              }`}
            >
              {c}
              {c === 'All' && (
                <span className="ml-1.5 opacity-70">({restaurants.length})</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Count */}
      {active !== 'All' && (
        <p className="text-sm text-gray-500 mb-6">
          显示 {filtered.length} 家 <span className="font-semibold text-[#1D3557]">{active}</span> 餐厅
        </p>
      )}

      {/* Grid */}
      <div className={`grid md:grid-cols-2 lg:grid-cols-3 ${variant === 'editorial' ? 'gap-5' : 'gap-6'}`}>
        {filtered.map((r) => (
          <RestaurantCard key={r.id} restaurant={r} onClick={() => setSelected(r)} variant={variant} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-gray-400 py-12">暂无该类型餐厅</p>
      )}

      <DetailModal
        item={selected ? { type: 'restaurant', data: selected } : null}
        onClose={() => setSelected(null)}
        locationHint={locationHint}
      />
    </div>
  );
}
