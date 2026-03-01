import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import UnionJackDots from './UnionJackDots';

export default function Hero()
{
  return (
    <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden bg-[#010820]">
      {/* Union Jack dot-matrix animation */}
      <UnionJackDots />


      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fadeIn">
          Discover the Good Old Charm of{' '}
          <span>
            <span className="text-[#E63946]">G</span><span className="text-[#0d15ff]">reat </span><span className="text-[#E63946]">B</span><span className="text-[#0d15ff]">ritain</span>
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-white/90 mb-8 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          Explore iconic landmarks, world-class museums, and incredible restaurants
          with our fluffy 兽人控
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeIn" style={{ animationDelay: '0.4s' }}>
          <Link href="/attractions" className="btn-primary text-lg">
            Explore Attractions
          </Link>
          <Link href="/restaurants" className="btn-secondary text-lg border-2 border-white/30">
            Find Restaurants
          </Link>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="w-8 h-8 text-white/70" />
      </div>
    </section>
  );
}
