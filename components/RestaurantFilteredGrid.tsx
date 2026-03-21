'use client';

import { useState, useMemo } from 'react';
import RestaurantCard from './RestaurantCard';
import DetailModal from './DetailModal';
import { Restaurant } from '@/data/types';

interface Props {
  restaurants: Restaurant[];
  locationHint?: string;
}

export default function RestaurantFilteredGrid({ restaurants, locationHint }: Props) {
  const [active, setActive] = useState<string>('All');
  const [selected, setSelected] = useState<Restaurant | null>(null);

  const cuisines = useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = [];
    for (const r of restaurants) {
      if (!seen.has(r.cuisine)) {
        seen.add(r.cuisine);
        list.push(r.cuisine);
      }
    }
    return list.sort();
  }, [restaurants]);

  const filtered = active === 'All' ? restaurants : restaurants.filter((r) => r.cuisine === active);

  // Only show the filter bar if there are multiple cuisines
  if (cuisines.length <= 1) {
    return (
      <>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} onClick={() => setSelected(r)} />
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
        {['All', ...cuisines].map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              active === c
                ? 'bg-[#E63946] text-white shadow-sm'
                : 'bg-white text-[#1D3557] border border-[#1D3557]/20 hover:border-[#E63946] hover:text-[#E63946]'
            }`}
          >
            {c}
            {c === 'All' && (
              <span className="ml-1.5 opacity-70">({restaurants.length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Count */}
      {active !== 'All' && (
        <p className="text-sm text-gray-500 mb-6">
          显示 {filtered.length} 家 <span className="font-semibold text-[#1D3557]">{active}</span> 餐厅
        </p>
      )}

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((r) => (
          <RestaurantCard key={r.id} restaurant={r} onClick={() => setSelected(r)} />
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
