'use client';

import { useState } from 'react';
import RestaurantCard from './RestaurantCard';
import DetailModal from './DetailModal';
import { Restaurant } from '@/data/types';

interface Props {
  restaurants: Restaurant[];
}

export default function ClickableRestaurantGrid({ restaurants }: Props) {
  const [selected, setSelected] = useState<Restaurant | null>(null);

  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {restaurants.map((r) => (
          <RestaurantCard key={r.id} restaurant={r} onClick={() => setSelected(r)} />
        ))}
      </div>
      <DetailModal
        item={selected ? { type: 'restaurant', data: selected } : null}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
