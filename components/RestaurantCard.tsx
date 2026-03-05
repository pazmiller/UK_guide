import Image from 'next/image';
import { MapPin } from 'lucide-react';
import { Restaurant } from '@/data/types';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick?: () => void;
}

export default function RestaurantCard({ restaurant, onClick }: RestaurantCardProps) {
  const hasImage = restaurant.images.length > 0;

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden shadow-lg card-hover h-full cursor-pointer"
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
            <span className="badge bg-[#1D3557] text-white">{restaurant.cuisine}</span>
          </div>
        </div>
      )}

      <div className="p-5">
        {!hasImage && (
          <span className="badge bg-[#1D3557] text-white mb-3 inline-block">{restaurant.cuisine}</span>
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

        {restaurant.mustTry.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {restaurant.mustTry.slice(0, 3).map((item, i) => (
              <span key={i} className="text-xs bg-[#F1FAEE] text-[#1D3557] px-2 py-1 rounded-full">
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
