import Image from 'next/image';
import { Attraction } from '@/data/types';

interface AttractionCardProps {
  attraction: Attraction;
}

export default function AttractionCard({ attraction }: AttractionCardProps) {
  const hasImage = attraction.images.length > 0;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg card-hover cursor-pointer h-full">
      {hasImage && (
        <div className="relative h-48 overflow-hidden">
          <Image
            src={attraction.images[0]}
            alt={attraction.name}
            fill
            className="object-cover transition-transform duration-500 hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {attraction.category && (
            <div className="absolute top-4 left-4">
              <span className="badge bg-[#2A9D8F] text-white">{attraction.category}</span>
            </div>
          )}
        </div>
      )}

      <div className="p-5">
        {!hasImage && attraction.category && (
          <span className="badge bg-[#2A9D8F] text-white mb-3 inline-block">{attraction.category}</span>
        )}

        <h3 className="text-xl font-bold text-[#1D3557] mb-2 line-clamp-1">
          {attraction.name}
        </h3>

        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
          {attraction.shortDescription}
        </p>

        {attraction.price && (
          <p className="text-sm text-[#E63946] font-medium">{attraction.price}</p>
        )}
      </div>
    </div>
  );
}
