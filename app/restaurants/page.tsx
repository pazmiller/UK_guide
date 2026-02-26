import { Metadata } from 'next';
import RestaurantCard from '@/components/RestaurantCard';
import MapWrapper from '@/components/MapWrapper';
import { restaurants } from '@/data/restaurants';

export const metadata: Metadata = {
  title: 'Restaurants & Dining | Discover London',
  description: 'Discover the best restaurants in London, from traditional British pubs to Michelin-starred fine dining and international cuisines.',
};

export default function RestaurantsPage() {
  const cuisines = ['British', 'Indian', 'Italian', 'Asian', 'European', 'Pub', 'Eclectic'];

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
    <div className="pt-16">
      {/* Hero Section */}
      <section
        className="relative h-[40vh] min-h-[300px] flex items-center justify-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-[#1D3557]/70" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            London Restaurants
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            From traditional British fare to world cuisines and Michelin-starred dining
          </p>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#1D3557] mb-6">
            Find Restaurants Near You
          </h2>
          <MapWrapper
            locations={restaurants.map(r => ({
              id: r.id,
              slug: r.slug,
              name: r.name,
              coordinates: r.coordinates,
              cuisine: r.cuisine,
            }))}
            type="restaurant"
          />
        </div>
      </section>

      {/* Cuisine Filter */}
      <section className="py-8 bg-[#F1FAEE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {cuisines.map((cuisine) => (
              <span
                key={cuisine}
                className={`badge text-white cursor-pointer hover:opacity-80 transition-opacity ${cuisineColors[cuisine] || 'bg-gray-500'}`}
              >
                {cuisine}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Restaurants Grid */}
      <section className="py-16 bg-[#F1FAEE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
