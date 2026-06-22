import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const SOURCE_PATH = path.join( process.cwd(), 'info_datasource', 'DATA.md' );
const OUTPUT_PATH = path.join( process.cwd(), 'data', 'rag-knowledge-base.json' );

const FIELD_RE = /^(简介|推荐原因|推荐菜|价位|价格|地址|链接|邮编|避雷原因|原因|备注)：/;
const SEPARATOR_RE = /^[-—_]{3,}$/;

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

    const content = [
      `城市/地区：${current.city}`,
      `分类：${current.category}`,
      `来源章节：${current.section}`,
      `条目：${current.title}`,
      body,
    ].filter( Boolean ).join( '\n' );

    chunks.push( {
      id,
      city: current.city,
      category: current.category,
      section: current.section,
      title: current.title,
      content,
      source: 'info_datasource/DATA.md',
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
    version: 1,
    generatedAt: new Date().toISOString(),
    source: 'info_datasource/DATA.md',
    chunkCount: chunks.length,
    chunks,
  };
}

const markdown = await readFile( SOURCE_PATH, 'utf8' );
const knowledgeBase = buildKnowledgeBase( markdown );

await mkdir( path.dirname( OUTPUT_PATH ), { recursive: true } );
await writeFile( OUTPUT_PATH, `${JSON.stringify( knowledgeBase, null, 2 )}\n` );

console.log( `Built ${knowledgeBase.chunkCount} RAG chunks from ${knowledgeBase.source}` );
