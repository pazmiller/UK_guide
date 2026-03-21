'use client';

import { useState } from 'react';
import { londonRestaurants } from '@/data/london/restaurants';
import { Restaurant } from '@/data/types';
import DetailModal from './DetailModal';

const credits = [
  '赤夜', '鲁珀', '月桑', '葡萄柚', '裙大头',
  '雪麒', '啸羽', '米勒勒勒', '狮子', '恺', '枫霜'
];

export default function CreditsSection()
{
  const [ selected, setSelected ] = useState<Restaurant | null>( null );

  const handleRandomRestaurant = () =>
  {
    const idx = Math.floor( Math.random() * londonRestaurants.length );
    setSelected( londonRestaurants[ idx ] );
  };

  return (
    <>
      <section className="py-20 bg-[#1D3557]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Special Thanks
          </h2>
          <p className="text-white/60 mb-10 text-sm tracking-widest uppercase">
            To the Gentlemen of Brtiannia
          </p>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-4 mb-12">
            {credits.map( ( name ) => (
              <span
                key={name}
                className="text-lg text-white/90 font-medium px-4 py-2 rounded-full border border-white/20 backdrop-blur-sm hover:border-[#F4A261] hover:text-[#F4A261] transition-colors cursor-default"
              >
                {name}
              </span>
            ) )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleRandomRestaurant}
              className="btn-primary text-lg cursor-pointer"
            >
              Say no more!
            </button>
            <a
              href="/othercities"
              className="bg-white text-[#1D3557] px-7 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-lg"
            >
              Other Cities
            </a>
          </div>
        </div>
      </section>

      <DetailModal
        item={selected ? { type: 'restaurant', data: selected } : null}
        onClose={() => setSelected( null )}
        locationHint="London UK"
      />
    </>
  );
}
