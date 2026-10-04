// Geometry for the home hero particle journey: a Union Jack whose stripes
// straighten into a tube-style network map. Pure data, no three.js here.

type Vec2 = [ number, number ];
type Rgb = [ number, number, number ];

export type JourneyStation = {
  id: string;
  name: string;
  zh: string;
  /** Position in map design units (landscape layout, y up) */
  pos: Vec2;
  /** Colour of the line the station is introduced on, reused by the page strips and rail */
  color: string;
};

// Each station is a section of the home page, in scroll order.
export const JOURNEY_STATIONS: JourneyStation[] = [
  { id: 'welcome', name: 'Welcome', zh: '欢迎', pos: [ -3, 0 ], color: '#E63946' },
  { id: 'guide', name: 'Onboarding', zh: '赴英指南', pos: [ 0, 2 ], color: '#F4A261' },
  { id: 'explore', name: 'Explore', zh: '城市探索', pos: [ 0.5, -2 ], color: '#5280FF' },
  { id: 'restaurants', name: 'Eats', zh: '推荐餐厅', pos: [ 4, 2 ], color: '#33C7B0' },
  { id: 'news', name: 'Dispatch', zh: '新闻速递', pos: [ 6, 0 ], color: '#E63946' },
  { id: 'universities', name: 'Campus', zh: '大学评测', pos: [ 4, -2 ], color: '#5280FF' },
];

// Only 0°, 45° and 90° segments, like the stripes of the flag itself.
// Stations sit on line crossings and bends.
const LINES: { color: Rgb; points: Vec2[] }[] = [
  { color: [ 0.9, 0.22, 0.27 ], points: [ [ -7.5, 0 ], [ -2, 0 ], [ 0, 2 ], [ 4, 2 ], [ 6, 0 ], [ 7.5, 0 ] ] },
  { color: [ 0.96, 0.64, 0.38 ], points: [ [ 0, 4.4 ], [ 0, -1.5 ], [ 2.6, -4.1 ], [ 2.6, -4.4 ] ] },
  { color: [ 0.32, 0.5, 1 ], points: [ [ -6.6, 3.6 ], [ -3, 0 ], [ -3, -2 ], [ 4, -2 ], [ 6.2, -4.2 ] ] },
  { color: [ 0.2, 0.78, 0.69 ], points: [ [ 6.6, 4.6 ], [ 4, 2 ], [ 4, -4.4 ] ] },
];
const [ RED_LINE, AMBER_LINE, BLUE_LINE, TEAL_LINE ] = [ 0, 1, 2, 3 ];

const MAP_W = 15.6;
const MAP_H = 9.6;
const LINE_HALF_WIDTH = 0.075;
const RING_RADIUS = 0.3;
const RING_PARTICLES = 240;

// Matches the aKind branches in the ParticleJourney vertex shader
const KIND = { dust: 0, line: 1, thames: 2, station: 3 } as const;

const FLAG_RED: Rgb = [ 0.8, 0, 0.14 ];
const FLAG_WHITE: Rgb = [ 1, 1, 1 ];
const FLAG_BLUE: Rgb = [ 0.06, 0.22, 0.6 ];
const THAMES: Rgb = [ 0.16, 0.36, 0.85 ];
const DUST: Rgb = [ 0.55, 0.65, 0.92 ];

/** Visible world height at z = 0; the camera is placed to match. */
export const VIEW_HEIGHT = 10;

export type JourneyGeometry = {
  count: number;
  flag: Float32Array;
  map: Float32Array;
  colorFlag: Float32Array;
  colorMap: Float32Array;
  /** [flag alpha, map alpha] per particle */
  alpha: Float32Array;
  /** [flag size, map size] in world units per particle */
  size: Float32Array;
  kind: Float32Array;
  rand: Float32Array;
  /** Position along a line (0..1, offset per line) for the train pulses */
  arc: Float32Array;
  delay: Float32Array;
  /** Station positions in world units, same order as JOURNEY_STATIONS */
  stations: Vec2[];
};

function mulberry32( seed: number )
{
  return () =>
  {
    seed |= 0;
    seed = ( seed + 0x6d2b79f5 ) | 0;
    let t = Math.imul( seed ^ ( seed >>> 15 ), 1 | seed );
    t = ( t + Math.imul( t ^ ( t >>> 7 ), 61 | t ) ) ^ t;
    return ( ( t ^ ( t >>> 14 ) ) >>> 0 ) / 4294967296;
  };
}

