import Image from 'next/image';
import { Coffee, MapPin } from 'lucide-react';
import { Restaurant } from '@/data/types';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick?: () => void;
  variant?: 'classic' | 'editorial';
}

const CAFE_CUISINE = '喝的和小甜甜';
const CAFE_SUB_TAGS = [ 'Drinks', 'Desert' ];

export default function RestaurantCard({ restaurant, onClick, variant = 'classic' }: RestaurantCardProps) {
  const hasImage = restaurant.images.length > 0;
  const isEditorial = variant === 'editorial';
  const isCafe = restaurant.cuisine === CAFE_CUISINE;
  const cuisineBadgeClass = isCafe
    ? 'badge inline-flex items-center gap-1.5 bg-gradient-to-r from-[#2A9D8F] to-[#F4A261] text-white shadow-md ring-1 ring-white/60'
    : `badge bg-[#1D3557] text-white ${isEditorial ? 'rounded-md' : ''}`;
  const inlineCuisineBadgeClass = isCafe
    ? `${cuisineBadgeClass} mb-3`
    : `badge bg-[#1D3557] text-white mb-3 inline-block ${isEditorial ? 'rounded-md' : ''}`;

  return (
    <div
      className={isEditorial
        ? 'bg-white rounded-lg overflow-hidden shadow-sm ring-1 ring-[#1D3557]/10 hover:shadow-md transition-all duration-300 hover:-translate-y-1 h-full cursor-pointer'
        : 'bg-white rounded-2xl overflow-hidden shadow-lg card-hover h-full cursor-pointer'}
      onClick={onClick}
    >
      {hasImage && (
        <div className="relative h-44 overflow-hidden">
          <Image
            src={restaurant.images[0]}
            alt={restaurant.name}
            fill
            className="object-cover transition-transform duration-500 hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute top-4 left-4">
            <span className={cuisineBadgeClass}>
              {isCafe && <Coffee className="w-3.5 h-3.5" />}
              {restaurant.cuisine}
            </span>
          </div>
        </div>
      )}

      <div className="p-5">
        {!hasImage && (
          <span className={inlineCuisineBadgeClass}>
            {isCafe && <Coffee className="w-3.5 h-3.5" />}
            {restaurant.cuisine}
          </span>
        )}

        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-bold text-[#1D3557] line-clamp-1 flex-1">
            {restaurant.name}
          </h3>
          {restaurant.priceRange && (
            <span className="text-sm text-[#E63946] font-semibold ml-2 whitespace-nowrap">
              {restaurant.priceRange}
            </span>
          )}
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {restaurant.description}
        </p>

        {restaurant.tags?.length ? (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {restaurant.tags.map( tag => (
              <span
                key={tag}
                className={`text-xs px-2 py-1 font-semibold ${isEditorial ? 'rounded-md' : 'rounded-full'} ${
                  CAFE_SUB_TAGS.includes( tag )
                    ? 'bg-[#F4A261]/20 text-[#1D3557] border border-[#F4A261]/40'
                    : 'bg-[#F1FAEE] text-[#1D3557]'
                }`}
              >
                {tag}
              </span>
            ) )}
          </div>
        ) : null}

        {restaurant.mustTry.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {restaurant.mustTry.slice(0, 3).map((item, i) => (
              <span key={i} className={`text-xs bg-[#F1FAEE] text-[#1D3557] px-2 py-1 ${isEditorial ? 'rounded-md' : 'rounded-full'}`}>
                {item}
              </span>
            ))}
            {restaurant.mustTry.length > 3 && (
              <span className="text-xs text-gray-400">+{restaurant.mustTry.length - 3}</span>
            )}
          </div>
        )}

        {restaurant.address && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="w-3.5 h-3.5 text-[#E63946]" />
            <span className="line-clamp-1">{restaurant.address}</span>
          </div>
        )}
      </div>
    </div>
  );
}
