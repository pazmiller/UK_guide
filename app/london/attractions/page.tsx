import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import AttractionCard from '@/components/AttractionCard';
import AvoidSection from '@/components/AvoidSection';
import { londonAttractions, londonAvoids } from '@/data/london/attractions';

export default function LondonAttractionsPage() {
  return (
    <div className="pt-16">
      {/* Hero */}
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
          <div className="mb-4">
            <Link
              href="/london"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> London
            </Link>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            London Attractions
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            免费博物馆、皇家公园和城市观景台
          </p>
        </div>
      </section>

      {/* Attractions Grid */}
      <section className="py-16 bg-[#F1FAEE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {londonAttractions.map((attraction) => (
              <AttractionCard key={attraction.id} attraction={attraction} />
            ))}
          </div>
        </div>
      </section>

      {/* Avoid Section */}
      <AvoidSection items={londonAvoids} title="伦敦避雷指南" />
    </div>
  );
}
