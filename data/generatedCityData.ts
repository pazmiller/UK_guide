import { z } from 'zod';

const coordinatesSchema = z.object( {
  lat: z.number(),
  lng: z.number(),
} ).strict();

const restaurantSchema = z.object( {
  id: z.string().min( 1 ),
  slug: z.string().regex( /^[a-z0-9]+(?:-[a-z0-9]+)*$/ ),
  name: z.string().min( 1 ),
  cuisine: z.string().min( 1 ),
  shortDescription: z.string(),
  description: z.string(),
  recommendReason: z.string().optional(),
  address: z.string().optional(),
  coordinates: coordinatesSchema.optional(),
  openingHours: z.string().optional(),
  priceRange: z.string().optional(),
  rating: z.number().optional(),
  images: z.array( z.string().min( 1 ) ),
  website: z.string().optional(),
  mustTry: z.array( z.string().min( 1 ) ),
  tags: z.array( z.string().min( 1 ) ).optional(),
} ).strict();

const attractionSchema = z.object( {
  id: z.string().min( 1 ),
  slug: z.string().regex( /^[a-z0-9]+(?:-[a-z0-9]+)*$/ ),
  name: z.string().min( 1 ),
  category: z.string().optional(),
  shortDescription: z.string(),
  description: z.string(),
  address: z.string().optional(),
  coordinates: coordinatesSchema.optional(),
  openingHours: z.string().optional(),
  price: z.string().optional(),
  images: z.array( z.string().min( 1 ) ),
  website: z.string().optional(),
} ).strict();

const citySchema = z.object( {
  slug: z.string().regex( /^[a-z0-9]+(?:-[a-z0-9]+)*$/ ),
  name: z.string().min( 1 ),
  nameEn: z.string().min( 1 ),
  description: z.string().min( 1 ),
  heroImage: z.string().min( 1 ),
  country: z.enum( [ 'uk', 'europa' ] ),
  order: z.number().int().nonnegative(),
  restaurants: z.array( restaurantSchema ),
  cafes: z.array( restaurantSchema ),
  attractions: z.array( attractionSchema ),
  avoids: z.array( z.object( {
    name: z.string().min( 1 ),
    reason: z.string().min( 1 ),
    category: z.string().optional(),
    city: z.string().optional(),
  } ).strict() ),
  tips: z.array( z.object( { content: z.string().min( 1 ) } ).strict() ),
} ).strict();

const generatedContentSchema = z.object( {
  version: z.literal( 3 ),
  cities: z.array( citySchema ),
} ).passthrough();

export type GeneratedCityData = z.infer<typeof citySchema>;

export function parseGeneratedCities( input: unknown ): GeneratedCityData[]
{
  const { cities } = generatedContentSchema.parse( input );
  const slugs = new Set<string>();
  for ( const city of cities )
  {
    if ( slugs.has( city.slug ) ) throw new Error( `Duplicate generated city slug: ${city.slug}` );
    slugs.add( city.slug );
  }
  return cities;
}

export function findGeneratedCity( cities: GeneratedCityData[], slug: string )
{
  return cities.find( city => city.slug === slug );
}
