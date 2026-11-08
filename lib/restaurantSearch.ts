import type { Restaurant } from '@/data/types';

export function matchesRestaurant( restaurant: Restaurant, query: string, cuisine = 'All' ) {
  const inCuisine = cuisine === 'All' || restaurant.cuisine === cuisine || restaurant.tags?.includes( cuisine );
  const text = [ restaurant.name, restaurant.cuisine, ...( restaurant.tags ?? [] ) ].join( ' ' ).toLocaleLowerCase();
  return Boolean( inCuisine ) && text.includes( query.trim().toLocaleLowerCase() );
}
