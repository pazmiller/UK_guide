'use client';

import { useState } from 'react';
import RestaurantCard from './RestaurantCard';
import DetailModal from './DetailModal';
import { Restaurant } from '@/data/types';

interface Props {
  restaurants: Restaurant[];
  locationHint?: string;
  variant?: 'classic' | 'editorial';
}

export default function ClickableRestaurantGrid({ restaurants, locationHint, variant = 'classic' }: Props) {
  const [selected, setSelected] = useState<Restaurant | null>(null);

  return (
    <>
      <div className={`grid md:grid-cols-2 lg:grid-cols-3 ${variant === 'editorial' ? 'gap-5' : 'gap-8'}`}>
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
