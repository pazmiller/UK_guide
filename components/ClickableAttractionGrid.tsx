'use client';

import { useState } from 'react';
import AttractionCard from './AttractionCard';
import DetailModal from './DetailModal';
import { Attraction } from '@/data/types';

interface Props {
  attractions: Attraction[];
  locationHint?: string;
  variant?: 'classic' | 'editorial';
}

export default function ClickableAttractionGrid({ attractions, locationHint, variant = 'editorial' }: Props) {
  const [selected, setSelected] = useState<Attraction | null>(null);

  return (
    <>
      <div className={`grid md:grid-cols-2 lg:grid-cols-3 ${variant === 'editorial' ? 'gap-5' : 'gap-6'}`}>
        {attractions.map((a) => (
          <AttractionCard
            key={a.id}
            attraction={a}
            onClick={() => setSelected(a)}
            variant={variant}
          />
        ))}
      </div>
      <DetailModal
        item={selected ? { type: 'attraction', data: selected } : null}
        onClose={() => setSelected(null)}
        locationHint={locationHint}
      />
    </>
  );
}
