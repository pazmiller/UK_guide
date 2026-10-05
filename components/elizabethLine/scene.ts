import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import * as tex from './textures';
import { buildTrain } from './train';
import { buildStation, STATION_LEN, STATION_LIGHTS, STATION_LIGHT_X, STATION_LIGHT_Y } from './station';
import { resolutionGovernor } from './quality';

export type DigStation = { name: string; count: number };
export type DigScene = {
  /** p: progress of the pinned Explore section, 0..1; now: ms */
  update: ( p: number, now: number ) => void;
  /** Interval between two consecutive rendered frames, for the adaptive resolution */
  measure: ( intervalMs: number, now: number ) => void;
  resize: ( width: number, height: number ) => void;
  dispose: () => void;
};

// Units are roughly metres. Tunnel axis is z; trains run towards -z.
const R = 3.4;
const RING_W = 1.6;
const CITY_SPACING = 7;
const BEHIND = 30;
const RAIL_TOP = -2.35;
const INVERT = -2.55;
const FIXTURE_STEP = 3.2;
// Tunnel light pools sit on the fixtures this many steps behind / ahead of the camera
const POOL_OFFSETS = [ -2, 1, 5 ];
const POOL_COLOR = new THREE.Color( 0xffe8c8 );
const STATION_COLOR = new THREE.Color( 0xeef1ff );
const FILL_COLOR = new THREE.Color( 0xdcd6ff );
const CABIN_COLOR = new THREE.Color( 0xfff1de );

// Where each act sits in the pinned section's scroll progress (see ExploreCarriage.module.css)
const RIDE = [ 0.645, 0.84 ] as const;
const ARRIVE = [ 0.84, 0.93 ] as const;
const DOOR = [ 0.93, 0.995 ] as const;

const clamp01 = ( v: number ) => Math.min( Math.max( v, 0 ), 1 );
const lerp = ( a: number, b: number, t: number ) => a + ( b - a ) * t;
const smooth = ( a: number, b: number, v: number ) => { const t = clamp01( ( v - a ) / ( b - a ) ); return t * t * ( 3 - 2 * t ); };
const easeOut = ( t: number ) => 1 - Math.pow( 1 - t, 3 );
const easeInOut = ( t: number ) => ( t < 0.5 ? 4 * t * t * t : 1 - Math.pow( -2 * t + 2, 3 ) / 2 );
const phase = ( p: number, [ from, to ]: readonly [ number, number ] ) => clamp01( ( p - from ) / ( to - from ) );

const GradeShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uFade: { value: 1 },
    uExposure: { value: 1.05 },
    uRes: { value: new THREE.Vector2( 1, 1 ) },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uFade;
    uniform float uExposure;
    uniform vec2 uRes;
    varying vec2 vUv;
    float hash( vec2 p ) { return fract( sin( dot( p, vec2( 12.9898, 78.233 ) ) ) * 43758.5453 ); }
    // three.js's ACES filmic curve and sRGB encoding, done here to save a separate output pass
    vec3 rrtAndOdtFit( vec3 v )
    {
      vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
      vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
      return a / b;
    }
    vec3 acesFilmic( vec3 color )
    {
      const mat3 inputMat = mat3( vec3( 0.59719, 0.07600, 0.02840 ), vec3( 0.35458, 0.90834, 0.13383 ), vec3( 0.04823, 0.01566, 0.83777 ) );
      const mat3 outputMat = mat3( vec3( 1.60475, -0.10208, -0.00327 ), vec3( -0.53108, 1.10813, -0.07276 ), vec3( -0.07367, -0.00605, 1.07602 ) );
      return clamp( outputMat * rrtAndOdtFit( inputMat * ( color * uExposure / 0.6 ) ), 0.0, 1.0 );
    }
    vec3 toSRGB( vec3 c )
    {
      return mix( pow( c, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), c * 12.92, vec3( lessThanEqual( c, vec3( 0.0031308 ) ) ) );
    }
    void main()
    {
      vec2 c = vUv - 0.5;
      // Slight lens fringing towards the edges
      float ca = 0.0035 * dot( c, c ) * 4.0;
      vec3 col = toSRGB( acesFilmic( vec3(
        texture2D( tDiffuse, vUv + c * ca ).r,
        texture2D( tDiffuse, vUv ).g,
        texture2D( tDiffuse, vUv - c * ca ).b
      ) ) );
      // Grade: violet-leaning shadows, warm highlights
      float l = dot( col, vec3( 0.2126, 0.7152, 0.0722 ) );
      col = mix( col, col * vec3( 1.05, 0.99, 0.9 ), smoothstep( 0.45, 1.0, l ) );
      col += vec3( 0.014, 0.006, 0.03 ) * ( 1.0 - l );
      float vignette = smoothstep( 0.9, 0.28, length( c * vec2( 1.0, 0.82 ) ) );
      col *= mix( 0.5, 1.0, vignette );
      col += ( hash( vUv * uRes + fract( uTime ) * 61.0 ) - 0.5 ) * 0.04;
      gl_FragColor = vec4( col * uFade, 1.0 );
    }
  `,
};

function beamMaterial( color: number, intensity: number )
{
  return new THREE.ShaderMaterial( {
    uniforms: { uColor: { value: new THREE.Color( color ) }, uIntensity: { value: intensity } },
    vertexShader: /* glsl */ `
      varying float vAlong;
      varying vec3 vNormal;
      varying vec3 vView;
      void main()
      {
        vAlong = uv.y;
        vec4 mv = modelViewMatrix * vec4( position, 1.0 );
        vView = normalize( -mv.xyz );
        vNormal = normalize( normalMatrix * normal );
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uIntensity;
      varying float vAlong;
      varying vec3 vNormal;
      varying vec3 vView;
      void main()
      {
        float facing = pow( abs( dot( vNormal, vView ) ), 1.6 );
        float fall = pow( vAlong, 2.2 );
        gl_FragColor = vec4( uColor * uIntensity * facing * fall, 1.0 );
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  } );
}

