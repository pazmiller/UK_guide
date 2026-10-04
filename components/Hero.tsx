'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import ParticleJourney from './ParticleJourney';
import UnionJackDots from './UnionJackDots';
import styles from './Hero.module.css';

// "Discover the Good Old" lands first, then the coloured letters drop in one by one
const LETTER_START_MS = 450;
const LETTER_STEP_MS = 45;

const TITLE_LETTERS = [
  { text: 'G', color: '#E63946' },
  { text: 'reat ', color: '#0d15ff' },
  { text: 'B', color: '#E63946' },
  { text: 'ritain', color: '#0d15ff' },
]
  .flatMap( ( { text, color } ) => Array.from( text, char => ( { char, color } ) ) )
  .map( ( letter, i ) => ( { ...letter, delay: LETTER_START_MS + LETTER_STEP_MS * i } ) );

export default function Hero()
{
  const sectionRef = useRef<HTMLElement>( null );
  // 'webgl': the pinned particle journey; 'static': the 2D dot flag (reduced motion / no WebGL)
  const [ mode, setMode ] = useState<'pending' | 'webgl' | 'static'>( 'pending' );

  return (
    <section ref={sectionRef} className={styles.journey} data-mode={mode}>
      <div className={styles.stage}>
        {/* Union Jack dot matrix: click words always, the dots themselves only as fallback */}
        <UnionJackDots showDots={mode === 'static'} />
        {mode !== 'static' && (
          <ParticleJourney
            sectionRef={sectionRef}
            onReady={() => setMode( 'webgl' )}
            onFallback={() => setMode( 'static' )}
          />
        )}

        {/* Soft breathing glow + edge vignette to lift the copy off the dots */}
        <div className={`${styles.fadeOut} pointer-events-none absolute inset-0`} aria-hidden="true">
          <div className="hero-glow absolute left-1/2 top-1/2 h-[70vmin] w-[90vmin] rounded-full bg-[radial-gradient(closest-side,rgba(1,8,32,0.85),rgba(1,8,32,0))]" />
        </div>
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(1,8,32,0.75)_100%)]"
          aria-hidden="true"
        />

        {/* Content */}
        <div className={`${styles.fadeOut} relative z-10 text-center px-4 max-w-4xl mx-auto`}>
          <h1 className="[font-family:var(--font-special-elite)] text-5xl font-normal leading-tight tracking-normal text-white mb-6 sm:text-6xl md:text-7xl">
            <span className="hero-rise inline-block">Discover the Good Old</span>{' '}
            <span className="sr-only">Great Britain</span>
            <span aria-hidden="true">
              {TITLE_LETTERS.map( ( { char, color, delay } ) =>
                char === ' '
                  ? ' '
                  : (
                    <span key={delay} className="hero-letter" style={{ color, animationDelay: `${delay}ms` }}>
                      {char}
                    </span>
                  )
              )}
            </span>
          </h1>

          <p className="hero-rise text-xl md:text-2xl text-white/90 mb-8" style={{ animationDelay: '0.9s' }}>
            无论你是动物朋友还是人类朋友，来了就是一生英伦情了。
          </p>
          <p className="hero-rise text-xl md:text-2xl text-white/90 mb-8" style={{ animationDelay: '1.1s' }}>
            英国有很多和国内不一样的风景和文化，意料不到的习俗惯例。
            无论是迅速onboard，解答疑惑，还是准备好开始探索了，都过来吧！Get over here!
          </p>
          <p className="hero-rise text-xl md:text-2xl text-white/90 mb-8" style={{ animationDelay: '1.3s' }}>
            欢迎！Let me get you a lovely cup of tea for a start. Sugar, and milk?
          </p>

          <div className="hero-rise flex flex-col sm:flex-row gap-4 justify-center" style={{ animationDelay: '1.5s' }}>
            <Link href="/london/attractions" className="btn-primary text-lg shadow-[0_10px_30px_rgba(230,57,70,0.35)]">
              Explore Attractions
            </Link>
            <Link href="/london/restaurants" className="btn-secondary text-lg border-2 border-white/30">
              Find Restaurants
            </Link>
          </div>
        </div>

        {/* Scroll Indicator: plays the journey through to the map */}
        <div className={`${styles.fadeOut} absolute bottom-20 left-1/2 z-10 hidden -translate-x-1/2 sm:block`}>
          <a
            href={mode === 'static' ? '#welcome' : '#journey-map'}
            aria-label="向下滚动"
            className="hero-rise block"
            style={{ animationDelay: '2s' }}
          >
            <ChevronDown className="w-8 h-8 text-white/70 animate-bounce transition-colors hover:text-white" />
          </a>
        </div>

        {mode !== 'static' && (
          <div className={`${styles.caption} ${styles.mapIn}`}>
            <p className={styles.captionTitle}>The UKCFFA Line</p>
            <p className="mt-2 text-sm sm:text-base">我们的UK群就是一张地铁图，连接人类和动物。点站名直达，继续往下滚，都行，反正列车即将进站！Watch the gaps！</p>
          </div>
        )}

        {/* Wave transition into the white welcome section */}
        <svg
          className={`${styles.wave} pointer-events-none absolute inset-x-0 bottom-0 z-20 h-12 w-full text-white sm:h-16`}
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path fill="currentColor" d="M0 48 C 240 8 480 8 720 40 C 960 72 1200 72 1440 32 L1440 80 L0 80 Z" />
        </svg>
      </div>
      <span id="journey-map" className={styles.mapAnchor} aria-hidden="true" />
    </section>
  );
}
