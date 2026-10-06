import type { CSSProperties } from 'react';
import styles from './HomeScene.module.css';

// Compressed copies of the originals in public/wallpaper
const PHOTOS = {
  explore: { src: '/wallpaper/web/sunset_hellas.webp', position: '50% 58%' },
  london: { src: '/wallpaper/web/london.webp', position: '50% 78%' },
  campus: { src: '/wallpaper/web/royalholloway.webp', position: '50% 32%' },
} as const;

type Props = {
  kind: keyof typeof PHOTOS;
  /**
   * Extend past the section so neighbouring scenes overlap: 'bottom' keeps this photo
   * under the next scene, 'top' fades this photo in over the previous one.
   */
  bleed?: 'top' | 'bottom';
};

/**
 * Photo backdrop for a run of home sections. The photo sits in a sticky,
 * one-screen-tall layer, so it is only ever scaled to the viewport, never
 * stretched over a section many screens tall. Edges fade into the shared navy.
 */
export default function HomeScene( { kind, bleed }: Props )
{
  const { src, position } = PHOTOS[ kind ];
  const bleedClass = bleed === 'top' ? styles.bleedTop : bleed === 'bottom' ? styles.bleedBottom : '';
  return (
    <div className={`${styles.scene} ${styles[ kind ]} ${bleedClass}`} aria-hidden="true">
      <div className={styles.photo} style={{ '--photo': `url(${src})`, '--focus': position } as CSSProperties} />
    </div>
  );
}
