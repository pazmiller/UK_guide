'use client';

/**
 * A decorative blue-white-red tricolor ribbon (Union Jack palette)
 * that weaves through the London page as a visual guide.
 *
 * Renders an absolutely-positioned SVG spanning the full page height.
 * Each section boundary is connected by a curved ribbon segment.
 */

import { useEffect, useRef, useState } from 'react';

const BLUE = '#1D3557';
const WHITE = '#FFFFFF';
const RED = '#E63946';
const YELLOW = '#F4A261';  // Scotland
const GREEN = '#2A9D8F';   // Wales
const STRIPE_W = 20;
const GAP = 3;
const TOTAL_W = STRIPE_W * 5 + GAP * 4; // 112

export default function LondonRibbon()
{
  const containerRef = useRef<HTMLDivElement>( null );
  const [ height, setHeight ] = useState( 0 );
  const [ width, setWidth ] = useState( 0 );

  useEffect( () =>
  {
    const el = containerRef.current?.parentElement;
    if ( !el ) return;

    const measure = () =>
    {
      setHeight( el.scrollHeight );
      setWidth( el.clientWidth );
    };
    measure();

    const ro = new ResizeObserver( measure );
    ro.observe( el );
    return () => ro.disconnect();
  }, [] );

  if ( !height || !width )
  {
    return <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-visible" />;
  }

  // Waypoints define the center-x of the ribbon at key Y positions.
  // The ribbon weaves left → right → left → right → left across sections.
  const margin = Math.min( width * 0.15, 120 );
  const leftX = margin + TOTAL_W / 2;
  const rightX = width - margin - TOTAL_W / 2;
  const midX = width / 2;

  // Y breakpoints (approximate % of page height for each section transition)
  const waypoints = [
    { x: rightX, y: 0 },                    // start: top-right
    { x: rightX, y: height * 0.06 },        // hero area right
    { x: leftX, y: height * 0.18 },         // intro section left
    { x: leftX, y: height * 0.28 },         // hold left
    { x: rightX, y: height * 0.40 },        // history section right
    { x: rightX, y: height * 0.50 },        // hold right
    { x: midX, y: height * 0.58 },          // restaurants center
    { x: leftX, y: height * 0.68 },         // left
    { x: leftX, y: height * 0.78 },         // hold left
    { x: rightX, y: height * 0.88 },        // attractions right
    { x: midX, y: height * 1.0 },           // exit center-bottom
  ];

  // Build a smooth cubic bezier path through the waypoints
  function buildPath( offsetX: number ): string
  {
    const pts = waypoints.map( p => ( { x: p.x + offsetX, y: p.y } ) );
    let d = `M ${pts[ 0 ].x} ${pts[ 0 ].y}`;
    for ( let i = 1; i < pts.length; i++ )
    {
      const prev = pts[ i - 1 ];
      const curr = pts[ i ];
      const cpY = ( prev.y + curr.y ) / 2;
      d += ` C ${prev.x} ${cpY}, ${curr.x} ${cpY}, ${curr.x} ${curr.y}`;
    }
    return d;
  }

  const offsets = [
    { color: BLUE, dx: -2 * ( STRIPE_W + GAP ) },
    { color: RED, dx: -( STRIPE_W + GAP ) },
    { color: WHITE, dx: 0 },
    { color: GREEN, dx: STRIPE_W + GAP },
    { color: YELLOW, dx: 2 * ( STRIPE_W + GAP ) },
  ];

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute top-0 left-0"
      >
        {offsets.map( ( { color, dx } ) => (
          <path
            key={color}
            d={buildPath( dx )}
            stroke={color}
            strokeWidth={STRIPE_W}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity={0.75}
          />
        ) )}
      </svg>
    </div>
  );
}
