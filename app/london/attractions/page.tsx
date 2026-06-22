import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ClickableAttractionGrid from '@/components/ClickableAttractionGrid';
import AvoidSection from '@/components/AvoidSection';
import EditorialRibbon from '@/components/EditorialRibbon';
import { londonAttractions, londonAvoids } from '@/data/london/attractions';

export default function LondonAttractionsPage() {
  return (
    <div className="pt-16 bg-[#FBF8F1]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#FBF8F1] py-14 md:py-20 border-b border-[#1D3557]/10">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1fr_0.82fr] gap-10 items-center">
            <div className="text-center lg:text-left">
              <div className="mb-4">
                <Link
                  href="/london"
                  className="inline-flex items-center gap-2 text-[#1D3557]/55 hover:text-[#1D3557] text-sm transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> London
                </Link>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#1D3557] mb-4">
                London Attractions
              </h1>
              <p className="text-xl text-[#1D3557]/70 max-w-2xl mx-auto lg:mx-0">
                免费博物馆、皇家公园和城市观景台
              </p>
            </div>
            <div className="relative h-[260px] md:h-[340px] overflow-hidden rounded-lg border border-[#1D3557]/10 bg-white shadow-sm">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: 'url(/wesminster abbey.png)' }}
              />
              <div className="absolute inset-0 bg-[#1D3557]/10" />
              <EditorialRibbon className="absolute -bottom-2 left-0 h-20 w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Attractions Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ClickableAttractionGrid attractions={londonAttractions} locationHint="London UK" />
        </div>
      </section>

      {/* Avoid Section */}
      <AvoidSection items={londonAvoids} title="伦敦避雷指南" />
    </div>
  );
}
