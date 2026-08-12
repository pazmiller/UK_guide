import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CityPage from '@/components/CityPage';
import { getCityBySlug, getUkCities } from '@/lib/server/cities';

interface OtherCityPageProps
{
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams()
{
  return getUkCities().map( city => ( { slug: city.slug } ) );
}

export async function generateMetadata( { params }: OtherCityPageProps ): Promise<Metadata>
{
  const { slug } = await params;
  const city = getCityBySlug( slug );
  if ( !city ) return {};

  return {
    title: `${city.nameEn}｜${city.name}`,
    description: city.description,
  };
}

export default async function OtherCityPage( { params }: OtherCityPageProps )
{
  const { slug } = await params;
  const city = getCityBySlug( slug );
  if ( !city || city.country !== 'uk' ) notFound();

  return <CityPage data={city} backLink="/othercities" backLabel="Other Cities" />;
}
