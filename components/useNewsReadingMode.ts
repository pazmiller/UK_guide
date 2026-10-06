'use client';

import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

export function useNewsReadingMode()
{
  const [ reading, setReading ] = useState( false );
  const boardRef = useRef<HTMLElement>( null );
  const contentRef = useRef<HTMLDivElement>( null );
  const toggleRef = useRef<HTMLButtonElement>( null );
  const running = useRef<Animation[]>( [] );
  const savedOffset = useRef( 0 );

  useEffect( () => {
    const board = boardRef.current;
    const content = contentRef.current;
    const motion = window.matchMedia( '(prefers-reduced-motion: reduce)' );
    const settle = () => {
      running.current.forEach( animation => animation.cancel() );
      running.current = [];
      if ( content ) content.style.width = '';
      if ( board ) board.dataset.animating = 'false';
    };
    window.addEventListener( 'resize', settle );
    motion.addEventListener( 'change', settle );
    return () => {
      settle();
      window.removeEventListener( 'resize', settle );
      motion.removeEventListener( 'change', settle );
    };
  }, [] );

  function toggleReading( keyboard = false )
  {
    const board = boardRef.current;
    const content = contentRef.current;
    if ( !board || !content ) return;

    const before = board.getBoundingClientRect();
    const documentTop = before.top + window.scrollY;
    const interrupted = running.current.length > 0;
    const currentOpacity = getComputedStyle( content ).opacity;
    if ( !reading && !interrupted ) savedOffset.current = window.scrollY - documentTop;
    running.current.forEach( animation => animation.cancel() );
    running.current = [];
    content.style.width = '';

    const instant = keyboard || window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;
    board.dataset.instant = String( instant );
    board.dataset.animating = String( !instant );
    flushSync( () => setReading( !reading ) );

    if ( reading )
    {
      // Restore the compact panel's viewport position even when closing from its foot.
      window.scrollTo( { top: Math.max( 0, documentTop + savedOffset.current ), behavior: 'instant' } );
      toggleRef.current?.focus( { preventScroll: true } );
    }
    else if ( before.top < 100 || before.top > window.innerHeight / 3 )
    {
      window.scrollTo( { top: Math.max( 0, documentTop - 112 ), behavior: instant ? 'instant' : 'smooth' } );
    }

    if ( instant ) return;
    const after = board.getBoundingClientRect();
    // Measure once at the target width. Text does not rewrap on every resize frame.
    content.style.width = `${after.width - 2}px`;
    const duration = reading ? 520 : 760;
    const size = board.animate( [
      { width: `${before.width}px`, height: `${before.height}px` },
      { width: `${after.width}px`, height: `${after.height}px` },
    ], { duration, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' } );
    const reveal = content.animate( [
      { opacity: interrupted ? currentOpacity : 0 },
      { opacity: 1 },
    ], { duration: reading ? 220 : 380, delay: reading ? 160 : 100, fill: 'backwards' } );
    running.current = [ size, reveal ];
    size.onfinish = () => {
      content.style.width = '';
      board.dataset.animating = 'false';
      running.current = [];
    };
  }

  return { reading, boardRef, contentRef, toggleRef, toggleReading };
}
