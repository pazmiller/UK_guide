'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowUpRight, RotateCw } from 'lucide-react';
import styles from './CampusLetters.module.css';

export type CampusSchool = {
  slug: string;
  shortName: string;
  chineseName: string;
  color: string;
  count: number;
  average: number | null;
};

type Delivery = { id: number; school: CampusSchool };

// Older letters settle into a small pile behind the newest one
const PILE = [
  { x: 0, y: 0, r: -2 },
  { x: -64, y: 16, r: -9 },
  { x: 62, y: 22, r: 8 },
  { x: -18, y: 32, r: -4 },
];

function shuffle<T>( items: T[] )
{
  const copy = [ ...items ];
  for ( let i = copy.length - 1; i > 0; i-- )
  {
    const j = Math.floor( Math.random() * ( i + 1 ) );
    [ copy[ i ], copy[ j ] ] = [ copy[ j ], copy[ i ] ];
  }
  return copy;
}

/** Reviewed schools come first, then everyone else; no repeats until the deck runs out. */
function newDeck( schools: CampusSchool[] )
{
  return [ ...shuffle( schools.filter( school => school.count > 0 ) ), ...shuffle( schools.filter( school => school.count === 0 ) ) ];
}

function Letter( { school, current }: { school: CampusSchool; current: boolean } )
{
  return (
    <Link
      href={`/universities/${school.slug}`}
      className={styles.envelope}
      aria-label={`查看 ${school.shortName} 的大学评价`}
      tabIndex={current ? undefined : -1}
    >
      <span className={styles.back} />
      <span className={styles.letter}>
        <span className={styles.offer}>Offer · 录取通知</span>
        <b className={styles.school}>{school.shortName}</b>
        <span className={styles.chinese}>{school.chineseName}</span>
        <span className={styles.score}>
          {school.average === null ? '还没有评价，等你写第一份' : `★ ${school.average.toFixed( 1 )} · ${school.count} 份评价`}
        </span>
        <span className={styles.open}>拆开看评价 <ArrowUpRight aria-hidden="true" /></span>
      </span>
      <span className={styles.pocket} />
      <span className={styles.flap} />
      <span className={styles.seal}>
        <span className={styles.sealLeft} />
        <span className={styles.sealRight} />
        <i>{school.shortName.charAt( 0 )}</i>
      </span>
    </Link>
  );
}

export default function CampusDispenser( { schools }: { schools: CampusSchool[] } )
{
  const doorRef = useRef<HTMLDivElement>( null );
  const deck = useRef<CampusSchool[]>( [] );
  const nextId = useRef( 0 );
  const [ deliveries, setDeliveries ] = useState<Delivery[]>( [] );

  function deliver()
  {
    if ( deck.current.length === 0 ) deck.current = newDeck( schools );
    const school = deck.current.shift()!;
    const id = ++nextId.current;
    setDeliveries( previous => [ { id, school }, ...previous ].slice( 0, PILE.length ) );
  }

  // The first letter arrives on its own once the door scrolls into view
  useEffect( () =>
  {
    const door = doorRef.current;
    if ( !door ) return;
    const observer = new IntersectionObserver( ( [ entry ] ) =>
    {
      if ( !entry.isIntersecting ) return;
      observer.disconnect();
      if ( nextId.current === 0 ) deliver();
    }, { threshold: 0.6 } );
    observer.observe( door );
    return () => observer.disconnect();
    // deliver only reads refs and stable props
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [] );

  const current = deliveries[ 0 ];
  // Delivery ids count up from 1, so they double as the running total
  const total = current?.id ?? 0;
  const received = ( ( total - 1 ) % schools.length ) + 1;
  const round = Math.floor( ( total - 1 ) / schools.length ) + 1;

  return (
    <div className={styles.dispenser}>
      <div ref={doorRef} className={styles.door}>
        <span className={styles.number} aria-hidden="true">06</span>
        <button type="button" className={styles.letterbox} onClick={deliver} aria-label="从投信口收一封新的大学来信">
          <span className={styles.flapPlate} key={current?.id ?? 0} />
        </button>
        <span className={styles.tapHint} aria-hidden="true">点投信口收信 ↑</span>
        <svg className={styles.plane} viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M2 11.5 21.5 3l-6.8 18.5-3.4-7.3L2 11.5Zm9.6 1.8 2.2 4.8L18 6.6 11.6 13.3Z" />
        </svg>
      </div>

      <div className={styles.mat}>
        <ol className={styles.pile} aria-label="收到的大学来信">
          {deliveries.map( ( { id, school }, depth ) => (
            <li
              key={id}
              className={styles.slot}
              data-current={depth === 0}
              aria-hidden={depth === 0 ? undefined : true}
              style={{
                '--school': school.color,
                '--x': `${PILE[ depth ].x}px`,
                '--y': `${PILE[ depth ].y}px`,
                '--tilt': `${PILE[ depth ].r}deg`,
                zIndex: PILE.length - depth,
              } as CSSProperties}
            >
              <Letter school={school} current={depth === 0} />
            </li>
          ) )}
        </ol>
      </div>

      <div className={styles.controls}>
        <button type="button" className={styles.again} onClick={deliver}>
          <RotateCw aria-hidden="true" /> {current ? '再来一封' : '收一封信'}
        </button>
        <span className={styles.tally}>
          {current ? `第 ${received} 封 · 共 ${schools.length} 所学校` : `${schools.length} 所学校，随机投递`}
          {round > 1 && ` · 第 ${round} 轮`}
        </span>
      </div>

      <p className="sr-only" aria-live="polite">
        {current && `收到：${current.school.shortName} ${current.school.chineseName}，${current.school.average === null ? '还没有评价' : `${current.school.average.toFixed( 1 )} 分，${current.school.count} 份评价`}`}
      </p>
    </div>
  );
}
