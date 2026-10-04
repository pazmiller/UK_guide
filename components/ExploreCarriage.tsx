'use client';

import Link from 'next/link';
import { useRef, type CSSProperties } from 'react';
import { ArrowRight, Building, Globe, MapPin } from 'lucide-react';
import styles from './ExploreCarriage.module.css';
import { useCollapseOnReturn } from './useCollapseOnReturn';

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
    image: 'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?w=1600&q=80',
    Icon: Building,
  },
  {
    href: '/europa',
    title: 'Europa',
    blurb: 'Iceland, Poland',
    image: 'https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=1600&q=80',
    Icon: Globe,
  },
];

const LED_MESSAGES = [
  'Now: London · 伦敦',
  'Next stop: York · Edinburgh · Glasgow',
  'Entering the Channel Tunnel · 进入海峡隧道',
  'Arriving: Europa · Iceland · Poland',
];

/**
 * Explore as a ride: three carriage windows share one panorama that runs
 * London → other cities → the Channel Tunnel → Europa as the page scrolls.
 */
export default function ExploreCarriage()
{
  const scrollerRef = useRef<HTMLDivElement>( null );
  useCollapseOnReturn( scrollerRef );

  const panorama = (
    <div className={styles.panorama}>
      <span className={styles.panel} style={{ backgroundImage: `url(${STOPS[ 0 ].image})` }} />
      <span className={styles.panel} style={{ backgroundImage: `url(${STOPS[ 1 ].image})` }} />
      <span className={`${styles.panel} ${styles.tunnel}`} />
      <span className={styles.panel} style={{ backgroundImage: `url(${STOPS[ 2 ].image})` }} />
    </div>
  );

  return (
    <div ref={scrollerRef} className={styles.scroller}>
      <div className={styles.stage}>
        <div className={styles.carriage}>
          <div className={styles.header}>
            <h2 className={styles.title}>Explore <span>城市探索</span></h2>
            <div className={styles.led} aria-hidden="true">
              {LED_MESSAGES.map( ( message, i ) => (
                <span key={message} className={styles.ledMessage} style={{ '--m': i } as CSSProperties}>{message}</span>
              ) )}
            </div>
          </div>

          <div className={styles.windows} aria-hidden="true">
            <div className={styles.handles}>
              {Array.from( { length: 9 }, ( _, i ) => <span key={i} style={{ '--h': i } as CSSProperties} />)}
            </div>
            {[ 0, 1, 2 ].map( i => (
              <div key={i} className={styles.window} style={{ '--w': i } as CSSProperties}>
                {panorama}
                <span className={styles.glass} />
              </div>
            ) )}
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
          </ol>

          <span className={styles.moquette} aria-hidden="true" />
          <span className={styles.dark} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
