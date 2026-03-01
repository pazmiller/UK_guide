import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import RestaurantCard from '@/components/RestaurantCard';
import { londonCafes } from '@/data/london/cafes';

export default function LondonCafesPage() {
  return (
    <div className="pt-16">
      {/* Hero */}
      <section
        className="relative h-[40vh] min-h-[300px] flex items-center justify-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1920&q=80)',
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
            甜品 / 咖啡 / 饮品
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            法式烘焙、精品咖啡、手摇珍奶和 Gelato
          </p>
        </div>
      </section>

      {/* Cafes Grid */}
      <section className="py-16 bg-[#F1FAEE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {londonCafes.map((cafe) => (
              <RestaurantCard key={cafe.id} restaurant={cafe} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
