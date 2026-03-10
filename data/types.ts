export interface Restaurant {
  id: string;
  slug: string;
  name: string;
  cuisine: string;
  shortDescription: string;
  description: string;
  address?: string;
  coordinates?: { lat: number; lng: number };
  openingHours?: string;
  priceRange?: string;
  rating?: number;
  images: string[];
  website?: string;
  mustTry: string[];
}

export interface Attraction {
  id: string;
  slug: string;
  name: string;
  category?: string;
  shortDescription: string;
  description: string;
  address?: string;
  coordinates?: { lat: number; lng: number };
  openingHours?: string;
  price?: string;
  images: string[];
  website?: string;
}

export interface AvoidItem {
  name: string;
  reason: string;
  category?: string;
  city?: string;
}

export interface CityTip {
  content: string;
}

export interface CityData {
  name: string;
  nameEn: string;
  slug: string;
  description: string;
  heroImage: string;
  restaurants: Restaurant[];
  cafes?: Restaurant[];
  attractions?: Attraction[];
  avoids?: AvoidItem[];
  tips?: CityTip[];
  country: 'uk' | 'europa';
}
