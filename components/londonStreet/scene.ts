import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { hasStandaloneShop, shopHref, SHOP_NAMES, SHOP_SLOTS, SHOP_STYLES, STREET_LOOP_SECONDS, STREET_SEGMENT_LENGTH } from './storefronts';

const INK = '#1D3557';
const PAPER = '#F3F0E7';
const RED = '#C3323A';
const BRIGHT_RED = '#E63946';
const GOLD = '#E9B949';
const BLUE = '#8DAFC2';
const BLOCK_LENGTH = STREET_SEGMENT_LENGTH;
const LOOP_SECONDS = STREET_LOOP_SECONDS;

export type LondonStreetScene = ReturnType<typeof createLondonStreetScene>;

/** Flat, unlit geometry: the street is a moving illustration, with no lighting or postprocessing. */
export function createLondonStreetScene( canvas: HTMLCanvasElement )
{
  const renderer = new THREE.WebGLRenderer( { canvas, antialias: true, alpha: true, powerPreference: 'low-power' } );
  renderer.setPixelRatio( Math.min( window.devicePixelRatio, 1.5 ) );
  renderer.setClearColor( RED, 1 );
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera( 58, 1, 0.1, 200 );
  camera.position.set( 0, 3.6, 8 );
  camera.lookAt( 0, 5.1, -60 );

  const materials = new Map<string, THREE.MeshBasicMaterial>();
  const signMaterials: THREE.MeshBasicMaterial[] = [];
  const signTextures: THREE.CanvasTexture[] = [];
  const material = ( color: string ) =>
  {
    if ( !materials.has( color ) ) materials.set( color, new THREE.MeshBasicMaterial( { color, side: THREE.DoubleSide } ) );
    return materials.get( color )!;
  };
  function mesh( parent: THREE.Group, geometry: THREE.BufferGeometry, color: string, x = 0, y = 0, z = 0 )
  {
    const object = new THREE.Mesh( geometry, material( color ) );
    object.position.set( x, y, z );
    parent.add( object );
    return object;
  }
  function box( parent: THREE.Group, w: number, h: number, d: number, x: number, y: number, z: number, color: string )
  {
    return mesh( parent, new THREE.BoxGeometry( w, h, d ), color, x, y, z );
  }
  function cylinder( parent: THREE.Group, top: number, bottom: number, height: number, x: number, y: number, z: number, color: string )
  {
    return mesh( parent, new THREE.CylinderGeometry( top, bottom, height, 20 ), color, x, y, z );
  }
  function silhouette( parent: THREE.Group, points: number[][], color: string, z = 0 )
  {
    const shape = new THREE.Shape( points.map( ( [ x, y ] ) => new THREE.Vector2( x, y ) ) );
    return mesh( parent, new THREE.ShapeGeometry( shape ), color, 0, 0, z );
  }

  function telephoneBox()
  {
    const g = new THREE.Group();
    box( g, 1.75, 3.6, 1.6, 0, 1.8, 0, BRIGHT_RED );
    box( g, 1.92, .18, 1.78, 0, .09, 0, INK );
    box( g, 1.94, .2, 1.78, 0, 3.5, 0, BRIGHT_RED );
    const roof = mesh( g, new THREE.SphereGeometry( 1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2 ), BRIGHT_RED, 0, 3.6 );
    roof.scale.set( .94, .4, .87 );
    box( g, 1.48, .38, .03, 0, 3.2, .81, PAPER );
    // The familiar crown and glazed grid remain legible without a raster texture.
    silhouette( g, [ [ -.22, 3.1 ], [ -.28, 3.3 ], [ -.08, 3.23 ], [ 0, 3.35 ], [ .08, 3.23 ], [ .28, 3.3 ], [ .22, 3.1 ] ], GOLD, .84 );
    for ( let row = 0; row < 5; row++ )
      for ( let col = 0; col < 3; col++ )
      {
        box( g, .36, .4, .025, ( col - 1 ) * .45, .65 + row * .49, .815, PAPER );
        box( g, .025, .4, .34, -.885, .65 + row * .49, ( col - 1 ) * .44, BLUE );
        box( g, .025, .4, .34, .885, .65 + row * .49, ( col - 1 ) * .44, BLUE );
      }
    box( g, .08, .25, .06, .68, 1.6, .85, INK );
    return g;
  }

  function postbox()
  {
    const g = new THREE.Group();
    cylinder( g, .62, .62, 2.35, 0, 1.18, 0, BRIGHT_RED );
    cylinder( g, .69, .69, .19, 0, 2.35, 0, BRIGHT_RED );
    cylinder( g, .69, .72, .27, 0, .14, 0, INK );
    const cap = mesh( g, new THREE.SphereGeometry( .69, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2 ), BRIGHT_RED, 0, 2.45 );
    cap.scale.y = .3;
    box( g, .67, .15, .08, 0, 1.93, .6, INK );
    box( g, .36, .45, .025, 0, 1.38, .63, PAPER );
    silhouette( g, [ [ -.2, .72 ], [ -.24, .95 ], [ -.08, .85 ], [ 0, 1.02 ], [ .08, .85 ], [ .24, .95 ], [ .2, .72 ] ], GOLD, .64 );
    return g;
  }

  function stPauls()
  {
    const g = new THREE.Group();
    box( g, 10, .5, 6, 0, .25, 0, PAPER );
    box( g, 9, 3.3, 5, 0, 2.05, 0, PAPER );
    box( g, 9.4, .22, 5.3, 0, 3.8, 0, INK );
    cylinder( g, 2.05, 2.05, 1.8, 0, 4.7, -.3, INK );
    for ( let i = 0; i < 16; i++ )
    {
      const angle = i / 16 * Math.PI * 2;
      cylinder( g, .12, .12, 1.7, Math.cos( angle ) * 2.06, 4.7, -.3 + Math.sin( angle ) * 2.06, PAPER );
    }
    cylinder( g, 2.3, 2.3, .25, 0, 5.65, -.3, PAPER );
    const dome = mesh( g, new THREE.SphereGeometry( 2.22, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2 ), BLUE, 0, 5.8, -.3 );
    dome.scale.y = 1.12;
    cylinder( g, .35, .45, .85, 0, 8.55, -.3, PAPER );
    cylinder( g, .1, .36, .5, 0, 9.2, -.3, INK );
    box( g, .12, .8, .12, 0, 9.75, -.3, GOLD );
    box( g, .5, .12, .12, 0, 9.85, -.3, GOLD );
    box( g, 5.1, 2.6, .12, 0, 1.9, 2.56, INK );
    for ( let i = 0; i < 6; i++ ) cylinder( g, .18, .2, 2.6, -2.25 + i * .9, 1.9, 2.75, PAPER );
    silhouette( g, [ [ -3, 3.35 ], [ 0, 4.75 ], [ 3, 3.35 ] ], INK, 2.8 );
    silhouette( g, [ [ -2.35, 3.52 ], [ 0, 4.48 ], [ 2.35, 3.52 ] ], PAPER, 2.82 );
    for ( const x of [ -3.7, 3.7 ] )
    {
      box( g, 1.4, 1.8, 1.6, x, 4.5, 1.4, PAPER );
      box( g, .52, .9, .05, x, 4.55, 2.22, INK );
      cylinder( g, .12, .78, 1.05, x, 5.9, 1.4, INK );
    }
    return g;
  }

  function shard()
  {
    const g = new THREE.Group();
    silhouette( g, [ [ -2.8, 0 ], [ -.5, 23 ], [ 1, 0 ] ], PAPER );
    silhouette( g, [ [ 1, 0 ], [ -.35, 24.5 ], [ 3.1, 0 ] ], BLUE, .03 );
    silhouette( g, [ [ -.4, 0 ], [ -.5, 23 ], [ .1, 0 ] ], INK, .06 );
    for ( let y = 1; y < 20; y += 1.15 )
    {
      const w = 5.6 * ( 1 - y / 24.5 );
      box( g, w, .045, .05, .12, y, .1, RED );
    }
    return g;
  }

  function walkieTalkie()
  {
    const g = new THREE.Group();
    const shoulder = 15.1;
    const halfWidth = ( y: number ) => 2.05 + 1.25 * Math.sin( Math.min( y / shoulder, 1 ) * Math.PI / 2 );
    const frontZ = ( y: number ) => 1.45 + .8 * Math.sin( y / 16.1 * Math.PI / 2 );
    const backZ = ( y: number ) => -1.65 - .45 * Math.sin( y / 16.1 * Math.PI / 2 );
    const roofHeight = ( u: number ) => shoulder + 1 - u * u;
    const front = ( u: number, y: number, offset = 0 ) => new THREE.Vector3( u * halfWidth( y ), y, frontZ( y ) + offset );

    // Indexed patches follow the same curved envelope, including mullions and side fins.
    // They retain UVs/normals so the street's existing colour batching can merge them.
    function surface( columns: number, rows: number, point: ( u: number, v: number ) => THREE.Vector3, color: string )
    {
      const positions: number[] = [];
      const uvs: number[] = [];
      const indices: number[] = [];
      for ( let row = 0; row <= rows; row++ )
        for ( let col = 0; col <= columns; col++ )
        {
          const u = col / columns;
          const v = row / rows;
          positions.push( ...point( u, v ).toArray() );
          uvs.push( u, v );
          if ( row < rows && col < columns )
          {
            const a = row * ( columns + 1 ) + col;
            const b = a + columns + 1;
            indices.push( a, b, a + 1, a + 1, b, b + 1 );
          }
        }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
      geometry.setAttribute( 'uv', new THREE.Float32BufferAttribute( uvs, 2 ) );
      geometry.setIndex( indices );
      geometry.computeVertexNormals();
      mesh( g, geometry, color );
    }

    surface( 24, 32, ( u, v ) => front( u * 2 - 1, v * roofHeight( u * 2 - 1 ) ), INK );
    surface( 24, 24, ( u, v ) =>
    {
      const y = v * roofHeight( u * 2 - 1 );
      return new THREE.Vector3( ( u * 2 - 1 ) * halfWidth( y ), y, backZ( y ) );
    }, BLUE );
    surface( 24, 6, ( u, v ) =>
    {
      const y = roofHeight( u * 2 - 1 );
      return new THREE.Vector3( ( u * 2 - 1 ) * halfWidth( y ), y, THREE.MathUtils.lerp( backZ( y ), frontZ( y ), v ) );
    }, PAPER );

    for ( const side of [ -1, 1 ] )
    {
      const sidePoint = ( depth: number, y: number, offset = 0 ) => new THREE.Vector3(
        side * ( halfWidth( y ) + offset ), y, THREE.MathUtils.lerp( backZ( y ), frontZ( y ), depth ),
      );
      surface( 1, 32, ( u, v ) => sidePoint( u, v * shoulder ), BLUE );
      for ( let rib = 0; rib <= 16; rib++ )
      {
        const depth = rib / 16;
        surface( 1, 32, ( u, v ) => sidePoint( THREE.MathUtils.clamp( depth + ( u - .5 ) * .026, 0, 1 ), v * shoulder, .035 ), PAPER );
      }
      // Thick pale jambs frame the dark front, rather than striping the entire facade.
      surface( 1, 32, ( u, v ) =>
      {
        const x = side * ( .93 + u * .07 );
        return front( x, v * roofHeight( x ), .055 );
      }, PAPER );
    }
    surface( 32, 1, ( u, v ) => front( u * 2 - 1, roofHeight( u * 2 - 1 ) - .3 + v * .3, .055 ), PAPER );

    for ( let y = .3; y < 13.45; y += .24 )
      surface( 1, 1, ( u, v ) => front( ( u * 2 - 1 ) * .927, y + v * .025, .045 ), BLUE );
    for ( let col = -7; col <= 7; col++ )
      surface( 1, 24, ( u, v ) => front( col / 8 + ( u - .5 ) * .008, v * 13.45, .04 ), BLUE );

    // A separate glazed crown sits above the office floors, under the rounded roof frame.
    surface( 1, 1, ( u, v ) => front( ( u * 2 - 1 ) * .93, 13.55 + v * .22, .06 ), PAPER );
    surface( 1, 1, ( u, v ) => front( ( u * 2 - 1 ) * .93, 13.83 + v * .22, .06 ), BLUE );
    for ( let col = -4; col <= 4; col++ )
    {
      const u = col / 5;
      const bottom = front( u, 14.15, .06 );
      const top = front( u + .08, roofHeight( u + .08 ) - .36, .06 );
      const direction = top.clone().sub( bottom );
      const middle = top.clone().add( bottom ).multiplyScalar( .5 );
      const strut = box( g, .05, direction.length(), .05, middle.x, middle.y, middle.z, BLUE );
      strut.quaternion.setFromUnitVectors( new THREE.Vector3( 0, 1, 0 ), direction.normalize() );
    }
    return g;
  }

  function britannia()
  {
    const g = new THREE.Group();
    box( g, 3.5, .45, 2.5, 0, .22, 0, PAPER );
    box( g, 2.7, 1.4, 2, 0, 1.1, 0, INK );
    box( g, 3, .2, 2.2, 0, 1.9, 0, PAPER );
    silhouette( g, [ [ -1.25, 2 ], [ -.85, 3.1 ], [ -.6, 4.8 ], [ -.95, 5.5 ], [ -.55, 6.1 ], [ .45, 6.1 ], [ .85, 5.3 ], [ .6, 3.6 ], [ 1.2, 2 ] ], BLUE, .1 );
    silhouette( g, [ [ -.5, 2 ], [ -.1, 5.3 ], [ .08, 4.1 ], [ .1, 2 ] ], PAPER, .13 );
    mesh( g, new THREE.CircleGeometry( .48, 12 ), PAPER, -.1, 6.5, .1 );
    silhouette( g, [ [ -.65, 6.65 ], [ -.48, 7.03 ], [ .05, 7.17 ], [ .5, 6.7 ] ], INK, .14 );
    silhouette( g, [ [ -.22, 7.08 ], [ -.45, 7.7 ], [ -.03, 7.82 ], [ .4, 7.2 ], [ .3, 6.95 ] ], GOLD, .12 );
    // Outstretched arm, trident and shield give the small silhouette its identity.
    silhouette( g, [ [ .3, 5.9 ], [ 1.25, 5.25 ], [ 1.8, 5.75 ], [ 1.95, 5.5 ], [ 1.3, 4.85 ], [ .25, 5.4 ] ], BLUE, .11 );
    box( g, .12, 5.7, .12, 1.9, 4.9, 0, GOLD );
    box( g, .95, .12, .12, 1.9, 7.15, 0, GOLD );
    for ( const x of [ 1.46, 1.9, 2.34 ] )
    {
      box( g, .1, .65, .12, x, 7.45, 0, GOLD );
      silhouette( g, [ [ x - .15, 7.72 ], [ x, 8 ], [ x + .15, 7.72 ] ], GOLD );
    }
    const shield = mesh( g, new THREE.CircleGeometry( 1.03, 24 ), INK, -1.05, 3.5, .25 );
    shield.scale.x = .78;
    box( g, .14, 1.9, .025, -1.05, 3.5, .3, PAPER );
    box( g, 1.5, .14, .025, -1.05, 3.5, .3, PAPER );
    return g;
  }

  function battersea()
  {
    const g = new THREE.Group();
    const brick = '#97564B';
    box( g, 12, 6.8, 7.5, 0, 3.4, 0, brick );
    box( g, 9.5, 1, 6.4, 0, 7.3, 0, INK );
    box( g, 7.8, .6, 6.2, 0, 8.1, 0, BLUE );
    for ( const x of [ -4.7, 4.7 ] )
      for ( const z of [ -2.6, 2.6 ] )
      {
        box( g, 2.1, 8.5, 2.1, x, 4.25, z, brick );
        box( g, 1.8, .8, 1.8, x, 8.7, z, INK );
        cylinder( g, .48, .65, 6.5, x, 12.35, z, PAPER );
        for ( const y of [ 9.25, 14.9, 15.4 ] ) cylinder( g, .58, .58, .12, x, y, z, '#D7CEC0' );
      }
    for ( let i = -4; i <= 4; i++ )
    {
      box( g, .35, 4.6, .06, i * 1.2, 4.1, 3.78, INK );
      box( g, .07, 4.6, .08, i * 1.2, 4.1, 3.83, PAPER );
    }
    for ( const x of [ -5.65, -3.8, 3.8, 5.65 ] ) box( g, .12, 7.5, .08, x, 4, 3.83, GOLD );
    return g;
  }

  function uclPortico()
  {
    const g = new THREE.Group();
    box( g, 13, 3.7, 4.5, 0, 2.2, -1, PAPER );
    box( g, 13.3, .24, 4.7, 0, 4.15, -1, INK );
    for ( const side of [ -1, 1 ] )
      for ( let i = 0; i < 3; i++ ) box( g, .6, 1.6, .05, side * ( 4 + i ), 2.6, 1.28, INK );
    for ( let step = 0; step < 4; step++ ) box( g, 8.5 - step * .45, .22, 3.8 - step * .6, 0, .11 + step * .22, 1.5, PAPER );
    box( g, 7.2, 4.2, .2, 0, 3, 1.35, INK );
    for ( let i = 0; i < 8; i++ )
    {
      const x = -3.3 + i * .94;
      cylinder( g, .17, .23, 4.3, x, 3.02, 2.25, PAPER );
      box( g, .54, .25, .54, x, 5.15, 2.25, PAPER );
      box( g, .5, .22, .5, x, .97, 2.25, '#D7CEC0' );
    }
    box( g, 8.3, .4, 2.1, 0, 5.5, 1.8, PAPER );
    silhouette( g, [ [ -4.35, 5.7 ], [ 0, 7.25 ], [ 4.35, 5.7 ] ], INK, 2.88 );
    silhouette( g, [ [ -3.65, 5.88 ], [ 0, 7.02 ], [ 3.65, 5.88 ] ], PAPER, 2.9 );
    const dome = mesh( g, new THREE.SphereGeometry( 1.45, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2 ), BLUE, 0, 6.5, -.4 );
    dome.scale.y = .85;
    cylinder( g, .24, .3, .75, 0, 8.05, -.4, PAPER );
    cylinder( g, 0, .32, .5, 0, 8.68, -.4, INK );
    box( g, .05, 1.4, .05, 0, 9.5, -.4, PAPER );
    for ( const [ i, color ] of [ BRIGHT_RED, GOLD, PAPER, BLUE, INK ].entries() )
      box( g, .8, .1, .03, -.4, 10.08 - i * .1, -.4, color );
    return g;
  }

  function steppedGlassTower()
  {
    const g = new THREE.Group();
    // Three overlapping, chamfered volumes preserve the reference's stepped crown.
    const tiers = [
      { x: -1.9, width: 2.4, height: 24, depth: 3.6, z: -.5 },
      { x: .3, width: 2.5, height: 21, depth: 4, z: 0 },
      { x: 2.1, width: 1.7, height: 17.8, depth: 3.5, z: .5 },
    ];
    for ( const { x, width, height, depth, z } of tiers )
    {
      box( g, width, height, depth, x, height / 2, z, BLUE );
      silhouette( g, [ [ x - width / 2, height ], [ x - width / 2, height + 1.2 ], [ x + width / 2, height + .25 ], [ x + width / 2, height ] ], INK, z + depth / 2 );
      for ( let y = .8; y < height; y += .68 ) box( g, width, .055, .04, x, y, z + depth / 2 + .02, PAPER );
      for ( let i = 0; i <= 4; i++ ) box( g, .04, height, .05, x - width / 2 + i * width / 4, height / 2, z + depth / 2 + .05, PAPER );
      box( g, .14, height, depth + .06, x - width / 2, height / 2, z, PAPER );
      for ( const y of [ 5.5, 12.5 ] ) box( g, width, .38, .05, x, y, z + depth / 2 + .08, INK );
    }
    return g;
  }

  function westminsterAbbey()
  {
    const g = new THREE.Group();
    const stone = '#D7CEC0';
    box( g, 10.2, .4, 4.4, 0, .2, 0, PAPER );
    box( g, 9.6, 6.8, 3.8, 0, 3.8, 0, PAPER );
    function arch( x: number, bottom: number, width: number, height: number, z: number )
    {
      const shape = new THREE.Shape();
      shape.moveTo( x - width / 2, bottom );
      shape.lineTo( x - width / 2, bottom + height * .65 );
      shape.quadraticCurveTo( x - width / 2, bottom + height * .84, x, bottom + height );
      shape.quadraticCurveTo( x + width / 2, bottom + height * .84, x + width / 2, bottom + height * .65 );
      shape.lineTo( x + width / 2, bottom );
      mesh( g, new THREE.ShapeGeometry( shape ), INK, 0, 0, z );
      box( g, .09, height * .85, .03, x, bottom + height * .425, z + .03, PAPER );
    }
    for ( const x of [ -3.3, 3.3 ] )
    {
      box( g, 2.8, 12.2, 3.6, x, 6.5, 0, PAPER );
      for ( const y of [ 3.8, 7, 10, 12.5 ] ) box( g, 3.1, .22, 3.9, x, y, 0, stone );
      for ( const dx of [ -1.3, 1.3 ] )
      {
        box( g, .2, 12.5, .22, x + dx, 6.65, 1.85, stone );
        for ( const z of [ -1.6, 1.6 ] ) cylinder( g, 0, .28, 2.4, x + dx, 13.65, z, PAPER );
      }
      arch( x, 7.4, 1.55, 2.35, 1.83 );
      arch( x, 10.2, 1.4, 1.8, 1.83 );
      mesh( g, new THREE.CircleGeometry( .82, 24 ), INK, x, 5.75, 1.96 );
      for ( let i = 0; i < 12; i++ )
      {
        const spoke = box( g, .045, 1.5, .03, x, 5.75, 2, GOLD );
        spoke.rotation.z = i / 12 * Math.PI;
      }
    }
    arch( 0, .5, 2.3, 2.7, 1.95 );
    arch( 0, 3.6, 3.2, 3.5, 1.95 );
    for ( const x of [ -.85, .85 ] ) box( g, .12, 2.7, .04, x, 4.95, 2.01, PAPER );
    silhouette( g, [ [ -2, 7.2 ], [ 0, 9.5 ], [ 2, 7.2 ] ], stone, 1.92 );
    silhouette( g, [ [ -1.55, 7.35 ], [ 0, 9.15 ], [ 1.55, 7.35 ] ], PAPER, 1.95 );
    arch( 0, 7.4, .6, 1.2, 1.98 );
    return g;
  }

  function gherkin()
  {
    const g = new THREE.Group();
    const profile = [ [ 2, 0 ], [ 2.55, 2 ], [ 3.05, 4 ], [ 3.3, 6 ], [ 3.3, 8 ], [ 3.1, 10 ], [ 2.7, 12 ], [ 2.05, 14 ], [ 1.1, 16 ], [ .05, 17.3 ] ];
    const point = ( ring: number, column: number ) =>
    {
      const [ radius, y ] = profile[ ring ];
      const angle = ( column + ring * .5 ) / 12 * Math.PI * 2;
      return new THREE.Vector3( Math.cos( angle ) * ( radius + .035 ), y, Math.sin( angle ) * ( radius + .035 ) );
    };
    for ( let ring = 0; ring < profile.length - 1; ring++ )
      for ( let column = 0; column < 12; column++ )
      {
        const a = point( ring, column );
        const b = point( ring + 1, column );
        const c = point( ring + 1, column + 1 );
        const d = point( ring, column + 1 );
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( [ ...a.toArray(), ...b.toArray(), ...c.toArray(), ...d.toArray() ], 3 ) );
        geometry.setAttribute( 'uv', new THREE.Float32BufferAttribute( [ 0, 0, 0, 1, 1, 1, 1, 0 ], 2 ) );
        geometry.setIndex( [ 0, 1, 2, 0, 2, 3 ] );
        geometry.computeVertexNormals();
        mesh( g, geometry, column % 3 === 0 ? INK : BLUE );
        for ( const target of [ b, point( ring + 1, column - 1 ) ] )
        {
          const direction = target.clone().sub( a );
          const midpoint = a.clone().add( target ).multiplyScalar( .5 );
          const strut = box( g, .045, direction.length(), .045, midpoint.x, midpoint.y, midpoint.z, PAPER );
          strut.quaternion.setFromUnitVectors( new THREE.Vector3( 0, 1, 0 ), direction.normalize() );
        }
      }
    cylinder( g, 2.05, 2.05, .3, 0, .15, 0, INK );
    return g;
  }

  function building( side: number, index: number )
  {
    const g = new THREE.Group();
    const height = [ 12, 16, 10, 14 ][ index % 4 ];
    const facade = index % 3 === 1 ? PAPER : INK;
    const windowColor = facade === PAPER ? INK : PAPER;
    box( g, 7, height, 9, 0, height / 2, 0, facade );
    box( g, 7.3, .28, 9.3, 0, height - .4, 0, facade );
    for ( let row = 0; row < Math.floor( height / 2.4 ); row++ )
      for ( let col = 0; col < 3; col++ )
      {
        box( g, .04, 1.15, .85, -side * 3.52, 1.8 + row * 2.3, ( col - 1 ) * 2.5, windowColor );
        box( g, 1, 1.15, .04, ( col - 1 ) * 2, 1.8 + row * 2.3, 4.52, windowColor );
      }
    box( g, .06, height, .08, -side * 3.56, height / 2, 4.6, BLUE );
    return g;
  }

  const block = new THREE.Group();
  const replacementFacades = new Map<string, { create: () => THREE.Group; setback: number }>( [
    [ '-1:1', { create: battersea, setback: 14 } ],
    [ '-1:5', { create: gherkin, setback: 11.5 } ],
    [ '1:1', { create: uclPortico, setback: 14 } ],
    [ '1:3', { create: westminsterAbbey, setback: 12.5 } ],
    [ '1:7', { create: steppedGlassTower, setback: 12 } ],
  ] );
  for ( const side of [ -1, 1 ] )
    for ( let i = 0; i < 8; i++ )
    {
      // Leave real gaps for the landmark silhouettes instead of hiding them behind facades.
      if ( ( side === -1 && ( i === 2 || i === 3 ) ) || ( side === 1 && ( i === 5 || i === 6 ) ) ) continue;
      const replacement = replacementFacades.get( `${side}:${i}` );
      // Ordinary buildings differ between the two shop segments and are added below.
      if ( !replacement ) continue;
      const facade = replacement.create();
      facade.rotation.y = -side * .2;
      facade.position.set( side * replacement.setback, 0, -i * 13.5 );
      block.add( facade );
    }
  const landmarks = [
    { object: telephoneBox(), x: -6.6, z: -3, rotation: .2 },
    { object: postbox(), x: 6.3, z: -17, rotation: -.2 },
    { object: stPauls(), x: -14, z: -34, rotation: .22 },
    { object: britannia(), x: 7.5, z: -48, rotation: -.15 },
    { object: walkieTalkie(), x: 12.5, z: -74, rotation: -.72 },
    { object: shard(), x: -13, z: -87, rotation: .1 },
  ];
  for ( const { object, x, z, rotation } of landmarks )
  {
    object.position.set( x, 0, z );
    object.rotation.y = rotation;
    block.add( object );
  }

  // Bake each colour into one mesh. Repeated windows do not become hundreds of draw calls.
  block.updateMatrixWorld( true );
  const byMaterial = new Map<THREE.Material, THREE.BufferGeometry[]>();
  block.traverse( object =>
  {
    if ( !( object instanceof THREE.Mesh ) ) return;
    const geometry = object.geometry.clone().applyMatrix4( object.matrixWorld );
    const list = byMaterial.get( object.material ) ?? [];
    list.push( geometry );
    byMaterial.set( object.material, list );
    object.geometry.dispose();
  } );
  const street = new THREE.Group();
  for ( const [ surface, geometries ] of byMaterial )
  {
    street.add( new THREE.Mesh( mergeGeometries( geometries ), surface ) );
    geometries.forEach( geometry => geometry.dispose() );
  }
  function storefronts( segment: number )
  {
    const shops = new THREE.Group();
    const occupiedBays = new Set<string>();
    for ( const { side, bay } of SHOP_SLOTS )
    {
      const key = `${side}:${bay}`;
      if ( occupiedBays.has( key ) || hasStandaloneShop( segment, side, bay ) ) continue;
      occupiedBays.add( key );
      const moveFromShard = side === -1 && bay === 6;
      const facade = building( moveFromShard ? 1 : side, bay );
      // Preserve the low neighbours beside the Abbey and Gherkin.
      if ( ( side === -1 && bay === 4 ) || ( side === 1 && bay === 2 ) ) facade.scale.y = .35;
      // Keep Shard's approach clear; place this neighbour between the two right-hand towers.
      facade.position.set( moveFromShard ? 16 : side * 14, 0, moveFromShard ? -84 : -bay * 13.5 );
      shops.add( facade );
    }
    const font = getComputedStyle( document.body ).getPropertyValue( '--font-noto-sans-sc' ).trim() || 'sans-serif';
    SHOP_SLOTS.forEach( ( { side, bay, offset, width }, slot ) =>
    {
      const index = segment * SHOP_SLOTS.length + slot;
      const name = SHOP_NAMES[ index ];
      const style = SHOP_STYLES[ index % SHOP_STYLES.length ];
      const accent = [ INK, '#38675E', RED, '#8B651D' ][ index % 4 ];
      const shop = new THREE.Group();
      box( shop, width, 3.3, 1.5, 0, 1.65, 0, accent );
      box( shop, width + .15, .15, 1.8, 0, .075, .1, PAPER );
      // Two display windows flank a glazed door; all lettering stays on the shop's own sign.
      const windowWidth = ( width - 1.65 ) / 2;
      for ( const direction of [ -1, 1 ] )
      {
        const x = direction * ( .62 + windowWidth / 2 );
        box( shop, windowWidth, 1.85, .06, x, 1.45, .78, BLUE );
        box( shop, windowWidth, .12, .08, x, 1.0, .83, PAPER );
        box( shop, .045, 1.85, .08, x, 1.45, .83, PAPER );
      }
      box( shop, .85, 2.25, .08, 0, 1.3, .79, INK );
      box( shop, .64, 1.65, .04, 0, 1.46, .85, BLUE );
      box( shop, .055, .27, .05, .27, 1.25, .9, GOLD );

      const signCanvas = document.createElement( 'canvas' );
      const square = style === 'hanging';
      const signWidth = square ? 1.55 : width - .16;
      const signHeight = square ? 1.55 : .82;
      signCanvas.width = square ? 512 : 1024;
      signCanvas.height = Math.round( signCanvas.width * signHeight / signWidth );
      const context = signCanvas.getContext( '2d' )!;
      context.fillStyle = accent;
      context.fillRect( 0, 0, signCanvas.width, signCanvas.height );
      context.strokeStyle = PAPER;
      context.lineWidth = 5;
      context.strokeRect( 15, 15, signCanvas.width - 30, signCanvas.height - 30 );
      context.fillStyle = PAPER;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      const lines = name === 'Chef Javad Persian' ? [ 'Chef Javad', 'Persian' ]
        : ( square && name.includes( ' ' ) ? name.split( ' ' ) : [ name ] );
      let fontSize = square ? 105 : Math.min( 108, signCanvas.height / ( lines.length > 1 ? 3 : 1.7 ) );
      context.font = `600 ${fontSize}px ${font}, sans-serif`;
      while ( Math.max( ...lines.map( line => context.measureText( line ).width ) ) > signCanvas.width - 75 )
      {
        fontSize -= 2;
        context.font = `600 ${fontSize}px ${font}, sans-serif`;
      }
      lines.forEach( ( line, lineIndex ) => context.fillText( line, signCanvas.width / 2, signCanvas.height / 2 + ( lineIndex - ( lines.length - 1 ) / 2 ) * fontSize * 1.2 ) );
      const texture = new THREE.CanvasTexture( signCanvas );
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = Math.min( renderer.capabilities.getMaxAnisotropy(), 4 );
      const signMaterial = new THREE.MeshBasicMaterial( { map: texture } );
      signTextures.push( texture );
      signMaterials.push( signMaterial );
      const sign = new THREE.Mesh( new THREE.PlaneGeometry( signWidth, signHeight ), signMaterial );
      sign.position.set( 0, square ? 2.7 : 2.87, square ? 1.9 : .8 );
      if ( square )
      {
        // A projecting bracket faces arriving visitors, rather than flattening against the wall.
        box( shop, .1, .1, 1.4, 0, 3.53, 1.35, INK );
        box( shop, .08, .3, .08, 0, 3.4, 1.9, INK );
        sign.rotation.y = side * Math.PI / 6;
      }
      shop.add( sign );
      if ( style === 'awning' && name !== 'Chef Javad Persian' )
      {
        const canopy = new THREE.Group();
        for ( let stripe = 0; stripe < 8; stripe++ )
        {
          const stripeWidth = width / 8;
          box( canopy, stripeWidth, .07, 1.1, -width / 2 + ( stripe + .5 ) * stripeWidth, 0, 0, stripe % 2 ? PAPER : accent );
          box( shop, stripeWidth, .2, .07, -width / 2 + ( stripe + .5 ) * stripeWidth, 2.34, 1.72, stripe % 2 ? PAPER : accent );
        }
        canopy.rotation.x = .23;
        canopy.position.set( 0, 2.56, 1.2 );
        shop.add( canopy );
      }
      shop.rotation.y = -side * Math.PI / 3;
      shop.position.set( side * 10.9, 0, -bay * 13.5 + offset );
      shop.traverse( object => { object.userData.href = shopHref( index ); } );
      shops.add( shop );
    } );
    // Batch storefront geometry too; each unique text texture remains its own material.
    shops.updateMatrixWorld( true );
    const surfaces = new Map<string, { material: THREE.Material; geometries: THREE.BufferGeometry[]; href?: string }>();
    shops.traverse( object =>
    {
      if ( !( object instanceof THREE.Mesh ) ) return;
      const href = object.userData.href as string | undefined;
      const key = `${object.material.uuid}:${href ?? ''}`;
      const surface = surfaces.get( key ) ?? { material: object.material, geometries: [] as THREE.BufferGeometry[], href };
      surface.geometries.push( object.geometry.clone().applyMatrix4( object.matrixWorld ) );
      surfaces.set( key, surface );
      object.geometry.dispose();
    } );
    const baked = new THREE.Group();
    for ( const { material: surface, geometries, href } of surfaces.values() )
    {
      const mesh = new THREE.Mesh( mergeGeometries( geometries ), surface );
      mesh.userData.href = href;
      baked.add( mesh );
      geometries.forEach( geometry => geometry.dispose() );
    }
    return baked;
  }

  const shopSegments = [ storefronts( 0 ), storefronts( 1 ) ];
  const blocks = [ street, street.clone(), street.clone(), street.clone() ];
  blocks.forEach( ( item, index ) => item.add( shopSegments[ index % 2 ].clone() ) );
  blocks.forEach( item => scene.add( item ) );

  const ground = new THREE.Group();
  box( ground, 300, .1, 500, 0, -.15, -120, RED );
  box( ground, 10, .08, 500, 0, -.05, -120, PAPER );
  box( ground, .16, .025, 500, 0, .01, -120, RED );
  for ( const side of [ -1, 1 ] )
  {
    box( ground, 4.8, .14, 500, side * 7.5, -.02, -120, '#D7CEC0' );
    box( ground, .14, .16, 500, side * 5.1, 0, -120, PAPER );
    box( ground, .14, .02, 500, side * 4.55, .01, -120, '#4A80C4' );
  }
  scene.add( ground );
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const shopMeshes: THREE.Mesh[] = [];
  const occluders: THREE.Mesh[] = [];
  scene.traverse( object =>
  {
    if ( !( object instanceof THREE.Mesh ) ) return;
    if ( !object.geometry.boundingBox ) object.geometry.computeBoundingBox();
    ( object.userData.href ? shopMeshes : occluders ).push( object );
  } );
  const worldBounds = new THREE.Box3();
  const entryPoint = new THREE.Vector3();

  function possibleHits( meshes: THREE.Mesh[], maxDistance = Infinity )
  {
    return meshes.filter( mesh =>
    {
      worldBounds.copy( mesh.geometry.boundingBox! ).applyMatrix4( mesh.matrixWorld );
      const entry = raycaster.ray.intersectBox( worldBounds, entryPoint );
      return entry !== null && entry.distanceTo( raycaster.ray.origin ) <= maxDistance;
    } );
  }

  function render( elapsed: number )
  {
    const distance = ( elapsed % LOOP_SECONDS ) / LOOP_SECONDS * BLOCK_LENGTH * 2;
    blocks.forEach( ( item, index ) => { item.position.z = distance - index * BLOCK_LENGTH; } );
    renderer.render( scene, camera );
  }

  return {
    render,
    hrefAt( clientX: number, clientY: number ): string | undefined
    {
      const bounds = canvas.getBoundingClientRect();
      pointer.set( ( clientX - bounds.left ) / bounds.width * 2 - 1, -( clientY - bounds.top ) / bounds.height * 2 + 1 );
      raycaster.setFromCamera( pointer, camera );
      raycaster.far = camera.far;
      const hit = raycaster.intersectObjects( possibleHits( shopMeshes ), false )[ 0 ];
      if ( !hit ) return undefined;
      // Only check blockers when a shop is actually hit, and only as far as that shop.
      raycaster.far = hit.distance;
      const blocker = raycaster.intersectObjects( possibleHits( occluders, hit.distance ), false )[ 0 ];
      return blocker && blocker.distance < hit.distance ? undefined : hit.object.userData.href;
    },
    resize( width: number, height: number )
    {
      renderer.setSize( width, height, false );
      camera.aspect = width / height;
      camera.fov = width < 640 ? 76 : 58;
      camera.updateProjectionMatrix();
    },
    dispose()
    {
      const geometries = new Set<THREE.BufferGeometry>();
      scene.traverse( object => { if ( object instanceof THREE.Mesh ) geometries.add( object.geometry ); } );
      geometries.forEach( geometry => geometry.dispose() );
      materials.forEach( surface => surface.dispose() );
      signMaterials.forEach( surface => surface.dispose() );
      signTextures.forEach( texture => texture.dispose() );
      renderer.dispose();
    },
  };
}
