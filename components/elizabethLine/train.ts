import * as THREE from 'three';
import { mergeStatic, slidingRig } from './merge';

// An Elizabeth line train in the spirit of the Class 345: white body, purple doors,
// dark wrap-around windscreen, yellow warning panel. Local frame: z = 0 at the cab tip,
// cars extend towards +z, y = 0 at rail top.

const BODY_Y = 0.55;
const HALF_W = 1.45;
const NOSE_LEN = 2.1;
export const CAR_LEN = 13;
const CAR_GAP = 0.6;

type Region = 'skirt' | 'white' | 'window' | 'roof';
type ProfilePoint = { x: number; y: number; region: Region };

const WHITE = new THREE.Color( 0xf2f2f5 );
const SKIRT = new THREE.Color( 0x3a3d44 );
const WINDOW = new THREE.Color( 0x10131a );
const ROOF = new THREE.Color( 0xc5c8cf );
const YELLOW = new THREE.Color( 0xf3c316 );

/** Cross-section, right side bottom to top then left side down; repeated points make hard colour edges */
function profile(): ProfilePoint[]
{
  const right: ProfilePoint[] = [
    { x: 0, y: 0, region: 'skirt' },
    { x: 1.2, y: 0, region: 'skirt' },
    { x: 1.38, y: 0.06, region: 'skirt' },
    { x: 1.45, y: 0.22, region: 'skirt' },
    { x: 1.45, y: 0.5, region: 'skirt' },
    { x: 1.45, y: 0.5, region: 'white' },
    { x: 1.45, y: 1.42, region: 'white' },
    { x: 1.45, y: 1.42, region: 'window' },
    { x: 1.45, y: 2.2, region: 'window' },
    { x: 1.45, y: 2.2, region: 'white' },
    { x: 1.43, y: 2.45, region: 'white' },
    { x: 1.37, y: 2.72, region: 'white' },
    { x: 1.24, y: 2.94, region: 'white' },
    { x: 1.06, y: 3.08, region: 'white' },
    { x: 1.06, y: 3.08, region: 'roof' },
    { x: 0.62, y: 3.24, region: 'roof' },
    { x: 0.22, y: 3.31, region: 'roof' },
  ];
  const left = right.slice( 1 ).reverse().map( p => ( { ...p, x: -p.x } ) );
  return [ ...right, { x: 0, y: 3.32, region: 'roof' }, ...left ];
}

/** s = 0 on the body, 1 at the cab tip: narrower, with the top raked back */
function noseShape( p: ProfilePoint, s: number )
{
  const x = p.x * ( 1 - 0.13 * Math.pow( s, 2.2 ) );
  let y = p.y;
  if ( y > 1.0 ) y = 1.0 + ( y - 1.0 ) * ( 1 - 0.5 * Math.pow( s, 1.6 ) );
  if ( y < 0.3 ) y += 0.18 * Math.pow( s, 3 );
  return { x, y };
}

function noseColor( p: ProfilePoint, s: number )
{
  if ( p.region === 'skirt' ) return SKIRT;
  // Black visor wrapping round the cab, white dome above it
  if ( s > 0.04 && p.y >= 1.42 && p.y < 2.5 ) return WINDOW;
  if ( s > 0.45 && p.y >= 0.5 && p.y < 1.42 ) return YELLOW;
  return p.region === 'window' ? WINDOW : p.region === 'roof' ? ROOF : WHITE;
}

function bodyColor( p: ProfilePoint )
{
  return p.region === 'skirt' ? SKIRT : p.region === 'window' ? WINDOW : p.region === 'roof' ? ROOF : WHITE;
}

// Strips of the profile that make up the flat right-hand side (y 0.5 to 2.2)
const RIGHT_SIDE_STRIPS = new Set( [ 4, 5, 6, 7, 8 ] );

/** Lofts the profile through a list of sections; optional fan caps at both ends.
 *  The flat right-hand side is left open between body sections, for a panel with door openings. */
