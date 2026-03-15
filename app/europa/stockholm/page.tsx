'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import RestaurantCard from '@/components/RestaurantCard';
import DetailModal from '@/components/DetailModal';
import { stockholmData } from '@/data/europa/stockholm';
import { Restaurant } from '@/data/types';

export default function StockholmPage() {
  const [selected, setSelected] = useState<Restaurant | null>(null);
  const data = stockholmData;

  return (
    <div className="pt-16">
      {/* Hero — Sweden flag: blue #006AA7, yellow #FECC00 */}
      <section className="relative h-[45vh] min-h-[340px] flex items-end overflow-hidden">
        {/* Flag stripe background */}
        <div className="absolute inset-0 bg-[#006AA7]" />
        {/* Horizontal yellow cross */}
        <div className="absolute top-1/2 left-0 right-0 h-[18%] -translate-y-1/2 bg-[#FECC00]" />
        {/* Vertical yellow cross (offset left like real flag) */}
        <div className="absolute top-0 bottom-0 left-[36%] w-[10%] bg-[#FECC00]" />
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-[#006AA7]/40" />

        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 pb-12 max-w-7xl mx-auto">
          <div className="mb-4">
            <Link
              href="/europa"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Europa
            </Link>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-3 tracking-tight">
            {data.nameEn}
          </h1>
          <p className="text-xl text-[#FECC00] font-bold mb-1">{data.name}</p>
          <p className="text-white/80 max-w-xl">{data.description}</p>
        </div>
      </section>

      {/* Restaurants */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-1.5 h-8 bg-[#FECC00] rounded-full" />
            <h2 className="text-3xl font-black text-[#006AA7]">
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
      />
    </div>
  );
}
