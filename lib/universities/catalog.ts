export type UniversityCatalogEntry = {
  slug: string;
  name: string;
  shortName: string;
  fileNumber: string;
  color: string;
  tabColor: string;
  tabTextColor: string;
  textColor: string;
  featured: boolean;
};

const universityNames = [
  'Aston University',
  'Bangor University',
  'Birkbeck, University of London',
  'Brunel University London',
  'Camberwell College of Arts',
  'Cardiff University',
  'Central Saint Martins',
  'Chelsea College of Arts',
  'City St George’s, University of London',
  'Courtauld Institute of Art',
  'Coventry University',
  'Durham University',
  'Glasgow School of Art',
  'Guildhall School of Music & Drama',
  'Heriot-Watt University',
  'Imperial College London',
  'Kingston University',
  'King’s College London',
  'Lancaster University',
  'London College of Communication',
  'London College of Fashion',
  'London School of Economics and Political Science',
  'Loughborough University',
  'Manchester Metropolitan University',
  'Newcastle University',
  'Northumbria University',
  'Nottingham Trent University',
  'Oxford Brookes University',
  'Queen Mary University of London',
  'Queen’s University Belfast',
  'Royal Academy of Music',
  'Royal Central School of Speech and Drama',
  'Royal College of Art',
  'Royal College of Music',
  'Royal Conservatoire of Scotland',
  'Royal Holloway, University of London',
  'Royal Northern College of Music',
  'SOAS University of London',
  'Swansea University',
  'Ulster University',
  'University College London',
  'University of Aberdeen',
  'University of Bath',
  'University of Birmingham',
  'University of Bradford',
  'University of Bristol',
  'University of Cambridge',
  'University of Dundee',
  'University of East Anglia',
  'University of Edinburgh',
  'University of Essex',
  'University of Exeter',
  'University of Glasgow',
  'University of Huddersfield',
  'University of Hull',
  'University of Kent',
  'University of Leeds',
  'University of Leicester',
  'University of Liverpool',
  'University of Manchester',
  'University of Nottingham',
  'University of Oxford',
  'University of Plymouth',
  'University of Portsmouth',
  'University of Reading',
  'University of Sheffield',
  'University of Southampton',
  'University of St Andrews',
  'University of Stirling',
  'University of Strathclyde',
  'University of Surrey',
  'University of Sussex',
  'University of Warwick',
  'University of York',
  'Wimbledon College of Arts',
] as const;

const visualPalettes = [
  { color: '#d39a29', tabColor: '#273f86', tabTextColor: '#fff8e9', textColor: '#171510' },
  { color: '#b32a31', tabColor: '#1b1715', tabTextColor: '#fff8e9', textColor: '#fff8e9' },
  { color: '#2851d8', tabColor: '#f0cf45', tabTextColor: '#171510', textColor: '#f8f4e9' },
  { color: '#34745b', tabColor: '#f1d7a7', tabTextColor: '#171510', textColor: '#fffaf0' },
  { color: '#69376f', tabColor: '#ef6a45', tabTextColor: '#171510', textColor: '#fff8e9' },
] as const;

const featuredSlugs = new Set( [ 'ucl', 'kcl', 'oxford', 'exeter', 'royal-holloway' ] );
const featuredNames = [
  'University College London',
  'King’s College London',
  'University of Oxford',
  'University of Exeter',
  'Royal Holloway, University of London',
] as const;
const fileOrder = [ ...featuredNames, ...universityNames.filter( name => !( featuredNames as readonly string[] ).includes( name ) ) ];

const slugOverrides: Record<string, string> = {
  'King’s College London': 'kcl',
  'Royal Holloway, University of London': 'royal-holloway',
  'University College London': 'ucl',
  'University of Exeter': 'exeter',
  'University of Oxford': 'oxford',
};

const shortNameOverrides: Record<string, string> = {
  'King’s College London': 'KCL',
  'Royal Holloway, University of London': 'RHUL',
  'University College London': 'UCL',
  'University of Exeter': 'EXETER',
  'University of Oxford': 'OXFORD',
};

const visualOverrides: Record<string, ( typeof visualPalettes )[ number ]> = {
  ucl: visualPalettes[ 0 ],
  kcl: visualPalettes[ 1 ],
  oxford: visualPalettes[ 2 ],
  exeter: visualPalettes[ 3 ],
  'royal-holloway': visualPalettes[ 4 ],
};

function slugifyUniversityName( name: string )
{
  return name
    .normalize( 'NFKD' )
    .replaceAll( '&', ' and ' )
    .replace( /[’']/g, '' )
    .replace( /[^A-Za-z0-9]+/g, '-' )
    .replace( /(^-|-$)/g, '' )
    .toLowerCase();
}

function createShortName( name: string )
{
  const distinctiveName = name
    .replace( /,? University of London$/i, '' )
    .replace( /^University (College London|of )/i, '$1' )
    .replace( / University( London)?$/i, '' );
  const words = distinctiveName.split( /\s+/ ).filter( word => ![ 'of', 'and', 'the', '&' ].includes( word.toLowerCase() ) );
  if ( words.length === 1 ) return words[ 0 ].toUpperCase().slice( 0, 12 );
  return words.map( word => word[ 0 ] ).join( '' ).toUpperCase().slice( 0, 8 );
}

export const UNIVERSITY_CATALOG: UniversityCatalogEntry[] = universityNames.map( ( name, index ) => {
  const slug = slugOverrides[ name ] ?? slugifyUniversityName( name );
  const palette = visualOverrides[ slug ] ?? visualPalettes[ index % visualPalettes.length ];
  return {
    slug,
    name,
    shortName: shortNameOverrides[ name ] ?? createShortName( name ),
    fileNumber: String( fileOrder.indexOf( name ) + 1 ).padStart( 2, '0' ),
    ...palette,
    featured: featuredSlugs.has( slug ),
  };
} );

export const UNIVERSITY_FORM_OPTIONS = UNIVERSITY_CATALOG.map( ( { slug, name } ) => ( { slug, name } ) );

export function getUniversityBySlug( slug: string )
{
  return UNIVERSITY_CATALOG.find( university => university.slug === slug );
}
