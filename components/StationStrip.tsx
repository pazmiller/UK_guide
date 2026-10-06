import type { CSSProperties } from 'react';
import { JOURNEY_STATIONS } from '@/lib/heroJourney';
import Reveal from './Reveal';
import styles from './StationStrip.module.css';

type Props = {
  /** Index into JOURNEY_STATIONS; omit for the terminus */
  index?: number;
  tone?: 'light' | 'dark';
  className?: string;
  /** Set when the strip itself is the scroll target for its station */
  anchor?: boolean;
};

const TERMINUS = { name: 'End of the line', zh: '本次列车终点站 · 请带好随身物品', color: '#F4A261' };

/** A platform between home sections: the hero's tube line threading down the page. */
export default function StationStrip( { index, tone = 'light', className = '', anchor = false }: Props )
{
  const station = index === undefined ? null : JOURNEY_STATIONS[ index ];
  const { name, zh, color } = station ?? TERMINUS;

  return (
    <Reveal className={`${styles.strip} ${className}`}>
      <div
        id={anchor && station ? station.id : undefined}
        className={styles.inner}
        data-tone={tone}
        data-terminus={station ? undefined : 'true'}
        style={{ '--line': color } as CSSProperties}
      >
        <div className={styles.sign}>
          <span className={styles.marker} aria-hidden="true" />
          <span className={styles.number} aria-hidden="true">{station ? String( index! + 1 ).padStart( 2, '0' ) : '终'}</span>
          <span className={styles.names}>
            <b>{name}</b>
            <span>{zh}</span>
          </span>
        </div>
        <div className={styles.track} aria-hidden="true">
          <span className={styles.rail} />
          <span className={styles.train}>
            <i /><i /><i /><i />
          </span>
          <span className={styles.gap}>Mind the gap</span>
        </div>
      </div>
    </Reveal>
  );
}
