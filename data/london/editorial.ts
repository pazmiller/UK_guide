import { londonRestaurants } from './restaurants';
import { londonAttractions } from './attractions';

// Presentation selections share the existing place objects; details stay in their source data.
export const londonEditorialFood = londonRestaurants.filter( place =>
  [ 'med-salleh-kopitiam', 'ceru', 'kiln' ].includes( place.slug ) );
export const londonEditorialSights = londonAttractions.filter( place =>
  [ 'westminster-abbey', 'kew-garden', 'natural-history-museum' ].includes( place.slug ) );
