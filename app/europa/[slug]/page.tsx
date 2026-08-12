import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CityPage from '@/components/CityPage';
import {
  getEuropaDestinationBySlug,
  getEuropaDestinations,
} from '@/lib/server/cities';

interface EuropaDestinationPageProps
{
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams()
{
  return getEuropaDestinations().map( destination => ( { slug: destination.slug } ) );
}

export async function generateMetadata( { params }: EuropaDestinationPageProps ): Promise<Metadata>
{
  const { slug } = await params;
  const destination = getEuropaDestinationBySlug( slug );
  if ( !destination ) return {};

  return {
    title: `${destination.nameEn}｜${destination.name}`,
    description: destination.description,
  };
}

export default async function EuropaDestinationPage( { params }: EuropaDestinationPageProps )
{
  const { slug } = await params;
  const destination = getEuropaDestinationBySlug( slug );
  if ( !destination ) notFound();

  return <CityPage data={destination} backLink="/europa" backLabel="Europa" />;
}
