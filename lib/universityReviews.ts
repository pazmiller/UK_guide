import type { StaticImageData } from 'next/image';
import exeterImage from '@/src/img/universities/exeter.png';
import kclImage from '@/src/img/universities/kcl.png';
import oxfordImage from '@/src/img/universities/oxford.png';
import royalHollowayImage from '@/src/img/universities/royalholloway.png';
import uclImage from '@/src/img/universities/ucl.png';
import { getUniversityBySlug, UNIVERSITY_CATALOG, type UniversityCatalogEntry } from '@/lib/universities/catalog';

export type UniversityReview = UniversityCatalogEntry;

export type UniversityPhotoRecord = UniversityCatalogEntry & {
  image: StaticImageData;
  imagePosition: string;
  imageAlt: string;
};

export const UNIVERSITIES = UNIVERSITY_CATALOG;
export const FEATURED_UNIVERSITIES = UNIVERSITY_CATALOG.filter( university => university.featured );

const photoDetails: Record<string, Pick<UniversityPhotoRecord, 'image' | 'imagePosition' | 'imageAlt'>> = {
  ucl: {
    image: uclImage,
    imagePosition: '61% center',
    imageAlt: 'UCL portico and main quadrangle in Bloomsbury',
  },
  kcl: {
    image: kclImage,
    imagePosition: 'center center',
    imageAlt: "Historic towers at King's College London Strand Campus",
  },
  oxford: {
    image: oxfordImage,
    imagePosition: 'center 58%',
    imageAlt: 'Historic Oxford college towers beneath a rainbow',
  },
  exeter: {
    image: exeterImage,
    imagePosition: '52% center',
    imageAlt: 'The Forum building at the University of Exeter Streatham Campus',
  },
  'royal-holloway': {
    image: royalHollowayImage,
    imagePosition: '54% center',
    imageAlt: 'Founder’s Building at Royal Holloway in Egham',
  },
};

export const UNIVERSITY_PHOTO_RECORDS: UniversityPhotoRecord[] = FEATURED_UNIVERSITIES.map( university => ( {
  ...university,
  ...photoDetails[ university.slug ],
} ) );

export function getUniversity( slug: string )
{
  return getUniversityBySlug( slug );
}

export function getNextUniversity( slug: string, universities: UniversityCatalogEntry[] = FEATURED_UNIVERSITIES )
{
  const index = universities.findIndex( university => university.slug === slug );
  return universities[( index + 1 ) % universities.length] ?? universities[ 0 ];
}
