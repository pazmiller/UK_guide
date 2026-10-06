'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { buildJourney, JOURNEY_STATIONS, VIEW_HEIGHT } from '@/lib/heroJourney';
import styles from './Hero.module.css';

type Props = {
  /** The tall pinned section whose scroll position drives the journey */
  sectionRef: RefObject<HTMLElement | null>;
  onReady: () => void;
  onFallback: () => void;
};

const FOV = 40;
const MAX_PARTICLES = 18000;
const MAX_PARTICLES_MOBILE = 9000;

const vertexShader = /* glsl */ `
  uniform float uMorph;
  uniform float uTime;
  uniform float uIntro;
  uniform float uPxScale;
  uniform vec2 uMouse;

  attribute vec3 aMap;
  attribute vec3 aColorFlag;
  attribute vec3 aColorMap;
  attribute vec2 aAlpha;
  attribute vec2 aSize;
  attribute float aKind;
  attribute float aRand;
  attribute float aArc;
  attribute float aDelay;

  varying vec3 vColor;
  varying float vAlpha;

  float easeInOutCubic( float t )
  {
    return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow( -2.0 * t + 2.0, 3.0 ) / 2.0;
  }

  void main()
  {
    float local = clamp( ( uMorph - aDelay ) / 0.55, 0.0, 1.0 );
    float e = easeInOutCubic( local );

    // Flag: waving cloth, lifted where the pointer is
    vec3 flag = position;
    flag.z += sin( flag.x * 0.55 + uTime * 1.6 + flag.y * 0.25 ) * 0.35 + sin( flag.x * 1.3 - uTime * 1.1 ) * 0.12;
    float md = distance( position.xy, uMouse );
    float glow = exp( -md * md / 2.2 ) * ( 1.0 - e );
    flag.z += glow * 0.9;

    // Map: dust drifts, the river shimmers, trains of light run along the lines
    vec3 map = aMap;
    float isDust = 1.0 - step( 0.5, aKind );
    float isLine = step( 0.5, aKind ) * ( 1.0 - step( 1.5, aKind ) );
    float isThames = step( 1.5, aKind ) * ( 1.0 - step( 2.5, aKind ) );
    float isStation = step( 2.5, aKind );
    map.xy += isDust * vec2( sin( uTime * 0.21 + aRand * 31.0 ), cos( uTime * 0.17 + aRand * 23.0 ) ) * 0.18;
    map.y += isThames * sin( uTime * 0.9 + aArc * 40.0 ) * 0.025;
    float train = isLine * smoothstep( 0.045, 0.0, abs( fract( aArc * 1.5 - uTime * 0.09 ) - 0.5 ) );
    float breathe = isStation * ( 0.5 + 0.5 * sin( uTime * 2.0 + aRand * 6.28 ) );

    // In flight: arc towards the camera and swirl a little
    vec3 pos = mix( flag, map, e );
    float flight = sin( local * 3.14159 );
    pos.z += flight * ( 1.2 + aRand * 3.0 );
    pos.xy += vec2( sin( aRand * 40.0 + uTime ), cos( aRand * 33.0 + uTime ) ) * flight * 0.5;

    vColor = mix( aColorFlag, aColorMap, e ) + train * e * 0.7;
    vAlpha = mix( aAlpha.x + glow * 0.4, aAlpha.y * ( 0.85 + breathe * 0.15 ), e ) * uIntro;

    vec4 mv = modelViewMatrix * vec4( pos, 1.0 );
    float size = mix( aSize.x * ( 1.0 + glow * 1.3 ), aSize.y * ( 1.0 + train * 1.6 ), e );
    gl_PointSize = size * uPxScale / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const fragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;

  void main()
  {
    float d = length( gl_PointCoord - 0.5 );
    if ( d > 0.5 ) discard;
    gl_FragColor = vec4( vColor, vAlpha * smoothstep( 0.5, 0.28, d ) );
  }
`;

const clamp01 = ( v: number ) => Math.min( Math.max( v, 0 ), 1 );
const easeInOut = ( t: number ) => t * t * ( 3 - 2 * t );

