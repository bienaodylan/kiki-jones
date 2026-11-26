import React, { useEffect, useRef, useState } from 'react';
import { Product } from '../../types/commerce';
import { formatXOF } from '../../lib/format';

interface DoupiRackFallback2DProps {
  products: Product[];
  selectedIndex: number | null;
  activeCenterIndex: number;
  viewSide: 'front' | 'back';
  onSelectIndex: (index: number | null) => void;
  onCenterChange: (index: number) => void;
  externalScrollIndex: number | null;
}

/**
 * Automatic 2D / CSS-3D fallback rack when WebGL is unavailable.
 * Preserves the exact boutique-atelier rail, hangers, hanging price tags,
 * horizontal scroll/swipe inertia, center emphasis, and click-to-inspect zoom.
 */
export function DoupiRackFallback2D({
  products,
  selectedIndex,
  activeCenterIndex,
  viewSide,
  onSelectIndex,
  onCenterChange,
  externalScrollIndex,
}: DoupiRackFallback2DProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [swayDeg, setSwayDeg] = useState(0);
  const lastScrollLeft = useRef(0);
  const decayTimer = useRef<number | null>(null);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || externalScrollIndex === null) return;
    const card = el.querySelector<HTMLElement>(`[data-doupi-idx="${externalScrollIndex}"]`);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [externalScrollIndex]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (selectedIndex !== null) return;
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(delta) > 0) {
        e.preventDefault();
        el.scrollLeft += delta * 1.1;
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [selectedIndex]);

  const handleScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const delta = el.scrollLeft - lastScrollLeft.current;
    lastScrollLeft.current = el.scrollLeft;

    const clamped = Math.max(-7, Math.min(7, -delta * 0.12));
    setSwayDeg(clamped);

    if (decayTimer.current) window.clearTimeout(decayTimer.current);
    decayTimer.current = window.setTimeout(() => setSwayDeg(0), 140);

    const centerX = el.scrollLeft + el.clientWidth / 2;
    const cards = Array.from(el.querySelectorAll<HTMLElement>('[data-doupi-idx]'));
    let bestIdx = 0;
    let bestDist = Infinity;
    for (const card of cards) {
      const idx = Number(card.dataset.doupiIdx || '0');
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const dist = Math.abs(cardCenter - centerX);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = idx;
      }
    }
    onCenterChange(bestIdx);
  };

  return (
    <div className="relative w-full h-full bg-[#F4F3EF] overflow-hidden select-none flex flex-col justify-center">
      {/* Studio Metallic Rail */}
      <div
        className={`pointer-events-none absolute left-0 right-0 top-[20%] sm:top-[22%] h-[7px] bg-gradient-to-b from-[#FFFFFF] via-[#C8C9CE] to-[#8C8E94] shadow-[0_3px_10px_rgba(0,0,0,0.12)] transition-opacity duration-500 ${
          selectedIndex !== null ? 'opacity-25' : 'opacity-100'
        }`}
      />

      {/* Dimmer when inspecting a piece */}
      {selectedIndex !== null && (
        <div
          onClick={() => onSelectIndex(null)}
          className="absolute inset-0 z-20 bg-[#F4F3EF]/85 transition-opacity duration-300 cursor-pointer"
        />
      )}

      {/* Horizontal Hanging Track */}
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="relative z-10 w-full overflow-x-auto no-scrollbar flex items-start gap-8 sm:gap-12 px-[26vw] sm:px-[36vw] pt-[17%] sm:pt-[19%] pb-20 snap-x snap-mandatory"
        style={{ perspective: '1200px' }}
      >
        {products.map((product, idx) => {
          const isCenter = idx === activeCenterIndex;
          const isSelected = idx === selectedIndex;
          const effectivePrice =
            typeof product.promoPriceXof === 'number' && product.promoPriceXof > 0
              ? product.promoPriceXof
              : product.regularPriceXof;
          const frontImg = product.images?.[0] || '';
          const backImg = product.images?.[1] || product.runwayModelImageUrl || frontImg;
          const activeImg = isSelected && viewSide === 'back' ? backImg : frontImg;

          return (
            <div
              key={product.id}
              data-doupi-idx={idx}
              onClick={() => onSelectIndex(idx)}
              className={`relative shrink-0 snap-center cursor-pointer transition-all duration-500 ease-out origin-top ${
                isSelected
                  ? 'z-30 scale-105 md:-translate-x-[12vw]'
                  : selectedIndex !== null
                    ? 'opacity-20 scale-90 pointer-events-none'
                    : isCenter
                      ? 'scale-[1.06] opacity-100'
                      : 'scale-[0.92] opacity-75 hover:opacity-95'
              }`}
              style={{
                width: '220px',
                transform: isSelected
                  ? undefined
                  : `rotateZ(${swayDeg}deg) scale(${isCenter ? 1.06 : 0.92})`,
              }}
            >
              {/* Hook + Matte Hanger SVG */}
              <div className="flex flex-col items-center -mb-2">
                <svg
                  viewBox="0 0 180 64"
                  className="w-[170px] h-[56px] drop-shadow-[0_4px_6px_rgba(0,0,0,0.12)]"
                  fill="none"
                >
                  <path
                    d="M90 28 C90 12 78 6 88 4 C99 2 104 12 94 20"
                    stroke="#A6A8AE"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M90 27 L18 56 C13 58 14 62 20 62 L160 62 C166 62 167 58 162 56 Z"
                    fill="#191918"
                  />
                </svg>
              </div>

              {/* Garment Card */}
              <div className="relative w-full aspect-[3/4] bg-[#ECEAE4] shadow-[0_18px_36px_rgba(0,0,0,0.12)] overflow-hidden border border-black/8">
                <img
                  src={activeImg}
                  alt={product.name}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top transition-transform duration-500"
                />
              </div>

              {/* Hanging Price Tag */}
              <div className="absolute -right-4 top-12 w-[62px] bg-[#FAF9F6] border border-black/15 shadow-[0_6px_14px_rgba(0,0,0,0.1)] px-1.5 py-2 text-center rotate-[5deg] pointer-events-none">
                <div className="w-1.5 h-1.5 rounded-full bg-[#D8D5CD] mx-auto mb-1 border border-black/25" />
                <p className="text-[7px] tracking-[0.2em] uppercase text-black/45">
                  {String(idx + 1).padStart(2, '0')}
                </p>
                <p className="text-[8.5px] font-semibold text-black leading-tight mt-0.5 tabular-nums">
                  {formatXOF(effectivePrice)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
