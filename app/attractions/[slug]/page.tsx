import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MapPin, Clock, Ticket, Globe, ArrowRight } from 'lucide-react';
import ImageGallery from '@/components/ImageGallery';
import AttractionCard from '@/components/AttractionCard';
import MapWrapper from '@/components/MapWrapper';
import { attractions, getAttractionBySlug } from '@/data/attractions';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const attraction = getAttractionBySlug(slug);

  if (!attraction) {
    return { title: 'Attraction Not Found' };
  }

  return {
    title: `${attraction.name} | Discover London`,
    description: attraction.shortDescription,
  };
}

export async function generateStaticParams() {
  return attractions.map((attraction) => ({
    slug: attraction.slug,
  }));
}

export default async function AttractionDetailPage({ params }: Props) {
  const { slug } = await params;
  const attraction = getAttractionBySlug(slug);

  if (!attraction) {
    notFound();
  }

  const categoryClass = `badge badge-${attraction.category.toLowerCase()}`;

  // Get related attractions (same category, excluding current)
  const relatedAttractions = attractions
    .filter(a => a.category === attraction.category && a.id !== attraction.id)
    .slice(0, 3);

  return (
    <div className="pt-16">
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/attractions"
            className="inline-flex items-center gap-2 text-[#1D3557] hover:text-[#E63946] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Attractions
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <ImageGallery images={attraction.images} alt={attraction.name} />

            {/* Title & Category */}
            <div className="mt-8">
              <span className={categoryClass}>{attraction.category}</span>
              <h1 className="text-4xl font-bold text-[#1D3557] mt-4 mb-4">
                {attraction.name}
              </h1>
            </div>

            {/* Description */}
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 leading-relaxed">
                {attraction.description}
              </p>
            </div>

            {/* Map */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-[#1D3557] mb-4">Location</h2>
              <MapWrapper
                locations={[{
                  id: attraction.id,
                  slug: attraction.slug,
                  name: attraction.name,
                  coordinates: attraction.coordinates,
                  category: attraction.category,
                }]}
                center={[attraction.coordinates.lat, attraction.coordinates.lng]}
                zoom={15}
                type="attraction"
              />
            </div>
          </div>

          {/* Right Column - Info Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-[#1D3557] mb-6">
                Visitor Information
              </h2>

              <div className="space-y-4">
                {/* Address */}
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#E63946] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-[#1D3557]">Address</p>
                    <p className="text-gray-600 text-sm">{attraction.address}</p>
                  </div>
                </div>

                {/* Opening Hours */}
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#2A9D8F] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-[#1D3557]">Opening Hours</p>
                    <p className="text-gray-600 text-sm">{attraction.openingHours}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-start gap-3">
                  <Ticket className="w-5 h-5 text-[#F4A261] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-[#1D3557]">Admission</p>
                    <p className="text-gray-600 text-sm">{attraction.price}</p>
                  </div>
                </div>

                {/* Website */}
                {attraction.website && (
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-[#1D3557] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-[#1D3557]">Website</p>
                      <a
                        href={attraction.website}
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
              {attraction.website && (
                <a
                  href={attraction.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full mt-6 text-center block"
                >
                  Book Tickets
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Related Attractions */}
        {relatedAttractions.length > 0 && (
          <section className="mt-16">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-[#1D3557]">
                Similar Attractions
              </h2>
              <Link
                href="/attractions"
                className="text-[#E63946] font-semibold flex items-center gap-2 hover:gap-3 transition-all"
              >
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedAttractions.map((attr) => (
                <AttractionCard key={attr.id} attraction={attr} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
