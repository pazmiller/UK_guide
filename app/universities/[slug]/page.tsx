import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import UniversityDossier from '@/components/UniversityDossier';
import { getNextUniversity, getUniversity, UNIVERSITIES } from '@/lib/universityReviews';
import { getUniversityReviews } from '@/lib/universities/reviews';

type UniversityPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams()
{
  return UNIVERSITIES.map( ( university ) => ( { slug: university.slug } ) );
}

export async function generateMetadata( { params }: UniversityPageProps ): Promise<Metadata>
{
  const { slug } = await params;
  const university = getUniversity( slug );
  if ( !university ) return {};

  return {
    title: `${university.name} | 英国大学观察簿`,
    description: `${university.name} 的学生就读年份、专业、评分、评价原文与投稿照片。`,
  };
}

export default async function UniversityPage( { params }: UniversityPageProps )
{
  const { slug } = await params;
  const university = getUniversity( slug );
  if ( !university ) notFound();

  const visibleUniversities = UNIVERSITIES
    .filter( entry => entry.featured || getUniversityReviews( entry.slug ).length > 0 )
    .sort( ( first, second ) => Number( first.fileNumber ) - Number( second.fileNumber ) );
  return <UniversityDossier university={university} nextUniversity={getNextUniversity( university.slug, visibleUniversities )} reviews={getUniversityReviews( university.slug )} />;
}
