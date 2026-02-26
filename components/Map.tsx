'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import Link from 'next/link';
import 'leaflet/dist/leaflet.css';

interface Location {
  id: string;
  slug: string;
  name: string;
  coordinates: { lat: number; lng: number };
  category?: string;
  cuisine?: string;
}

interface MapProps {
  locations: Location[];
  center?: [number, number];
  zoom?: number;
  type: 'attraction' | 'restaurant';
}

export default function Map({ locations, center = [51.5074, -0.1278], zoom = 12, type }: MapProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fix Leaflet default icon issue
  useEffect(() => {
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: () => void })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  // Custom marker icons
  const attractionIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const restaurantIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  if (!isClient) {
    return (
      <div className="w-full h-[400px] bg-gray-200 rounded-xl flex items-center justify-center">
        <span className="text-gray-500">Loading map...</span>
      </div>
    );
  }

  const icon = type === 'attraction' ? attractionIcon : restaurantIcon;
  const basePath = type === 'attraction' ? '/attractions' : '/restaurants';

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="w-full h-[400px] rounded-xl shadow-lg z-0"
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locations.map((location) => (
        <Marker
          key={location.id}
          position={[location.coordinates.lat, location.coordinates.lng]}
          icon={icon}
        >
          <Popup>
            <div className="text-center">
              <h3 className="font-bold text-[#1D3557] mb-1">{location.name}</h3>
              {location.category && (
                <p className="text-xs text-gray-500 mb-2">{location.category}</p>
              )}
              {location.cuisine && (
                <p className="text-xs text-gray-500 mb-2">{location.cuisine} Cuisine</p>
              )}
              <Link
                href={`${basePath}/${location.slug}`}
                className="text-[#E63946] text-sm font-medium hover:underline"
              >
                View Details →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
