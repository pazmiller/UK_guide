'use client';

import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';

interface ImageCarouselProps {
  images: string[];
  alt: string;
  sizes: string;
  className?: string;
  imageClassName?: string;
  children?: ReactNode;
}

export default function ImageCarousel({
  images,
  alt,
  sizes,
  className = '',
  imageClassName = '',
  children,
}: ImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isInView, setIsInView] = useState(true);
  const [isInteracting, setIsInteracting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasMultipleImages = images.length > 1;
  const safeActiveIndex = images.length ? Math.min(activeIndex, images.length - 1) : 0;

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = () => setReducedMotion(mediaQuery.matches);

    updateMotionPreference();
    mediaQuery.addEventListener('change', updateMotionPreference);

    return () => mediaQuery.removeEventListener('change', updateMotionPreference);
  }, []);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    }, { threshold: 0.2 });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasMultipleImages || reducedMotion || !isInView || isInteracting) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, 4000);

    return () => window.clearInterval(timer);
  }, [hasMultipleImages, images.length, isInView, isInteracting, reducedMotion]);

  const showPrevious = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setActiveIndex((current) => (current - 1 + images.length) % images.length);
  }, [images.length]);

  const showNext = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setActiveIndex((current) => (current + 1) % images.length);
  }, [images.length]);

  if (!images.length) return null;

  return (
    <div
      ref={containerRef}
      className={`group/image relative overflow-hidden ${className}`}
      onMouseEnter={() => setIsInteracting(true)}
      onMouseLeave={() => setIsInteracting(false)}
      onFocus={() => setIsInteracting(true)}
      onBlur={() => setIsInteracting(false)}
    >
      {images.map((src, index) => (
        <Image
          key={`${src}-${index}`}
          src={src}
          alt={hasMultipleImages ? `${alt} ${index + 1}` : alt}
          fill
          className={`object-cover transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] motion-reduce:transition-none ${
            index === safeActiveIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.025]'
          } ${imageClassName}`}
          sizes={sizes}
        />
      ))}

      {children}

      {hasMultipleImages && (
        <>
          <div className="pointer-events-none absolute inset-x-3 top-1/2 z-20 flex -translate-y-1/2 items-center justify-between">
            <button
              type="button"
              aria-label={`Previous image for ${alt}`}
              onClick={showPrevious}
              className="pointer-events-auto grid h-9 w-9 place-items-center rounded-full border border-white/55 bg-black/32 text-white shadow-lg backdrop-blur-md transition-[background-color,transform] duration-200 hover:scale-105 hover:bg-black/46 focus:outline-none focus-visible:ring-2 focus-visible:ring-white motion-reduce:transition-colors motion-reduce:hover:scale-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label={`Next image for ${alt}`}
              onClick={showNext}
              className="pointer-events-auto grid h-9 w-9 place-items-center rounded-full border border-white/55 bg-black/32 text-white shadow-lg backdrop-blur-md transition-[background-color,transform] duration-200 hover:scale-105 hover:bg-black/46 focus:outline-none focus-visible:ring-2 focus-visible:ring-white motion-reduce:transition-colors motion-reduce:hover:scale-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/45 bg-black/30 px-2.5 py-1.5 backdrop-blur-md">
            {images.map((src, index) => (
              <span
                key={`${src}-dot-${index}`}
                className={`h-1.5 w-5 rounded-full transition-[background-color,opacity,transform] duration-200 ${
                  index === safeActiveIndex ? 'scale-x-100 bg-white opacity-100' : 'scale-x-[0.32] bg-white/55 opacity-80'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
