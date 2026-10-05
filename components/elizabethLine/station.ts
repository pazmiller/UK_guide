import * as THREE from 'three';
import { mergeStatic, slidingRig } from './merge';

// The unfinished Elizabeth line station at the end of the line. Headwall at z = start,
// the station runs towards -z. Track at x = 0, platform on the +x side.

export const STATION_LEN = 40;
const PLATFORM_TOP = -1.25;
const PSD_X = 1.78;

/** Where the station's own lights hang; the scene moves its roaming lights here on arrival */
export const STATION_LIGHTS = [ { dz: -6, intensity: 8 }, { dz: -17, intensity: 10 }, { dz: -29, intensity: 8 } ];
export const STATION_LIGHT_X = 3.6;
export const STATION_LIGHT_Y = 3.0;

export type Station = {
  group: THREE.Group;
  glowMaterials: THREE.MeshStandardMaterial[];
  update: ( lit: number, doorOpen: number ) => void;
};

type Textures = {
  vault: THREE.Texture;
  terrazzo: THREE.Texture;
  roundel: THREE.Texture;
  nameBoard: THREE.Texture;
  stripes: THREE.Texture;
};

export function buildStation( start: number, radius: number, doorWorldZ: number[], textures: Textures ): Station
{
  const group = new THREE.Group();
  const end = start - STATION_LEN;
  const mid = ( start + end ) / 2;

  const vaultTex = textures.vault.clone();
  vaultTex.repeat.set( 6, 5 );
  const vault = new THREE.Mesh(
    new THREE.CylinderGeometry( 8, 8, STATION_LEN, 72, 1, true ).rotateX( Math.PI / 2 ),
    new THREE.MeshStandardMaterial( { map: vaultTex, color: 0x9d9ca6, roughness: 0.82, side: THREE.BackSide } ),
  );
  vault.position.set( 2, -0.4, mid );
  group.add( vault );

  // Ribs every few metres
  const ribs = new THREE.InstancedMesh( new THREE.TorusGeometry( 7.85, 0.13, 8, 64, Math.PI * 1.05 ), new THREE.MeshStandardMaterial( { color: 0xb9b8c2, roughness: 0.7 } ), 14 );
  for ( let i = 0; i < 14; i++ )
  {
    const m = new THREE.Matrix4().compose(
      new THREE.Vector3( 2, -0.4, start - 1.5 - i * 2.85 ),
      new THREE.Quaternion().setFromEuler( new THREE.Euler( 0, 0, -0.025 * Math.PI ) ),
      new THREE.Vector3( 1, 1, 1 ),
    );
    ribs.setMatrixAt( i, m );
  }
  group.add( ribs );

  // Floor beside the track and the platform
  const bed = new THREE.Mesh( new THREE.PlaneGeometry( 8, STATION_LEN ).rotateX( -Math.PI / 2 ), new THREE.MeshStandardMaterial( { color: 0x5b5a5e, roughness: 0.95 } ) );
  bed.position.set( -2.3, -2.56, mid );
  group.add( bed );
  const terrazzo = textures.terrazzo.clone();
  terrazzo.repeat.set( 3, 16 );
  // Plain block under a thin terrazzo slab (one material each, so they can be merged)
  const platform = new THREE.Mesh( new THREE.BoxGeometry( 8, 1.28, STATION_LEN ), new THREE.MeshStandardMaterial( { color: 0x4a4950, roughness: 0.8 } ) );
  platform.position.set( 1.7 + 4, PLATFORM_TOP - 0.66, mid );
  group.add( platform );
  const platformTop = new THREE.Mesh( new THREE.BoxGeometry( 8, 0.02, STATION_LEN ), new THREE.MeshStandardMaterial( { map: terrazzo, roughness: 0.35, metalness: 0.05 } ) );
  platformTop.position.set( 1.7 + 4, PLATFORM_TOP - 0.01, mid );
  group.add( platformTop );

  // ---- Platform screen doors, aligned with the train doors ----
  const psdLength = Math.max( ...doorWorldZ ) - Math.min( ...doorWorldZ ) + 3;
  const psdStart = Math.max( ...doorWorldZ ) + 1.5;
  const psdEnd = psdStart - psdLength;
  const graphite = new THREE.MeshStandardMaterial( { color: 0x2a2b31, roughness: 0.5, metalness: 0.6 } );
  const glass = new THREE.MeshStandardMaterial( { color: 0xd6e6f0, roughness: 0.04, metalness: 0, transparent: true, opacity: 0.16, envMapIntensity: 2.2, depthWrite: false, side: THREE.DoubleSide } );
  const purpleLine = new THREE.MeshStandardMaterial( { color: 0x6950a1, emissive: 0x7a5cc4, emissiveIntensity: 2.2 } );
  const header = new THREE.Mesh( new THREE.BoxGeometry( 0.34, 0.55, psdLength ), graphite );
  header.position.set( PSD_X, PLATFORM_TOP + 2.85, ( psdStart + psdEnd ) / 2 );
  group.add( header );
  for ( const x of [ PSD_X - 0.18, PSD_X + 0.18 ] )
  {
    const line = new THREE.Mesh( new THREE.BoxGeometry( 0.02, 0.05, psdLength ), purpleLine );
    line.position.set( x, PLATFORM_TOP + 2.55, ( psdStart + psdEnd ) / 2 );
    group.add( line );
  }
  const H = 2.55;
  const doorLeaves: { baseZ: number; dir: number }[] = [];
  const doorHalf = 0.8;
  const sortedDoors = [ ...doorWorldZ ].sort( ( a, b ) => b - a );
  // Fixed panels fill the gaps between doors
  let cursor = psdStart;
  const postGeo = new THREE.BoxGeometry( 0.12, H, 0.08 );
  const addPost = ( z: number ) =>
  {
    const post = new THREE.Mesh( postGeo, graphite );
    post.position.set( PSD_X, PLATFORM_TOP + H / 2, z );
    group.add( post );
  };
  const addPanel = ( from: number, to: number ) =>
  {
    if ( from - to < 0.2 ) return;
    const panel = new THREE.Mesh( new THREE.BoxGeometry( 0.03, H - 0.1, from - to - 0.1 ), glass );
    panel.position.set( PSD_X, PLATFORM_TOP + H / 2, ( from + to ) / 2 );
    group.add( panel );
    addPost( to );
  };
  addPost( cursor );
  for ( const dz of sortedDoors )
  {
    addPanel( cursor, dz + doorHalf );
    addPost( dz + doorHalf );
    for ( const dir of [ 1, -1 ] ) doorLeaves.push( { baseZ: dz + dir * doorHalf / 2, dir } );
    addPost( dz - doorHalf );
    cursor = dz - doorHalf;
  }
  addPanel( cursor, psdEnd );

  // Tactile edge strip
  const strip = new THREE.Mesh( new THREE.BoxGeometry( 0.35, 0.01, STATION_LEN ), new THREE.MeshStandardMaterial( { color: 0xd8c25a, roughness: 0.7 } ) );
  strip.position.set( 2.15, PLATFORM_TOP + 0.005, mid );
  group.add( strip );

  // ---- Lighting: a soffit over the platform and coves along the vault ----
  const glowMaterials: THREE.MeshStandardMaterial[] = [];
  const glow = ( color: number ) =>
  {
    const mat = new THREE.MeshStandardMaterial( { color: 0x000000, emissive: color, emissiveIntensity: 0 } );
    glowMaterials.push( mat );
    return mat;
  };
  const soffit = new THREE.Mesh( new THREE.BoxGeometry( 2.6, 0.06, STATION_LEN - 4 ), glow( 0xf4f6ff ) );
  soffit.position.set( 4.6, 3.35, mid );
  group.add( soffit );
  for ( const x of [ -5.2, 9.2 ] )
  {
    const cove = new THREE.Mesh( new THREE.BoxGeometry( 0.12, 0.12, STATION_LEN - 2 ), glow( 0xe9ecff ) );
    cove.position.set( x, 2.6, mid );
    group.add( cove );
  }
  const crown = new THREE.Mesh( new THREE.BoxGeometry( 0.5, 0.05, STATION_LEN - 2 ), glow( 0xffffff ) );
  crown.position.set( 2, 7.45, mid );
  group.add( crown );

  // ---- Signs, facing back along the platform ----
  const signAt = Math.min( ...doorWorldZ ) + 4;
  const roundel = new THREE.Mesh( new THREE.PlaneGeometry( 1.7, 1.7 ), new THREE.MeshStandardMaterial( { map: textures.roundel, transparent: true, emissive: 0xffffff, emissiveMap: textures.roundel, emissiveIntensity: 0.45 } ) );
  roundel.position.set( 3.4, 2.35, signAt );
  roundel.rotation.y = Math.PI;
  group.add( roundel );
  const board = new THREE.Mesh( new THREE.PlaneGeometry( 3.4, 0.76 ), new THREE.MeshStandardMaterial( { map: textures.nameBoard, emissive: 0xffffff, emissiveMap: textures.nameBoard, emissiveIntensity: 0.55 } ) );
  board.position.set( 5.9, 2.5, signAt + 0.3 );
  board.rotation.y = Math.PI;
  group.add( board );
  // Plain backs, so the signs never read mirrored from behind
  for ( const [ sign, w, h ] of [ [ roundel, 1.2, 0.36 ], [ board, 3.4, 0.76 ] ] as const )
  {
    const back = new THREE.Mesh( new THREE.PlaneGeometry( w, h ), graphite );
    back.position.copy( sign.position ).add( new THREE.Vector3( 0, 0, 0.02 ) );
    group.add( back );
  }
  for ( const x of [ 3.4, 5.9 ] )
  {
    const rod = new THREE.Mesh( new THREE.CylinderGeometry( 0.02, 0.02, 1.6 ), graphite );
    rod.position.set( x, 3.9, signAt + 0.15 );
    group.add( rod );
  }

  // The far end isn't finished yet: no screen doors, just barriers
  const stripes = textures.stripes.clone();
  stripes.repeat.set( 3, 1 );
  const barrierMat = new THREE.MeshStandardMaterial( { map: stripes, roughness: 0.6 } );
  for ( let i = 0; i < 4; i++ )
  {
    const barrier = new THREE.Mesh( new THREE.BoxGeometry( 0.08, 0.32, 1.9 ), barrierMat );
    barrier.position.set( 2.3, PLATFORM_TOP + 0.9, psdEnd - 9 - i * 2.05 );
    group.add( barrier );
    for ( const dz of [ -0.85, 0.85 ] )
    {
      const foot = new THREE.Mesh( new THREE.BoxGeometry( 0.5, 0.9, 0.06 ), graphite );
      foot.position.set( 2.3, PLATFORM_TOP + 0.45, barrier.position.z + dz );
      group.add( foot );
    }
  }

  // ---- Headwalls with the tunnel eyes ----
  const wallMat = new THREE.MeshStandardMaterial( { color: 0x8d8b90, roughness: 0.9, side: THREE.DoubleSide } );
  const headwall = new THREE.Mesh( new THREE.RingGeometry( radius + 0.15, 12, 96, 2 ), wallMat );
  headwall.position.set( 0, 0, start );
  group.add( headwall );
  const farWall = new THREE.Mesh( new THREE.RingGeometry( radius + 0.15, 12, 96, 2 ), wallMat );
  farWall.position.set( 0, 0, end );
  group.add( farWall );

  mergeStatic( group );
  // Sliding leaves: a glass pane with a frame on its leading edge
  const frameOffsets = doorLeaves.map( leaf => new THREE.Vector3( 0, 0, leaf.dir * ( doorHalf / 2 - 0.03 ) ) );
  const rig = slidingRig( [
    { geometry: new THREE.BoxGeometry( 0.035, H - 0.2, doorHalf - 0.06 ), material: glass },
    { geometry: new THREE.BoxGeometry( 0.05, H - 0.2, 0.05 ), material: graphite, offset: i => frameOffsets[ i ] },
  ], doorLeaves.length );
  group.add( ...rig.meshes );
  let lastDoorOpen = Number.NaN;

  return {
    group,
    glowMaterials,
    update( lit, doorOpen )
    {
      glowMaterials.forEach( mat => { mat.emissiveIntensity = lit * 1.15; } );
      if ( doorOpen === lastDoorOpen ) return;
      lastDoorOpen = doorOpen;
      doorLeaves.forEach( ( leaf, i ) => rig.place( i, PSD_X, PLATFORM_TOP + H / 2 - 0.05, leaf.baseZ + leaf.dir * doorOpen * ( doorHalf - 0.08 ) ) );
    },
  };
}
