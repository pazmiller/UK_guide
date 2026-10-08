'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';

// Match the timed window ride: 62% of a 45-second trip is about 28 seconds.
const TRIP_DURATION = 45_000;
const DEPARTURE_DELAY = 900;
const SCROLL_KEYS = new Set( [ 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Tab', 'Escape' ] );

type Status = 'ready' | 'playing' | 'paused' | 'finished';

/** Advance the existing scroll-driven ride, yielding immediately to the reader. */
export function useCarriageAutoplay( ref: RefObject<HTMLElement | null>, enabled: boolean )
{
  const [ status, setStatus ] = useState<Status>( 'ready' );
  const controls = useRef<{ toggle: () => void } | null>( null );

  useEffect( () =>
  {
    const section = ref.current;
    if ( !enabled || !section ) return;
    let frame = 0;
    let departure: ReturnType<typeof setTimeout> | undefined;
    let playing = false;
    let manualPause = false;
    let interacting = false;
    let last = 0;
    let departedAt = 0;
    let remainder = 0;

    const clearDeparture = () =>
    {
      clearTimeout( departure );
      departure = undefined;
    };

    const inRide = () =>
    {
      const rect = section!.getBoundingClientRect();
      return section!.dataset.collapsed !== 'true'
        && rect.height > window.innerHeight
        && rect.top <= window.innerHeight * 0.15
        && rect.bottom > window.innerHeight + 1;
    };

    function pause()
    {
      clearDeparture();
      cancelAnimationFrame( frame );
      frame = 0;
      if ( playing )
      {
        playing = false;
        setStatus( 'paused' );
      }
    }

    function tick( now: number )
    {
      frame = 0;
      const rect = section!.getBoundingClientRect();
      const range = rect.height - window.innerHeight;
      if ( document.hidden || section!.dataset.collapsed === 'true' || rect.top > window.innerHeight * 0.15 || rect.bottom <= 0 || range <= 0 )
      {
        pause();
        return;
      }
      const remaining = rect.bottom - window.innerHeight;
      if ( remaining <= 1 )
      {
        playing = false;
        setStatus( 'finished' );
        return;
      }
      if ( !last ) departedAt = now;
      const elapsed = last ? Math.min( now - last, 64 ) : 0;
      last = now;
      const ramp = Math.min( ( now - departedAt ) / 900, 1 );
      const step = Math.min( range * elapsed / TRIP_DURATION * ramp + remainder, remaining );
      const pixels = Math.floor( step );
      remainder = step - pixels;
      window.scrollTo( { top: window.scrollY + pixels, behavior: 'instant' } );
      frame = requestAnimationFrame( tick );
    }

    function play()
    {
      clearDeparture();
      if ( playing || document.hidden || interacting || !inRide() ) return;
      playing = true;
      last = 0;
      remainder = 0;
      setStatus( 'playing' );
      frame = requestAnimationFrame( tick );
    }

    function scheduleDeparture()
    {
      clearDeparture();
      if ( playing || manualPause || interacting || document.hidden || !inRide() ) return;
      departure = setTimeout( play, DEPARTURE_DELAY );
    }

    const interrupt = () =>
    {
      pause();
      scheduleDeparture();
    };
    const onPointerDown = ( event: Event ) =>
    {
      if ( ( event.target as Element | null )?.closest( '[data-carriage-playback]' ) ) return;
      interacting = true;
      pause();
    };
    const onPointerUp = () =>
    {
      interacting = false;
      scheduleDeparture();
    };
    const onKey = ( event: KeyboardEvent ) =>
    {
      // Space activates the playback button; Escape and navigation keys still pause it.
      if ( event.key === ' ' && ( event.target as Element | null )?.closest( '[data-carriage-playback]' ) ) return;
      if ( event.key === 'Escape' && playing ) manualPause = true;
      if ( SCROLL_KEYS.has( event.key ) ) interrupt();
    };
    const onScroll = () =>
    {
      // Our own animation scrolls must not reset the idle timer or pause the ride.
      if ( !playing ) scheduleDeparture();
    };
    const onVisibility = () =>
    {
      if ( document.hidden )
      {
        interacting = false;
        pause();
      }
      else scheduleDeparture();
    };
    const observer = new IntersectionObserver( ( [ entry ] ) =>
    {
      if ( entry.isIntersecting ) scheduleDeparture();
      else pause();
    } );
    observer.observe( section );
    controls.current = { toggle: () =>
    {
      if ( playing )
      {
        manualPause = true;
        pause();
      }
      else
      {
        manualPause = false;
        play();
      }
    } };
    window.addEventListener( 'scroll', onScroll, { passive: true } );
    window.addEventListener( 'wheel', interrupt, { passive: true } );
    window.addEventListener( 'pointerdown', onPointerDown, { passive: true } );
    window.addEventListener( 'pointerup', onPointerUp, { passive: true } );
    window.addEventListener( 'pointercancel', onPointerUp, { passive: true } );
    window.addEventListener( 'touchstart', onPointerDown, { passive: true } );
    window.addEventListener( 'touchend', onPointerUp, { passive: true } );
    window.addEventListener( 'touchcancel', onPointerUp, { passive: true } );
    window.addEventListener( 'keydown', onKey );
    document.addEventListener( 'visibilitychange', onVisibility );

    return () =>
    {
      clearDeparture();
      cancelAnimationFrame( frame );
      observer.disconnect();
      controls.current = null;
      window.removeEventListener( 'scroll', onScroll );
      window.removeEventListener( 'wheel', interrupt );
      window.removeEventListener( 'pointerdown', onPointerDown );
      window.removeEventListener( 'pointerup', onPointerUp );
      window.removeEventListener( 'pointercancel', onPointerUp );
      window.removeEventListener( 'touchstart', onPointerDown );
      window.removeEventListener( 'touchend', onPointerUp );
      window.removeEventListener( 'touchcancel', onPointerUp );
      window.removeEventListener( 'keydown', onKey );
      document.removeEventListener( 'visibilitychange', onVisibility );
    };
  }, [ enabled, ref ] );

  return { status, toggle: () => controls.current?.toggle() };
}
