import 'server-only';

import generatedContent from '@/src/DATA.json';
import { parseGeneratedCities } from '@/data/generatedCityData';
import { mergeCityRegistry } from '@/data/cityRegistry';
import { colchesterData } from '@/data/colchester';
import { edinburghData } from '@/data/edinburgh';
import { glasgowData } from '@/data/glasgow';
import { nottinghamData } from '@/data/nottingham';
import { southamptonData } from '@/data/southampton';
import { swanseaData } from '@/data/swansea';
import { yorkData } from '@/data/york';
import { copenhagenData } from '@/data/europa/copenhagen';
import { icelandData } from '@/data/europa/iceland';
import { kolnData } from '@/data/europa/koln';
import { parisData } from '@/data/europa/paris';
import { polandData } from '@/data/europa/poland';
import { stockholmData } from '@/data/europa/stockholm';

const generatedCities = parseGeneratedCities( generatedContent );
const legacyUkCities = [
  yorkData,
  glasgowData,
  southamptonData,
  swanseaData,
  colchesterData,
  nottinghamData,
  edinburghData,
];
const legacyEuropaDestinations = [
  icelandData,
  polandData,
  stockholmData,
  copenhagenData,
  parisData,
  kolnData,
];
const ukCities = mergeCityRegistry(
  generatedCities.filter( city => city.country === 'uk' ),
  legacyUkCities,
);
const europaDestinations = mergeCityRegistry(
  generatedCities.filter( city => city.country === 'europa' ),
  legacyEuropaDestinations,
);

export function getCityBySlug( slug: string )
{
  return ukCities.find( city => city.slug === slug );
}

export function getUkCities()
{
  return ukCities;
}

export function getUkCityNavItems()
{
  return getUkCities().map( city => ( {
    href: `/othercities/${city.slug}`,
    label: city.nameEn,
  } ) );
}

export function getEuropaDestinationBySlug( slug: string )
{
  return europaDestinations.find( destination => destination.slug === slug );
}

export function getEuropaDestinations()
{
  return europaDestinations;
}

export function getEuropaNavItems()
{
  return europaDestinations.map( destination => ( {
    href: `/europa/${destination.slug}`,
    label: destination.nameEn,
  } ) );
}