function polyline( points: Vec2[] )
{
  const lengths = [ 0 ];
  for ( let i = 1; i < points.length; i++ )
  {
    const [ ax, ay ] = points[ i - 1 ];
    const [ bx, by ] = points[ i ];
    lengths.push( lengths[ i - 1 ] + Math.hypot( bx - ax, by - ay ) );
  }
  const total = lengths[ lengths.length - 1 ];

  /** Point and unit normal at fraction t of the total length */
  return ( t: number ): [ number, number, number, number ] =>
  {
    const d = Math.min( Math.max( t, 0 ), 1 ) * total;
    let i = 1;
    while ( i < lengths.length - 1 && lengths[ i ] < d ) i++;
    const [ ax, ay ] = points[ i - 1 ];
    const [ bx, by ] = points[ i ];
    const seg = lengths[ i ] - lengths[ i - 1 ];
    const k = seg > 0 ? ( d - lengths[ i - 1 ] ) / seg : 0;
    return [ ax + ( bx - ax ) * k, ay + ( by - ay ) * k, -( by - ay ) / seg, ( bx - ax ) / seg ];
  };
}

/**
 * Builds the particle buffers for a viewport. The flag covers the viewport
 * (2:1, cropped like a background image), so on narrow screens the off-screen
 * parts of the flag stream in from the sides during the morph.
 */
