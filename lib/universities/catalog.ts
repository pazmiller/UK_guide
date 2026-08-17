export type UniversityCatalogEntry = {
  slug: string;
  name: string;
  chineseName: string;
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

const chineseNameByEnglishName: Record<( typeof universityNames )[number], string> = {
  'Aston University': '阿斯顿大学',
  'Bangor University': '班戈大学',
  'Birkbeck, University of London': '伦敦大学伯贝克学院',
  'Brunel University London': '伦敦布鲁内尔大学',
  'Camberwell College of Arts': '坎伯韦尔艺术学院',
  'Cardiff University': '卡迪夫大学',
  'Central Saint Martins': '中央圣马丁艺术与设计学院',
  'Chelsea College of Arts': '切尔西艺术学院',
  'City St George’s, University of London': '伦敦大学城市圣乔治学院',
  'Courtauld Institute of Art': '考陶尔德艺术学院',
  'Coventry University': '考文垂大学',
  'Durham University': '杜伦大学',
  'Glasgow School of Art': '格拉斯哥艺术学院',
  'Guildhall School of Music & Drama': '市政厅音乐及戏剧学院',
  'Heriot-Watt University': '赫瑞-瓦特大学',
  'Imperial College London': '伦敦帝国理工学院',
  'Kingston University': '金斯顿大学',
  'King’s College London': '伦敦国王学院',
  'Lancaster University': '兰卡斯特大学',
  'London College of Communication': '伦敦传媒学院',
  'London College of Fashion': '伦敦时装学院',
  'London School of Economics and Political Science': '伦敦政治经济学院',
  'Loughborough University': '拉夫堡大学',
  'Manchester Metropolitan University': '曼彻斯特城市大学',
  'Newcastle University': '纽卡斯尔大学',
  'Northumbria University': '诺森比亚大学',
  'Nottingham Trent University': '诺丁汉特伦特大学',
  'Oxford Brookes University': '牛津布鲁克斯大学',
  'Queen Mary University of London': '伦敦玛丽女王大学',
  'Queen’s University Belfast': '贝尔法斯特女王大学',
  'Royal Academy of Music': '英国皇家音乐学院',
  'Royal Central School of Speech and Drama': '皇家中央演讲与戏剧学院',
  'Royal College of Art': '皇家艺术学院',
  'Royal College of Music': '皇家音乐学院',
  'Royal Conservatoire of Scotland': '苏格兰皇家音乐学院',
  'Royal Holloway, University of London': '伦敦大学皇家霍洛威学院',
  'Royal Northern College of Music': '皇家北方音乐学院',
  'SOAS University of London': '伦敦大学亚非学院',
  'Swansea University': '斯旺西大学',
  'Ulster University': '阿尔斯特大学',
  'University College London': '伦敦大学学院',
  'University of Aberdeen': '阿伯丁大学',
  'University of Bath': '巴斯大学',
  'University of Birmingham': '伯明翰大学',
  'University of Bradford': '布拉德福德大学',
  'University of Bristol': '布里斯托大学',
  'University of Cambridge': '剑桥大学',
  'University of Dundee': '邓迪大学',
  'University of East Anglia': '东英吉利大学',
  'University of Edinburgh': '爱丁堡大学',
  'University of Essex': '埃塞克斯大学',
  'University of Exeter': '埃克塞特大学',
  'University of Glasgow': '格拉斯哥大学',
  'University of Huddersfield': '哈德斯菲尔德大学',
  'University of Hull': '赫尔大学',
  'University of Kent': '肯特大学',
  'University of Leeds': '利兹大学',
  'University of Leicester': '莱斯特大学',
  'University of Liverpool': '利物浦大学',
  'University of Manchester': '曼彻斯特大学',
  'University of Nottingham': '诺丁汉大学',
  'University of Oxford': '牛津大学',
  'University of Plymouth': '普利茅斯大学',
  'University of Portsmouth': '朴茨茅斯大学',
  'University of Reading': '雷丁大学',
  'University of Sheffield': '谢菲尔德大学',
  'University of Southampton': '南安普顿大学',
  'University of St Andrews': '圣安德鲁斯大学',
  'University of Stirling': '斯特灵大学',
  'University of Strathclyde': '思克莱德大学',
  'University of Surrey': '萨里大学',
  'University of Sussex': '萨塞克斯大学',
  'University of Warwick': '华威大学',
  'University of York': '约克大学',
  'Wimbledon College of Arts': '温布尔登艺术学院',
};

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
    chineseName: chineseNameByEnglishName[name],
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
