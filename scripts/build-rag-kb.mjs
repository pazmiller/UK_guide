import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const MARKDOWN_PATH = path.join( process.cwd(), 'src', 'DATA.md' );
const SOURCE_PATH = path.join( process.cwd(), 'src', 'DATA.json' );
const OUTPUT_PATH = path.join( process.cwd(), 'data', 'rag-knowledge-base.json' );
const MARKDOWN_SOURCE = 'src/DATA.md';
const JSON_SOURCE = 'src/DATA.json';

const FIELD_RE = /^(简介|推荐原因|推荐菜|价位|价格|地址|链接|邮编|避雷原因|原因|备注)：/;
const SEPARATOR_RE = /^[-—_]{3,}$/;
const RESTAURANT_CONTENT_FIELDS = {
  '简介': 'summary',
  '推荐原因': 'recommend_reason',
  '推荐菜': 'recommend_signatures',
  '价位': 'price',
  '价格': 'price',
};
const RESTAURANT_DETAIL_FIELDS = {
  '地址': 'address',
  '链接': 'link',
  '邮编': 'postcode',
  '备注': 'notes',
};
const CAFE_CUISINES = [ 'Drinks', 'Dessert' ];
const DESSERT_CAFE_RE = /甜品|点心|烘焙|冰淇淋|巧克力|\bbakery\b|\bgelato\b|\bdessert\b|\bchocolat/i;
const CUISINE_RULES = [
  [ /\blahpet\b|缅甸/i, 'Burmese' ],
  [ /越南|\bpho\b/i, 'Vietnamese' ],
  [ /med salleh|\byiqi\b|马来西亚|马来菜/i, 'Malaysian' ],
  [ /\bceru\b|地中海|黎凡特/i, 'Mediterranean' ],
  [ /\bkiln\b|plaza khao gaeng|speedboat|泰餐|泰式/i, 'Thai' ],
  [ /sushi|日料|日式|日本/i, 'Japanese' ],
  [ /vasiniko|\bgloria\b|amalfi|celino|punto pasta|marzano|paradiso|那不勒斯|意大利|西西里|披萨/i, 'Italian' ],
  [ /俄罗斯/i, 'Russian' ],
  [ /秘鲁|ceviche/i, 'Peruvian' ],
  [ /波斯|persian/i, 'Persian' ],
  [ /法国|法餐|巴黎菜|\bparis\b/i, 'French' ],
  [ /印度|dishroom/i, 'Indian' ],
  [ /印尼|印度尼西亚/i, 'Indonesian' ],
  [ /\bbao\b|台式|台湾|桂林|新疆|宁波|潮汕|云南|湘菜|江浙|川菜|中餐|中国|兰州拉面/i, 'Chinese' ],
  [ /西班牙/i, 'Spanish' ],
  [ /波兰/i, 'Polish' ],
  [ /瑞典/i, 'Swedish' ],
  [ /丹麦/i, 'Danish' ],
  [ /冰岛|雷克雅未克|赫本海鲜/i, 'Icelandic' ],
  [ /巴西/i, 'Brazilian' ],
  [ /希腊/i, 'Greek' ],
  [ /英国菜|英国汉堡|英式|fish\s*&\s*chips|炸鱼薯条|bettys/i, 'British' ],
  [ /red dog saloon|wingstop|美式|烟熏肉/i, 'American' ],
];

const CITY_ALIASES = [
  [ /london|伦敦/i, 'London' ],
  [ /york|约克/i, 'York' ],
  [ /southampton|南安普顿/i, 'Southampton' ],
  [ /edinburgh|爱丁堡/i, 'Edinburgh' ],
  [ /glasgow|格拉斯哥/i, 'Glasgow' ],
  [ /swansea|斯旺西/i, 'Swansea' ],
  [ /poland|格但斯克|波兰/i, 'Poland' ],
  [ /köln|koln|科隆/i, 'Köln' ],
  [ /stockholm|斯德哥尔摩/i, 'Stockholm' ],
  [ /københavn|copenhagen|哥本哈根/i, 'København' ],
  [ /paris|巴黎/i, 'Paris' ],
  [ /iceland|冰岛/i, 'Iceland' ],
  [ /^uk\b|英国/i, 'UK' ],
];

