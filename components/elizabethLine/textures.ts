import * as THREE from 'three';

// Procedural textures for the Elizabeth line dig: no image downloads, crisp at any size.

function hash( x: number, y: number, seed: number )
{
  let h = Math.imul( x | 0, 374761393 ) ^ Math.imul( y | 0, 668265263 ) ^ Math.imul( seed | 0, 982451653 );
  h = Math.imul( h ^ ( h >>> 13 ), 1274126177 );
  return ( ( h ^ ( h >>> 16 ) ) >>> 0 ) / 4294967295;
}

function valueNoise( x: number, y: number, seed: number )
{
  const xi = Math.floor( x );
  const yi = Math.floor( y );
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * ( 3 - 2 * xf );
  const v = yf * yf * ( 3 - 2 * yf );
  const a = hash( xi, yi, seed );
  const b = hash( xi + 1, yi, seed );
  const c = hash( xi, yi + 1, seed );
  const d = hash( xi + 1, yi + 1, seed );
  return a + ( b - a ) * u + ( c - a ) * v + ( a - b - c + d ) * u * v;
}

export function fbm( x: number, y: number, seed: number, octaves = 5 )
{
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  for ( let i = 0; i < octaves; i++ )
  {
    sum += amp * valueNoise( x * freq, y * freq, seed + i * 17 );
    freq *= 2;
    amp *= 0.5;
  }
  return sum;
}

/** Deterministic random numbers, so the scene looks the same on every visit */
export function seeded( seed: number )
{
  let s = seed;
  return () =>
  {
    s = ( s + 0x6d2b79f5 ) | 0;
    let t = Math.imul( s ^ ( s >>> 15 ), 1 | s );
    t = ( t + Math.imul( t ^ ( t >>> 7 ), 61 | t ) ) ^ t;
    return ( ( t ^ ( t >>> 14 ) ) >>> 0 ) / 4294967296;
  };
}

function canvas( w: number, h: number )
{
  const c = document.createElement( 'canvas' );
  c.width = w;
  c.height = h;
  return { c, g: c.getContext( '2d' )! };
}

function texture( c: HTMLCanvasElement, srgb = true )
{
  const t = new THREE.CanvasTexture( c );
  if ( srgb ) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}

/** Hands the main thread back to the browser so scrolling stays smooth during set-up */
export const yieldToMain = () => new Promise<void>( resolve => setTimeout( resolve, 0 ) );

/** Per-pixel grey level plus a fixed RGB tint, computed in slices that yield between them */
async function fillNoise( g: CanvasRenderingContext2D, w: number, h: number, tint: [ number, number, number ], shade: ( x: number, y: number ) => number )
{
  const img = g.createImageData( w, h );
  const data = img.data;
  let sliceStart = performance.now();
  for ( let y = 0; y < h; y++ )
  {
    for ( let x = 0; x < w; x++ )
    {
      const v = shade( x, y );
      const i = ( y * w + x ) * 4;
      data[ i ] = v + tint[ 0 ];
      data[ i + 1 ] = v + tint[ 1 ];
      data[ i + 2 ] = v + tint[ 2 ];
      data[ i + 3 ] = 255;
    }
    if ( performance.now() - sliceStart > 10 )
    {
      await yieldToMain();
      sliceStart = performance.now();
    }
  }
  g.putImageData( img, 0, 0 );
}

/**
 * One precast lining segment, unwrapped: canvas x runs around the tunnel, canvas y along it.
 * Chamfered edges, bolt pockets on both joints, grout hole and water staining.
 */
