import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/**
 * Collapses every static, non-instanced mesh under `root` into one mesh per material,
 * baked into root's local space. Turns hundreds of draw calls into a handful, so
 * anything that moves must be added after this runs (or be instanced).
 */
export function mergeStatic( root: THREE.Object3D )
{
  root.updateMatrixWorld( true );
  const toRoot = new THREE.Matrix4().copy( root.matrixWorld ).invert();
  const byMaterial = new Map<THREE.Material, THREE.BufferGeometry[]>();
  const merged: THREE.Mesh[] = [];

  root.traverse( object =>
  {
    const mesh = object as THREE.Mesh;
    if ( !mesh.isMesh || ( mesh as unknown as THREE.InstancedMesh ).isInstancedMesh ) return;
    // Vertex-coloured or multi-material meshes keep their own draw call
    if ( Array.isArray( mesh.material ) || !mesh.geometry.attributes.uv || mesh.geometry.attributes.color ) return;
    const geometry = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();
    // Merging needs identical attribute sets
    for ( const name of Object.keys( geometry.attributes ) ) if ( ![ 'position', 'normal', 'uv' ].includes( name ) ) geometry.deleteAttribute( name );
    geometry.applyMatrix4( new THREE.Matrix4().multiplyMatrices( toRoot, mesh.matrixWorld ) );
    const list = byMaterial.get( mesh.material ) ?? [];
    list.push( geometry );
    byMaterial.set( mesh.material, list );
    merged.push( mesh );
  } );

  for ( const mesh of merged )
  {
    mesh.removeFromParent();
    mesh.geometry.dispose();
  }
  for ( const [ material, geometries ] of byMaterial )
  {
    const geometry = mergeGeometries( geometries );
    geometries.forEach( g => g.dispose() );
    if ( geometry ) root.add( new THREE.Mesh( geometry, material ) );
  }
}

type RigPart = {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  /** Offset of this part from the rig's origin, per copy */
  offset?: ( index: number ) => THREE.Vector3Like;
};

/**
 * `count` copies of a small rig of meshes that slide together (door leaves),
 * drawn as one instanced mesh per part instead of a draw call per mesh.
 */
export function slidingRig( parts: RigPart[], count: number )
{
  const meshes = parts.map( part =>
  {
    const mesh = new THREE.InstancedMesh( part.geometry, part.material, count );
    // Copies move, so the bounding sphere computed at build time would go stale
    mesh.frustumCulled = false;
    return mesh;
  } );
  const m4 = new THREE.Matrix4();
  return {
    meshes,
    place( index: number, x: number, y: number, z: number )
    {
      parts.forEach( ( part, j ) =>
      {
        const o = part.offset?.( index );
        m4.makeTranslation( x + ( o?.x ?? 0 ), y + ( o?.y ?? 0 ), z + ( o?.z ?? 0 ) );
        meshes[ j ].setMatrixAt( index, m4 );
        meshes[ j ].instanceMatrix.needsUpdate = true;
      } );
    },
  };
}
