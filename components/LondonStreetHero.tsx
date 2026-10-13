'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { LondonStreetScene } from './londonStreet/scene';
import { shopHref, SHOP_NAMES } from './londonStreet/storefronts';
import styles from './LondonStreetHero.module.css';

/** The server-rendered poster also works without JavaScript, WebGL or animation. */
function StreetPoster()
{
  return (
    <svg className={styles.poster} viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="1440" height="800" fill="#C3323A" />
      <path d="M690 370H750L1350 800H90Z" fill="#D7CEC0" />
      <path d="M702 370H738L1120 800H320Z" fill="#F3F0E7" />
      <path d="M718 370H722L725 800H715Z" fill="#C3323A" />
      <g fill="#1D3557">
        <path d="M0 0H170V735L0 800ZM190 70L340 126V645L190 720ZM362 152L467 198V554L362 627ZM490 226L557 254V488L490 535ZM577 277L621 298V439L577 473Z" />
        <path d="M1440 0H1260V735L1440 800ZM1238 55L1085 119V633L1238 720ZM1064 180L970 214V550L1064 616ZM947 234L874 268V487L947 536ZM852 286L814 303V438L852 470Z" />
      </g>
      <g fill="#F3F0E7">
        <path d="M30 110L74 118V217L30 208ZM110 124L148 133V226L110 220ZM30 284L74 288V388L30 387ZM110 290L148 297V391L110 390ZM220 163L247 173V239L220 230ZM283 187L311 197V262L283 251ZM220 294L247 300V369L220 364ZM283 310L311 316V383L283 378ZM385 223L406 231V278L385 270ZM437 241L455 249V294L437 287Z" />
        <path d="M1397 109L1352 119V218L1397 209ZM1314 130L1278 138V231L1314 223ZM1397 283L1352 290V389L1397 386ZM1314 300L1278 305V399L1314 392ZM1210 164L1183 175V242L1210 232ZM1149 188L1119 200V264L1149 253ZM1210 302L1183 310V374L1210 369Z" />
        <path d="M606 322V293H618V280H627V260C627 229 666 229 666 260V280H677V293H689V344ZM636 229V213H646V204H650V213H661V217H650V229Z" />
        <path d="M781 348L795 128L822 372Z" />
        <path d="M857 355L845 226Q872 211 897 225L884 374Z" />
      </g>
      <g transform="translate(350 482)">
        <path d="M0 25Q40-5 80 25V166H0Z" fill="#E63946" />
        <path d="M8 29H72V43H8Z" fill="#F3F0E7" />
        <path d="M10 53H70V150H10Z" fill="#8DAFC2" />
        <path d="M30 52V151M50 52V151M10 76H70M10 101H70M10 126H70" stroke="#E63946" strokeWidth="5" />
        <path d="M-4 167H84" stroke="#1D3557" strokeWidth="8" />
      </g>
      <g transform="translate(1010 485)">
        <path d="M0 10Q23-10 46 10V91H0Z" fill="#E63946" />
        <path d="M7 25H39" stroke="#1D3557" strokeWidth="6" />
        <path d="M17 39H29V59H17Z" fill="#F3F0E7" />
        <path d="M-3 91H49" stroke="#1D3557" strokeWidth="10" />
      </g>
    </svg>
  );
}