export function buildJourney( widthPx: number, heightPx: number, maxParticles: number ): JourneyGeometry
{
  const rand = mulberry32( 1801 );
  const aspect = widthPx / heightPx;
  const viewW = VIEW_HEIGHT * aspect;
  const portrait = aspect < 1;

  const flagW = aspect >= 2 ? viewW : VIEW_HEIGHT * 2;
  const flagH = flagW / 2;
  const minSpacing = 9 * VIEW_HEIGHT / heightPx;
  const spacing = Math.max( minSpacing, Math.sqrt( flagW * flagH / maxParticles ) );
  const cols = Math.floor( flagW / spacing );
  const rows = Math.floor( flagH / spacing );
  const count = cols * rows;

  const designW = portrait ? MAP_H : MAP_W;
  const designH = portrait ? MAP_W : MAP_H;
  const scale = Math.min( viewW * ( portrait ? 0.72 : 0.86 ) / designW, VIEW_HEIGHT * 0.7 / designH );
  // Leave room for the caption below and, on phones, for labels on the right
  const [ offsetX, offsetY ] = portrait ? [ -viewW * 0.08, 0.6 ] : [ 0, 0.45 ];
  // Portrait screens get the map turned a quarter: 45° stays 45°.
  const toWorld = ( [ x, y ]: Vec2 ): Vec2 => portrait
    ? [ y * scale + offsetX, -x * scale + offsetY ]
    : [ x * scale + offsetX, y * scale + offsetY ];
  const lineAt = LINES.map( line => polyline( line.points.map( toWorld ) ) );
  const thamesAt = polyline( Array.from( { length: 33 }, ( _, i ): Vec2 =>
  {
    const x = -8 + i / 2;
    return toWorld( [ x, -1 + 0.35 * Math.sin( x * 0.55 + 0.6 ) ] );
  } ) );
  const stations = JOURNEY_STATIONS.map( s => toWorld( s.pos ) );

  const g: JourneyGeometry = {
    count,
    flag: new Float32Array( count * 3 ),
    map: new Float32Array( count * 3 ),
    colorFlag: new Float32Array( count * 3 ),
    colorMap: new Float32Array( count * 3 ),
    alpha: new Float32Array( count * 2 ),
    size: new Float32Array( count * 2 ),
    kind: new Float32Array( count ),
    rand: new Float32Array( count ),
    arc: new Float32Array( count ),
    delay: new Float32Array( count ),
    stations,
  };

  const whitePool: number[] = [];
  const bluePool: number[] = [];
  const dotSize = spacing * 0.5;
  const lineSize = 0.1 * scale;

  function setMap( i: number, x: number, y: number, z: number, color: Rgb, alpha: number, size: number, kind: number )
  {
    g.map.set( [ x, y, z ], i * 3 );
    g.colorMap.set( color, i * 3 );
    g.alpha[ i * 2 + 1 ] = alpha;
    g.size[ i * 2 + 1 ] = size;
    g.kind[ i ] = kind;
  }

  function toLine( i: number, line: number, t: number, s: number )
  {
    // Spread each grid column along the line instead of stacking it on one spot
    t += ( rand() - 0.5 ) * 2 * spacing / flagH;
    const [ x, y, nx, ny ] = lineAt[ line ]( t );
    const offset = Math.max( -1, Math.min( 1, s ) ) * LINE_HALF_WIDTH * scale;
    setMap( i, x + nx * offset, y + ny * offset, 0, LINES[ line ].color, 0.95, lineSize, KIND.line );
    g.arc[ i ] = t + line * 0.37;
  }

  for ( let r = 0; r < rows; r++ )
  {
    for ( let c = 0; c < cols; c++ )
    {
      const i = r * cols + c;
      const nx = ( c + 0.5 ) / cols;
      const ny = ( r + 0.5 ) / rows;
      g.flag.set( [ ( nx - 0.5 ) * flagW, ( 0.5 - ny ) * flagH, 0 ], i * 3 );
      g.rand[ i ] = rand();
      g.arc[ i ] = g.rand[ i ];
      g.size[ i * 2 ] = dotSize;
      g.delay[ i ] = nx * 0.3 + g.rand[ i ] * 0.15;

      // Same stripe maths as UnionJackDots, flag spanning x 0..2, y 0..1
      const X = nx * 2;
      const Y = ny;
      const dv = Math.abs( X - 1 );
      const dh = Math.abs( Y - 0.5 );
      const dd1 = ( X - 2 * Y ) / Math.sqrt( 5 );
      const dd2 = ( X + 2 * Y - 2 ) / Math.sqrt( 5 );

      let flagColor = FLAG_BLUE;
      if ( dh < 0.1 )
      {
        flagColor = FLAG_RED;
        toLine( i, RED_LINE, nx, ( 0.5 - Y ) / 0.1 );
      }
      else if ( dv < 0.1 )
      {
        flagColor = FLAG_RED;
        toLine( i, AMBER_LINE, ny, ( X - 1 ) / 0.1 );
      }
      else if ( dh < 0.16 || dv < 0.16 )
      {
        flagColor = FLAG_WHITE;
        whitePool.push( i );
      }
      else if ( Math.abs( dd1 ) < 0.084 )
      {
        flagColor = Math.abs( dd1 ) < 0.028 ? FLAG_RED : FLAG_WHITE;
        toLine( i, BLUE_LINE, ( 2 * X + Y ) / 5, dd1 / 0.084 );
      }
      else if ( Math.abs( dd2 ) < 0.084 )
      {
        flagColor = Math.abs( dd2 ) < 0.028 ? FLAG_RED : FLAG_WHITE;
        toLine( i, TEAL_LINE, ( 2 * ( 2 - X ) + Y ) / 5, dd2 / 0.084 );
      }
      else
      {
        bluePool.push( i );
      }

      g.colorFlag.set( flagColor, i * 3 );
      g.alpha[ i * 2 ] = flagColor === FLAG_BLUE ? 0.5 : 0.62;
    }
  }

  const dust = ( i: number, color: Rgb ) => setMap(
    i,
    ( rand() - 0.5 ) * viewW * 1.4,
    ( rand() - 0.5 ) * VIEW_HEIGHT * 1.4,
    -6 + rand() * 8,
    color,
    0.22,
    dotSize * 0.8,
    KIND.dust,
  );

  // White border of the cross → station rings, then dust
  const ringTotal = Math.min( whitePool.length, stations.length * RING_PARTICLES );
  whitePool.forEach( ( i, n ) =>
  {
    if ( n >= ringTotal ) return dust( i, FLAG_WHITE );
    const [ sx, sy ] = stations[ n % stations.length ];
    const angle = rand() * Math.PI * 2;
    const radius = ( RING_RADIUS + ( rand() - 0.5 ) * 0.07 ) * scale;
    setMap( i, sx + Math.cos( angle ) * radius, sy + Math.sin( angle ) * radius, 0.02, FLAG_WHITE, 1, lineSize, KIND.station );
  } );

  // Blue field → the Thames, then dust
  bluePool.forEach( ( i, n ) =>
  {
    if ( n % 5 >= 2 ) return dust( i, DUST );
    const t = rand();
    const [ x, y, nx, ny ] = thamesAt( t );
    const offset = ( rand() - 0.5 ) * 0.55 * scale;
    setMap( i, x + nx * offset, y + ny * offset, -0.05, THAMES, 0.38, lineSize * 1.1, KIND.thames );
    g.arc[ i ] = t;
  } );

  return g;
}