function loft( sections: { z: number; s: number }[], withNose: boolean )
{
  const prof = profile();
  const n = prof.length;
  const positions: number[] = [];
  const colors: number[] = [];
  const index: number[] = [];

  for ( const { z, s } of sections )
  {
    for ( const p of prof )
    {
      const { x, y } = withNose ? noseShape( p, s ) : p;
      positions.push( x, y + BODY_Y, z );
      const col = withNose ? noseColor( p, s ) : bodyColor( p );
      colors.push( col.r, col.g, col.b );
    }
  }
  for ( let i = 0; i < sections.length - 1; i++ )
  {
    const bodyOnly = sections[ i ].s === 0 && sections[ i + 1 ].s === 0;
    for ( let j = 0; j < n; j++ )
    {
      if ( bodyOnly && RIGHT_SIDE_STRIPS.has( j ) ) continue;
      const a = i * n + j;
      const b = i * n + ( ( j + 1 ) % n );
      const c = ( i + 1 ) * n + j;
      const d = ( i + 1 ) * n + ( ( j + 1 ) % n );
      index.push( a, c, b, b, c, d );
    }
  }
  // Caps: a slightly domed centre for the cab tip, flat at the far end
  const cap = ( ring: number, z: number, y: number, color: THREE.Color ) =>
  {
    const centre = positions.length / 3;
    positions.push( 0, y + BODY_Y, z );
    colors.push( color.r, color.g, color.b );
    for ( let j = 0; j < n; j++ ) index.push( centre, ring * n + ( ( j + 1 ) % n ), ring * n + j );
  };
  cap( 0, sections[ 0 ].z - ( withNose ? 0.16 : 0 ), withNose ? 1.0 : 1.6, withNose ? YELLOW : WHITE );
  cap( sections.length - 1, sections[ sections.length - 1 ].z, 1.6, WHITE );

  const geo = new THREE.BufferGeometry();
  geo.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
  geo.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
  geo.setIndex( index );
  geo.computeVertexNormals();
  return geo;
}

export type Train = {
  group: THREE.Group;
  headLight: THREE.SpotLight;
  /** Where the cabin light hangs, just inside the first door; the scene owns the light itself */
  cabinLightAt: THREE.Vector3;
  /** z of each door centre (right-hand side) relative to the cab tip */
  doorZ: number[];
  update: ( doorOpen: number ) => void;
};

