'use client';

import { useEffect, useCallback, useState } from 'react';
import Image from 'next/image';
import { X, MapPin, ExternalLink } from 'lucide-react';
import { Restaurant, Attraction } from '@/data/types';

type ModalData =
  | { type: 'restaurant'; data: Restaurant }
  | { type: 'attraction'; data: Attraction };

interface DetailModalProps {
  item: ModalData | null;
  onClose: () => void;
}

export default function DetailModal({ item, onClose }: DetailModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (item) {
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      // Trigger enter animation on next frame
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [item]);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 300);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [item, handleClose]);

  if (!item) return null;

  const isRestaurant = item.type === 'restaurant';
  const d = item.data;
  const hasImage = d.images.length > 0;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
      />

      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl overflow-hidden max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-all duration-300"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.92) translateY(24px)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur rounded-full p-2 shadow-lg hover:bg-white transition-colors"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>

        {/* Image */}
        {hasImage && (
          <div className="relative w-full aspect-[16/10] overflow-hidden">
            <Image
              src={d.images[0]}
              alt={d.name}
              fill
              className="object-cover"
              sizes="(max-width: 672px) 100vw, 672px"
            />
            {/* Gradient overlay at bottom */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        )}

        {/* Content */}
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-start gap-3 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    isRestaurant
                      ? 'bg-[#1D3557] text-white'
                      : 'bg-[#2A9D8F] text-white'
                  }`}
                >
                  {isRestaurant ? (d as Restaurant).cuisine : (d as Attraction).category || '景点'}
                </span>
                {isRestaurant && (d as Restaurant).priceRange && (
                  <span className="text-sm text-[#E63946] font-semibold">
                    {(d as Restaurant).priceRange}
                  </span>
                )}
                {!isRestaurant && (d as Attraction).price && (
                  <span className="text-sm text-[#E63946] font-semibold">
                    {(d as Attraction).price}
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold text-[#1D3557]">{d.name}</h2>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 leading-relaxed mb-5">
            {d.description}
          </p>

          {/* Must Try (restaurants only) */}
          {isRestaurant && (d as Restaurant).mustTry.length > 0 && (
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-[#1D3557] mb-2">
                推荐菜
              </h3>
              <div className="flex flex-wrap gap-2">
                {(d as Restaurant).mustTry.map((item, i) => (
                  <span
                    key={i}
                    className="text-sm bg-[#F1FAEE] text-[#1D3557] px-3 py-1.5 rounded-full border border-[#1D3557]/10"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Address */}
          {d.address && (
            <div className="flex items-start gap-2 text-sm text-gray-500 mb-3">
              <MapPin className="w-4 h-4 text-[#E63946] mt-0.5 shrink-0" />
              <span>{d.address}</span>
            </div>
          )}

          {/* Website */}
          {d.website && (
            <a
              href={d.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-[#457B9D] hover:text-[#1D3557] transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              查看更多
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
