'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  /** Solid colour or image URL for the front face */
  front: string;
  /** Solid colour or image URL for the back face */
  back: string;
  slats?: number;
  /** Height in px — used when fill=false (standalone divider mode) */
  height?: number;
  /** Fill mode: renders as absolute inset-0 to cover its positioned parent */
  fill?: boolean;
  duration?: number;
  pauseMs?: number;
}

function isUrl(v: string) {
  return v.startsWith('http') || v.startsWith('/');
}

export default function BlindsTransition({
  front,
  back,
  slats = 12,
  height = 320,
  fill = false,
  duration = 900,
  pauseMs = 1600,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [flipped, setFlipped] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [measuredH, setMeasuredH] = useState(height);

  useEffect(() => {
    const el = ref.current;
    if (!el || !fill) return;
    const ro = new ResizeObserver(([entry]) => {
      const h = entry.contentRect.height;
      if (h > 0) setMeasuredH(h);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [fill]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let timerId: ReturnType<typeof setTimeout> | null = null;
    let active = false;

    function scheduleFlip(currentlyFlipped: boolean) {
      timerId = setTimeout(() => {
        if (!active) return;
        const next = !currentlyFlipped;
        setFlipped(next);
        setAnimating(true);
        timerId = setTimeout(() => {
          if (!active) return;
          setAnimating(false);
          scheduleFlip(next);
        }, duration);
      }, pauseMs);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !active) {
          active = true;
          setFlipped(true);
          setAnimating(true);
          timerId = setTimeout(() => {
            if (!active) return;
            setAnimating(false);
            scheduleFlip(true);
          }, duration);
        } else if (!entry.isIntersecting && active) {
          active = false;
          if (timerId) clearTimeout(timerId);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => {
      active = false;
      if (timerId) clearTimeout(timerId);
      observer.disconnect();
    };
  }, [duration, pauseMs]);

  const totalH = fill ? measuredH : height;
  const flipMs = Math.round(duration * 0.6);
  const staggerMs = slats > 1 ? Math.round((duration * 0.4) / (slats - 1)) : 0;
  const slatH = totalH / slats;

  /**
   * For image faces: renders a full-height (totalH) div inside the slat face,
   * shifted upward so it aligns with the container top. The slat face has
   * overflow:hidden which clips it to slatH. background-size:cover maintains
   * correct aspect ratio at any viewport width — no horizontal squishing.
   *
   * For solid colour faces: just fills the slat with the colour.
   */
  function renderFace(value: string, slatIndex: number, flip?: boolean) {
    const faceStyle: React.CSSProperties = {
      backfaceVisibility: 'hidden',
      ...(flip ? { transform: 'rotateX(180deg)' } : {}),
    };

    if (isUrl(value)) {
      return (
        <div className="absolute inset-0 overflow-hidden" style={faceStyle}>
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              // Shift this div up so its top edge aligns with the container top
              top: `${-(slatIndex * slatH)}px`,
              height: `${totalH}px`,
              backgroundImage: `url(${value})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
            }}
          />
        </div>
      );
    }

    return (
      <div
        className="absolute inset-0"
        style={{ backgroundColor: value, ...faceStyle }}
      />
    );
  }

  return (
    <div
      ref={ref}
      className="overflow-hidden"
      style={
        fill
          ? { position: 'absolute', inset: 0, perspective: '1200px' }
          : { position: 'relative', width: '100%', perspective: '1200px', height: `${height}px` }
      }
    >
      {Array.from({ length: slats }, (_, i) => (
        <div
          key={i}
          className="absolute left-0 right-0"
          style={{
            top: `${i * slatH}px`,
            height: `${slatH + 0.5}px`,
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateX(180deg)' : 'rotateX(0deg)',
            transformOrigin: 'center center',
            transition: animating
              ? `transform ${flipMs}ms cubic-bezier(0.4, 0, 0.2, 1) ${i * staggerMs}ms`
              : 'none',
          }}
        >
          {renderFace(front, i)}
          {renderFace(back, i, true)}
        </div>
      ))}
    </div>
  );
}
