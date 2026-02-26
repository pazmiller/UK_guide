import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1920&q=80)'
        }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 hero-gradient" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fadeIn">
          Discover the Magic of{' '}
          <span className="text-[#F4A261]">London</span>
        </h1>

        <p className="text-xl md:text-2xl text-white/90 mb-8 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          Explore iconic landmarks, world-class museums, and incredible restaurants
          in one of the world&apos;s most vibrant cities
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
