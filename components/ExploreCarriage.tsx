'use client';

import Link from 'next/link';
import { useRef, useState, useSyncExternalStore, type CSSProperties } from 'react';
import { ArrowRight, Building, Globe, MapPin, Pause, Play, Plus } from 'lucide-react';
import ElizabethLineBuild from './ElizabethLineBuild';
import styles from './ExploreCarriage.module.css';
import { useCollapseOnReturn } from './useCollapseOnReturn';
import { useCarriageAutoplay } from './useCarriageAutoplay';

const STOPS = [
  {
    href: '/london',
    title: 'London',
    blurb: '餐厅、景点、甜品饮品',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1600&q=80',
    Icon: MapPin,
  },
  {
    href: '/othercities',
    title: 'Other Cities',
    blurb: 'York, Glasgow, Edinburgh, Nottingham + more',
    image: '/trains/train2.png',
    Icon: Building,
  },
  {
    href: '/europa',
    title: 'Europa',
    blurb: 'Iceland, Poland',
    image: '/trains/train3.png',
    Icon: Globe,
  },
];

const LED_MESSAGES = [
  'Now: London · 伦敦',
  'Next stop: York · Edinburgh · Glasgow',
  'Entering the Channel Tunnel · 进入海峡隧道',
  'Arriving: Europa · Iceland · Poland',
  'Next stop: 你的站 · CFFA Elizabeth Line',
];

// Placeholder copy for the three windows during the tunnel crossing.
const TUNNEL_MESSAGES = [
  { caption: '你来到了这个期待又陌生的国家', text: '一开始可能很不适应，\n有的开始想念国内。' },
  { caption: ' 未完待续', text: '但你逐渐喜欢上了这里，\n或是伦敦的多姿多彩，或是英国悠闲的风吹过了你毛绒发梢。' },
  { caption: '沿途都是故事', text: '有的人留在这里，有的已经离开却已难舍难分，\n记得回来分享！在这里留下你存在的证据，永恒记下' },
];

// Sleepers laid on screen; any further stations are summed into the last label
const MAX_SLEEPERS = 10;

export type BuiltStation = { name: string; count: number };

// Same conditions as the pinned layout in ExploreCarriage.module.css; elsewhere the dig is hidden
const PINNED_QUERY = '(min-width: 1024px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)';
const subscribePinned = ( onChange: () => void ) =>
{
  const query = window.matchMedia( PINNED_QUERY );
  query.addEventListener( 'change', onChange );
  return () => query.removeEventListener( 'change', onChange );
};
const isPinned = () => window.matchMedia( PINNED_QUERY ).matches && CSS.supports( 'animation-timeline: view()' );

/**
 * Explore as a ride: three carriage windows share one panorama that runs
 * London → other cities → the Channel Tunnel → Europa as the page scrolls.
 * Past Europa the track runs out: every sleeper laid is a city the community
 * has recommended, and the last stretch is left for the reader to contribute.
 */
