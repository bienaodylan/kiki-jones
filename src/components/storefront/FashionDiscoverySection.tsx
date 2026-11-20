import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useLanguage } from '../../context/LanguageContext';
import { formatXOF, getColorHex } from '../../lib/format';
import { detectDominantColorsFromImageUrl, DetectedColor } from '../../lib/colorDetector';
import { Product } from '../../types/commerce';

function getCircularOffset(index: number, active: number, total: number): number {
  let diff = index - active;
  if (diff > total / 2) diff -= total;
  if (diff < -total / 2) diff += total;
  return diff;
}

export function FashionDiscoverySection() {
  const { products, getProductVariants, navigate } = useStore();
  const { tr } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const [activeIdx, setActiveIdx] = useState(0);
  const [detectedColorsMap, setDetectedColorsMap] = useState<Record<string, DetectedColor[]>>({});
  const [selectedSwatchHex, setSelectedSwatchHex] = useState<string>('');

  const spotlightProducts = useMemo<Product[]>(() => {
    const newDropList = products
      .filter((p) => p.isNewDrop && p.status !== 'archived')
      .sort((a, b) => (a.newDropOrder || 999) - (b.newDropOrder || 999))
      .slice(0, 8);

    if (newDropList.length > 0) return newDropList;
    return products.slice(0, 6);
  }, [products]);

  const total = spotlightProducts.length;
  const safeActiveIdx = total > 0 ? Math.min(activeIdx, total - 1) : 0;
  const activeProduct = spotlightProducts[safeActiveIdx] || null;

  useEffect(() => {
    if (activeIdx >= total && total > 0) {
      setActiveIdx(0);
    }
  }, [activeIdx, total]);

  const activeVariants = useMemo(
    () => (activeProduct ? getProductVariants(activeProduct.id).filter((v) => v.isActive) : []),
    [activeProduct, getProductVariants]
  );

  useEffect(() => {
    if (!activeProduct) return;
    let cancelled = false;
    const imgUrl = activeProduct.images?.[0] || activeProduct.runwayModelImageUrl || '';
    if (!imgUrl || detectedColorsMap[activeProduct.id]) return;

    detectDominantColorsFromImageUrl(imgUrl, 3).then((cols) => {
      if (!cancelled && cols.length > 0) {
        setDetectedColorsMap((prev) => ({ ...prev, [activeProduct.id]: cols }));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [activeProduct, detectedColorsMap]);

  const displaySwatches = useMemo(() => {
    if (!activeProduct) return [];
    const variantMap = new Map<string, string>();
    for (const v of activeVariants) {
      if (v.color && v.color !== 'Edition 01' && !variantMap.has(v.color)) {
        variantMap.set(v.color, v.colorHex || getColorHex(v.color));
      }
    }
    if (variantMap.size > 0) {
      return Array.from(variantMap.entries()).map(([name, hex]) => ({ name, hex }));
    }
    const detected = detectedColorsMap[activeProduct.id];
    if (detected && detected.length > 0) {
      return detected;
    }
    return [{ name: activeProduct.name, hex: '#111111' }];
  }, [activeProduct, activeVariants, detectedColorsMap]);

  useEffect(() => {
    if (displaySwatches.length > 0) {
      setSelectedSwatchHex(displaySwatches[0].hex);
    }
  }, [safeActiveIdx, displaySwatches]);

  if (!activeProduct || total === 0) return null;

  const goPrev = () => setActiveIdx((prev) => (prev - 1 + total) % total);
  const goNext = () => setActiveIdx((prev) => (prev + 1) % total);

  const displayTitle = activeProduct.name;
  const displayDescription = activeProduct.description;
  const displayPrice =
    typeof activeProduct.promoPriceXof === 'number' &&
    activeProduct.promoPriceXof > 0 &&
    activeProduct.promoPriceXof < activeProduct.regularPriceXof
      ? activeProduct.promoPriceXof
      : activeProduct.regularPriceXof;

  const compareAt =
    typeof activeProduct.promoPriceXof === 'number' &&
    activeProduct.promoPriceXof > 0 &&
    activeProduct.promoPriceXof < activeProduct.regularPriceXof
      ? activeProduct.regularPriceXof
      : null;

  const targetHref = `/product/${activeProduct.slug}`;

  return (
    <section
      aria-label="KIKI JONES New Season Spotlight"
      className="relative w-full bg-[#FFFFFF] text-black overflow-hidden min-h-[580px] sm:min-h-[640px] lg:min-h-[700px] flex flex-col justify-between select-none border-y border-black/10"
    >
      {/* Pure White 3D Perspective Runway Stage */}
      <div className="relative z-10 flex-1 w-full bg-[#FFFFFF] min-h-[440px] sm:min-h-[520px] lg:min-h-[580px] flex items-end justify-center pt-5 pb-16 sm:pb-14">
        {spotlightProducts.map((product, idx) => {
          const offset = getCircularOffset(idx, safeActiveIdx, total);
          const isCenter = offset === 0;
          const absOffset = Math.abs(offset);
          const isVisible = absOffset <= 2;

          const xPercent =
            offset === 0
              ? '0%'
              : offset === -1
                ? '-82%'
                : offset === 1
                  ? '82%'
                  : offset < 0
                    ? '-146%'
                    : '146%';

          const yPercent = offset === 0 ? '0%' : absOffset === 1 ? '-7%' : '-14%';

          const scale = offset === 0 ? 1 : absOffset === 1 ? 0.68 : absOffset === 2 ? 0.46 : 0.36;
          const opacity = !isVisible ? 0 : offset === 0 ? 1 : absOffset === 1 ? 0.94 : 0.78;
          const zIndex = offset === 0 ? 30 : absOffset === 1 ? 20 : absOffset === 2 ? 10 : 0;

          const visualUrl = product.runwayModelImageUrl || product.images?.[0] || '';
          const hasRunwayPhoto = Boolean(product.runwayModelImageUrl);

          return (
            <motion.button
              key={product.id}
              type="button"
              onClick={() => {
                if (!isVisible) return;
                if (isCenter) {
                  navigate(`/product/${product.slug}`);
                } else {
                  setActiveIdx(idx);
                }
              }}
              aria-label={isCenter ? `View ${product.name}` : `Spotlight ${product.name}`}
              aria-hidden={!isVisible}
              tabIndex={isVisible ? 0 : -1}
              initial={false}
              animate={{
                x: xPercent,
                y: yPercent,
                scale,
                opacity,
              }}
              transition={
                shouldReduceMotion
                  ? { duration: 0.15 }
                  : { type: 'spring', stiffness: 210, damping: 26, mass: 0.9 }
              }
              style={{
                zIndex,
                pointerEvents: isVisible ? 'auto' : 'none',
              }}
              className={`absolute bottom-14 sm:bottom-10 h-[390px] sm:h-[520px] lg:h-[630px] aspect-[3/4] flex items-end justify-center bg-transparent focus:outline-none cursor-pointer ${
                absOffset >= 2 ? 'hidden md:flex' : 'flex'
              }`}
            >
              {visualUrl && (
                <img
                  src={visualUrl}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  draggable={false}
                  className={`w-full h-full pointer-events-none ${
                    hasRunwayPhoto
                      ? 'object-cover object-top shadow-[0_24px_50px_-24px_rgba(0,0,0,0.28)]'
                      : 'object-contain object-center mix-blend-multiply p-8'
                  }`}
                />
              )}
            </motion.button>
          );
        })}

        {/* Left & Right Circular Carousel Arrows */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous piece"
              className="absolute left-4 sm:left-8 lg:left-12 top-1/2 -translate-y-1/2 z-40 w-11 h-11 rounded-full bg-[#FFFFFF] border border-black/15 text-black inline-flex items-center justify-center hover:bg-black hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={1.6} />
            </button>

            <button
              type="button"
              onClick={goNext}
              aria-label="Next piece"
              className="absolute right-4 sm:right-8 lg:right-12 top-1/2 -translate-y-1/2 z-40 w-11 h-11 rounded-full bg-[#FFFFFF] border border-black/15 text-black inline-flex items-center justify-center hover:bg-black hover:text-white transition-colors cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" strokeWidth={1.6} />
            </button>
          </>
        )}
      </div>

      {/* Bottom Interactive Overlay Row */}
      <div className="relative lg:absolute lg:inset-x-0 lg:bottom-0 z-40 px-5 sm:px-8 lg:px-12 pb-8 pt-2 flex flex-col lg:flex-row lg:items-end justify-between gap-6 pointer-events-none">
        {/* LEFT: Live Product Details */}
        <div className="pointer-events-auto max-w-[300px] sm:max-w-[340px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeProduct.id}
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="space-y-2.5"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/45">
                {tr('Sélection Nouvelle Saison', 'New Season Spotlight')} &middot; {activeProduct.categoryName}
              </p>
              <h2 className="font-editorial text-2xl sm:text-3xl lg:text-[32px] text-black leading-[1.06] tracking-[-0.01em] uppercase">
                {displayTitle}
              </h2>

              <div className="flex items-baseline gap-2.5 tabular-nums">
                <span className="text-base sm:text-lg font-bold text-black">
                  {formatXOF(displayPrice)}
                </span>
                {compareAt && compareAt > displayPrice && (
                  <span className="text-xs font-light text-black/45 line-through">
                    {formatXOF(compareAt)}
                  </span>
                )}
              </div>

              <p className="text-xs font-light text-black/65 line-clamp-2 leading-relaxed">
                {displayDescription}
              </p>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => navigate(targetHref)}
                  className="px-6 py-2.5 bg-black text-white text-[11px] font-bold uppercase tracking-[0.14em] inline-flex items-center gap-2.5 hover:bg-black/85 transition-colors cursor-pointer"
                >
                  <span>{tr('Découvrir la pièce', 'Explore Piece')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* CENTER: Minimal Slide Counter + Hairline Progress Bar */}
        <div className="pointer-events-auto flex items-center gap-3 self-start lg:self-end lg:mb-2">
          <span className="text-xs font-medium text-black tabular-nums tracking-wider">
            {String(safeActiveIdx + 1).padStart(2, '0')}
            <span className="text-black/35"> / {String(total).padStart(2, '0')}</span>
          </span>
          <div className="relative w-24 sm:w-28 h-[1.5px] bg-black/15 overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-black"
              initial={false}
              animate={{ width: `${((safeActiveIdx + 1) / total) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* RIGHT: Color Swatches + Pure White Thumbnail Dock */}
        <div className="pointer-events-auto flex flex-col items-start lg:items-end gap-3.5">
          {displaySwatches.length > 0 && (
            <div className="flex items-center gap-2.5 px-1">
              {displaySwatches.map((swatch) => {
                const isSelected = selectedSwatchHex === swatch.hex;
                return (
                  <button
                    key={`${swatch.name}_${swatch.hex}`}
                    type="button"
                    title={swatch.name}
                    aria-label={swatch.name}
                    onClick={() => setSelectedSwatchHex(swatch.hex)}
                    className={`w-5 h-5 rounded-full border border-black/20 transition-all cursor-pointer ${
                      isSelected
                        ? 'ring-2 ring-black ring-offset-2 ring-offset-white scale-105'
                        : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: swatch.hex }}
                  />
                );
              })}
            </div>
          )}

          <div className="bg-[#FFFFFF] border border-black/15 p-1.5 flex items-center gap-1.5 max-w-full overflow-x-auto">
            {spotlightProducts.map((product, idx) => {
              const isSelected = idx === safeActiveIdx;
              const thumbSrc = product.runwayModelImageUrl || product.images?.[0] || '';
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => setActiveIdx(idx)}
                  aria-label={`Select ${product.name}`}
                  className={`relative w-10 h-10 sm:w-11 sm:h-11 overflow-hidden bg-[#F5F5F5] shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? 'ring-1 ring-black opacity-100'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  {thumbSrc && (
                    <img
                      src={thumbSrc}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className={`w-full h-full ${
                        product.runwayModelImageUrl
                          ? 'object-cover object-top'
                          : 'object-contain p-1'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
