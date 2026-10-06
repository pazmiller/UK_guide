'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, type CSSProperties } from 'react';
import { Printer } from 'lucide-react';
import DetailModal from './DetailModal';
import type { Restaurant } from '@/data/types';
import styles from './EatsReceipts.module.css';

const TILTS = [ -2.5, 1.5, -1 ];

/**
 * Eats as a receipt printer: the Explore ticket drops into the slot and three
 * receipts feed out, one per featured restaurant. Tapping a receipt opens its details.
 */
type Counts = { london: number; uk: number; europa: number };

export default function EatsReceipts( { restaurants, counts }: { restaurants: Restaurant[]; counts: Counts } )
{
  const [ selected, setSelected ] = useState<Restaurant | null>( null );

  return (
    <div className={styles.scroller}>
      <div className={styles.stage}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>London 推荐餐厅</h2>
            <p className={styles.subtitle}>精选伦敦美食推荐</p>
            <ul className={styles.tally} aria-label="餐厅总数">
              {[
                { href: '/london/restaurants', label: 'London', zh: '伦敦', value: counts.london },
                { href: '/othercities', label: 'All UK', zh: '全英', value: counts.uk },
                { href: '/europa', label: 'Europa', zh: '欧陆', value: counts.europa },
              ].map( ( { href, label, zh, value } ) => (
                <li key={href}>
                  <Link href={href} className={styles.stub} aria-label={`${zh}共 ${value} 家餐厅`}>
                    <b>{value}</b>
                    <span>{label}<br />{zh}</span>
                  </Link>
                </li>
              ) )}
            </ul>
          </div>
          {/* The printer's feed key: press it for the full list */}
          <Link href="/london/restaurants" className={styles.feedKey} aria-label={`更多好吃的地方！查看全部 ${counts.london} 家伦敦餐厅 View All`}>
            <span className={styles.keycap}>
              <span className={styles.keyLed} aria-hidden="true" />
              <Printer className={styles.keyIcon} aria-hidden="true" />
              <span className={styles.keyText}>
                <b>更多好吃的地方！</b>

              </span>
            </span>
            <span className={styles.tongue} aria-hidden="true">LONDON EATS ▸ ▸ ▸</span>
          </Link>
        </div>

        <div className={styles.printer}>
          <span className={styles.ticket} aria-hidden="true">
            <b>UKCFFA LINE</b>
            <span>Explore → Eats</span>
            <small>Admit one</small>
          </span>
          <div className={styles.body} aria-hidden="true">
            <span className={styles.brand}>CFFA · EATS</span>
            <span className={styles.inlet} />
            <span className={styles.led} />
          </div>

          <ol className={styles.feeds} aria-label="推荐餐厅小票">
            {restaurants.map( ( restaurant, i ) => (
              <li key={restaurant.id} className={styles.feed} style={{ '--i': i, '--tilt': `${TILTS[ i % TILTS.length ]}deg` } as CSSProperties}>
                <span className={styles.head} aria-hidden="true" />
                <div className={styles.window}>
                  <button
                    type="button"
                    className={styles.receipt}
                    onClick={() => setSelected( restaurant )}
                    aria-haspopup="dialog"
                    aria-label={`查看 ${restaurant.name} 的详情`}
                  >
                    <span className={styles.receiptTop}>
                      <b>★ CFFA EATS ★</b>
                      <span>LONDON · 伦敦 · TABLE {String( i + 1 ).padStart( 2, '0' )}</span>
                    </span>

                    {restaurant.images[ 0 ] && (
                      <span className={styles.photo}>
                        <Image src={restaurant.images[ 0 ]} alt="" fill sizes="(max-width: 768px) 90vw, 360px" className={styles.photoImage} />
                      </span>
                    )}

                    <span className={styles.name}>{restaurant.name}</span>
                    <span className={styles.cuisine}>{restaurant.cuisine} · {restaurant.shortDescription}</span>

                    <span className={styles.rule} />
                    <span className={styles.label}>必点 Must try</span>
                    {restaurant.mustTry.slice( 0, 3 ).map( dish => (
                      <span key={dish} className={styles.line}>
                        <span>1 × {dish}</span>
                        <span>✓</span>
                      </span>
                    ) )}

                    {restaurant.priceRange && (
                      <>
                        <span className={styles.rule} />
                        <span className={styles.line}>
                          <span>人均 Per person</span>
                          <b>{restaurant.priceRange}</b>
                        </span>
                      </>
                    )}

                    <span className={styles.rule} />
                    <span className={styles.note}>“{restaurant.recommendReason ?? restaurant.description}”</span>

                    <span className={styles.rule} />
                    <span className={`${styles.line} ${styles.total}`}>
                      <span>TOTAL</span>
                      <b>好吃</b>
                    </span>
                    <span className={styles.barcode} aria-hidden="true" />
                    <span className={styles.thanks}>Thank you · 点击撕下看详情</span>
                  </button>
                </div>
              </li>
            ) )}
          </ol>
        </div>
      </div>

      {/* Outside every transformed element, so the fixed-position modal lays out against the viewport */}
      <DetailModal item={selected ? { type: 'restaurant', data: selected } : null} onClose={() => setSelected( null )} />
    </div>
  );
}