function normalizeLine( line )
{
  return line.trim().replace( /\s+/g, ' ' );
}

function isFieldLine( line )
{
  return FIELD_RE.test( line );
}

function cityFromText( text )
{
  for ( const [ pattern, city ] of CITY_ALIASES )
  {
    if ( pattern.test( text ) ) return city;
  }
  return 'General';
}

function categoryFromText( text )
{
  const lower = text.toLowerCase();
  if ( /避雷|avoid|不推荐/.test( text ) ) return 'avoid';
  if ( /景点|attraction|museum|garden|park|castle|bay/.test( lower ) || /博物馆|公园|景点/.test( text ) ) return 'attraction';
  if ( /甜品|烘焙|咖啡|饮品|奶茶|gelato|bakery|cafe|coffee/i.test( text ) ) return 'cafe';
  if ( /快餐|meal deal|连锁|budget/i.test( text ) ) return 'budget';
  if ( /生活|长期居住|其他|tips/i.test( text ) ) return 'tip';
  return 'restaurant';
}

function hasStructuredFoodContent( category )
{
  return category === 'restaurant' || category === 'cafe';
}

function isSectionHeading( line )
{
  if ( !line || isFieldLine( line ) || line.includes( 'http' ) ) return false;
  if ( line.includes( '｜' ) || /\s\|\s/.test( line ) ) return true;
  return /^(伦敦景点|伦敦避雷景点|伦敦避雷餐厅|UK 性价比快餐|推荐|避雷|其他|长期居住的小动物们|致谢名单)/.test( line );
}

function cleanTitle( line )
{
  return line.replace( /[：:]\s*$/, '' ).trim();
}

function slugPart( value )
{
  const ascii = value
    .normalize( 'NFKD' )
    .replace( /[\u0300-\u036f]/g, '' )
    .toLowerCase()
    .replace( /[^a-z0-9]+/g, '-' )
    .replace( /^-+|-+$/g, '' );

  return ascii || 'chunk';
}

function splitInlineFields( line )
{
  const match = line.match( /(简介|推荐原因|推荐菜|价位|价格|地址|链接|邮编|避雷原因|原因|备注)：/ );
  if ( !match || match.index === 0 ) return null;

  const title = line.slice( 0, match.index ).trim();
  const rest = line.slice( match.index ).trim();
  return { title, rest };
}

function appendValue( target, key, value )
{
  if ( !value ) return;
  target[ key ] = target[ key ] ? `${target[ key ]}\n${value}` : value;
}

function inferRestaurantCuisine( current )
{
  const summary = current.lines.find( line => line.startsWith( '简介：' ) ) ?? '';
  const primaryText = `${current.title} ${summary}`;
  const searchableText = [
    current.title,
    current.section,
    current.city,
    ...current.lines,
  ].join( ' ' );

  if ( current.category === 'cafe' )
  {
    return DESSERT_CAFE_RE.test( primaryText ) ? 'Dessert' : 'Drinks';
  }

  for ( const [ pattern, cuisine ] of CUISINE_RULES )
  {
    if ( pattern.test( primaryText ) ) return cuisine;
  }
  for ( const [ pattern, cuisine ] of CUISINE_RULES )
  {
    if ( pattern.test( searchableText ) ) return cuisine;
  }
  return 'Other';
}