export async function liningTexture()
{
  const w = 512;
  const h = 256;
  const { c, g } = canvas( w, h );
  await fillNoise( g, w, h, [ 4, 2, -2 ], ( x, y ) =>
  {
    const n = fbm( x / 46, y / 46, 3 ) * 0.7 + fbm( x / 7, y / 7, 9, 2 ) * 0.3;
    const pit = hash( x, y, 41 ) > 0.985 ? -38 : 0;
    return 118 + n * 78 + pit;
  } );

  // Chamfered edges catch the light differently
  const edge = ( x: number, y: number, ew: number, eh: number, from: string, to: string, horizontal: boolean ) =>
  {
    const grad = horizontal ? g.createLinearGradient( x, 0, x + ew, 0 ) : g.createLinearGradient( 0, y, 0, y + eh );
    grad.addColorStop( 0, from );
    grad.addColorStop( 1, to );
    g.fillStyle = grad;
    g.fillRect( x, y, ew, eh );
  };
  edge( 0, 0, w, 10, 'rgba(20,18,16,0.85)', 'rgba(20,18,16,0)', false );
  edge( 0, h - 10, w, 10, 'rgba(20,18,16,0)', 'rgba(20,18,16,0.85)', false );
  edge( 0, 0, 10, h, 'rgba(20,18,16,0.8)', 'rgba(20,18,16,0)', true );
  edge( w - 10, 0, 10, h, 'rgba(20,18,16,0)', 'rgba(20,18,16,0.8)', true );

  // Bolt pockets on the circumferential joints, dowel pockets on the radial ones
  const pocket = ( cx: number, cy: number, pw: number, ph: number ) =>
  {
    g.fillStyle = 'rgba(12,11,10,0.92)';
    g.beginPath();
    g.roundRect( cx - pw / 2, cy - ph / 2, pw, ph, 4 );
    g.fill();
    g.strokeStyle = 'rgba(210,205,196,0.35)';
    g.lineWidth = 2;
    g.stroke();
    g.fillStyle = 'rgba(140,130,118,0.9)';
    g.beginPath();
    g.arc( cx, cy, Math.min( pw, ph ) * 0.22, 0, Math.PI * 2 );
    g.fill();
  };
  for ( const fx of [ 0.22, 0.5, 0.78 ] )
  {
    pocket( fx * w, 22, 30, 16 );
    pocket( fx * w, h - 22, 30, 16 );
  }
  pocket( 22, h / 2, 16, 28 );
  pocket( w - 22, h / 2, 16, 28 );

  // Grout hole
  g.fillStyle = 'rgba(30,28,26,0.9)';
  g.beginPath();
  g.arc( w * 0.5, h * 0.5, 9, 0, Math.PI * 2 );
  g.fill();

  // Water stains running down from the joints
  const rand = seeded( 7 );
  for ( let i = 0; i < 6; i++ )
  {
    const x = rand() * w;
    const len = 40 + rand() * 120;
    const grad = g.createLinearGradient( 0, 0, 0, len );
    grad.addColorStop( 0, 'rgba(60,52,40,0.35)' );
    grad.addColorStop( 1, 'rgba(60,52,40,0)' );
    g.fillStyle = grad;
    g.fillRect( x, 10, 3 + rand() * 8, len );
  }
  return texture( c );
}

export async function slabTexture()
{
  const w = 256;
  const h = 512;
  const { c, g } = canvas( w, h );
  await fillNoise( g, w, h, [ 0, -2, -6 ], ( x, y ) =>
  {
    const n = fbm( x / 30, y / 30, 51 ) * 0.7 + fbm( x / 5, y / 5, 61, 2 ) * 0.3;
    return 128 + n * 70;
  } );
  g.fillStyle = 'rgba(25,22,20,0.8)';
  g.fillRect( 0, 0, w, 3 );
  g.fillStyle = 'rgba(40,36,30,0.25)';
  g.fillRect( w * 0.3, 0, w * 0.4, h );
  return texture( c );
}

/** Glass-fibre reinforced concrete cladding for the station vault: large pale panels */
export async function vaultTexture()
{
  const s = 512;
  const { c, g } = canvas( s, s );
  await fillNoise( g, s, s, [ 0, -1, 3 ], ( x, y ) =>
  {
    const n = fbm( x / 70, y / 70, 71 ) * 0.6 + fbm( x / 6, y / 6, 81, 2 ) * 0.4;
    return 196 + n * 30;
  } );
  g.fillStyle = 'rgba(70,70,80,0.55)';
  for ( let i = 0; i <= 4; i++ )
  {
    g.fillRect( i * 128 - 2, 0, 4, s );
    g.fillRect( 0, i * 128 - 2, s, 4 );
  }
  g.fillStyle = 'rgba(255,255,255,0.35)';
  for ( let i = 0; i <= 4; i++ ) g.fillRect( i * 128 + 2, 0, 2, s );
  return texture( c );
}

export async function terrazzoTexture()
{
  const s = 512;
  const { c, g } = canvas( s, s );
  await fillNoise( g, s, s, [ 0, 0, 4 ], ( x, y ) => 186 + fbm( x / 50, y / 50, 91 ) * 26 );
  const rand = seeded( 13 );
  for ( let i = 0; i < 2600; i++ )
  {
    const shade = rand();
    g.fillStyle = shade < 0.5 ? `rgba(60,60,70,${0.4 + rand() * 0.4})` : `rgba(240,240,245,${0.5 + rand() * 0.4})`;
    g.beginPath();
    g.arc( rand() * s, rand() * s, 0.6 + rand() * 2.2, 0, Math.PI * 2 );
    g.fill();
  }
  g.fillStyle = 'rgba(40,40,48,0.35)';
  g.fillRect( 0, 0, s, 3 );
  g.fillRect( 0, 0, 3, s );
  return texture( c );
}

