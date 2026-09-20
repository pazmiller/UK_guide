import 'server-only';
import { getUkCities, getEuropaDestinations } from './cities';
import { londonRestaurants } from '@/data/london/restaurants';
import { londonCafes } from '@/data/london/cafes';
import { londonAttractions } from '@/data/london/attractions';

// Same arrays used by London's dedicated pages; do not add London to Other Cities navigation.
export function getContributionCities() {
  return [{ slug: 'london', nameEn: 'London', country: 'uk' as const, restaurants: londonRestaurants, cafes: londonCafes, attractions: londonAttractions }, ...getUkCities(), ...getEuropaDestinations()];
}
