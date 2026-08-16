import type { Metadata } from 'next';
import UniversityReviewPage from '@/components/UniversityReviewPage';
import { UNIVERSITY_CATALOG } from '@/lib/universities/catalog';
import { calculateAverageRating, getUniversityReviews, getUniversitySlugsWithReviews } from '@/lib/universities/reviews';

export const metadata: Metadata = {
  title: 'University Files | 英国大学观察簿',
  description: '打开英国大学学生评价档案，查看就读年份、专业、评分、原文与投稿照片。',
};

export default function UniversitiesPage()
{
  const reviewedSlugs = getUniversitySlugsWithReviews();
  const universities = UNIVERSITY_CATALOG
    .filter( university => university.featured || reviewedSlugs.has( university.slug ) )
    .map( university => {
      const reviews = getUniversityReviews( university.slug );
      return { ...university, reviewCount: reviews.length, averageRating: calculateAverageRating( reviews ) };
    } )
    .sort( ( first, second ) => Number( first.fileNumber ) - Number( second.fileNumber ) );

  return <UniversityReviewPage universities={universities} />;
}
