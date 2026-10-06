'use client';

import { useEffect, useRef, type RefObject } from 'react';
import type { BuiltStation } from './ExploreCarriage';
import styles from './ExploreCarriage.module.css';

type Props = {
  stations: BuiltStation[];
  /** The pinned Explore scroller whose scroll position drives the dig */
  scrollerRef: RefObject<HTMLElement | null>;
  onReady: () => void;
  onFallback: () => void;
};

// Build the scene well before the dig scrolls into view (it is invisible until 0.62):
// set-up is spread over many short slices so scrolling stays smooth meanwhile
const PREPARE_AT = 0.35;
const DRAW_FROM = 0.6;
// Below this gap between scroll position and the eased progress, the picture is still
const SETTLED = 0.0001;

const clamp01 = ( v: number ) => Math.min( Math.max( v, 0 ), 1 );

/**
 * CFFA's own Elizabeth line: a train runs through the finished tunnel past a ring
 * marker for every city the community has recommended, pulls into the unfinished
 * station at the end of the line, and opens its doors onto the call to contribute.
 * Scene code lives in ./elizabethLine.
 */
export default function ElizabethLineBuild( { stations, scrollerRef, onReady, onFallback }: Props )
{
  const canvasRef = useRef<HTMLCanvasElement>( null );
  const callbacks = useRef( { onReady, onFallback } );
  useEffect( () => { callbacks.current = { onReady, onFallback }; } );
  const stationKey = stations.map( station => `${station.name}:${station.count}` ).join( '|' );

  useEffect( () =>
  {
    const canvas = canvasRef.current;
    const scroller = scrollerRef.current;
    if ( !canvas || !scroller || !stationKey ) return;

    let disposed = false;
    let scene: import( './elizabethLine/scene' ).DigScene | null = null;
    let loading = false;
    let frame = 0;
    let visible = false;
    let smoothed = -1;
    let last = 0;
    let lastDrawn = 0;
    let readyFired = false;
    let width = 0;
    let height = 0;

    const progress = () =>
    {
      const rect = scroller.getBoundingClientRect();
      const range = rect.height - window.innerHeight;
      return range > 0 ? clamp01( -rect.top / range ) : 0;
    };

    const resize = () =>
    {
      const parent = canvas.parentElement!;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      if ( !scene || !w || !h || ( w === width && h === height ) ) return;
      width = w;
      height = h;
      scene.resize( w, h );
    };

    async function prepare()
    {
      if ( loading || scene ) return;
      loading = true;
      try
      {
        await document.fonts.ready;
        const { createDigScene } = await import( './elizabethLine/scene' );
        if ( disposed ) return;
        const font = getComputedStyle( document.body ).fontFamily || 'sans-serif';
        const created = await createDigScene( canvas!, stations, font );
        if ( disposed )
        {
          created.dispose();
          return;
        }
        scene = created;
        width = 0;
        resize();
        wake();
      }
      catch
      {
        if ( !disposed ) callbacks.current.onFallback();
      }
    }

    // Draws only while the eased progress is still catching up with the scroll position;
    // once the picture is still the loop stops until the next scroll, resize or reveal
    function wake()
    {
      if ( visible && scene && !frame ) frame = requestAnimationFrame( tick );
    }

    function tick( now: number )
    {
      frame = 0;
      if ( !visible || !scene ) return;
      const dt = last ? Math.min( ( now - last ) / 1000, 0.25 ) : 0;
      last = now;
      const p = progress();
      smoothed = smoothed < 0 ? p : smoothed + ( p - smoothed ) * ( 1 - Math.exp( -dt * 9 ) );
      const settled = Math.abs( p - smoothed ) < SETTLED;
      if ( settled ) smoothed = p;
      if ( smoothed >= DRAW_FROM )
      {
        resize();
        // Only back-to-back frames say anything about how fast this device renders
        if ( lastDrawn && dt > 0 ) scene.measure( now - lastDrawn, now );
        scene.update( smoothed, now );
        lastDrawn = now;
        if ( !readyFired )
        {
          readyFired = true;
          callbacks.current.onReady();
        }
      }
      else lastDrawn = 0;
      if ( settled )
      {
        last = 0;
        lastDrawn = 0;
        return;
      }
      frame = requestAnimationFrame( tick );
    }

    const onScroll = () =>
    {
      if ( scene ) wake();
      else if ( progress() >= PREPARE_AT ) void prepare();
    };
    window.addEventListener( 'scroll', onScroll, { passive: true } );
    onScroll();

    const visibility = new IntersectionObserver( ( [ entry ] ) =>
    {
      visible = entry.isIntersecting;
      last = 0;
      lastDrawn = 0;
      wake();
    } );
    visibility.observe( scroller );
    const resizeObserver = new ResizeObserver( () =>
    {
      resize();
      wake();
    } );
    resizeObserver.observe( canvas.parentElement! );

    return () =>
    {
      disposed = true;
      cancelAnimationFrame( frame );
      window.removeEventListener( 'scroll', onScroll );
      visibility.disconnect();
      resizeObserver.disconnect();
      scene?.dispose();
    };
    // stations is captured through stationKey
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ scrollerRef, stationKey ] );

  return (
    <div className={styles.dig} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.digCanvas} />
    </div>
  );
}
