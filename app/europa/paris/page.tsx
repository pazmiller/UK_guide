'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import RestaurantCard from '@/components/RestaurantCard';
import DetailModal from '@/components/DetailModal';
import { parisData } from '@/data/europa/paris';
import { Restaurant } from '@/data/types';

export default function ParisPage() {
  const [selected, setSelected] = useState<Restaurant | null>(null);
  const data = parisData;

  return (
    <div className="pt-16">
      {/* Hero — France tricolore: blue #002395, white, red #ED2939 */}
      <section className="relative h-[45vh] min-h-[340px] flex items-end overflow-hidden">
        {/* Three vertical stripes */}
        <div className="absolute inset-0 flex">
          <div className="flex-1 bg-[#002395]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#ED2939]" />
        </div>
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/35" />

        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 pb-12 max-w-7xl mx-auto">
          <div className="mb-4">
            <Link
              href="/europa"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Europa
            </Link>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-3 tracking-tight drop-shadow-lg">
            {data.nameEn}
          </h1>
          <p className="text-xl text-white/90 font-bold mb-1 drop-shadow">{data.name}</p>
          <p className="text-white/80 max-w-xl drop-shadow">{data.description}</p>
        </div>
      </section>

      {/* Restaurants */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-1.5 h-8 bg-[#002395] rounded-full" />
            <h2 className="text-3xl font-black text-[#002395]">
              推荐餐厅
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.restaurants.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} onClick={() => setSelected(r)} />
            ))}
          </div>
        </div>
      </section>

      <DetailModal
        item={selected ? { type: 'restaurant', data: selected } : null}
        onClose={() => setSelected(null)}
        locationHint="Paris France"
      />
    </div>
  );
}
