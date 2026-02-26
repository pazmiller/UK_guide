import { Metadata } from 'next';
import AttractionCard from '@/components/AttractionCard';
import MapWrapper from '@/components/MapWrapper';
import { attractions } from '@/data/attractions';

export const metadata: Metadata = {
  title: 'Tourist Attractions | Discover London',
  description: 'Explore London\'s most iconic tourist attractions, from historic landmarks to world-class museums and beautiful parks.',
};

export default function AttractionsPage() {
  const categories = ['Historical', 'Landmarks', 'Museums', 'Parks', 'Markets'];

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section
        className="relative h-[40vh] min-h-[300px] flex items-center justify-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-[#1D3557]/70" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            London Attractions
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Discover iconic landmarks, world-class museums, and historic sites
          </p>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#1D3557] mb-6">
            Explore on the Map
          </h2>
          <MapWrapper
            locations={attractions.map(a => ({
              id: a.id,
              slug: a.slug,
              name: a.name,
              coordinates: a.coordinates,
              category: a.category,
            }))}
            type="attraction"
          />
        </div>
      </section>

      {/* Categories Filter */}
      <section className="py-8 bg-[#F1FAEE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <span
                key={category}
                className={`badge badge-${category.toLowerCase()} cursor-pointer hover:opacity-80 transition-opacity`}
              >
                {category}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Attractions Grid */}
      <section className="py-16 bg-[#F1FAEE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {attractions.map((attraction) => (
              <AttractionCard key={attraction.id} attraction={attraction} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
