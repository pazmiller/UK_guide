'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react';
import { Megaphone } from 'lucide-react';
import { LONDON_FURS_DATES, VERIFIED_DATA } from './FurconIndex';
import millerIcon from '@/src/img/miller_icon.png';
import styles from './WelcomeBoard.module.css';

// 占位台词：等群主改成自己的版本
const ANNOUNCEMENTS = [
  'Ladies, gentlemen and fluffy friends —— 欢迎乘坐 UKCFFA Line！',
  '想要了解最近英国的兽聚是几号，周边国家有什么兽展吗？请看右边的发车屏。',
  '请注意站台间隙，也请注意你的手机。Mind the gap, mind your phone.',
  '本次列车由群主与群成员们共同驾驶，欢迎随时上车，出一份力。',
  '下一站：赴英指南。初到英国的乘客，请在此站下车。',
];

const CALLING_AT = [ '伦敦餐厅', '景点', '甜品饮品', '其他城市', '欧陆', '大学评测', '避坑指南', '兽聚', '新闻', '以及你的推荐' ];
const FURCON_HREF = 'https://ukeu.vercel.app/furcon';

// ---- London clock and date, read on the client only (the page is statically rendered) ----

const londonTime = new Intl.DateTimeFormat( 'en-GB', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' } );
const londonDate = new Intl.DateTimeFormat( 'en-CA', { timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit' } );

function subscribeMinute( onChange: () => void )
{
  const id = setInterval( onChange, 10_000 );
  return () => clearInterval( id );
}

const useLondon = ( format: Intl.DateTimeFormat ) => useSyncExternalStore( subscribeMinute, () => format.format( Date.now() ), () => '' );

function daysBetween( fromIso: string, toIso: string )
{
  return Math.round( ( Date.parse( toIso + 'T00:00:00Z' ) - Date.parse( fromIso + 'T00:00:00Z' ) ) / 86_400_000 );
}

type Departure = { time: string; destination: string; status: string; href: string; swap?: string };

function buildDepartures( today: string ): Departure[]
{
  const shortDate = ( iso: string ) => iso.slice( 5 ).replace( '-', '/' );
  const countdown = ( iso: string ) =>
  {
    const days = daysBetween( today, iso );
    return days === 0 ? '今天!' : `${days}天后`;
  };
  const furs = today ? LONDON_FURS_DATES.find( date => date.iso >= today ) : undefined;
  const upcoming = today ? VERIFIED_DATA.filter( event => !event.cancelled && event.start > today ) : [];
  const uk = upcoming.find( event => event.country === 'UK' );
  const europe = upcoming.find( event => event.region === 'europe' && event.country !== 'UK' );

  return [
    furs
      ? { time: shortDate( furs.iso ), destination: 'London Furs · 伦敦兽聚', status: countdown( furs.iso ), href: FURCON_HREF }
      : { time: '--/--', destination: 'London Furs · 伦敦兽聚', status: today ? '待公布' : '----', href: FURCON_HREF },
    uk
      ? { time: shortDate( uk.start ), destination: `${uk.name} · 英国兽展`, status: countdown( uk.start ), href: FURCON_HREF }
      : { time: '--/--', destination: '英国兽展', status: today ? '待公布' : '----', href: FURCON_HREF },
    europe
      ? { time: shortDate( europe.start ), destination: `${europe.name} · 欧洲兽展`, status: countdown( europe.start ), href: FURCON_HREF }
      : { time: '--/--', destination: '欧洲兽展', status: today ? '待公布' : '----', href: FURCON_HREF },
    { time: 'NOW', destination: '出一份力 · 你的推荐 = 新的一站', swap: 'Your station here · 你的站', status: '上车', href: '/contribute' },
  ];
}

// ---- Split-flap style text: scrambles through glyphs, then settles ----

const GLYPHS = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789#%&*+=<>/';
const prefersReducedMotion = () => window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;

function FlapText( { text, play, delay = 0 }: { text: string; play: boolean; delay?: number } )
{
  const [ frame, setFrame ] = useState<string | null>( null );

  useEffect( () =>
  {
    if ( !play || prefersReducedMotion() ) return;
    const chars = Array.from( text );
    const settleAt = chars.map( ( _, i ) => 0.25 + ( i / chars.length ) * 0.55 + Math.random() * 0.2 );
    const pool = GLYPHS + chars.join( '' );
    let raf = 0;
    let start = 0;
    const timer = setTimeout( () =>
    {
      raf = requestAnimationFrame( function step( now )
      {
        if ( !start ) start = now;
        const t = ( now - start ) / 750;
        if ( t >= 1 ) return setFrame( null );
        setFrame( chars.map( ( char, i ) => char === ' ' || t >= settleAt[ i ] ? char : pool[ Math.floor( Math.random() * pool.length ) ] ).join( '' ) );
        raf = requestAnimationFrame( step );
      } );
    }, delay );
    return () =>
    {
      clearTimeout( timer );
      cancelAnimationFrame( raf );
    };
  }, [ text, play, delay ] );

  return (
    <>
      <span aria-hidden="true">{frame ?? text}</span>
      <span className="sr-only">{text}</span>
    </>
  );
}

// ---- Miller's typewriter announcements ----

function Announcer( { active }: { active: boolean } )
{
  const [ index, setIndex ] = useState( 0 );
  const [ typed, setTyped ] = useState( ANNOUNCEMENTS[ 0 ].length );

  useEffect( () =>
  {
    if ( !active ) return;
    const reduced = prefersReducedMotion();
    const line = ANNOUNCEMENTS[ index ];
    let count = reduced ? line.length : 0;
    let timer: ReturnType<typeof setTimeout>;
    const next = () => timer = setTimeout( () =>
    {
      setIndex( i => ( i + 1 ) % ANNOUNCEMENTS.length );
    }, reduced ? 6000 : 3200 );
    const type = () =>
    {
      setTyped( count );
      if ( count >= line.length ) return next();
      count++;
      timer = setTimeout( type, 42 );
    };
    timer = setTimeout( type, 0 );
    return () => clearTimeout( timer );
  }, [ active, index ] );

  const line = ANNOUNCEMENTS[ index ];
  const speaking = active && typed < line.length;

  return (
    <div className={styles.announcer} data-speaking={speaking}>
      <div className={styles.bubble}>
        <span className={styles.bubbleLabel}><Megaphone aria-hidden="true" /> 站务广播 · Announcement</span>
        <p className={styles.bubbleText}>
          {/* Invisible copies of every line share the cell, so typing never changes the bubble's height */}
          {ANNOUNCEMENTS.map( announcement => <span key={announcement} className={styles.sizer} aria-hidden="true">{announcement}</span> )}
          <span className={styles.typed} aria-hidden="true">{line.slice( 0, typed )}<span className={styles.caret} /></span>
          <span className="sr-only">{ANNOUNCEMENTS.join( ' ' )}</span>
        </p>
      </div>
      <div className={styles.avatar}>
        <Image src={millerIcon} alt="站务员米勒" className={styles.avatarImage} />
      </div>
    </div>
  );
}

// ---- The board ----

export default function WelcomeBoard()
{
  const boardRef = useRef<HTMLDivElement>( null );
  const [ powered, setPowered ] = useState( false );
  const [ inView, setInView ] = useState( false );
  const clock = useLondon( londonTime );
  const today = useLondon( londonDate );
  const departures = buildDepartures( today );

  useEffect( () =>
  {
    const board = boardRef.current;
    if ( !board ) return;
    const observer = new IntersectionObserver( ( [ entry ] ) =>
    {
      setInView( entry.isIntersecting );
      if ( entry.intersectionRatio >= 0.35 ) setPowered( true );
    }, { threshold: [ 0, 0.35 ] } );
    observer.observe( board );
    return () => observer.disconnect();
  }, [] );

  return (
    <div ref={boardRef} className={styles.welcome}>
      <Announcer active={inView} />

      <div className={styles.board} data-powered={powered}>
        <span className={styles.hanger} aria-hidden="true" />
        <span className={`${styles.hanger} ${styles.hangerRight}`} aria-hidden="true" />

        <div className={styles.plate}>
          <h2 className={styles.title}>
            欢迎！ <span>by UK CFFA群主与群成员们</span>
          </h2>
          <p className={styles.intro}>
            无论你是刚来英国上学的新人，还是已经就读工作多年，UKCFFA会一直与你分享英国与欧陆。
          </p>
        </div>

        <div className={styles.screen}>
          <div className={styles.screenTop} aria-hidden="true">
            <span>UKCFFA LINE · PLATFORM 1</span>
            <span className={styles.clock}>{clock ? <>{clock.slice( 0, 2 )}<i>:</i>{clock.slice( 3 )}</> : '--:--'}</span>
          </div>

          <ol className={styles.rows} aria-label="近期班次">
            {departures.map( ( departure, i ) => (
              <li key={i} style={{ '--row': i } as CSSProperties}>
                <Link href={departure.href} className={styles.row} data-swap={departure.swap ? 'true' : undefined}>
                  <span className={styles.order} aria-hidden="true">{[ '1st', '2nd', '3rd', '4th' ][ i ]}</span>
                  <span className={styles.time}><FlapText text={departure.time} play={powered} delay={300 + i * 180} /></span>
                  <span className={styles.destination}>
                    <span className={styles.destinationMain}><FlapText text={departure.destination} play={powered} delay={300 + i * 180} /></span>
                    {departure.swap && <span className={styles.destinationSwap} aria-hidden="true">{departure.swap}</span>}
                  </span>
                  <span className={styles.status}>{departure.status} ▸</span>
                </Link>
              </li>
            ) )}
          </ol>

          <div className={styles.calling} aria-hidden="true">
            <span className={styles.callingLabel}>Calling at:</span>
            <span className={styles.callingWindow}>
              <span className={styles.callingTrack}>
                {[ 0, 1 ].map( copy => <span key={copy}>{CALLING_AT.join( ' · ' )} · </span> )}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
