'use client';

import { ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function MobileBackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(window.scrollY > 420));
    const onScroll = () => setVisible(window.scrollY > 420);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const scrollToTop = () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  return (
    <button
      type="button"
      aria-label="Return to the top"
      onClick={scrollToTop}
      className={`fixed left-4 z-[70] grid h-12 w-12 place-items-center overflow-hidden rounded-full border border-white/55 bg-white/30 text-black shadow-[inset_0_1px_0_rgba(255,255,255,0.72),inset_0_-10px_18px_rgba(255,255,255,0.16),0_12px_28px_rgba(29,53,87,0.18)] backdrop-blur-xl transition-[opacity,transform,background-color] duration-300 hover:bg-white/44 focus:outline-none focus-visible:ring-2 focus-visible:ring-white md:hidden ${
        visible ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
      }`}
      style={{ bottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}
    >
      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,rgba(255,255,255,0.82),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.26),transparent_58%)]" />
      <ArrowUp className="relative h-5 w-5" />
    </button>
  );
}