function structureRestaurantContent( current )
{
  const content = {
    summary: '',
    type_cusine: inferRestaurantCuisine( current ),
    recommend_reason: '',
    recommend_signatures: '',
    price: '',
  };
  const details = {};
  const additionalInfo = [];

  for ( const line of current.lines )
  {
    const match = line.match( /^([^：]+)：\s*(.*)$/ );
    if ( !match )
    {
      additionalInfo.push( line );
      continue;
    }

    const [ , label, value ] = match;
    const contentKey = RESTAURANT_CONTENT_FIELDS[ label ];
    if ( contentKey )
    {
      appendValue( content, contentKey, value );
      continue;
    }

    const detailKey = RESTAURANT_DETAIL_FIELDS[ label ];
    if ( detailKey )
    {
      appendValue( details, detailKey, value );
      continue;
    }

    additionalInfo.push( line );
  }

  if ( additionalInfo.length ) details.additional_info = additionalInfo;
  return {
    content,
    ...( Object.keys( details ).length ? { details } : {} ),
  };
}

function serializeRestaurantContent( chunk )
{
  const labels = {
    summary: '简介',
    type_cusine: '菜系',
    recommend_reason: '推荐原因',
    recommend_signatures: '推荐菜',
    price: '价位',
  };
  const detailLabels = {
    address: '地址',
    link: '链接',
    postcode: '邮编',
    notes: '备注',
  };
  const lines = [
    `城市/地区：${chunk.city}`,
    `分类：${chunk.category}`,
    `来源章节：${chunk.section}`,
    `条目：${chunk.title}`,
  ];

  for ( const [ key, label ] of Object.entries( labels ) )
  {
    if ( chunk.content[ key ] ) lines.push( `${label}：${chunk.content[ key ]}` );
  }
  for ( const [ key, label ] of Object.entries( detailLabels ) )
  {
    if ( chunk.details?.[ key ] ) lines.push( `${label}：${chunk.details[ key ]}` );
  }
  if ( chunk.details?.additional_info?.length ) lines.push( ...chunk.details.additional_info );

  return lines.join( '\n' );
}

function validateRestaurantContent( chunk )
{
  const requiredKeys = [ 'summary', 'type_cusine', 'recommend_reason', 'recommend_signatures', 'price' ];
  if ( !chunk.content || typeof chunk.content !== 'object' || Array.isArray( chunk.content ) )
  {
    throw new TypeError( `Restaurant ${chunk.id} must have structured content` );
  }
  const unexpectedKeys = Object.keys( chunk.content ).filter( key => !requiredKeys.includes( key ) );
  if ( unexpectedKeys.length )
  {
    throw new TypeError( `Restaurant ${chunk.id} has unexpected content fields: ${unexpectedKeys.join( ', ' )}` );
  }
  for ( const key of requiredKeys )
  {
    if ( typeof chunk.content[ key ] !== 'string' )
    {
      throw new TypeError( `Restaurant ${chunk.id} content.${key} must be a string` );
    }
  }
  if ( chunk.category === 'cafe' && !CAFE_CUISINES.includes( chunk.content.type_cusine ) )
  {
    throw new TypeError( `Cafe ${chunk.id} must use a Drinks or Dessert cuisine` );
  }
}