/** Builds the scene in slices that yield to the browser, then compiles every shader up front */
export async function createDigScene( canvas: HTMLCanvasElement, stations: DigStation[], font: string ): Promise<DigScene>
{
  // Everything is drawn into the composer's buffers, so canvas multisampling would be wasted;
  // tone mapping happens in the grade pass
  const renderer = new THREE.WebGLRenderer( { canvas, antialias: false, powerPreference: 'high-performance' } );

  // Software rendering (no usable GPU): start at the lowest resolution and skip bloom
  const gl = renderer.getContext();
  const debugInfo = gl.getExtension( 'WEBGL_debug_renderer_info' );
  const gpu = debugInfo ? String( gl.getParameter( debugInfo.UNMASKED_RENDERER_WEBGL ) ) : '';
  const software = /swiftshader|llvmpipe|softpipe|software/i.test( gpu );
  const maxRatio = Math.min( window.devicePixelRatio, 1.5 );
  const minRatio = Math.min( 0.6, maxRatio );
  const fewCores = ( navigator.hardwareConcurrency || 8 ) <= 4;
  const governor = resolutionGovernor( minRatio, maxRatio, software ? minRatio : fewCores ? Math.min( 1, maxRatio ) : maxRatio );

  const scene = new THREE.Scene();
  const fog = new THREE.FogExp2( 0x0d0a12, 0.03 );
  scene.fog = fog;
  const tunnelFog = new THREE.Color( 0x0d0a12 );
  const stationFog = new THREE.Color( 0x1c1b24 );
  const pmrem = new THREE.PMREMGenerator( renderer );
  const room = new RoomEnvironment();
  const envTarget = pmrem.fromScene( room, 0.04 );
  room.dispose();
  scene.environment = envTarget.texture;
  await tex.yieldToMain();

  const camera = new THREE.PerspectiveCamera( 48, 1, 0.05, 160 );

  const textures = {
    lining: await tex.liningTexture(),
    slab: await tex.slabTexture(),
    vault: await tex.vaultTexture(),
    terrazzo: await tex.terrazzoTexture(),
    sprite: tex.spriteTexture(),
    roundel: tex.roundelTexture( font ),
    nameBoard: tex.nameBoardTexture( font ),
    moquette: tex.moquetteTexture(),
    stripes: tex.stripeTexture(),
  };
  await tex.yieldToMain();

  const endZ = -( stations.length * CITY_SPACING + 4 );
  const stopFront = endZ - 30;
  const trackEnd = endZ - STATION_LEN + 1;

  // ---- Finished lining: rings of six precast segments ----
  const ringZ: number[] = [];
  for ( let z = BEHIND - RING_W / 2; z > endZ + RING_W / 2 - 0.01; z -= RING_W ) ringZ.push( z );
  const segGeo = new THREE.CylinderGeometry( R, R, RING_W - 0.035, 18, 1, true, -Math.PI / 6 + 0.006, Math.PI / 3 - 0.012 ).rotateX( Math.PI / 2 );
  const liningMat = new THREE.MeshStandardMaterial( { map: textures.lining, bumpMap: textures.lining, bumpScale: 2.2, roughness: 0.9, side: THREE.DoubleSide } );
  const segments = new THREE.InstancedMesh( segGeo, liningMat, ringZ.length * 6 );
  const rand = tex.seeded( 3 );
  const tint = new THREE.Color();
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const pos = new THREE.Vector3();
  const one = new THREE.Vector3( 1, 1, 1 );
  ringZ.forEach( ( z, r ) =>
  {
    for ( let j = 0; j < 6; j++ )
    {
      e.set( 0, 0, j * Math.PI / 3 );
      m4.compose( pos.set( 0, 0, z ), q.setFromEuler( e ), one );
      segments.setMatrixAt( r * 6 + j, m4 );
      const v = 0.82 + rand() * 0.24;
      segments.setColorAt( r * 6 + j, tint.setRGB( v, v * 0.99, v * 0.97 ) );
    }
  } );
  scene.add( segments );

  // ---- Track and fittings along the whole line ----
  const along = ( obj: THREE.Mesh, from: number, to: number, texture?: THREE.Texture, period?: number ) =>
  {
    obj.scale.z = from - to;
    obj.position.z = ( from + to ) / 2;
    if ( texture && period ) texture.repeat.set( 1, ( from - to ) / period );
    scene.add( obj );
  };
  const slabTex = textures.slab.clone();
  const slab = new THREE.Mesh( new THREE.PlaneGeometry( 4.6, 1 ).rotateX( -Math.PI / 2 ), new THREE.MeshStandardMaterial( { map: slabTex, roughness: 0.9 } ) );
  slab.position.y = INVERT;
  along( slab, BEHIND + 2, endZ, slabTex, 4 );

  const steel = new THREE.MeshStandardMaterial( { color: 0x9fa4ab, roughness: 0.25, metalness: 0.95 } );
  const railGeo = mergeGeometries( [
    new THREE.BoxGeometry( 0.1, 0.06, 1 ).translate( 0, -0.03, 0 ),
    new THREE.BoxGeometry( 0.025, 0.11, 1 ).translate( 0, -0.115, 0 ),
    new THREE.BoxGeometry( 0.17, 0.025, 1 ).translate( 0, -0.18, 0 ),
  ] );
  for ( const x of [ -0.8, 0.8 ] )
  {
    const rail = new THREE.Mesh( railGeo, steel );
    rail.position.set( x, RAIL_TOP, 0 );
    along( rail, BEHIND + 2, trackEnd );
  }

  const fittingGrey = new THREE.MeshStandardMaterial( { color: 0x6b6e75, roughness: 0.6, metalness: 0.5 } );
  const walkway = new THREE.Mesh( new THREE.BoxGeometry( 0.95, 0.12, 1 ), new THREE.MeshStandardMaterial( { color: 0x77756f, roughness: 0.85 } ) );
  walkway.position.set( -2.55, -1.6, 0 );
  along( walkway, BEHIND + 2, endZ );
  const handrail = new THREE.Mesh( new THREE.CylinderGeometry( 0.035, 0.035, 1, 8 ).rotateX( Math.PI / 2 ), new THREE.MeshStandardMaterial( { color: 0xd8c23a, roughness: 0.5, metalness: 0.3 } ) );
  handrail.position.set( -2.1, -0.62, 0 );
  along( handrail, BEHIND + 2, endZ );
  [ [ 3.06, 0.1 ], [ 3.14, 0.3 ], [ 3.06, 0.5 ], [ 2.98, 0.7 ] ].forEach( ( [ x, y ], i ) =>
  {
    const cable = new THREE.Mesh( new THREE.CylinderGeometry( 0.045, 0.045, 1, 8 ).rotateX( Math.PI / 2 ), new THREE.MeshStandardMaterial( { color: [ 0x1b1b1e, 0x2b2b30, 0x8a3a2a, 0x1b1b1e ][ i ], roughness: 0.55 } ) );
    cable.position.set( x, y, 0 );
    along( cable, BEHIND + 2, endZ );
  } );
  const purpleStripMat = new THREE.MeshStandardMaterial( { color: 0x6950a1, emissive: 0x7b5cd0, emissiveIntensity: 2.6 } );
  for ( const [ x, y ] of [ [ -3.0, -0.2 ], [ 3.24, 0.95 ] ] )
  {
    const strip = new THREE.Mesh( new THREE.BoxGeometry( 0.03, 0.05, 1 ), purpleStripMat );
    strip.position.set( x, y, 0 );
    along( strip, BEHIND + 2, endZ );
  }
  const beam = new THREE.Mesh( new THREE.BoxGeometry( 0.12, 0.22, 1 ), new THREE.MeshStandardMaterial( { color: 0xc7cbd1, roughness: 0.3, metalness: 0.9 } ) );
  beam.position.set( 0, 2.3, 0 );
  along( beam, BEHIND + 2, trackEnd );

  // Repeated fittings, instanced
  const repeated = ( geo: THREE.BufferGeometry, mat: THREE.Material, step: number, to: number, place: ( z: number ) => THREE.Matrix4 ) =>
  {
    const zs: number[] = [];
    for ( let v = BEHIND + 2; v > to; v -= step ) zs.push( v );
    const mesh = new THREE.InstancedMesh( geo, mat, zs.length );
    zs.forEach( ( v, i ) => mesh.setMatrixAt( i, place( v ) ) );
    scene.add( mesh );
    return zs;
  };
  const concrete = new THREE.MeshStandardMaterial( { color: 0x8f8c86, roughness: 0.85 } );
  repeated( new THREE.BoxGeometry( 2.5, 0.16, 0.28 ), concrete, 0.65, trackEnd, z => new THREE.Matrix4().makeTranslation( 0, RAIL_TOP - 0.27, z ) );
  repeated( new THREE.BoxGeometry( 0.05, 1.0, 0.05 ), fittingGrey, 1.6, endZ, z => new THREE.Matrix4().makeTranslation( -2.1, -1.1, z ) );
  repeated( new THREE.BoxGeometry( 0.42, 0.06, 0.08 ), fittingGrey, 1.6, endZ, z => new THREE.Matrix4().makeTranslation( 3.05, 0.4, z ) );
  repeated( new THREE.BoxGeometry( 0.06, 0.95, 0.06 ), fittingGrey, 3.2, trackEnd, z => new THREE.Matrix4().makeTranslation( 0, 2.85, z ) );
  const fixtureMat = new THREE.MeshStandardMaterial( { color: 0xffffff, emissive: 0xfff1dc, emissiveIntensity: 3.2 } );
  const fixtureZ = repeated( new THREE.BoxGeometry( 0.14, 0.1, 0.95 ), fixtureMat, FIXTURE_STEP, endZ, z =>
    new THREE.Matrix4().compose( new THREE.Vector3( -2.82, 1.95, z ), new THREE.Quaternion().setFromEuler( new THREE.Euler( 0, 0, -0.6 ) ), one ) );

  // Three roaming lights: pools under the fixtures nearest the camera in the tunnel, the
  // station's own lights once it is lit. Moving lights rather than adding more keeps the
  // per-pixel lighting cost low and the shaders unchanged.
  const pools = POOL_OFFSETS.map( () =>
  {
    const light = new THREE.PointLight( POOL_COLOR, 5.5, 10, 2 );
    scene.add( light );
    return light;
  } );

  // ---- Ring markers naming each city on the line ----
  stations.forEach( ( station, c ) =>
  {
    const z = -( c + 0.5 ) * CITY_SPACING;
    const ring = Math.round( ( BEHIND - z ) / RING_W );
    const map = tex.ringSignTexture( font, ring, station.name, station.count );
    const sign = new THREE.Mesh( new THREE.PlaneGeometry( 1.25, 0.49 ), new THREE.MeshStandardMaterial( { map, emissive: 0xffffff, emissiveMap: map, emissiveIntensity: 0.5, roughness: 0.4 } ) );
    // High on the wall, well above the camera's path past the cab
    sign.position.set( -2.32, 1.95, z );
    sign.rotation.y = 0.5;
    scene.add( sign );
  } );
  await tex.yieldToMain();

  // ---- Train and station ----
  const trainBeam = beamMaterial( 0xfff2df, 0.06 );
  const train = buildTrain( trainBeam, { moquette: textures.moquette } );
  train.group.position.y = RAIL_TOP;
  scene.add( train.group );
  await tex.yieldToMain();
  const station = buildStation( endZ, R, train.doorZ.map( z => stopFront + z ), {
    vault: textures.vault,
    terrazzo: textures.terrazzo,
    roundel: textures.roundel,
    nameBoard: textures.nameBoard,
    stripes: textures.stripes,
  } );
  scene.add( station.group );
  await tex.yieldToMain();

  const hemi = new THREE.HemisphereLight( 0x8d84b8, 0x241c14, 0.3 );
  scene.add( hemi );
  // One light, two jobs (never needed at once): fill beside the camera during the ride,
  // then the glow from inside the train once its doors open
  const fill = new THREE.PointLight( FILL_COLOR, 0, 9, 2 );
  scene.add( fill );

  // ---- Dust motes drifting around the camera, faded near the lens; animated on the GPU ----
  const DUST = 700;
  const dustBase = new Float32Array( DUST * 3 );
  const dustSeed = new Float32Array( DUST );
  for ( let i = 0; i < DUST; i++ )
  {
    dustBase[ i * 3 ] = ( rand() - 0.5 ) * 6;
    dustBase[ i * 3 + 1 ] = -2.3 + rand() * 5.2;
    dustBase[ i * 3 + 2 ] = -30 + rand() * 34;
    dustSeed[ i ] = i;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute( 'position', new THREE.BufferAttribute( dustBase, 3 ) );
  dustGeo.setAttribute( 'aSeed', new THREE.BufferAttribute( dustSeed, 1 ) );
  const dustMat = new THREE.ShaderMaterial( {
    uniforms: {
      uMap: { value: textures.sprite },
      uColor: { value: new THREE.Color( 0xc9b89c ) },
      uOpacity: { value: 0.45 },
      uScale: { value: 400 },
      uDensity: { value: 0.03 },
      uTime: { value: 0 },
      uCamZ: { value: 0 },
    },
    vertexShader: /* glsl */ `
      attribute float aSeed;
      uniform float uScale;
      uniform float uDensity;
      uniform float uTime;
      uniform float uCamZ;
      varying float vFade;
      void main()
      {
        vec3 p = position + vec3(
          sin( uTime * 0.3 + aSeed ) * 0.25,
          sin( uTime * 0.22 + aSeed * 1.7 ) * 0.3,
          uCamZ + sin( uTime * 0.17 + aSeed * 0.3 ) * 0.4
        );
        vec4 mv = modelViewMatrix * vec4( p, 1.0 );
        float dist = -mv.z;
        vFade = smoothstep( 1.2, 3.0, dist ) * exp( -uDensity * uDensity * dist * dist );
        gl_PointSize = min( 0.06 * uScale / max( dist, 0.1 ), 14.0 );
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uMap;
      uniform vec3 uColor;
      uniform float uOpacity;
      varying float vFade;
      void main()
      {
        float a = texture2D( uMap, gl_PointCoord ).a * uOpacity * vFade;
        if ( a < 0.004 ) discard;
        gl_FragColor = vec4( uColor, a );
      }
    `,
    transparent: true,
    depthWrite: false,
  } );
  const dust = new THREE.Points( dustGeo, dustMat );
  dust.frustumCulled = false;
  scene.add( dust );

  // ---- Post-processing ----
  const composer = new EffectComposer( renderer );
  composer.addPass( new RenderPass( scene, camera ) );
  // High threshold: only lamps, LED strips and lit panels glow, never the lit concrete
  const bloom = new UnrealBloomPass( new THREE.Vector2( 512, 512 ), 0.55, 0.35, 1.6 );
  bloom.enabled = !software;
  composer.addPass( bloom );
  const grade = new ShaderPass( GradeShader );
  composer.addPass( grade );

  // ---- Camera choreography ----
  const up = new THREE.Vector3( 0, 1, 0 );
  const look = new THREE.Vector3();
  const camPos = new THREE.Vector3();
  const qa = new THREE.Quaternion();
  const qb = new THREE.Quaternion();
  const qc = new THREE.Quaternion();
  const lookM = new THREE.Matrix4();
  const quatLooking = ( out: THREE.Quaternion, from: THREE.Vector3, to: THREE.Vector3 ) => out.setFromRotationMatrix( lookM.lookAt( from, to, up ) );
  const scratch = new THREE.Vector3();

  const rideStart = 16;
  const rideEnd = endZ + 12;
  // Ahead of the cab looking back at it, then round its left side to look up the line.
  // The view turns by blending rotations (cab, then along the train's side, then far ahead);
  // blending look targets instead would swing the target through the camera and flip the view.
  const orbitPosition = ( u: number, front: number, out: THREE.Vector3 ) =>
  {
    const theta = lerp( 0.5, 2.05, u );
    return out.set( -Math.sin( theta ) * 2.2, 0.25 + 0.3 * u, front - Math.cos( theta ) * lerp( 6.4, 4.6, u ) );
  };
  const farAhead = ( front: number, out: THREE.Vector3 ) => out.set( 0.4, -0.2, front - 28 );
  const orbitQuaternion = ( u: number, front: number, from: THREE.Vector3, out: THREE.Quaternion ) =>
  {
    quatLooking( qa, from, scratch.set( 0, -0.4, front + 0.5 ) );
    quatLooking( qb, from, scratch.set( 0.3, -0.5, front + 3 ) );
    quatLooking( qc, from, farAhead( front, scratch ) );
    if ( u < 0.5 ) out.slerpQuaternions( qa, qb, smooth( 0, 0.5, u ) );
    else out.slerpQuaternions( qb, qc, smooth( 0.5, 1, u ) );
  };

  // Arrival: from the end of the orbit, through the eye onto the platform, settling to face the train
  const flightStart = orbitPosition( 1, rideEnd, new THREE.Vector3() );
  const flightLook = farAhead( rideEnd, new THREE.Vector3() );
  const flight = new THREE.CatmullRomCurve3( [
    flightStart,
    new THREE.Vector3( -1.4, 0.45, endZ + 8 ),
    new THREE.Vector3( 1.9, 0.6, endZ - 1.6 ),
    new THREE.Vector3( 3.4, 0.45, endZ - 13 ),
    new THREE.Vector3( 4.3, 0.32, stopFront - 3.2 ),
  ], false, 'centripetal' );
  const platformFar = new THREE.Vector3( 2.6, -0.3, endZ - STATION_LEN );
  const arrivalLook = new THREE.Vector3( 0.6, -0.55, stopFront + 9 );

  // Door push-in: along the platform to the first door, square on, then through the screen doors
  const doorZ = stopFront + train.doorZ[ 0 ];
  const walk = new THREE.CatmullRomCurve3( [
    new THREE.Vector3( 4.3, 0.32, stopFront - 3.2 ),
    new THREE.Vector3( 3.9, 0.22, doorZ - 2.4 ),
    new THREE.Vector3( 2.7, 0.05, doorZ ),
  ], false, 'centripetal' );
  const doorLook = new THREE.Vector3( 0, -0.35, doorZ );

  let lastNow = 0;
  // Animation clock (shake, dust, grain); it only advances while frames are drawn, so
  // nothing jumps when drawing resumes after a pause
  let clock = 0;

  function update( p: number, now: number )
  {
    const dt = lastNow ? Math.min( ( now - lastNow ) / 1000, 0.1 ) : 0;
    lastNow = now;
    clock += dt;
    const t = clock;

    const r = phase( p, RIDE );
    const a = phase( p, ARRIVE );
    const dd = phase( p, DOOR );
    const arriving = a > 0;

    // Train: through the tunnel past every city, then decelerating into the platform
    const trainFront = arriving ? lerp( rideEnd, stopFront, easeOut( clamp01( a / 0.95 ) ) ) : lerp( rideStart, rideEnd, r );
    train.group.position.z = trainFront;
    const doorOpen = smooth( 0.48, 0.8, dd );
    train.update( doorOpen );

    // Station lights come up as the train arrives
    const lit = smooth( 0, 0.3, a );
    station.update( lit, doorOpen );
    hemi.intensity = lerp( 0.3, 0.26, lit );
    scene.environmentIntensity = lerp( 0.13, 0.28, lit );
    fog.density = lerp( 0.03, 0.012, lit );
    fog.color.copy( tunnelFog ).lerp( stationFog, lit );
    renderer.setClearColor( fog.color );

    // ---- Camera ----
    let shake = 0.004;
    if ( !arriving )
    {
      const u = smooth( 0.08, 0.95, r );
      camera.position.copy( orbitPosition( u, trainFront, camPos ) );
      orbitQuaternion( u, trainFront, camPos, camera.quaternion );
      shake = 0.007;
    }
    else if ( dd <= 0 )
    {
      const c = easeOut( clamp01( a / 0.7 ) );
      camPos.copy( flight.getPointAt( c ) );
      camera.position.copy( camPos );
      // Ahead into the station, down the platform, across to the track, then back up it at the train
      quatLooking( qa, camPos, flightLook );
      quatLooking( qb, camPos, platformFar );
      camera.quaternion.slerpQuaternions( qa, qb, smooth( 0.05, 0.4, c ) );
      const turn = smooth( 0.55, 1, c );
      if ( turn > 0 )
      {
        qa.copy( camera.quaternion );
        quatLooking( qb, camPos, look.set( camPos.x - 8, -0.6, camPos.z + 2 ) );
        quatLooking( qc, camPos, arrivalLook );
        if ( turn < 0.5 ) camera.quaternion.slerpQuaternions( qa, qb, turn * 2 );
        else camera.quaternion.slerpQuaternions( qb, qc, turn * 2 - 1 );
      }
    }
    else
    {
      // Walk up to the first door, face it square on, and once it opens step through the screen doors
      camPos.copy( walk.getPointAt( easeInOut( clamp01( dd / 0.5 ) ) ) );
      camPos.x -= smooth( 0.62, 1, dd ) * 0.75;
      camera.position.copy( camPos );
      quatLooking( qa, camPos, arrivalLook );
      quatLooking( qb, camPos, doorLook );
      camera.quaternion.slerpQuaternions( qa, qb, smooth( 0.05, 0.45, dd ) );
      shake = 0.002;
    }
    camera.position.x += ( Math.sin( t * 13.1 ) + Math.sin( t * 7.7 ) * 0.6 ) * shake;
    camera.position.y += ( Math.sin( t * 11.3 + 1 ) + Math.sin( t * 5.9 ) * 0.6 ) * shake;
    camera.updateMatrixWorld();

    if ( !arriving )
    {
      // Kept on the wall side of the camera: next to the train it would burn the paint white
      fill.position.copy( camera.position ).add( scratch.set( -0.6, 1.1, 1.4 ) );
      fill.color.copy( FILL_COLOR );
      fill.distance = 9;
      fill.decay = 2;
      fill.intensity = 1.6;
    }
    else
    {
      fill.position.copy( train.cabinLightAt ).add( train.group.position );
      fill.color.copy( CABIN_COLOR );
      fill.distance = 7;
      fill.decay = 1.6;
      fill.intensity = doorOpen * 9;
    }

    // Roaming lights: tunnel pools until the station is half lit, then the station's lights
    const camZ = camera.position.z;
    const inStation = lit >= 0.5;
    pools.forEach( ( light, i ) =>
    {
      if ( inStation )
      {
        const spot = STATION_LIGHTS[ i ];
        light.position.set( STATION_LIGHT_X, STATION_LIGHT_Y, endZ + spot.dz );
        light.color.copy( STATION_COLOR );
        light.distance = 34;
        light.decay = 1.4;
        light.intensity = spot.intensity * lit * smooth( 0.5, 0.7, lit );
        return;
      }
      const k = Math.round( ( fixtureZ[ 0 ] - ( camZ - POOL_OFFSETS[ i ] * FIXTURE_STEP ) ) / FIXTURE_STEP );
      light.position.set( -1.4, 2.3, fixtureZ[ Math.min( Math.max( k, 0 ), fixtureZ.length - 1 ) ] );
      light.color.copy( POOL_COLOR );
      light.distance = 10;
      light.decay = 2;
      light.intensity = 5.5 * ( 1 - lit ) * ( 1 - smooth( 0.3, 0.5, lit ) );
    } );

    // Dust drifts around the camera in the tunnel, thins out in the station
    dustMat.uniforms.uTime.value = t;
    dustMat.uniforms.uCamZ.value = camZ;
    dustMat.uniforms.uOpacity.value = 0.45 * ( 1 - lit * 0.8 );
    dustMat.uniforms.uDensity.value = fog.density;

    // Fade up with the overlay (CSS build-in 0.62–0.66); dim behind the big call to action at the end
    grade.uniforms.uFade.value = smooth( 0.62, 0.66, p ) * ( 1 - 0.38 * smooth( 0.78, 1, dd ) );
    grade.uniforms.uTime.value = t;
    bloom.strength = lerp( 0.55, 0.4, lit );

    composer.render( dt );
  }

  let width = 1;
  let height = 1;
  const applySize = () =>
  {
    const ratio = governor.ratio;
    renderer.setPixelRatio( ratio );
    renderer.setSize( width, height, false );
    composer.setPixelRatio( ratio );
    composer.setSize( width, height );
    grade.uniforms.uRes.value.set( width * ratio, height * ratio );
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  // Upload every texture and compile every shader now, while the dig is still hidden,
  // instead of stalling the first frames of the ride
  const sceneTextures = new Set<THREE.Texture>();
  scene.traverse( object =>
  {
    const material = ( object as THREE.Mesh ).material as THREE.Material | undefined;
    if ( !material ) return;
    const values = 'uniforms' in material ? Object.values( ( material as THREE.ShaderMaterial ).uniforms ).map( u => u.value ) : Object.values( material );
    for ( const value of values ) if ( value instanceof THREE.Texture ) sceneTextures.add( value );
  } );
  for ( const texture of sceneTextures )
  {
    renderer.initTexture( texture );
    await tex.yieldToMain();
  }
  // Compile for the composer's buffer, which is where the scene is drawn
  renderer.setRenderTarget( composer.readBuffer );
  await renderer.compileAsync( scene, camera );
  renderer.setRenderTarget( null );
  // One hidden frame (faded to black) compiles the post-processing passes
  update( RIDE[ 0 ] - 0.05, 0 );
  lastNow = 0;

  return {
    update,
    measure( intervalMs, now )
    {
      if ( governor.sample( intervalMs, now ) ) applySize();
    },
    resize( w, h )
    {
      width = w;
      height = h;
      applySize();
    },
    dispose()
    {
      const disposedTextures = new Set<THREE.Texture>();
      scene.traverse( object =>
      {
        const mesh = object as THREE.Mesh;
        mesh.geometry?.dispose();
        const mats = Array.isArray( mesh.material ) ? mesh.material : mesh.material ? [ mesh.material ] : [];
        for ( const mat of mats )
        {
          for ( const value of Object.values( mat ) ) if ( value instanceof THREE.Texture ) disposedTextures.add( value );
          mat.dispose();
        }
      } );
      for ( const texture of [ ...disposedTextures, ...Object.values( textures ) ] ) texture.dispose();
      composer.dispose();
      envTarget.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}
