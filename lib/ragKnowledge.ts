import knowledgeBase from '@/data/rag-knowledge-base.json';

export type RagChunk = {
  id: string;
  city: string;
  category: string;
  section: string;
  title: string;
  content: string;
  source: string;
  tags: string[];
};

type KnowledgeBase = {
  version: number;
  generatedAt: string;
  source: string;
  chunkCount: number;
  chunks: RagChunk[];
};

export type RetrieveOptions = {
  limit?: number;
  city?: string;
  category?: string;
};

export type RetrievedChunk = RagChunk & {
  score: number;
};

const kb = knowledgeBase as KnowledgeBase;

const QUERY_ALIASES: Record<string, string[]> = {
  london: [ 'london', '伦敦' ],
  伦敦: [ 'london', '伦敦' ],
  york: [ 'york', '约克' ],
  约克: [ 'york', '约克' ],
  food: [ 'food', 'restaurant', '餐厅', '美食', '好吃', '吃', '推荐菜' ],
  好吃: [ 'food', 'restaurant', '餐厅', '美食', '好吃', '吃', '推荐菜' ],
  restaurant: [ 'food', 'restaurant', '餐厅', '美食', '好吃', '吃', '推荐菜' ],
  玩: [ 'attraction', '景点', '好玩', '玩', '博物馆', '公园' ],
  好玩: [ 'attraction', '景点', '好玩', '玩', '博物馆', '公园' ],
  attraction: [ 'attraction', '景点', '好玩', '玩', '博物馆', '公园' ],
  avoid: [ 'avoid', '避雷', '不推荐', '踩雷', '坑' ],
  避雷: [ 'avoid', '避雷', '不推荐', '踩雷', '坑' ],
};

function cjkBigrams( value: string )
{
  const chars = Array.from( value.replace( /[^\p{Script=Han}]/gu, '' ) );
  const grams: string[] = [];
  for ( let i = 0; i < chars.length - 1; i++ )
  {
    grams.push( `${chars[ i ]}${chars[ i + 1 ]}` );
  }
  return grams;
}

function tokenize( value: string )
{
  const lower = value.toLowerCase();
  const words = lower.match( /[\p{Script=Han}]+|[a-z0-9£€]+/gu ) ?? [];
  return Array.from( new Set( [ ...words, ...cjkBigrams( lower ) ] ) );
}

function expandQueryTerms( query: string )
{
  const baseTerms = tokenize( query );
  const expanded = new Set<string>( baseTerms );

  for ( const term of baseTerms )
  {
    for ( const alias of QUERY_ALIASES[ term ] ?? [] )
    {
      expanded.add( alias.toLowerCase() );
      for ( const token of tokenize( alias ) )
      {
        expanded.add( token );
      }
    }
  }

  return Array.from( expanded ).filter( term => term.length > 0 );
}

function scoreChunk( chunk: RagChunk, terms: string[] )
{
  const title = chunk.title.toLowerCase();
  const city = chunk.city.toLowerCase();
  const category = chunk.category.toLowerCase();
  const haystack = [
    chunk.title,
    chunk.city,
    chunk.category,
    chunk.section,
    chunk.content,
    ...chunk.tags,
  ].join( '\n' ).toLowerCase();

  let score = 0;
  for ( const term of terms )
  {
    if ( title.includes( term ) ) score += 12;
    if ( city.includes( term ) ) score += 10;
    if ( category.includes( term ) ) score += 7;
    if ( haystack.includes( term ) ) score += Math.min( 6, Math.max( 2, term.length ) );
  }

  return score;
}

export function getRagKnowledgeBase()
{
  return kb;
}

export function retrieveKnowledge( query: string, options: RetrieveOptions = {} ): RetrievedChunk[]
{
  const limit = options.limit ?? 8;
  const terms = expandQueryTerms( query );
  const cityFilter = options.city?.toLowerCase();
  const categoryFilter = options.category?.toLowerCase();

  return kb.chunks
    .filter( chunk =>
    {
      if ( cityFilter && chunk.city.toLowerCase() !== cityFilter ) return false;
      if ( categoryFilter && chunk.category.toLowerCase() !== categoryFilter ) return false;
      return true;
    } )
    .map( chunk => ( { ...chunk, score: scoreChunk( chunk, terms ) } ) )
    .filter( chunk => chunk.score > 0 )
    .sort( ( a, b ) => b.score - a.score )
    .slice( 0, limit );
}

export function buildRagContext( query: string, options: RetrieveOptions = {} )
{
  const chunks = retrieveKnowledge( query, options );

  if ( chunks.length === 0 )
  {
    return {
      chunks,
      context: '知识库没有检索到相关内容。',
    };
  }

  const context = chunks
    .map( ( chunk, index ) => [
      `[${index + 1}] ${chunk.city} / ${chunk.category} / ${chunk.title}`,
      chunk.content,
    ].join( '\n' ) )
    .join( '\n\n---\n\n' );

  return {
    chunks,
    context,
  };
}