export function buildTrain( beamMaterial: THREE.Material, textures: { moquette: THREE.Texture } ): Train
{
  const group = new THREE.Group();

  // Standard rather than clear-coated paint: a second specular layer costs a lot of fill rate for little visible gain
  const paint = new THREE.MeshStandardMaterial( { vertexColors: true, roughness: 0.26, metalness: 0.05, side: THREE.DoubleSide } );
  const purple = new THREE.MeshStandardMaterial( { color: 0x6950a1, roughness: 0.28 } );
  const doorGlass = new THREE.MeshStandardMaterial( { color: 0x0b0e14, roughness: 0.06, metalness: 0.9 } );
  const windowBay = new THREE.MeshStandardMaterial( { color: 0x0e1118, emissive: 0xffdcae, emissiveIntensity: 0.32, roughness: 0.08, metalness: 0.85 } );
  const under = new THREE.MeshStandardMaterial( { color: 0x23252a, roughness: 0.75, metalness: 0.3 } );
  const steel = new THREE.MeshStandardMaterial( { color: 0x9aa0a8, roughness: 0.35, metalness: 0.9 } );
  const lamp = new THREE.MeshStandardMaterial( { color: 0xffffff, emissive: 0xfff3dc, emissiveIntensity: 9 } );
  const sidePaint = new THREE.MeshStandardMaterial( { color: 0xf2f2f5, roughness: 0.26, metalness: 0.05, side: THREE.DoubleSide } );
  const floorMat = new THREE.MeshStandardMaterial( { color: 0x4a4b52, roughness: 0.85 } );
  const ceilingMat = new THREE.MeshStandardMaterial( { color: 0xe9e8ee, roughness: 0.6 } );
  const lightStrip = new THREE.MeshStandardMaterial( { color: 0xffffff, emissive: 0xfff4e4, emissiveIntensity: 2.2 } );
  const moquette = new THREE.MeshStandardMaterial( { map: textures.moquette, roughness: 0.95 } );
  const seatShell = new THREE.MeshStandardMaterial( { color: 0x8b8d95, roughness: 0.5, metalness: 0.4 } );

  const doorZ: number[] = [];
  // Only the platform-side leaves open; everything else is merged into static meshes
  const leaves: { baseZ: number; dir: number }[] = [];

  const wheelGeo = new THREE.CylinderGeometry( 0.42, 0.42, 0.13, 28 ).rotateZ( Math.PI / 2 );
  const leafGeo = new THREE.BoxGeometry( 0.05, 1.86, 0.68 );
  const leafWindowGeo = new THREE.BoxGeometry( 0.06, 0.82, 0.4 );
  const bayGeo = new THREE.BoxGeometry( 0.04, 0.72, 1 );

  const carStarts = [ 0, CAR_LEN + CAR_GAP ];
  carStarts.forEach( ( z0, car ) =>
  {
    const front = car === 0;
    const sections = front
      ? [
        ...[ 1, 0.96, 0.9, 0.8, 0.66, 0.5, 0.33, 0.17, 0.06, 0 ].map( s => ( { z: z0 + NOSE_LEN * ( 1 - s ), s } ) ),
        { z: z0 + CAR_LEN, s: 0 },
      ]
      : [ { z: z0, s: 0 }, { z: z0 + CAR_LEN, s: 0 } ];
    group.add( new THREE.Mesh( loft( sections, front ), paint ) );

    // Three double doors per side, windows between them
    const doors = front ? [ 3.9, 7.7, 11.3 ] : [ 1.7, 6.5, 11.3 ];
    const bodyFrom = z0 + ( front ? NOSE_LEN : 0 );
    const bodyTo = z0 + CAR_LEN;

    // Right-hand side panel with real door openings (platform side)
    const panel = new THREE.Shape();
    panel.moveTo( bodyFrom, BODY_Y + 0.5 );
    panel.lineTo( bodyTo, BODY_Y + 0.5 );
    panel.lineTo( bodyTo, BODY_Y + 2.2 );
    panel.lineTo( bodyFrom, BODY_Y + 2.2 );
    panel.lineTo( bodyFrom, BODY_Y + 0.5 );
    for ( const dz of doors )
    {
      const hole = new THREE.Path();
      hole.moveTo( z0 + dz - 0.7, BODY_Y + 0.53 );
      hole.lineTo( z0 + dz - 0.7, BODY_Y + 2.17 );
      hole.lineTo( z0 + dz + 0.7, BODY_Y + 2.17 );
      hole.lineTo( z0 + dz + 0.7, BODY_Y + 0.53 );
      hole.lineTo( z0 + dz - 0.7, BODY_Y + 0.53 );
      panel.holes.push( hole );
    }
    group.add( new THREE.Mesh( new THREE.ShapeGeometry( panel ).rotateY( -Math.PI / 2 ).translate( HALF_W, 0, 0 ), sidePaint ) );

    // Interior: floor, ceiling with light strips, longitudinal seats, grab poles and rails
    const len = bodyTo - bodyFrom;
    const mid = ( bodyFrom + bodyTo ) / 2;
    const floor = new THREE.Mesh( new THREE.BoxGeometry( 2.8, 0.05, len ), floorMat );
    floor.position.set( 0, BODY_Y + 0.52, mid );
    group.add( floor );
    const ceiling = new THREE.Mesh( new THREE.BoxGeometry( 2.5, 0.04, len ), ceilingMat );
    ceiling.position.set( 0, BODY_Y + 2.85, mid );
    group.add( ceiling );
    for ( const x of [ -0.7, 0.7 ] )
    {
      const strip = new THREE.Mesh( new THREE.BoxGeometry( 0.22, 0.03, len - 0.6 ), lightStrip );
      strip.position.set( x, BODY_Y + 2.82, mid );
      group.add( strip );
      const rail = new THREE.Mesh( new THREE.CylinderGeometry( 0.022, 0.022, len - 0.4, 8 ).rotateX( Math.PI / 2 ), steel );
      rail.position.set( x * 1.15, BODY_Y + 2.45, mid );
      group.add( rail );
    }
    const gaps = [ bodyFrom - z0 + 0.25, ...doors.flatMap( d => [ d - 0.9, d + 0.9 ] ), CAR_LEN - 0.25 ];
    for ( let i = 0; i < gaps.length; i += 2 )
    {
      const a = gaps[ i ];
      const b = gaps[ i + 1 ];
      if ( b - a < 0.8 ) continue;
      for ( const sx of [ -1, 1 ] )
      {
        const seat = new THREE.Mesh( new THREE.BoxGeometry( 0.5, 0.14, b - a - 0.1 ), moquette );
        seat.position.set( sx * 1.1, BODY_Y + 0.98, z0 + ( a + b ) / 2 );
        group.add( seat );
        const back = new THREE.Mesh( new THREE.BoxGeometry( 0.1, 0.6, b - a - 0.1 ), moquette );
        back.position.set( sx * 1.36, BODY_Y + 1.32, z0 + ( a + b ) / 2 );
        group.add( back );
        const base = new THREE.Mesh( new THREE.BoxGeometry( 0.4, 0.42, b - a - 0.3 ), seatShell );
        base.position.set( sx * 1.12, BODY_Y + 0.73, z0 + ( a + b ) / 2 );
        group.add( base );
      }
    }
    const poleGeo = new THREE.CylinderGeometry( 0.025, 0.025, 2.3, 10 );
    for ( const dz of doors )
    {
      for ( const [ x, oz ] of [ [ 0.85, -0.8 ], [ 0.85, 0.8 ], [ -0.85, -0.8 ], [ -0.85, 0.8 ], [ 0, 0 ] ] )
      {
        const pole = new THREE.Mesh( poleGeo, steel );
        pole.position.set( x, BODY_Y + 1.68, z0 + dz + oz );
        group.add( pole );
      }
    }
    for ( const dz of doors )
    {
      const z = z0 + dz;
      doorZ.push( z );
      for ( const side of [ -1, 1 ] )
      {
        for ( const dir of [ -1, 1 ] )
        {
          if ( side > 0 )
          {
            leaves.push( { baseZ: z + dir * 0.35, dir } );
            continue;
          }
          const leaf = new THREE.Mesh( leafGeo, purple );
          leaf.position.set( side * ( HALF_W + 0.03 ), BODY_Y + 1.42, z + dir * 0.35 );
          group.add( leaf );
          const glassPane = new THREE.Mesh( leafWindowGeo, doorGlass );
          glassPane.position.set( side * ( HALF_W + 0.04 ), BODY_Y + 1.8, z + dir * 0.35 );
          group.add( glassPane );
        }
      }
    }
    const edges = [ front ? NOSE_LEN + 0.3 : 0.3, ...doors.flatMap( d => [ d - 0.85, d + 0.85 ] ), CAR_LEN - 0.3 ];
    for ( let i = 0; i < edges.length; i += 2 )
    {
      const a = edges[ i ];
      const b = edges[ i + 1 ];
      if ( b - a < 0.6 ) continue;
      for ( const side of [ -1, 1 ] )
      {
        const bay = new THREE.Mesh( bayGeo, windowBay );
        bay.scale.z = b - a - 0.25;
        bay.position.set( side * ( HALF_W + 0.015 ), BODY_Y + 1.82, z0 + ( a + b ) / 2 );
        group.add( bay );
      }
    }

    // Underframe and bogies
    const box = new THREE.Mesh( new THREE.BoxGeometry( 2.3, 0.42, CAR_LEN - 5.5 ), under );
    box.position.set( 0, BODY_Y - 0.1, z0 + CAR_LEN / 2 );
    group.add( box );
    for ( const bz of [ 2.6, CAR_LEN - 2.4 ] )
    {
      const frame = new THREE.Mesh( new THREE.BoxGeometry( 2.0, 0.34, 2.4 ), under );
      frame.position.set( 0, 0.5, z0 + bz );
      group.add( frame );
      for ( const wz of [ -0.85, 0.85 ] )
      {
        for ( const wx of [ -0.8, 0.8 ] )
        {
          // Plain round wheels look the same turning or not, so they stay static
          const wheel = new THREE.Mesh( wheelGeo, steel );
          wheel.position.set( wx, 0.42, z0 + bz + wz );
          group.add( wheel );
        }
      }
    }

    if ( !front )
    {
      // Pantograph reaching up to the overhead conductor beam
      const base = new THREE.Mesh( new THREE.BoxGeometry( 1.0, 0.12, 1.4 ), under );
      base.position.set( 0, BODY_Y + 3.34, z0 + 6 );
      group.add( base );
      const armGeo = new THREE.BoxGeometry( 0.06, 0.06, 1.1 );
      const lower = new THREE.Mesh( armGeo, steel );
      lower.position.set( 0, BODY_Y + 3.62, z0 + 6.3 );
      lower.rotation.x = 0.55;
      group.add( lower );
      const upper = new THREE.Mesh( armGeo, steel );
      upper.position.set( 0, BODY_Y + 3.92, z0 + 6.05 );
      upper.rotation.x = -0.65;
      group.add( upper );
      const head = new THREE.Mesh( new THREE.BoxGeometry( 1.5, 0.05, 0.12 ), steel );
      head.position.set( 0, BODY_Y + 4.25, z0 + 5.75 );
      group.add( head );
    }
    else
    {
      // Gangway to the next car
      const gang = new THREE.Mesh( new THREE.BoxGeometry( 1.4, 2.4, CAR_GAP + 0.2 ), under );
      gang.position.set( 0, BODY_Y + 1.6, z0 + CAR_LEN + CAR_GAP / 2 );
      group.add( gang );
    }
  } );

  // Headlights low on the yellow panel, just proud of the nose surface
  const lampGeo = new THREE.CircleGeometry( 0.13, 24 );
  for ( const x of [ -0.82, 0.82 ] )
  {
    const head = new THREE.Mesh( lampGeo, lamp );
    head.position.set( x, BODY_Y + 0.82, -0.12 );
    head.rotation.y = Math.PI;
    group.add( head );
  }

  // Real light from the cab, plus faint visible beams in the dusty air
  const headLight = new THREE.SpotLight( 0xfff3e2, 140, 48, 0.42, 0.7, 1.3 );
  headLight.position.set( 0, BODY_Y + 0.9, -0.2 );
  headLight.target.position.set( 0, 0.2, -30 );
  group.add( headLight, headLight.target );
  const beamGeo = new THREE.ConeGeometry( 1.7, 14, 32, 1, true ).translate( 0, -7, 0 ).rotateX( Math.PI / 2 );
  for ( const x of [ -0.82, 0.82 ] )
  {
    const beam = new THREE.Mesh( beamGeo, beamMaterial );
    beam.position.set( x, BODY_Y + 0.82, 0 );
    beam.rotation.x = 0.04;
    group.add( beam );
  }

  const cabinLightAt = new THREE.Vector3( -0.3, BODY_Y + 2.3, doorZ[ 0 ] );

  mergeStatic( group );
  const glassOffset = new THREE.Vector3( 0.01, 0.38, 0 );
  const rig = slidingRig( [ { geometry: leafGeo, material: purple }, { geometry: leafWindowGeo, material: doorGlass, offset: () => glassOffset } ], leaves.length );
  group.add( ...rig.meshes );
  let lastDoorOpen = Number.NaN;
  const update = ( doorOpen: number ) =>
  {
    if ( doorOpen === lastDoorOpen ) return;
    lastDoorOpen = doorOpen;
    // Plug doors: step out, then slide apart (platform side only)
    const out = Math.min( doorOpen / 0.25, 1 );
    const slide = Math.max( ( doorOpen - 0.25 ) / 0.75, 0 );
    leaves.forEach( ( leaf, i ) => rig.place( i, HALF_W + 0.03 + out * 0.06, BODY_Y + 1.42, leaf.baseZ + leaf.dir * slide * 0.66 ) );
  };
  update( 0 );

  return { group, headLight, cabinLightAt, doorZ, update };
}