function buildKnowledgeBase( markdown )
{
  const lines = markdown.split( /\r?\n/ ).map( normalizeLine );
  const chunks = [];
  let section = {
    raw: 'General',
    city: 'General',
    category: 'general',
  };
  let current = null;

  function flush()
  {
    if ( !current ) return;
    const body = current.lines.join( '\n' ).trim();
    if ( !body && current.title === section.raw ) return;

    const id = [
      String( chunks.length + 1 ).padStart( 4, '0' ),
      slugPart( current.city ),
      slugPart( current.category ),
      slugPart( current.title ),
    ].join( '-' );

    const restaurantData = hasStructuredFoodContent( current.category )
      ? structureRestaurantContent( current )
      : {
          content: [
            `城市/地区：${current.city}`,
            `分类：${current.category}`,
            `来源章节：${current.section}`,
            `条目：${current.title}`,
            body,
          ].filter( Boolean ).join( '\n' ),
        };

    chunks.push( {
      id,
      city: current.city,
      category: current.category,
      section: current.section,
      title: current.title,
      ...restaurantData,
      source: MARKDOWN_SOURCE,
      tags: [
        current.city,
        current.category,
        current.section,
        current.title,
      ].filter( Boolean ),
    } );
    current = null;
  }

  for ( let i = 0; i < lines.length; i++ )
  {
    const line = lines[ i ];
    if ( !line || SEPARATOR_RE.test( line ) ) continue;

    if ( isSectionHeading( line ) )
    {
      flush();
      section = {
        raw: cleanTitle( line ),
        city: cityFromText( line ),
        category: categoryFromText( line ),
      };
      continue;
    }

    const inline = splitInlineFields( line );
    if ( inline )
    {
      flush();
      current = {
        city: section.city,
        category: categoryFromText( `${section.raw} ${inline.title}` ),
        section: section.raw,
        title: cleanTitle( inline.title ),
        lines: [ inline.rest ],
      };
      continue;
    }

    if ( isFieldLine( line ) )
    {
      if ( !current )
      {
        current = {
          city: section.city,
          category: section.category,
          section: section.raw,
          title: section.raw,
          lines: [],
        };
      }
      current.lines.push( line );
      continue;
    }

    const next = lines.slice( i + 1 ).find( candidate => candidate && !SEPARATOR_RE.test( candidate ) );
    if ( next && isFieldLine( next ) )
    {
      flush();
      current = {
        city: cityFromText( `${section.raw} ${line}` ),
        category: categoryFromText( `${section.raw} ${line}` ),
        section: section.raw,
        title: cleanTitle( line ),
        lines: [],
      };
      continue;
    }

    if ( current )
    {
      current.lines.push( line );
    } else
    {
      current = {
        city: section.city,
        category: section.category,
        section: section.raw,
        title: section.raw,
        lines: [ line ],
      };
    }
  }

  flush();

  return {
    version: 2,
    generatedAt: new Date().toISOString(),
    source: MARKDOWN_SOURCE,
    chunkCount: chunks.length,
    chunks,
  };
}

if ( process.argv.includes( '--build-data' ) )
{
  const markdown = await readFile( MARKDOWN_PATH, 'utf8' );
  const contentData = buildKnowledgeBase( markdown );

  await mkdir( path.dirname( SOURCE_PATH ), { recursive: true } );
  await writeFile( SOURCE_PATH, `${JSON.stringify( contentData, null, 2 )}\n` );

  console.log( `Built ${contentData.chunkCount} content entries in ${JSON_SOURCE}` );
} else
{
  const contentData = JSON.parse( await readFile( SOURCE_PATH, 'utf8' ) );
  if ( !Array.isArray( contentData.chunks ) )
  {
    throw new TypeError( `${JSON_SOURCE} must contain a chunks array` );
  }
  for ( const chunk of contentData.chunks )
  {
    if ( hasStructuredFoodContent( chunk.category ) ) validateRestaurantContent( chunk );
  }

  const knowledgeBase = {
    ...contentData,
    generatedAt: new Date().toISOString(),
    source: JSON_SOURCE,
    chunkCount: contentData.chunks.length,
    chunks: contentData.chunks.map( chunk => ( {
      ...chunk,
      content: hasStructuredFoodContent( chunk.category )
        ? serializeRestaurantContent( chunk )
        : chunk.content,
      source: JSON_SOURCE,
    } ) ),
  };

  await mkdir( path.dirname( OUTPUT_PATH ), { recursive: true } );
  await writeFile( OUTPUT_PATH, `${JSON.stringify( knowledgeBase, null, 2 )}\n` );

  console.log( `Built ${knowledgeBase.chunkCount} RAG chunks from ${knowledgeBase.source}` );
}
