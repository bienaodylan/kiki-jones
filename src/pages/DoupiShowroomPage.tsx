import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import { useExperienceMode } from '../context/ExperienceContext';
import { DoupiRackScene } from '../components/doupi/DoupiRackScene';
import { DoupiRackFallback2D } from '../components/doupi/DoupiRackFallback2D';
import { DoupiProductPanel } from '../components/doupi/DoupiProductPanel';
import { Product } from '../types/commerce';

const APPAREL_PRIORITY = new Set([
  'dresses',
  'matching-sets',
  'jumpsuits',
  'tops',
  'shirts',
  'bottoms',
  'jeans',
  'pants',
  'skirts',
  'activewear',
]);

export function DoupiShowroomPage() {
  const { products, getProductVariants, navigate } = useStore();
  const { tr } = useLanguage();
  const { isAppMode } = useExperienceMode();

  const [webglUnavailable, setWebglUnavailable] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [activeCenterIndex, setActiveCenterIndex] = useState<number>(0);
  const [externalScrollIndex, setExternalScrollIndex] = useState<number | null>(null);
  const [viewSide, setViewSide] = useState<'front' | 'back'>('front');

  // Resolve real Kiki Jones Doupi collection pieces (inside Kiki Jones Premium)
  const showroomProducts: Product[] = useMemo(() => {
    const published = products.filter((p) => p.status === 'published' && (p.images || []).length > 0);

    // 1. Products explicitly tagged for kiki-jones-doupi
    const explicitDoupi = published.filter((p) =>
      (p.collectionSlugs || []).includes('kiki-jones-doupi')
    );

    // 2. Kiki Jones Premium (brandSlug === 'kiki-luxe') apparel pieces
    const premiumApparel = published.filter(
      (p) =>
        p.brandSlug === 'kiki-luxe' &&
        APPAREL_PRIORITY.has(p.subCategory || '') &&
        !explicitDoupi.some((e) => e.id === p.id)
    );

    // 3. Curated statement apparel pieces to ensure a full atelier rail (~12–15 silhouettes)
    const curatedExtras = published.filter(
      (p) =>
        APPAREL_PRIORITY.has(p.subCategory || '') &&
        !explicitDoupi.some((e) => e.id === p.id) &&
        !premiumApparel.some((e) => e.id === p.id)
    );

    const combined = [...explicitDoupi, ...premiumApparel];
    if (combined.length < 12) {
      combined.push(...curatedExtras.slice(0, 15 - combined.length));
    }

    return combined.slice(0, 15);
  }, [products]);

  const selectedProduct =
    selectedIndex !== null && showroomProducts[selectedIndex]
      ? showroomProducts[selectedIndex]
      : null;

  const selectedVariants = useMemo(
    () => (selectedProduct ? getProductVariants(selectedProduct.id) : []),
    [selectedProduct, getProductVariants]
  );

  // Reset Front/Back view whenever selecting a different garment
  useEffect(() => {
    setViewSide('front');
  }, [selectedIndex]);

  const handleSelectIndex = useCallback((idx: number | null) => {
    setSelectedIndex(idx);
    if (idx !== null) {
      setActiveCenterIndex(idx);
    }
  }, []);

  const handleStep = (delta: number) => {
    if (showroomProducts.length === 0) return;
    const base = selectedIndex !== null ? selectedIndex : activeCenterIndex;
    const next = Math.max(0, Math.min(showroomProducts.length - 1, base + delta));
    setExternalScrollIndex(next);
    setActiveCenterIndex(next);
    if (selectedIndex !== null) {
      setSelectedIndex(next);
    }
  };

  const handleScrubTo = (idx: number) => {
    setExternalScrollIndex(idx);
    setActiveCenterIndex(idx);
    if (selectedIndex !== null) {
      setSelectedIndex(idx);
    }
  };

  const activeProduct = showroomProducts[activeCenterIndex] || null;
  const totalCount = showroomProducts.length;
  const displayIndex = selectedIndex !== null ? selectedIndex : activeCenterIndex;

  return (
    <main
      className={`relative w-full bg-[#F4F3EF] text-black overflow-hidden select-none ${
        isAppMode
          ? 'h-[calc(100dvh-56px)]'
          : 'pt-[88px] lg:pt-[96px] flex-1 min-h-0 h-full'
      }`}
    >
      {/* Full-Bleed 3D / 2D Boutique-Atelier Stage */}
      <div className="relative w-full h-full">
        {showroomProducts.length > 0 ? (
          webglUnavailable ? (
            <DoupiRackFallback2D
              products={showroomProducts}
              selectedIndex={selectedIndex}
              activeCenterIndex={activeCenterIndex}
              viewSide={viewSide}
              onSelectIndex={handleSelectIndex}
              onCenterChange={setActiveCenterIndex}
              externalScrollIndex={externalScrollIndex}
            />
          ) : (
            <DoupiRackScene
              products={showroomProducts}
              selectedIndex={selectedIndex}
              viewSide={viewSide}
              externalScrollIndex={externalScrollIndex}
              onSelectIndex={handleSelectIndex}
              onCenterChange={setActiveCenterIndex}
              onWebGLUnavailable={() => setWebglUnavailable(true)}
            />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-[11px] font-light uppercase tracking-[0.26em] text-black/45">
              {tr('Chargement de la collection…', 'Loading collection…')}
            </p>
          </div>
        )}

        {/* Discreet Atelier Header Overlay */}
        <header className="pointer-events-none absolute top-4 sm:top-6 inset-x-4 sm:inset-x-8 lg:inset-x-12 z-20 flex items-center justify-between gap-4">
          <div className="pointer-events-auto flex items-center gap-3 sm:gap-5">
            <button
              type="button"
              onClick={() => navigate('/brand/kiki-luxe')}
              className="inline-flex items-center gap-1.5 text-[10px] font-light uppercase tracking-[0.22em] text-black/55 hover:text-black transition-colors cursor-pointer"
              aria-label="Kiki Jones Premium"
            >
              <ArrowLeft className="w-3.5 h-3.5 stroke-[1.5]" />
              <span className="hidden sm:inline">Kiki Jones Premium</span>
            </button>
            <span className="hidden sm:inline-block w-px h-3 bg-black/15" />
            <h1 className="text-[10.5px] sm:text-[11.5px] font-normal uppercase tracking-[0.26em] text-black/85">
              NEW COLLECTION <span className="text-black/30 mx-1.5">|</span> KIKI JONES DOUPI
            </h1>
          </div>

          {totalCount > 0 && (
            <div className="text-[10.5px] font-light uppercase tracking-[0.24em] text-black/55 tabular-nums">
              {String(displayIndex + 1).padStart(2, '0')} / {String(totalCount).padStart(2, '0')}
            </div>
          )}
        </header>

        {/* Bottom Minimalist Atelier Scrubber & Quiet Navigation Controls */}
        {selectedIndex === null && totalCount > 0 && (
          <div className="pointer-events-none absolute bottom-5 sm:bottom-7 inset-x-4 sm:inset-x-8 lg:inset-x-12 z-20 flex flex-col gap-3">
            {/* Active Centered Piece Subtle Caption */}
            {activeProduct && (
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[11px] sm:text-xs font-light tracking-[0.06em] text-black/80 truncate">
                    {activeProduct.name}
                  </p>
                  <p className="text-[9.5px] font-light uppercase tracking-[0.22em] text-black/45 mt-0.5">
                    {tr(
                      'Faites défiler · Cliquez sur une pièce pour l’inspecter',
                      'Scroll or swipe · Click any piece to inspect'
                    )}
                  </p>
                </div>

                {/* Quiet Prev / Next Arrows */}
                <div className="pointer-events-auto flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleStep(-1)}
                    disabled={activeCenterIndex <= 0}
                    aria-label={tr('Pièce précédente', 'Previous garment')}
                    className="w-9 h-9 border border-black/15 bg-[#FFFFFF]/90 text-black flex items-center justify-center hover:border-black disabled:opacity-25 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4 stroke-[1.5]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStep(1)}
                    disabled={activeCenterIndex >= totalCount - 1}
                    aria-label={tr('Pièce suivante', 'Next garment')}
                    className="w-9 h-9 border border-black/15 bg-[#FFFFFF]/90 text-black flex items-center justify-center hover:border-black disabled:opacity-25 transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4 stroke-[1.5]" />
                  </button>
                </div>
              </div>
            )}

            {/* Hairline Interactive Progress Rail */}
            <div className="pointer-events-auto flex items-center gap-1.5">
              {showroomProducts.map((p, idx) => {
                const isActive = idx === activeCenterIndex;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleScrubTo(idx)}
                    aria-label={`${String(idx + 1).padStart(2, '0')} ${p.name}`}
                    className="group flex-1 py-2 cursor-pointer flex items-center"
                  >
                    <span
                      className={`block w-full transition-all duration-300 ${
                        isActive
                          ? 'h-[2px] bg-black'
                          : 'h-[1px] bg-black/18 group-hover:bg-black/45'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Minimalist Product Panel (appears beside unhooked garment on desktop / bottom sheet on mobile) */}
        <DoupiProductPanel
          product={selectedProduct}
          variants={selectedVariants}
          itemIndex={selectedIndex ?? 0}
          totalCount={totalCount}
          viewSide={viewSide}
          onViewSideChange={setViewSide}
          onClose={() => setSelectedIndex(null)}
        />
      </div>
    </main>
  );
}
