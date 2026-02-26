import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MapPin, Clock, Star, Globe, ArrowRight, UtensilsCrossed } from 'lucide-react';
import ImageGallery from '@/components/ImageGallery';
import RestaurantCard from '@/components/RestaurantCard';
import MapWrapper from '@/components/MapWrapper';
import { restaurants, getRestaurantBySlug } from '@/data/restaurants';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const restaurant = getRestaurantBySlug(slug);

  if (!restaurant) {
    return { title: 'Restaurant Not Found' };
  }

  return {
    title: `${restaurant.name} | Discover London`,
    description: restaurant.shortDescription,
  };
}

export async function generateStaticParams() {
  return restaurants.map((restaurant) => ({
    slug: restaurant.slug,
  }));
}

function PriceRange({ range }: { range: string }) {
  const maxPrice = 4;
  const activeCount = range.length;

  return (
    <span className="text-lg">
      {Array.from({ length: maxPrice }).map((_, i) => (
        <span
          key={i}
          className={i < activeCount ? 'text-[#E63946] font-bold' : 'text-gray-300'}
        >
          £
        </span>
      ))}
    </span>
  );
}

export default async function RestaurantDetailPage({ params }: Props) {
  const { slug } = await params;
  const restaurant = getRestaurantBySlug(slug);

  if (!restaurant) {
    notFound();
  }

  const cuisineColors: Record<string, string> = {
    British: 'bg-[#1D3557]',
    Indian: 'bg-[#E63946]',
    Italian: 'bg-[#2A9D8F]',
    Asian: 'bg-[#F4A261]',
    European: 'bg-[#457B9D]',
    Pub: 'bg-[#8B4513]',
    Eclectic: 'bg-[#9B59B6]',
  };

  // Get related restaurants (same cuisine, excluding current)
  const relatedRestaurants = restaurants
    .filter(r => r.cuisine === restaurant.cuisine && r.id !== restaurant.id)
    .slice(0, 3);

  return (
    <div className="pt-16">
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/restaurants"
            className="inline-flex items-center gap-2 text-[#1D3557] hover:text-[#E63946] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Restaurants
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <ImageGallery images={restaurant.images} alt={restaurant.name} />

            {/* Title & Category */}
            <div className="mt-8">
              <div className="flex items-center gap-3 mb-4">
                <span className={`badge text-white ${cuisineColors[restaurant.cuisine] || 'bg-gray-500'}`}>
                  {restaurant.cuisine}
                </span>
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-[#F4A261] text-[#F4A261]" />
                  <span className="font-bold text-[#1D3557]">{restaurant.rating.toFixed(1)}</span>
                </div>
                <PriceRange range={restaurant.priceRange} />
              </div>
              <h1 className="text-4xl font-bold text-[#1D3557] mb-4">
                {restaurant.name}
              </h1>
            </div>

            {/* Description */}
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 leading-relaxed">
                {restaurant.description}
              </p>
            </div>

            {/* Must Try */}
            <div className="mt-8 bg-[#F1FAEE] rounded-2xl p-6">
              <h2 className="text-xl font-bold text-[#1D3557] mb-4 flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-[#E63946]" />
                Must Try Dishes
              </h2>
              <div className="flex flex-wrap gap-2">
                {restaurant.mustTry.map((dish, index) => (
                  <span
                    key={index}
                    className="bg-white px-4 py-2 rounded-full text-[#1D3557] font-medium shadow-sm"
                  >
                    {dish}
                  </span>
                ))}
              </div>
            </div>

            {/* Map */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-[#1D3557] mb-4">Location</h2>
              <MapWrapper
                locations={[{
                  id: restaurant.id,
                  slug: restaurant.slug,
                  name: restaurant.name,
                  coordinates: restaurant.coordinates,
                  cuisine: restaurant.cuisine,
                }]}
                center={[restaurant.coordinates.lat, restaurant.coordinates.lng]}
                zoom={15}
                type="restaurant"
              />
            </div>
          </div>

          {/* Right Column - Info Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-[#1D3557] mb-6">
                Restaurant Information
              </h2>

              <div className="space-y-4">
                {/* Address */}
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#E63946] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-[#1D3557]">Address</p>
                    <p className="text-gray-600 text-sm">{restaurant.address}</p>
                  </div>
                </div>

                {/* Opening Hours */}
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#2A9D8F] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-[#1D3557]">Opening Hours</p>
                    <p className="text-gray-600 text-sm">{restaurant.openingHours}</p>
                  </div>
                </div>

                {/* Price Range */}
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 text-[#F4A261] mt-0.5 flex-shrink-0 font-bold text-center">£</span>
                  <div>
                    <p className="font-medium text-[#1D3557]">Price Range</p>
                    <p className="text-gray-600 text-sm">
                      {restaurant.priceRange === '£' && 'Budget-friendly'}
                      {restaurant.priceRange === '££' && 'Moderate'}
                      {restaurant.priceRange === '£££' && 'Upscale'}
                      {restaurant.priceRange === '££££' && 'Fine Dining'}
                    </p>
                  </div>
                </div>

                {/* Website */}
                {restaurant.website && (
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-[#1D3557] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-[#1D3557]">Website</p>
                      <a
                        href={restaurant.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#E63946] text-sm hover:underline"
                      >
                        Visit Official Website
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* CTA Button */}
              {restaurant.website && (
                <a
                  href={restaurant.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full mt-6 text-center block"
                >
                  Make a Reservation
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Related Restaurants */}
        {relatedRestaurants.length > 0 && (
          <section className="mt-16">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-[#1D3557]">
                Similar Restaurants
              </h2>
              <Link
                href="/restaurants"
                className="text-[#E63946] font-semibold flex items-center gap-2 hover:gap-3 transition-all"
              >
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedRestaurants.map((rest) => (
                <RestaurantCard key={rest.id} restaurant={rest} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
