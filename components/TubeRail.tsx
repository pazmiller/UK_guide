'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { JOURNEY_STATIONS } from '@/lib/heroJourney';
import styles from './TubeRail.module.css';

const LAST = JOURNEY_STATIONS.length - 1;

/**
 * After the hero, the tube line carries on as a rail beside the page:
 * the train advances with scroll and each section lights up its station.
 */
export default function TubeRail()
{
  const railRef = useRef<HTMLElement>( null );
  const [ active, setActive ] = useState( -1 );

  useEffect( () =>
  {
    const rail = railRef.current;
    if ( !rail ) return;
    let frame = 0;

    function update()
    {
      frame = 0;
      const sections = JOURNEY_STATIONS.map( station => document.getElementById( station.id ) );
      if ( sections.some( section => !section ) ) return;
      const tops = sections.map( section => section!.getBoundingClientRect().top );
      const end = sections[ LAST ]!.getBoundingClientRect().bottom;
      // The train is "at" a station while its section holds the upper part of the screen
      const anchor = window.innerHeight * 0.4;

      let index = -1;
      let progress = 0;
      // Appears once the hero map has mostly scrolled away
      if ( tops[ 0 ] <= window.innerHeight * 0.5 && end > anchor )
      {
        index = Math.max( 0, tops.findLastIndex( top => top <= anchor ) );
        const from = tops[ index ];
        const to = index < LAST ? tops[ index + 1 ] : end;
        const within = to > from ? Math.min( Math.max( ( anchor - from ) / ( to - from ), 0 ), 1 ) : 0;
        progress = Math.min( ( index + within ) / LAST, 1 );
      }
      rail!.style.setProperty( '--rail', progress.toFixed( 4 ) );
      setActive( index );
    }

    const schedule = () => { if ( !frame ) frame = requestAnimationFrame( update ); };
    update();
    window.addEventListener( 'scroll', schedule, { passive: true } );
    window.addEventListener( 'resize', schedule );
    return () =>
    {
      cancelAnimationFrame( frame );
      window.removeEventListener( 'scroll', schedule );
      window.removeEventListener( 'resize', schedule );
    };
  }, [] );

  const visible = active >= 0;
  const color = JOURNEY_STATIONS[ Math.max( active, 0 ) ].color;

  return (
    <nav
      ref={railRef}
      className={styles.rail}
      data-visible={visible}
      aria-label="页面线路"
      aria-hidden={!visible}
      inert={!visible}
      style={{ '--current': color } as CSSProperties}
    >
      <span className={styles.track} aria-hidden="true">
        <span className={styles.fill} />
      </span>
      <span className={styles.train} aria-hidden="true" />
      <ol className={styles.stops}>
        {JOURNEY_STATIONS.map( ( station, i ) => (
          <li key={station.id} style={{ '--pos': i / LAST, '--line': station.color } as CSSProperties}>
            <a
              href={`#${station.id}`}
              className={styles.stop}
              data-state={i < active ? 'passed' : i === active ? 'current' : 'ahead'}
              aria-current={i === active ? 'location' : undefined}
            >
              <span className={styles.dot} aria-hidden="true" />
              <span className={styles.label}>{station.zh}</span>
            </a>
          </li>
        ) )}
      </ol>
    </nav>
  );
}