export default function ExploreCarriage( { stations }: { stations: BuiltStation[] } )
{
  const total = stations.reduce( ( sum, station ) => sum + station.count, 0 );
  const sleepers = stations.length > MAX_SLEEPERS
    ? [ ...stations.slice( 0, MAX_SLEEPERS - 1 ), { name: `+${stations.length - MAX_SLEEPERS + 1} 站`, count: stations.slice( MAX_SLEEPERS - 1 ).reduce( ( sum, station ) => sum + station.count, 0 ) } ]
    : stations;

  const scrollerRef = useRef<HTMLDivElement>( null );
  useCollapseOnReturn( scrollerRef );
  // 3D dig once three.js is up; the flat track stays as the fallback
  const [ dig, setDig ] = useState<'pending' | 'webgl' | 'static'>( 'pending' );
  // Phones and Firefox never see the dig, so they never download three.js for it
  const pinned = useSyncExternalStore( subscribePinned, isPinned, () => false );
  const playback = useCarriageAutoplay( scrollerRef, pinned );

  const panorama = (
    <div className={styles.panorama}>
      <span className={styles.panel} style={{ backgroundImage: `url(${STOPS[ 0 ].image})` }} />
      <span className={styles.panel} style={{ backgroundImage: `url(${STOPS[ 1 ].image})` }} />
      <span className={`${styles.panel} ${styles.tunnel}`} />
      <span className={styles.panel} style={{ backgroundImage: `url(${STOPS[ 2 ].image})` }} />
    </div>
  );

  return (
    <div ref={scrollerRef} className={styles.scroller} data-playback={playback.status}>
      <div className={styles.stage}>
        <div className={styles.carriage} data-carriage>
          <div className={styles.header}>
            <h2 className={styles.title}>Explore <span>城市探索</span></h2>
            <div className={styles.led} aria-hidden="true">
              {LED_MESSAGES.map( ( message, i ) => (
                <span key={message} className={styles.ledMessage} style={{ '--m': i } as CSSProperties}>{message}</span>
              ) )}
            </div>
            {pinned && (
              <button
                type="button"
                className={styles.playback}
                data-carriage-playback
                onClick={playback.toggle}
                disabled={playback.status === 'finished'}
              >
                {playback.status === 'playing' ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
                {playback.status === 'playing' ? '暂停游览' : playback.status === 'finished' ? '行程结束' : playback.status === 'paused' ? '继续游览' : '开始游览'}
              </button>
            )}
          </div>

          <div className={styles.windows} aria-hidden="true">
            <div className={styles.handles}>
              {Array.from( { length: 9 }, ( _, i ) => <span key={i} style={{ '--h': i } as CSSProperties} /> )}
            </div>
            {[ 0, 1, 2 ].map( i => (
              <div key={i} className={styles.window} style={{ '--w': i } as CSSProperties}>
                {panorama}
                <div className={styles.tunnelMessage}>
                  <span className={styles.tunnelCaption}>{TUNNEL_MESSAGES[ i ].caption}</span>
                  <p className={styles.tunnelText}>{TUNNEL_MESSAGES[ i ].text}</p>
                </div>
                <span className={styles.glass} />
              </div>
            ) )}
          </div>

          {/* Last stretch (pinned layout only): the line the group has built so far, and the gap left for you */}
          <div className={styles.build} data-dig={dig} style={{ '--sleeper-count': sleepers.length } as CSSProperties}>
            {pinned && dig !== 'static' && (
              <ElizabethLineBuild
                stations={sleepers}
                scrollerRef={scrollerRef}
                onReady={() => setDig( 'webgl' )}
                onFallback={() => setDig( 'static' )}
              />
            )}
            <div className={styles.buildHead}>
              {/* Ring-and-bar homage, deliberately not the TfL roundel */}
              <span className={styles.roundel} aria-hidden="true"><i /><b>CFFA</b></span>
              <span className={styles.lineName}>
                <small>CFFA限定 · Pro Max Duo版</small>
                <strong>Elizabeth Line</strong>
              </span>
              <span className={styles.lineMeta}>
                <b>{stations.length} 条地铁线 · {total} 个站点</b>
                <span>沿途每一站都来自群友亲笔打字打出来的推荐</span>
              </span>
            </div>
            <div className={styles.track} aria-hidden="true">
              <span className={styles.rail} />
              <ol className={styles.sleepers}>
                {sleepers.map( ( station, i ) => (
                  <li key={station.name} style={{ '--i': i } as CSSProperties}>
                    <span className={styles.tag}><b>{station.name}</b>{station.count} 条</span>
                  </li>
                ) )}
              </ol>
              <span className={styles.gap} />
            </div>
            {/* Appears once the train doors have opened */}
            <Link href="/contribute" className={styles.yourStop}>
              <span className={styles.yourSign}>Mind the Gaps</span>
              <span className={styles.yourCta}>为群地铁铺路 <ArrowRight aria-hidden="true" /></span>
              <span className={styles.yourText}>下一站造在哪？由你吃过、去过、踩过的雷来决定</span>
            </Link>
          </div>

          <ol className={styles.stops} aria-label="城市探索路线">
            {STOPS.map( ( { href, title, blurb, Icon }, i ) => (
              <li key={href} className={styles.stopItem} style={{ '--s': i } as CSSProperties}>
                {i === 2 && <span className={styles.tunnelSign} aria-hidden="true">Channel Tunnel</span>}
                <Link href={href} className={styles.stop}>
                  <span className={styles.stopDot} aria-hidden="true" />
                  <Icon className={styles.stopIcon} aria-hidden="true" />
                  <span className={styles.stopText}>
                    <b>{title}</b>
                    <span>{blurb}</span>
                  </span>
                  <span className={styles.getOff}>下车 <ArrowRight aria-hidden="true" /></span>
                </Link>
              </li>
            ) )}
            <li className={styles.nextItem}>
              <Link href="/contribute" className={styles.nextStop} aria-label={`你的站：出一份力，已铺 ${stations.length} 条线 ${total} 站`}>
                <Plus aria-hidden="true" />
                <span className={styles.stopText}>
                  <b>你的站</b>
                  <span>已铺 {stations.length} 站 · 等你出一份力</span>
                </span>
              </Link>
            </li>
          </ol>

          <span className={styles.moquette} aria-hidden="true" />
          <span className={styles.dark} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
