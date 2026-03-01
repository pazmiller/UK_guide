'use client';

import { useEffect, useRef } from 'react';

export default function UnionJackDots()
{
  const canvasRef = useRef<HTMLCanvasElement>( null );

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

    // Returns the Union Jack color [r, g, b] at normalized coords (nx, ny) in [0,1]x[0,1]
    // The flag has 2:1 aspect ratio, so we scale nx to [0,2]
    function getUnionJackColor( nx: number, ny: number ): [ number, number, number ]
    {
      const x = nx * 2;
      const y = ny;

      // Distance from center cross-lines
      const dv = Math.abs( x - 1.0 ); // vertical centre
      const dh = Math.abs( y - 0.5 ); // horizontal centre

      // Perpendicular distance from each main diagonal of a 2:1 flag
      // Diagonal 1: (0,0)→(2,1)  →  line: x - 2y = 0,  |normal| = √5
      const dd1 = Math.abs( x - 2 * y ) / Math.sqrt( 5 );
      // Diagonal 2: (2,0)→(0,1)  →  line: x + 2y = 2,  |normal| = √5
      const dd2 = Math.abs( x + 2 * y - 2 ) / Math.sqrt( 5 );

      // St George's Cross (red) — 1/5 of flag height wide
      if ( dv < 0.10 || dh < 0.10 ) return [ 204, 0, 35 ];
      // White fimbriation around the cross — extends to 1/3 of flag height wide total
      if ( dv < 0.16 || dh < 0.16 ) return [ 255, 255, 255 ];
      // St Andrew's / St Patrick's saltire
      if ( dd1 < 0.084 || dd2 < 0.084 )
      {
        if ( dd1 < 0.028 || dd2 < 0.028 ) return [ 204, 0, 35 ]; // Patrick red stripe
        return [ 255, 255, 255 ]; // Andrew white saltire
      }
      // Blue field
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

      // Flag fills the full width, centred vertically
      const flagW = W;
      const flagH = W / 2;
      const flagOffsetY = ( H - flagH ) / 2;

      const cols = Math.ceil( W / SPACING ) + 1;
      const rows = Math.ceil( H / SPACING ) + 1;

      for ( let row = 0; row < rows; row++ )
      {
        for ( let col = 0; col < cols; col++ )
        {
          const px = col * SPACING + SPACING * 0.5;
          const py = row * SPACING + SPACING * 0.5;

          // Normalised flag coordinates
          const nx = px / flagW;
          const ny = ( py - flagOffsetY ) / flagH;
          const inFlag = nx >= 0 && nx <= 1 && ny >= 0 && ny <= 1;

          const baseColor: [ number, number, number ] = inFlag
            ? getUnionJackColor( nx, ny )
            : [ 0, 12, 50 ];

          // Light-ring from mouse cursor only
          const dx = px / W - mouseX;
          const dy = py / H - mouseY;
          const d2 = Math.sqrt( dx * dx + dy * dy );

          // 影响范围：越大覆盖越广（0.12~0.25 常用）
          const sigma = 0.25;
          // 距离衰减（高斯），只负责“离鼠标远就弱”，不产生环
          const falloff = Math.exp( -( d2 * d2 ) / ( 2 * sigma * sigma ) );

          // 起伏频率：越大“褶皱”越密（2~6）
          const spatial = 3.5;
          // 起伏速度：越大流动越快（0.6~1.8）
          const speed = 1.0;

          // 用 dx,dy 造一个平面波叠加（像布面起伏），不会是同心环
          const wave =
            0.5 + 0.5 * Math.sin( t * speed + dx * spatial * Math.PI * 2 + dy * spatial * Math.PI * 1.6 );

          // 最终“高度”（0~1）
          const height = falloff;       // 不随时间变化
          const wavePeak = Math.pow( height, 1.6 );

          const baseR = inFlag ? 1.6 : 1.0;         // 点的基础半径
          const bumpR = inFlag ? 2.4 : 0.8;         // 鼠标附近鼓起的幅度
          const baseA = inFlag ? 0.35 : 0.12;       // 基础透明度（别太低，否则像一堆黑洞）
          const bumpA = inFlag ? 0.55 : 0.12;       // 起伏增加的透明度

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
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: 'block' }}
    />
  );
}
