import ImageCarousel from './ImageCarousel';
import { Attraction } from '@/data/types';

interface AttractionCardProps {
  attraction: Attraction;
  onClick?: () => void;
  variant?: 'classic' | 'editorial';
}

export default function AttractionCard({ attraction, onClick, variant = 'classic' }: AttractionCardProps) {
  const hasImage = attraction.images.length > 0;
  const isEditorial = variant === 'editorial';

  return (
    <div
      className={isEditorial
        ? 'bg-white rounded-lg overflow-hidden shadow-sm ring-1 ring-[#1D3557]/10 hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full'
        : 'bg-white rounded-2xl overflow-hidden shadow-lg card-hover cursor-pointer h-full'}
      onClick={onClick}
    >
      {hasImage && (
        <ImageCarousel
          images={attraction.images}
          alt={attraction.name}
          className="h-48"
          imageClassName="group-hover/image:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        >
          {attraction.category && (
            <div className="absolute top-4 left-4 z-20">
              <span className={`badge bg-[#2A9D8F] text-white ${isEditorial ? 'rounded-md' : ''}`}>{attraction.category}</span>
            </div>
          )}
        </ImageCarousel>
      )}

      <div className="p-5">
        {!hasImage && attraction.category && (
          <span className={`badge bg-[#2A9D8F] text-white mb-3 inline-block ${isEditorial ? 'rounded-md' : ''}`}>{attraction.category}</span>
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
