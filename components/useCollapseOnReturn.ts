'use client';

import { useEffect, type RefObject } from 'react';

let lastAnchorClick: { hash: string; at: number } | null = null;
let intentSubscribers = 0;
let resumeTimer: ReturnType<typeof setTimeout> | undefined;

/** Several sections can collapse in one frame; resume the jump once, after all of them */
function resumeAnchorJump()
{
  if ( !lastAnchorClick || performance.now() - lastAnchorClick.at > 2000 ) return;
  const hash = lastAnchorClick.hash;
  clearTimeout( resumeTimer );
  resumeTimer = setTimeout( () => document.querySelector( hash )?.scrollIntoView( { behavior: 'smooth' } ), 60 );
}

// Only the reader heading up should collapse anything; programmatic scrolls
// (reading mode restoring its position, scroll cues) must leave the layout alone.
let lastUpIntent = -Infinity;
let touchY = 0;
const markUp = () => { lastUpIntent = performance.now(); };
const UP_KEYS = new Set( [ 'ArrowUp', 'PageUp', 'Home' ] );

function rememberAnchorClick( event: MouseEvent )
{
  const link = ( event.target as Element | null )?.closest?.( 'a[href^="#"]' );
  if ( !link ) return;
  lastAnchorClick = { hash: link.getAttribute( 'href' )!, at: performance.now() };
  markUp();
}

const intentListeners: [ string, EventListener ][] = [
  [ 'click', rememberAnchorClick as EventListener ],
  [ 'wheel', ( event => { if ( ( event as WheelEvent ).deltaY < 0 ) markUp(); } ) as EventListener ],
  [ 'keydown', ( event => { const e = event as KeyboardEvent; if ( UP_KEYS.has( e.key ) || ( e.key === ' ' && e.shiftKey ) ) markUp(); } ) as EventListener ],
  [ 'touchstart', ( event => { touchY = ( event as TouchEvent ).touches[ 0 ]?.clientY ?? 0; } ) as EventListener ],
  // Finger moving down scrolls the page up; momentum keeps going after the finger lifts
  [ 'touchmove', ( event => { const y = ( event as TouchEvent ).touches[ 0 ]?.clientY ?? touchY; if ( y > touchY + 4 ) markUp(); touchY = y; } ) as EventListener ],
];
const userIsHeadingUp = () => performance.now() - lastUpIntent < 1500;

/**
 * A pinned, scroll-driven section costs several screens of scrolling. When the
 * reader comes back up from below, collapse it to its normal height (keeping the
 * view still) so it passes in one screen; once it is below the viewport again,
 * restore it so the next trip down plays the animation as before.
 * The section's CSS decides what `data-collapsed="true"` looks like.
 */
export function useCollapseOnReturn( ref: RefObject<HTMLElement | null> )
{
  useEffect( () =>
  {
    const section = ref.current;
    if ( !section ) return;

    if ( intentSubscribers++ === 0 ) intentListeners.forEach( ( [ type, listener ] ) => document.addEventListener( type, listener, { capture: true, passive: true } ) );

    let lastY = window.scrollY;
    let frame = 0;

    function update()
    {
      frame = 0;
      const el = section!;
      const y = window.scrollY;
      const goingUp = y < lastY - 1;
      lastY = y;
      const rect = el.getBoundingClientRect();
      const collapsed = el.dataset.collapsed === 'true';

      if ( !collapsed && goingUp && rect.bottom < 0 && userIsHeadingUp() )
      {
        const before = el.offsetHeight;
        // Only pinned layouts are taller than a couple of screens
        if ( before < window.innerHeight * 1.6 ) return;
        const root = document.documentElement;
        root.style.overflowAnchor = 'none';
        el.dataset.collapsed = 'true';
        const removed = before - el.offsetHeight;
        window.scrollTo( { top: y - removed, behavior: 'instant' } );
        lastY = window.scrollY;
        requestAnimationFrame( () => { root.style.overflowAnchor = ''; } );

        // Our instant scroll cancels a smooth in-page jump that was under way; resume it
        resumeAnchorJump();
      }
      else if ( collapsed && rect.top > window.innerHeight )
      {
        // Entirely below the screen now, so growing back can't move what the reader sees
        delete el.dataset.collapsed;
      }
    }

    const onScroll = () => { if ( !frame ) frame = requestAnimationFrame( update ); };
    window.addEventListener( 'scroll', onScroll, { passive: true } );
    return () =>
    {
      cancelAnimationFrame( frame );
      window.removeEventListener( 'scroll', onScroll );
      if ( --intentSubscribers === 0 ) intentListeners.forEach( ( [ type, listener ] ) => document.removeEventListener( type, listener, { capture: true } ) );
    };
  }, [ ref ] );
}
