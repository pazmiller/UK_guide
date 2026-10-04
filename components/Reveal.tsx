'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  /** Delay in ms once in view; with scroll-driven animations it shifts the scroll range instead */
  delay?: number;
  variant?: 'up';
};

export default function Reveal( { children, className = '', delay = 0, variant = 'up' }: Props )
{
  const ref = useRef<HTMLDivElement>( null );
  const [ shown, setShown ] = useState( false );

  useEffect( () =>
  {
    const el = ref.current;
    if ( !el ) return;
    const observer = new IntersectionObserver( ( [ entry ] ) =>
    {
      if ( entry.isIntersecting )
      {
        setShown( true );
        observer.disconnect();
      }
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' } );
    observer.observe( el );
    return () => observer.disconnect();
  }, [] );

  return (
    <div
      ref={ref}
      className={`reveal reveal-${variant} ${shown ? 'is-shown' : ''} ${className}`}
      style={{ '--reveal-delay': `${delay}ms`, '--reveal-offset': `${delay / 40}vh` } as CSSProperties}
    >
      {children}
    </div>
  );
}
