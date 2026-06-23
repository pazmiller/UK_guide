'use client';

import { useState, useMemo } from 'react';
import RestaurantCard from './RestaurantCard';
import DetailModal from './DetailModal';
import { Restaurant } from '@/data/types';

interface Props {
  restaurants: Restaurant[];
  locationHint?: string;
  variant?: 'classic' | 'editorial';
}

const CAFE_CUISINE = '喝的和小甜甜';
const CAFE_SUB_TAGS = [ 'Drinks', 'Desert' ];

export default function RestaurantFilteredGrid({ restaurants, locationHint, variant = 'editorial' }: Props) {
  const [active, setActive] = useState<string>('All');
  const [selected, setSelected] = useState<Restaurant | null>(null);

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

  const filtered = active === 'All'
    ? restaurants
    : restaurants.filter((r) => r.cuisine === active || r.tags?.includes( active ));

  // Only show the filter bar if there are multiple cuisines
  if (cuisines.length <= 1) {
    return (
      <>
        <div className={`grid md:grid-cols-2 lg:grid-cols-3 ${variant === 'editorial' ? 'gap-5' : 'gap-6'}`}>
          {restaurants.map((r) => (
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
              onClick={() => setActive(c)}
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
