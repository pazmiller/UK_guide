import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Clock, Ticket } from 'lucide-react';
import { Attraction } from '@/data/attractions';

interface AttractionCardProps {
  attraction: Attraction;
}

export default function AttractionCard({ attraction }: AttractionCardProps) {
  const categoryClass = `badge badge-${attraction.category.toLowerCase()}`;

  return (
    <Link href={`/attractions/${attraction.slug}`}>
      <div className="bg-white rounded-2xl overflow-hidden shadow-lg card-hover cursor-pointer">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <Image
            src={attraction.images[0]}
            alt={attraction.name}
            fill
            className="object-cover transition-transform duration-500 hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute top-4 left-4">
            <span className={categoryClass}>{attraction.category}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-xl font-bold text-[#1D3557] mb-2 line-clamp-1">
            {attraction.name}
          </h3>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {attraction.shortDescription}
          </p>

          <div className="space-y-2 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#E63946]" />
              <span className="line-clamp-1">{attraction.address.split(',')[0]}</span>
            </div>
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-[#2A9D8F]" />
              <span>{attraction.price}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
