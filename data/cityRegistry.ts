import type { CityData } from './types';

interface OrderedCityData extends CityData
{
  order?: number;
}

export function mergeCityRegistry( generatedCities: OrderedCityData[], legacyCities: CityData[] )
{
  const cities = new Map( legacyCities.map( city => [ city.slug, city ] ) );
  for ( const city of generatedCities ) cities.set( city.slug, city );

  const legacyOrder = new Map( legacyCities.map( ( city, index ) => [ city.slug, index ] ) );
  return [ ...cities.values() ].sort( ( a, b ) =>
    ( ( a as OrderedCityData ).order ?? 1000 + ( legacyOrder.get( a.slug ) ?? 999 ) )
      - ( ( b as OrderedCityData ).order ?? 1000 + ( legacyOrder.get( b.slug ) ?? 999 ) ) );
}

export function countCityRecommendations( city: CityData )
{
  return city.restaurants.length + ( city.cafes?.length ?? 0 ) + ( city.attractions?.length ?? 0 );
}
