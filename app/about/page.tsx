import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Users, Building, Train, Plane, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About London & The UK | Discover London',
  description: 'Learn about London and the United Kingdom - history, culture, transport, and everything you need to know for your visit.',
};

export default function AboutPage() {
  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section
        className="relative h-[50vh] min-h-[400px] flex items-center justify-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-[#1D3557]/70" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            About London
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            A city where history meets modernity, tradition blends with innovation
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[#1D3557] mb-6">
                The Heart of the United Kingdom
              </h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                London, the capital of England and the United Kingdom, is one of the world&apos;s
                most visited cities. With a history spanning over 2,000 years, it stands as a
                global centre of arts, commerce, education, entertainment, fashion, finance,
                healthcare, media, tourism, and transport.
              </p>
              <p className="text-gray-600 mb-4 leading-relaxed">
                The city is home to four UNESCO World Heritage Sites: the Tower of London,
                the Royal Botanic Gardens at Kew, the Palace of Westminster and Westminster Abbey,
                and the historic settlement at Greenwich.
              </p>
              <p className="text-gray-600 leading-relaxed">
                From the iconic Big Ben to the modern Shard, London seamlessly blends its rich
                heritage with cutting-edge architecture and innovation, making it a truly
                unique destination for visitors from around the world.
              </p>
            </div>
            <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1529180184525-78f99adb8e98?w=800"
                alt="London skyline"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Facts */}
      <section className="py-16 bg-[#F1FAEE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#1D3557] text-center mb-12">
            London at a Glance
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <Users className="w-10 h-10 text-[#E63946] mb-4" />
              <h3 className="text-xl font-bold text-[#1D3557] mb-2">Population</h3>
              <p className="text-3xl font-bold text-[#E63946] mb-2">9+ Million</p>
              <p className="text-gray-600 text-sm">Making it the largest city in Western Europe</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <Building className="w-10 h-10 text-[#2A9D8F] mb-4" />
              <h3 className="text-xl font-bold text-[#1D3557] mb-2">Boroughs</h3>
              <p className="text-3xl font-bold text-[#2A9D8F] mb-2">32</p>
              <p className="text-gray-600 text-sm">Each with its own unique character and charm</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <MapPin className="w-10 h-10 text-[#F4A261] mb-4" />
              <h3 className="text-xl font-bold text-[#1D3557] mb-2">Area</h3>
              <p className="text-3xl font-bold text-[#F4A261] mb-2">1,572 km²</p>
              <p className="text-gray-600 text-sm">Greater London covers a vast metropolitan area</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <Train className="w-10 h-10 text-[#1D3557] mb-4" />
              <h3 className="text-xl font-bold text-[#1D3557] mb-2">Tube Stations</h3>
              <p className="text-3xl font-bold text-[#1D3557] mb-2">272</p>
              <p className="text-gray-600 text-sm">The world&apos;s oldest underground railway network</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <Plane className="w-10 h-10 text-[#E63946] mb-4" />
              <h3 className="text-xl font-bold text-[#1D3557] mb-2">Airports</h3>
              <p className="text-3xl font-bold text-[#E63946] mb-2">6</p>
              <p className="text-gray-600 text-sm">Including Heathrow, one of the world&apos;s busiest</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <Clock className="w-10 h-10 text-[#2A9D8F] mb-4" />
              <h3 className="text-xl font-bold text-[#1D3557] mb-2">Timezone</h3>
              <p className="text-3xl font-bold text-[#2A9D8F] mb-2">GMT/BST</p>
              <p className="text-gray-600 text-sm">Home of the Prime Meridian at Greenwich</p>
            </div>
          </div>
        </div>
      </section>

      {/* Neighbourhoods */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#1D3557] text-center mb-4">
            Iconic Neighbourhoods
          </h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
            Each area of London has its own distinct personality and attractions
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: 'Westminster',
                description: 'Home to Parliament, Big Ben, and Buckingham Palace',
                color: 'bg-[#E63946]',
              },
              {
                name: 'South Bank',
                description: 'Cultural hub with the Tate Modern and London Eye',
                color: 'bg-[#1D3557]',
              },
              {
                name: 'Shoreditch',
                description: 'Trendy area known for street art and nightlife',
                color: 'bg-[#2A9D8F]',
              },
              {
                name: 'Camden',
                description: 'Famous market and alternative culture scene',
                color: 'bg-[#F4A261]',
              },
              {
                name: 'Notting Hill',
                description: 'Colourful houses and the famous Portobello Market',
                color: 'bg-[#9B59B6]',
              },
              {
                name: 'Covent Garden',
                description: 'Theatre district with street performers and shopping',
                color: 'bg-[#E74C3C]',
              },
              {
                name: 'Kensington',
                description: 'Museums, gardens, and elegant Victorian architecture',
                color: 'bg-[#3498DB]',
              },
              {
                name: 'Greenwich',
                description: 'Maritime history and the Royal Observatory',
                color: 'bg-[#27AE60]',
              },
            ].map((neighbourhood) => (
              <div
                key={neighbourhood.name}
                className={`${neighbourhood.color} rounded-2xl p-6 text-white`}
              >
                <h3 className="text-xl font-bold mb-2">{neighbourhood.name}</h3>
                <p className="text-white/80 text-sm">{neighbourhood.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Getting Around */}
      <section className="py-16 bg-[#1D3557]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Getting Around London
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#E63946] rounded-full flex items-center justify-center mx-auto mb-4">
                <Train className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">The Tube</h3>
              <p className="text-white/70">
                The London Underground is the fastest way to get around. Use an Oyster card
                or contactless payment for the best fares.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#E63946] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8m-8 4h8m-8 4h4" />
                  <rect x="4" y="3" width="16" height="18" rx="2" strokeWidth={2} />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Buses</h3>
              <p className="text-white/70">
                Iconic red double-decker buses cover routes across the entire city. Great for
                sightseeing while you travel.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#E63946] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth={2} />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Black Cabs</h3>
              <p className="text-white/70">
                London&apos;s famous black taxis are everywhere. Drivers know every street
                thanks to &quot;The Knowledge&quot; test.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-[#1D3557] mb-4">
            Start Exploring London Today
          </h2>
          <p className="text-gray-600 mb-8">
            Discover the best attractions and restaurants London has to offer
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/attractions" className="btn-primary">
              View Attractions
            </Link>
            <Link href="/restaurants" className="btn-secondary">
              Find Restaurants
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
