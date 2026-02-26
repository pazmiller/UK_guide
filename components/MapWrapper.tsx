'use client';

import dynamic from 'next/dynamic';

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-gray-200 rounded-xl flex items-center justify-center">
      <span className="text-gray-500">Loading map...</span>
    </div>
  ),
});

interface Location {
  id: string;
  slug: string;
  name: string;
  coordinates: { lat: number; lng: number };
  category?: string;
  cuisine?: string;
}

interface MapWrapperProps {
  locations: Location[];
  center?: [number, number];
  zoom?: number;
  type: 'attraction' | 'restaurant';
}

export default function MapWrapper({ locations, center, zoom, type }: MapWrapperProps) {
  return <Map locations={locations} center={center} zoom={zoom} type={type} />;
}
