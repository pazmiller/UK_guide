import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Star, Clock } from 'lucide-react';
import { Restaurant } from '@/data/restaurants';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

function PriceRange({ range }: { range: string }) {
  const maxPrice = 4;
  const activeCount = range.length;

  return (
    <span className="font-semibold">
      {Array.from({ length: maxPrice }).map((_, i) => (
        <span
          key={i}
          className={i < activeCount ? 'text-[#E63946]' : 'text-gray-300'}
        >
          £
        </span>
      ))}
    </span>
  );
}

function Rating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      <Star className="w-4 h-4 fill-[#F4A261] text-[#F4A261]" />
      <span className="font-semibold text-[#1D3557]">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const cuisineColors: Record<string, string> = {
    British: 'bg-[#1D3557]',
    Indian: 'bg-[#E63946]',
    Italian: 'bg-[#2A9D8F]',
    Asian: 'bg-[#F4A261]',
    European: 'bg-[#457B9D]',
    Pub: 'bg-[#8B4513]',
    Eclectic: 'bg-[#9B59B6]',
  };

  return (
    <Link href={`/restaurants/${restaurant.slug}`}>
      <div className="bg-white rounded-2xl overflow-hidden shadow-lg card-hover cursor-pointer">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <Image
            src={restaurant.images[0]}
            alt={restaurant.name}
            fill
            className="object-cover transition-transform duration-500 hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute top-4 left-4">
            <span className={`badge text-white ${cuisineColors[restaurant.cuisine] || 'bg-gray-500'}`}>
              {restaurant.cuisine}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl font-bold text-[#1D3557] line-clamp-1 flex-1">
              {restaurant.name}
            </h3>
            <Rating rating={restaurant.rating} />
          </div>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {restaurant.shortDescription}
          </p>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-500">
              <MapPin className="w-4 h-4 text-[#E63946]" />
              <span className="line-clamp-1">{restaurant.address.split(',')[0]}</span>
            </div>
            <PriceRange range={restaurant.priceRange} />
          </div>
        </div>
      </div>
    </Link>
  );
}