export default function ParticleJourney( { sectionRef, onReady, onFallback }: Props )
{
  const canvasRef = useRef<HTMLCanvasElement>( null );
  const labelRefs = useRef<( HTMLAnchorElement | null )[]>( [] );
  const callbacks = useRef( { onReady, onFallback } );

  useEffect( () =>
  {
    callbacks.current = { onReady, onFallback };
  } );

  useEffect( () =>
  {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if ( !canvas || !section ) return;
    if ( window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches )
    {
      callbacks.current.onFallback();
      return;
    }

    let disposed = false;
    let cleanup = () => {};

    import( 'three' ).then( THREE =>
    {
      if ( disposed ) return;

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try
      {
        renderer = new THREE.WebGLRenderer( { canvas, antialias: false, powerPreference: 'high-performance' } );
      }
      catch
      {
        callbacks.current.onFallback();
        return;
      }
      renderer.setClearColor( 0x010820, 1 );

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera( FOV, 1, 0.1, 100 );
      const distance = VIEW_HEIGHT / 2 / Math.tan( THREE.MathUtils.degToRad( FOV / 2 ) );

      const uniforms = {
        uMorph: { value: 0 },
        uTime: { value: 0 },
        uIntro: { value: 0 },
        uPxScale: { value: 1 },
        uMouse: { value: new THREE.Vector2( 999, 999 ) },
      };
      const material = new THREE.ShaderMaterial( {
        uniforms,
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
      } );
      let geometry = new THREE.BufferGeometry();
      const points = new THREE.Points( geometry, material );
      points.frustumCulled = false;
      scene.add( points );

      let stations: [ number, number ][] = [];
      let width = 0;
      let height = 0;

      function rebuild()
      {
        const parent = canvas!.parentElement!;
        const w = parent.clientWidth;
        const h = parent.clientHeight;
        if ( !w || !h ) return;
        // Mobile URL bars nudge the height while scrolling; ignore small changes
        if ( w === width && Math.abs( h - height ) < 120 ) return;
        width = w;
        height = h;

        const pixelRatio = Math.min( window.devicePixelRatio, 2 );
        renderer.setPixelRatio( pixelRatio );
        renderer.setSize( w, h, false );
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        uniforms.uPxScale.value = h * pixelRatio / ( 2 * Math.tan( THREE.MathUtils.degToRad( FOV / 2 ) ) );

        const data = buildJourney( w, h, w < 768 ? MAX_PARTICLES_MOBILE : MAX_PARTICLES );
        stations = data.stations;
        const next = new THREE.BufferGeometry();
        next.setAttribute( 'position', new THREE.BufferAttribute( data.flag, 3 ) );
        next.setAttribute( 'aMap', new THREE.BufferAttribute( data.map, 3 ) );
        next.setAttribute( 'aColorFlag', new THREE.BufferAttribute( data.colorFlag, 3 ) );
        next.setAttribute( 'aColorMap', new THREE.BufferAttribute( data.colorMap, 3 ) );
        next.setAttribute( 'aAlpha', new THREE.BufferAttribute( data.alpha, 2 ) );
        next.setAttribute( 'aSize', new THREE.BufferAttribute( data.size, 2 ) );
        next.setAttribute( 'aKind', new THREE.BufferAttribute( data.kind, 1 ) );
        next.setAttribute( 'aRand', new THREE.BufferAttribute( data.rand, 1 ) );
        next.setAttribute( 'aArc', new THREE.BufferAttribute( data.arc, 1 ) );
        next.setAttribute( 'aDelay', new THREE.BufferAttribute( data.delay, 1 ) );
        geometry.dispose();
        geometry = next;
        points.geometry = next;
      }

      let resizeTimer: ReturnType<typeof setTimeout> | undefined;
      const resizeObserver = new ResizeObserver( () =>
      {
        clearTimeout( resizeTimer );
        resizeTimer = setTimeout( rebuild, width ? 150 : 0 );
      } );
      resizeObserver.observe( canvas.parentElement! );
      rebuild();

      // Pointer → point on the flag plane
      const pointer = new THREE.Vector2( 0, 0 );
      const parallax = new THREE.Vector2( 0, 0 );
      const ray = new THREE.Raycaster();
      const plane = new THREE.Plane( new THREE.Vector3( 0, 0, 1 ), 0 );
      const hit = new THREE.Vector3();
      let pointerActive = false;
      function onPointerMove( e: PointerEvent )
      {
        const rect = canvas!.getBoundingClientRect();
        pointer.set( ( e.clientX - rect.left ) / rect.width * 2 - 1, -( ( e.clientY - rect.top ) / rect.height * 2 - 1 ) );
        pointerActive = true;
      }
      window.addEventListener( 'pointermove', onPointerMove, { passive: true } );

      let visible = true;
      const visibility = new IntersectionObserver( ( [ entry ] ) =>
      {
        visible = entry.isIntersecting;
        if ( visible && !frame ) frame = requestAnimationFrame( tick );
      } );
      visibility.observe( section! );

      let frame = 0;
      let last = performance.now();
      let progress = -1;
      let readyAt = 0;
      let phase = '';
      const projected = new THREE.Vector3();

      function tick( now: number )
      {
        frame = 0;
        if ( !visible ) return;
        // Capped so a backgrounded tab doesn't jump, but loose enough to settle at low frame rates
        const dt = Math.min( ( now - last ) / 1000, 0.25 );
        last = now;

        const rect = section!.getBoundingClientRect();
        const range = rect.height - window.innerHeight;
        const target = range > 0 ? clamp01( -rect.top / range ) : 0;
        progress = progress < 0 ? target : progress + ( target - progress ) * ( 1 - Math.exp( -dt * 7 ) );
        section!.style.setProperty( '--journey', progress.toFixed( 4 ) );
        const nextPhase = progress < 0.18 ? 'flag' : progress < 0.6 ? 'morph' : 'map';
        if ( nextPhase !== phase )
        {
          phase = nextPhase;
          section!.dataset.phase = phase;
        }

        const morph = clamp01( ( progress - 0.12 ) / 0.5 );
        uniforms.uMorph.value = morph;
        uniforms.uTime.value += dt;
        if ( !readyAt ) readyAt = now;
        uniforms.uIntro.value = clamp01( ( now - readyAt ) / 900 );

        // Camera: gentle pointer parallax, tilting back like a map on a table
        parallax.lerp( pointer, 1 - Math.exp( -dt * 3 ) );
        const tilt = easeInOut( morph ) * 0.3;
        camera.position.set( parallax.x * 0.6, parallax.y * 0.4 - Math.sin( tilt ) * distance, Math.cos( tilt ) * distance * ( 1 - morph * 0.06 ) );
        camera.lookAt( 0, 0, 0 );
        camera.updateMatrixWorld();

        if ( pointerActive )
        {
          ray.setFromCamera( pointer, camera );
          if ( ray.ray.intersectPlane( plane, hit ) ) uniforms.uMouse.value.set( hit.x, hit.y );
        }

        stations.forEach( ( [ x, y ], i ) =>
        {
          const label = labelRefs.current[ i ];
          if ( !label ) return;
          projected.set( x, y, 0 ).project( camera );
          label.style.transform = `translate3d(${( projected.x + 1 ) / 2 * width}px, ${( 1 - projected.y ) / 2 * height}px, 0)`;
        } );

        renderer.render( scene, camera );
        if ( uniforms.uIntro.value === 0 ) callbacks.current.onReady();
        frame = requestAnimationFrame( tick );
      }
      frame = requestAnimationFrame( tick );

      cleanup = () =>
      {
        cancelAnimationFrame( frame );
        clearTimeout( resizeTimer );
        resizeObserver.disconnect();
        visibility.disconnect();
        window.removeEventListener( 'pointermove', onPointerMove );
        geometry.dispose();
        material.dispose();
        renderer.dispose();
      };
    } ).catch( () =>
    {
      if ( !disposed ) callbacks.current.onFallback();
    } );

    return () =>
    {
      disposed = true;
      cleanup();
    };
  }, [ sectionRef ] );

  return (
    <>
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      <nav className={styles.stations} aria-label="首页线路图">
        {JOURNEY_STATIONS.map( ( station, i ) => (
          <a
            key={station.id}
            ref={el => { labelRefs.current[ i ] = el; }}
            href={`#${station.id}`}
            className={styles.station}
          >
            <span className={styles.stationName}>{station.name}</span>
            <span className={styles.stationZh}>{station.zh}</span>
          </a>
        ) )}
      </nav>
    </>
  );
}
