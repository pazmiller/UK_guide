import { londonAvoids } from './london/attractions';
import { londonRestaurantAvoids } from './london/restaurants';
import { swanseaData } from './swansea';

export interface AvoidEntry {
  name: string;
  reason: string;
  city: string;
  type: 'restaurant' | 'attraction';
}

// London attraction avoids
const londonAttractionAvoids: AvoidEntry[] = londonAvoids.map( ( a ) => ( {
  ...a,
  city: 'London',
  type: 'attraction' as const,
} ) );

// London restaurant avoids
const londonRestAvoids: AvoidEntry[] = londonRestaurantAvoids.map( ( a ) => ( {
  ...a,
  city: 'London',
  type: 'restaurant' as const,
} ) );

// Swansea avoids (mix of restaurants and attractions)
const swanseaAttractionNames = ['Swansea Castle'];
const swanseaAvoids: AvoidEntry[] = ( swanseaData.avoids ?? [] ).map( ( a ) => ( {
  ...a,
  city: 'Swansea',
  type: swanseaAttractionNames.includes( a.name ) ? 'attraction' as const : 'restaurant' as const,
} ) );

export const allAvoids: AvoidEntry[] = [
  ...londonAttractionAvoids,
  ...londonRestAvoids,
  ...swanseaAvoids,
];