export function spriteTexture()
{
  const s = 64;
  const { c, g } = canvas( s, s );
  const grad = g.createRadialGradient( s / 2, s / 2, 0, s / 2, s / 2, s / 2 );
  grad.addColorStop( 0, 'rgba(255,255,255,1)' );
  grad.addColorStop( 0.35, 'rgba(255,255,255,0.45)' );
  grad.addColorStop( 1, 'rgba(255,255,255,0)' );
  g.fillStyle = grad;
  g.fillRect( 0, 0, s, s );
  return texture( c );
}

/** Painted ring marker, as tunnelling crews mark rings: here each one names a city */
export function ringSignTexture( font: string, ring: number, name: string, count: number )
{
  const w = 1024;
  const h = 400;
  const { c, g } = canvas( w, h );
  g.fillStyle = '#f7f6fb';
  g.beginPath();
  g.roundRect( 6, 6, w - 12, h - 12, 26 );
  g.fill();
  g.fillStyle = '#6950A1';
  g.fillRect( 6, 6, 46, h - 12 );
  g.fillStyle = '#7b7890';
  g.font = `700 46px ${font}`;
  g.textBaseline = 'alphabetic';
  g.fillText( `RING ${String( ring ).padStart( 2, '0' )} · CFFA ELIZABETH LINE`, 92, 92 );
  g.fillStyle = '#16142a';
  let size = 170;
  g.font = `800 ${size}px ${font}`;
  while ( g.measureText( name ).width > w - 140 && size > 80 )
  {
    size -= 8;
    g.font = `800 ${size}px ${font}`;
  }
  g.fillText( name, 88, 92 + size * 0.95 );
  g.fillStyle = '#6950A1';
  g.font = `800 64px ${font}`;
  g.fillText( `${count} 条推荐`, 92, h - 44 );
  return texture( c );
}

/** Ring-and-bar homage (not the TfL roundel) naming the unbuilt stop */
export function roundelTexture( font: string )
{
  const s = 1024;
  const { c, g } = canvas( s, s );
  g.strokeStyle = '#6950A1';
  g.lineWidth = 150;
  g.beginPath();
  g.arc( s / 2, s / 2, 330, 0, Math.PI * 2 );
  g.stroke();
  g.fillStyle = '#0019A8';
  g.fillRect( 40, s / 2 - 95, s - 80, 190 );
  g.fillStyle = '#ffffff';
  g.font = `800 112px ${font}`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText( 'CFFA · 你的站', s / 2, s / 2 + 6 );
  return texture( c );
}

export function nameBoardTexture( font: string )
{
  const w = 1600;
  const h = 360;
  const { c, g } = canvas( w, h );
  g.fillStyle = '#1b1830';
  g.fillRect( 0, 0, w, h );
  g.fillStyle = '#6950A1';
  g.fillRect( 0, h - 26, w, 26 );
  g.fillStyle = '#ffffff';
  g.font = `800 150px ${font}`;
  g.textBaseline = 'alphabetic';
  g.fillText( 'Your stop', 60, 190 );
  g.fillStyle = '#c9bdf0';
  g.font = `700 74px ${font}`;
  g.fillText( '你的站 · 下一站由你来建', 64, 296 );
  return texture( c );
}

/** Seat moquette: deep blue with a purple and teal step pattern */
export function moquetteTexture()
{
  const s = 128;
  const { c, g } = canvas( s, s );
  g.fillStyle = '#23285c';
  g.fillRect( 0, 0, s, s );
  const colors = [ '#6950A1', '#2fb3b0', '#3b4194' ];
  for ( let y = 0; y < s; y += 16 )
  {
    for ( let x = 0; x < s; x += 16 )
    {
      g.fillStyle = colors[ ( ( x + y ) / 16 ) % 3 ];
      g.fillRect( x + ( ( y / 16 ) % 2 ) * 8, y, 6, 6 );
    }
  }
  return texture( c );
}

export function stripeTexture()
{
  const { c, g } = canvas( 128, 32 );
  for ( let i = -2; i < 10; i++ )
  {
    g.fillStyle = i % 2 ? '#f2f2f2' : '#e5372e';
    g.beginPath();
    g.moveTo( i * 16, 32 );
    g.lineTo( i * 16 + 16, 32 );
    g.lineTo( i * 16 + 32, 0 );
    g.lineTo( i * 16 + 16, 0 );
    g.fill();
  }
  return texture( c );
}
