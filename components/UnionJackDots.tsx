'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

const WORDS = [ '啾咪', 'To be or not to be', 'That is the question', 'The game is afoot!', '西八巴', 'Oi', '哎呀媽呀', '林北跟你讲', '天啦嚕', 'Come next day', 'Do you have appointment?', 'Chanmeimei', 'Pompipi了', 'See it Say it Sorted', '保护好你的手机', 'bowowaer', "don't get mugged", "It's Chewsday", 'innit mate', 'what a plunker', 'A lovely cup of Tea', 'go get some Chippy' ] as const;
const WORD_COLORS = [ '#FFD700', '#FF6B9D', '#7BFF7B', '#87CEEB', '#FFB347', '#DA70D6' ];

type PopLabel = { id: number; x: number; y: number; word: string; color: string };

export default function UnionJackDots()
{
  const canvasRef = useRef<HTMLCanvasElement>( null );
  const [ pops, setPops ] = useState<PopLabel[]>( [] );
  const colorIdxRef = useRef( 0 );

  const handleClick = useCallback( ( e: React.MouseEvent<HTMLDivElement> ) =>
  {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const word = WORDS[ Math.floor( Math.random() * WORDS.length ) ];
    const color = WORD_COLORS[ colorIdxRef.current % WORD_COLORS.length ];
    colorIdxRef.current++;
    const id = Date.now() + Math.random();
    setPops( prev => [ ...prev, { id, x, y, word, color } ] );
    setTimeout( () =>
    {
      setPops( prev => prev.filter( p => p.id !== id ) );
    }, 2500 );
  }, [] );

  useEffect( () =>
  {
    const canvas = canvasRef.current!;
    if ( !canvas ) return;
    const ctx = canvas.getContext( '2d' )!;
    if ( !ctx ) return;

    let animId: number;
    let startTime: number | null = null;
    let mouseX = 0.5;
    let mouseY = 0.5;

    const SPACING = 12;

    function resize()
    {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();

    const ro = new ResizeObserver( resize );
    ro.observe( canvas );

    function onMouseMove( e: MouseEvent )
    {
      const rect = canvas.getBoundingClientRect();
      mouseX = ( e.clientX - rect.left ) / rect.width;
      mouseY = ( e.clientY - rect.top ) / rect.height;
    }
    window.addEventListener( 'mousemove', onMouseMove );

    function getUnionJackColor( nx: number, ny: number ): [ number, number, number ]
    {
      const x = nx * 2;
      const y = ny;

      const dv = Math.abs( x - 1.0 );
      const dh = Math.abs( y - 0.5 );

      const dd1 = Math.abs( x - 2 * y ) / Math.sqrt( 5 );
      const dd2 = Math.abs( x + 2 * y - 2 ) / Math.sqrt( 5 );

      if ( dv < 0.10 || dh < 0.10 ) return [ 204, 0, 35 ];
      if ( dv < 0.16 || dh < 0.16 ) return [ 255, 255, 255 ];
      if ( dd1 < 0.084 || dd2 < 0.084 )
      {
        if ( dd1 < 0.028 || dd2 < 0.028 ) return [ 204, 0, 35 ];
        return [ 255, 255, 255 ];
      }
      return [ 1, 33, 105 ];
    }

    function draw( ts: number )
    {
      if ( startTime === null ) startTime = ts;
      const t = ( ts - startTime ) / 1000;

      const W = canvas.width;
      const H = canvas.height;

      ctx.fillStyle = '#010820';
      ctx.fillRect( 0, 0, W, H );

      let flagW: number, flagH: number, flagOffsetX: number, flagOffsetY: number;
      if ( W / H >= 2 )
      {
        flagW = W;
        flagH = W / 2;
        flagOffsetX = 0;
        flagOffsetY = ( H - flagH ) / 2;
      }
      else
      {
        flagH = H;
        flagW = H * 2;
        flagOffsetX = ( W - flagW ) / 2;
        flagOffsetY = 0;
      }

      const cols = Math.ceil( W / SPACING ) + 1;
      const rows = Math.ceil( H / SPACING ) + 1;

      for ( let row = 0; row < rows; row++ )
      {
        for ( let col = 0; col < cols; col++ )
        {
          const px = col * SPACING + SPACING * 0.5;
          const py = row * SPACING + SPACING * 0.5;

          const nx = ( px - flagOffsetX ) / flagW;
          const ny = ( py - flagOffsetY ) / flagH;
          const inFlag = nx >= 0 && nx <= 1 && ny >= 0 && ny <= 1;

          const baseColor: [ number, number, number ] = inFlag
            ? getUnionJackColor( nx, ny )
            : [ 0, 12, 50 ];

          const dx = px / W - mouseX;
          const dy = py / H - mouseY;
          const d2 = Math.sqrt( dx * dx + dy * dy );

          const sigma = 0.25;
          const falloff = Math.exp( -( d2 * d2 ) / ( 2 * sigma * sigma ) );

          const spatial = 3.5;
          const speed = 1.0;

          void ( 0.5 + 0.5 * Math.sin( t * speed + dx * spatial * Math.PI * 2 + dy * spatial * Math.PI * 1.6 ) );

          const wavePeak = Math.pow( falloff, 1.6 );

          const baseR = inFlag ? 1.6 : 1.0;
          const bumpR = inFlag ? 2.4 : 0.8;
          const baseA = inFlag ? 0.35 : 0.12;
          const bumpA = inFlag ? 0.55 : 0.12;

          const radius = baseR + wavePeak * bumpR;
          const alpha = baseA + wavePeak * bumpA;
          const [ r, g, b ] = baseColor;
          ctx.beginPath();
          ctx.arc( px, py, radius, 0, Math.PI * 2 );
          ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
          ctx.fill();
        }
      }

      animId = requestAnimationFrame( draw );
    }

    animId = requestAnimationFrame( draw );

    return () =>
    {
      cancelAnimationFrame( animId );
      ro.disconnect();
      window.removeEventListener( 'mousemove', onMouseMove );
    };
  }, [] );

  return (
    <div
      className="absolute inset-0"
      style={{ cursor: 'crosshair' }}
      onClick={handleClick}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: 'block', pointerEvents: 'none' }}
      />
      {pops.map( p => (
        <span
          key={p.id}
          className="word-pop"
          style={{ left: p.x, top: p.y, color: p.color, zIndex: 50 }}
        >
          {p.word}
        </span>
      ) )}
    </div>
  );
}