export default function LondonStreetHero()
{
  const rootRef = useRef<HTMLElement>( null );
  const canvasRef = useRef<HTMLCanvasElement>( null );
  const router = useRouter();
  const [ availability, setAvailability ] = useState<'loading' | 'ready' | 'static'>( 'loading' );

  useEffect( () =>
  {
    const root = rootRef.current!;
    const canvas = canvasRef.current!;
    const motion = window.matchMedia( '(prefers-reduced-motion: reduce)' );
    let scene: LondonStreetScene | undefined;
    let disposed = false;
    let loading = false;
    let failed = false;
    let visible = false;
    let frame = 0;
    let previous = 0;
    let elapsed = 0;
    let hoverPosition: { x: number; y: number } | undefined;
    let lastHoverCheck = -Infinity;

    function tick( now: number )
    {
      // Resume from the same street position, even after a long visit to another tab.
      if ( previous ) elapsed += Math.min( ( now - previous ) / 1000, .05 );
      previous = now;
      scene!.render( elapsed );
      if ( hoverPosition && now - lastHoverCheck >= 80 )
      {
        lastHoverCheck = now;
        const cursor = scene!.hrefAt( hoverPosition.x, hoverPosition.y ) ? 'pointer' : '';
        if ( canvas.style.cursor !== cursor ) canvas.style.cursor = cursor;
      }
      frame = requestAnimationFrame( tick );
    }

    function sync()
    {
      cancelAnimationFrame( frame );
      frame = 0;
      previous = 0;
      const running = !!scene && visible && !document.hidden && !motion.matches;
      root.dataset.motion = running ? 'running' : 'paused';
      if ( !running ) canvas.style.cursor = '';
      if ( running ) frame = requestAnimationFrame( tick );
    }

    function resize()
    {
      scene?.resize( root.clientWidth, root.clientHeight );
      scene?.render( elapsed );
    }

    async function prepare()
    {
      if ( disposed || loading || failed ) return;
      if ( motion.matches )
      {
        setAvailability( 'static' );
        sync();
        return;
      }
      if ( scene )
      {
        setAvailability( 'ready' );
        sync();
        return;
      }
      if ( !visible ) return;
      loading = true;
      try
      {
        const [ { createLondonStreetScene } ] = await Promise.all( [ import( './londonStreet/scene' ), document.fonts.ready ] );
        const signFont = getComputedStyle( document.body ).getPropertyValue( '--font-noto-sans-sc' ).trim() || 'sans-serif';
        await document.fonts.load( `600 64px ${signFont.split( ',' )[ 0 ]}`, SHOP_NAMES.join( '' ) );
        if ( disposed ) return;
        scene = createLondonStreetScene( canvas );
        resize();
        setAvailability( motion.matches ? 'static' : 'ready' );
        sync();
      }
      catch
      {
        failed = true;
        scene?.dispose();
        scene = undefined;
        if ( !disposed ) setAvailability( 'static' );
      }
      finally { loading = false; }
    }

    function contextLost( event: Event )
    {
      event.preventDefault();
      failed = true;
      cancelAnimationFrame( frame );
      scene?.dispose();
      scene = undefined;
      root.dataset.motion = 'paused';
      setAvailability( 'static' );
    }

    function pointerMove( event: PointerEvent )
    {
      if ( event.pointerType === 'touch' ) return;
      hoverPosition = { x: event.clientX, y: event.clientY };
    }
    function pointerLeave()
    {
      canvas.style.cursor = '';
      hoverPosition = undefined;
    }
    function openShop( event: MouseEvent )
    {
      const href = !motion.matches && scene?.hrefAt( event.clientX, event.clientY );
      if ( href ) router.push( href );
    }
    canvas.addEventListener( 'pointermove', pointerMove );
    canvas.addEventListener( 'pointerleave', pointerLeave );
    canvas.addEventListener( 'click', openShop );
    const observer = new IntersectionObserver( ( [ entry ] ) =>
    {
      visible = entry.isIntersecting;
      void prepare();
      sync();
    } );
    const sizes = new ResizeObserver( resize );
    observer.observe( root );
    sizes.observe( root );
    motion.addEventListener( 'change', prepare );
    document.addEventListener( 'visibilitychange', sync );
    canvas.addEventListener( 'webglcontextlost', contextLost );
    return () =>
    {
      disposed = true;
      cancelAnimationFrame( frame );
      observer.disconnect();
      sizes.disconnect();
      motion.removeEventListener( 'change', prepare );
      document.removeEventListener( 'visibilitychange', sync );
      canvas.removeEventListener( 'webglcontextlost', contextLost );
      canvas.removeEventListener( 'pointermove', pointerMove );
      canvas.removeEventListener( 'pointerleave', pointerLeave );
      canvas.removeEventListener( 'click', openShop );
      scene?.dispose();
    };
  }, [ router ] );

  return (
    <section ref={rootRef} className={styles.hero} aria-labelledby="london-heading" data-scene={availability}>
      <div className={styles.artwork} aria-hidden="true">
        <StreetPoster />
        <canvas ref={canvasRef} className={styles.canvas} />
      </div>

      <div className={styles.heading}>
        <p className={styles.eyebrow}>The UK inside The UK</p>
        <h1 id="london-heading" className={styles.title}>LONDON<span className={styles.fullStop}>.</span></h1>
        <p className={styles.subtitle}>它是欧洲最好的城市。<br />它是欧洲最糟的城市。</p>
      </div>

      <div className={styles.corner} aria-hidden="true">
        <Image src="/logos/cffa-transparent.png" alt="" width={1103} height={1426} sizes="(max-width: 760px) 56px, 112px" className={styles.roundel} />
      </div>

      <div className={styles.footer}>
        <nav className={styles.destinations} aria-label="探索伦敦">
          <Link href="/london/restaurants" className={styles.destination}>
            <span><small>FOOD &amp; DRINK</small>找餐厅</span><ArrowUpRight size={23} aria-hidden="true" />
          </Link>
          <Link href="/london/attractions" className={styles.destination}>
            <span><small>OUT &amp; ABOUT</small>逛景点</span><ArrowUpRight size={23} aria-hidden="true" />
          </Link>
        </nav>
      </div>
      <nav className={styles.shopLinks} aria-label="街景餐厅快捷链接">
        {SHOP_NAMES.map( ( name, index ) => <Link key={name} href={shopHref( index )}>{name}</Link> )}
      </nav>
    </section>
  );
}
