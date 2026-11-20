import React from 'react';
import { useReducedMotion } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { DEFAULT_STOREFRONT_CONFIG, KIKI_JONES_IMAGES } from '../lib/catalogDefaults';
import { BRAND_LINES, KJ_IMAGES, PRODUCT_CATEGORIES } from '../lib/navigationData';
import { CustomHomepageSection } from '../types/commerce';

export function HomePage() {
  const { storefrontConfig, navigate } = useStore();
  const shouldReduceMotion = useReducedMotion();

  const renderCustomSection = (section: CustomHomepageSection, renderKey: string) => {
    if (section.layout === 'duo') {
      return (
        <section key={renderKey} className="w-full bg-black">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            <div
              onClick={() => navigate(section.ctaHref || '/shop')}
              className="group relative aspect-[4/5] md:aspect-[5/6] w-full overflow-hidden bg-black cursor-pointer"
            >
              <img
                src={section.imageUrl}
                alt={section.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
              <div className="absolute bottom-7 left-6 right-6 md:bottom-10 md:left-10 space-y-3">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-[-0.02em] text-white leading-tight">
                  {section.title}
                </h2>
                {section.body && (
                  <p className="text-xs font-light text-white/85 max-w-md leading-relaxed">
                    {section.body}
                  </p>
                )}
                {section.ctaLabel && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(section.ctaHref || '/shop');
                      }}
                      className="px-6 py-2.5 rounded-full bg-white text-black text-[11px] font-bold uppercase tracking-[0.14em] hover:bg-white/90 transition-colors cursor-pointer"
                    >
                      {section.ctaLabel}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div
              onClick={() => navigate(section.secondaryCtaHref || '/shop')}
              className="group relative aspect-[4/5] md:aspect-[5/6] w-full overflow-hidden bg-black cursor-pointer"
            >
              <img
                src={section.secondaryImageUrl || section.imageUrl}
                alt={section.secondaryTitle || section.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
              <div className="absolute bottom-7 left-6 right-6 md:bottom-10 md:left-10 space-y-3">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-[-0.02em] text-white leading-tight">
                  {section.secondaryTitle || section.title}
                </h2>
                {section.secondaryCtaLabel && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(section.secondaryCtaHref || '/shop');
                      }}
                      className="px-6 py-2.5 rounded-full bg-white text-black text-[11px] font-bold uppercase tracking-[0.14em] hover:bg-white/90 transition-colors cursor-pointer"
                    >
                      {section.secondaryCtaLabel}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      );
    }

    return (
      <section key={renderKey} className="w-full bg-black">
        <div
          onClick={() => navigate(section.ctaHref || '/shop')}
          className="group relative w-full aspect-[4/5] sm:aspect-[16/9] lg:aspect-[1800/840] overflow-hidden bg-black cursor-pointer"
        >
          <img
            src={section.imageUrl}
            alt={section.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
          <div className="absolute bottom-7 left-6 right-6 md:bottom-12 md:left-10 z-10 space-y-3 max-w-xl">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold uppercase tracking-[-0.02em] text-white leading-tight">
              {section.title}
            </h2>
            {section.body && (
              <p className="text-xs sm:text-sm font-light text-white/85 leading-relaxed">
                {section.body}
              </p>
            )}
            {section.ctaLabel && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(section.ctaHref || '/shop');
                  }}
                  className="px-6 py-2.5 rounded-full bg-white text-black text-[11px] font-bold uppercase tracking-[0.14em] hover:bg-white/90 transition-colors cursor-pointer"
                >
                  {section.ctaLabel}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  };

  const renderSection = (key: string, idx: number) => {
    const renderKey = `${key}_${idx}`;

    if (key.startsWith('custom:')) {
      const customId = key.slice('custom:'.length);
      const found = (storefrontConfig.customSections || []).find((s) => s.id === customId);
      return found ? renderCustomSection(found, renderKey) : null;
    }

    switch (key) {
      // 1. NUDE PROJECT STYLE 50/50 FULL-BLEED SPLIT HERO (ZERO MARGINS, ROUNDED PILL BUTTONS)
      case 'hero_split':
      case 'hero':
        return (
          <section
            key={renderKey}
            className="relative h-screen min-h-[620px] w-full overflow-hidden bg-black"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 h-full w-full">
              <div className="relative h-full w-full overflow-hidden bg-black">
                <img
                  src={KJ_IMAGES.womenSatinEvening}
                  alt="KIKI JONES Women Campaign"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="relative hidden md:block h-full w-full overflow-hidden bg-black">
                <img
                  src={KJ_IMAGES.menEditorial}
                  alt="KIKI JONES Men Campaign"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

            {shouldReduceMotion && (
              <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                <span className="font-bold text-4xl md:text-6xl tracking-[0.28em] uppercase text-white">
                  KIKI JONES
                </span>
              </div>
            )}

            <div className="absolute bottom-8 left-5 right-5 md:bottom-12 md:left-10 md:right-10 z-20 max-w-xl space-y-3">
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold uppercase tracking-[-0.025em] text-white leading-[1.0]">
                {storefrontConfig.heroHeadline || 'NEW SEASON DROP'}
              </h1>
              <p className="text-xs sm:text-sm font-light text-white/85 leading-relaxed max-w-md">
                {storefrontConfig.heroSubheadline ||
                  'Contemporary silhouettes across Kiki Men, Kiki Luxe, Kiki Sculpt, Kiki Curve, and Kiki Kids.'}
              </p>
              <div className="pt-1 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate(storefrontConfig.heroCtaHref || '/new-in')}
                  className="px-6 py-2.5 rounded-full bg-white text-black text-[11px] font-bold uppercase tracking-[0.14em] hover:bg-white/90 transition-colors cursor-pointer whitespace-nowrap"
                >
                  {storefrontConfig.heroCtaLabel || 'Shop New Arrivals'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(storefrontConfig.heroSecondaryCtaHref || '/brands')}
                  className="px-6 py-2.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/80 text-white text-[11px] font-bold uppercase tracking-[0.14em] hover:bg-white hover:text-black transition-colors cursor-pointer whitespace-nowrap"
                >
                  {storefrontConfig.heroSecondaryCtaLabel || 'Shop by Brand'}
                </button>
              </div>
            </div>
          </section>
        );

      // 2. FULL-BLEED 3-PANEL NEW ARRIVALS CAMPAIGN BANNER (100% REAL FASHION NOVA EDITORIAL SHOTS — ZERO PRODUCTS)
      case 'new_arrivals_banner':
      case 'new_arrivals':
      case 'new_drop':
        return (
          <section key={renderKey} className="w-full bg-black">
            <div
              onClick={() => navigate('/new-in')}
              className="group relative w-full overflow-hidden bg-black cursor-pointer"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                <div className="relative aspect-[3/4] md:aspect-[4/5] w-full overflow-hidden bg-black">
                  <img
                    src={KJ_IMAGES.heroCampaign}
                    alt="KIKI JONES New Arrivals Dress"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                </div>
                <div className="relative hidden md:block aspect-[4/5] w-full overflow-hidden bg-black">
                  <img
                    src={KJ_IMAGES.jumpsuitsFeature}
                    alt="KIKI JONES Tailored Romper"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                </div>
                <div className="relative hidden md:block aspect-[4/5] w-full overflow-hidden bg-black">
                  <img
                    src={KJ_IMAGES.womenResortSet}
                    alt="KIKI JONES Matching Resort Set"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                </div>
              </div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
              <div className="absolute bottom-8 left-5 right-5 md:bottom-12 md:left-10 z-10 max-w-lg space-y-3">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-white/75">
                  Just Landed &middot; Warm-Climate Drop
                </p>
                <h2 className="text-3xl sm:text-5xl font-bold uppercase tracking-[-0.025em] text-white leading-[1.02]">
                  New Arrivals
                </h2>
                <div className="pt-1 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/new-in');
                    }}
                    className="px-6 py-2.5 rounded-full bg-white text-black text-[11px] font-bold uppercase tracking-[0.14em] hover:bg-white/90 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Shop Now
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/collection/formal');
                    }}
                    className="px-6 py-2.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/80 text-white text-[11px] font-bold uppercase tracking-[0.14em] hover:bg-white hover:text-black transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Formal &amp; Occasion
                  </button>
                </div>
              </div>
            </div>
          </section>
        );

      // 3. 4-COLUMN EDGE-TO-EDGE SHOP BY CATEGORY STRIP (ZERO GAPS, UNDERLINED WHITE LABELS)
      case 'shop_by_category_strip':
      case 'categories': {
        const featuredCats = PRODUCT_CATEGORIES.slice(0, 4);
        return (
          <section key={renderKey} className="w-full bg-black">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-0">
              {featuredCats.map((cat) => (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => navigate(`/category/${cat.slug}`)}
                  className="group relative aspect-[3/4] w-full overflow-hidden bg-black text-left cursor-pointer border-r border-white/10 last:border-r-0"
                >
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 md:bottom-7 md:left-6">
                    <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.14em] text-white underline decoration-white/75 underline-offset-[6px] group-hover:decoration-white">
                      {cat.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        );
      }

      // 4. 50/50 FULL-BLEED SPLIT CAMPAIGN: KIKI MEN (2 BLOCKS ON SAME ROW, ZERO GAPS)
      case 'kiki_men_split':
        return (
          <section key={renderKey} className="w-full bg-black">
            <div
              onClick={() => navigate('/brand/kiki-men')}
              className="group relative w-full cursor-pointer overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <div className="relative aspect-[4/5] md:aspect-[5/6] w-full overflow-hidden bg-black">
                  <img
                    src={KJ_IMAGES.menMeshShirt}
                    alt="Kiki Men Night Out Shirts"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  />
                </div>
                <div className="relative hidden md:block aspect-[4/5] md:aspect-[5/6] w-full overflow-hidden bg-black">
                  <img
                    src={KJ_IMAGES.menStreetDenim}
                    alt="Kiki Men Stacked Flare Denim"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  />
                </div>
              </div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
              <div className="absolute bottom-8 left-5 right-5 md:bottom-12 md:left-10 z-10 max-w-lg space-y-3">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-white/75">
                  Shop by Brand &middot; Menswear
                </p>
                <h2 className="text-3xl sm:text-5xl font-bold uppercase tracking-[-0.025em] text-white leading-[1.02]">
                  Kiki Men
                </h2>
                <div className="pt-1 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/brand/kiki-men');
                    }}
                    className="px-6 py-2.5 rounded-full bg-white text-black text-[11px] font-bold uppercase tracking-[0.14em] hover:bg-white/90 transition-colors cursor-pointer"
                  >
                    Shop Now
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/men/shoes');
                    }}
                    className="px-6 py-2.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/80 text-white text-[11px] font-bold uppercase tracking-[0.14em] hover:bg-white hover:text-black transition-colors cursor-pointer"
                  >
                    Men&apos;s Footwear
                  </button>
                </div>
              </div>
            </div>
          </section>
        );

      // 5. FULL-BLEED 3-COLUMN TRIPTYCH CAMPAIGN: KIKI SCULPT & KIKI CURVE (ZERO GAPS)
      case 'kiki_sculpt_triptych':
      case 'fashion_discovery':
        return (
          <section key={renderKey} className="w-full bg-black">
            <div className="relative w-full overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                <div
                  onClick={() => navigate('/brand/kiki-sculpt')}
                  className="group relative aspect-[3/4] w-full overflow-hidden bg-black cursor-pointer"
                >
                  <img
                    src={KJ_IMAGES.sculptFeature}
                    alt="Kiki Sculpt Corset"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                </div>
                <div
                  onClick={() => navigate('/brand/kiki-sculpt')}
                  className="group relative hidden md:block aspect-[3/4] w-full overflow-hidden bg-black cursor-pointer"
                >
                  <img
                    src={KJ_IMAGES.sculptBodysuitFeature}
                    alt="Kiki Sculpt Seamless Bodysuit"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                </div>
                <div
                  onClick={() => navigate('/brand/kiki-curve')}
                  className="group relative hidden md:block aspect-[3/4] w-full overflow-hidden bg-black cursor-pointer"
                >
                  <img
                    src={KJ_IMAGES.curveFeature}
                    alt="Kiki Curve Going Out Dress"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                </div>
              </div>

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
              <div className="absolute bottom-8 left-5 right-5 md:bottom-12 md:left-10 z-10 max-w-lg space-y-3">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-white/75">
                  Sculpted Fit &middot; Second-Skin Confidence
                </p>
                <h2 className="text-3xl sm:text-5xl font-bold uppercase tracking-[-0.025em] text-white leading-[1.02]">
                  Kiki Sculpt &amp; Curve
                </h2>
                <div className="pt-1 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/brand/kiki-sculpt')}
                    className="px-6 py-2.5 rounded-full bg-white text-black text-[11px] font-bold uppercase tracking-[0.14em] hover:bg-white/90 transition-colors cursor-pointer"
                  >
                    Shop Kiki Sculpt
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/brand/kiki-curve')}
                    className="px-6 py-2.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/80 text-white text-[11px] font-bold uppercase tracking-[0.14em] hover:bg-white hover:text-black transition-colors cursor-pointer"
                  >
                    Shop Kiki Curve
                  </button>
                </div>
              </div>
            </div>
          </section>
        );

      // 6. FULL-BLEED 2-PANEL CAMPAIGN: KIKI LUXE & FORMAL OCCASION
      case 'women_exclusive_banner':
      case 'after_dark_banner':
      case 'trending':
      case 'featured':
        return (
          <section key={renderKey} className="w-full bg-black">
            <div
              onClick={() => navigate('/brand/kiki-luxe')}
              className="group relative w-full overflow-hidden bg-black cursor-pointer"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <div className="relative aspect-[4/5] md:aspect-[5/6] w-full overflow-hidden bg-black">
                  <img
                    src={KJ_IMAGES.formalFeature}
                    alt="Kiki Luxe Embroidered Formal Gown"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  />
                </div>
                <div className="relative hidden md:block aspect-[4/5] md:aspect-[5/6] w-full overflow-hidden bg-black">
                  <img
                    src={KJ_IMAGES.curveGownCampaign}
                    alt="Kiki Curve Evening Gown"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  />
                </div>
              </div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
              <div className="absolute bottom-8 left-5 right-5 md:bottom-12 md:left-10 z-10 max-w-lg space-y-3">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-white/75">
                  Formal &middot; Evening &middot; Resort
                </p>
                <h2 className="text-3xl sm:text-5xl font-bold uppercase tracking-[-0.025em] text-white leading-[1.02]">
                  Kiki Luxe
                </h2>
                <div className="pt-1 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/brand/kiki-luxe');
                    }}
                    className="px-6 py-2.5 rounded-full bg-white text-black text-[11px] font-bold uppercase tracking-[0.14em] hover:bg-white/90 transition-colors cursor-pointer"
                  >
                    Shop Now
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/category/dresses');
                    }}
                    className="px-6 py-2.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/80 text-white text-[11px] font-bold uppercase tracking-[0.14em] hover:bg-white hover:text-black transition-colors cursor-pointer"
                  >
                    Shop Dresses
                  </button>
                </div>
              </div>
            </div>
          </section>
        );

      // 7. FULL-BLEED 50/50 DUAL INDEPENDENT BLOCKS SIDE-BY-SIDE (KIKI KIDS | KIKI SPORT)
      case 'dual_spotlight':
      case 'next_drop':
        return (
          <section key={renderKey} className="w-full bg-black">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              {/* Left Block: Kiki Kids */}
              <div
                onClick={() => navigate(storefrontConfig.nextDropLeftCtaHref || '/brand/kiki-kids')}
                className="group relative aspect-[4/5] md:aspect-[5/6] w-full overflow-hidden bg-black cursor-pointer border-r border-white/10"
              >
                <img
                  src={storefrontConfig.nextDropLeftImageUrl || KJ_IMAGES.girlsEditorial}
                  alt={storefrontConfig.nextDropLeftTitle || 'Kiki Kids'}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-8 left-6 right-6 md:bottom-12 md:left-10 space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/75">
                    Girls &amp; Boys
                  </p>
                  <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-[-0.02em] text-white leading-tight">
                    {storefrontConfig.nextDropLeftTitle || 'Kiki Kids'}
                  </h2>
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(storefrontConfig.nextDropLeftCtaHref || '/brand/kiki-kids');
                      }}
                      className="px-6 py-2.5 rounded-full bg-white text-black text-[11px] font-bold uppercase tracking-[0.14em] hover:bg-white/90 transition-colors cursor-pointer"
                    >
                      {storefrontConfig.nextDropLeftCtaLabel || 'Shop Kids'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Block: Kiki Sport */}
              <div
                onClick={() => navigate(storefrontConfig.nextDropRightCtaHref || '/brand/kiki-sport')}
                className="group relative aspect-[4/5] md:aspect-[5/6] w-full overflow-hidden bg-black cursor-pointer"
              >
                <img
                  src={storefrontConfig.nextDropRightImageUrl || KJ_IMAGES.sportFeature}
                  alt={storefrontConfig.nextDropRightTitle || 'Kiki Sport'}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-8 left-6 right-6 md:bottom-12 md:left-10 space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/75">
                    Heat-Ready Activewear
                  </p>
                  <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-[-0.02em] text-white leading-tight">
                    {storefrontConfig.nextDropRightTitle || 'Kiki Sport'}
                  </h2>
                  <div className="pt-1 flex flex-wrap gap-2.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/brand/kiki-sport');
                      }}
                      className="px-6 py-2.5 rounded-full bg-white text-black text-[11px] font-bold uppercase tracking-[0.14em] hover:bg-white/90 transition-colors cursor-pointer"
                    >
                      Shop Sport
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/category/activewear');
                      }}
                      className="px-6 py-2.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/80 text-white text-[11px] font-bold uppercase tracking-[0.14em] hover:bg-white hover:text-black transition-colors cursor-pointer"
                    >
                      Biker Shorts
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );

      // 8. BOTTOM SHOP BY BRAND EDITORIAL STRIP (ALL 6 SIGNATURE LABELS)
      case 'shop_by_brand_strip':
      case 'brand_intro':
      case 'mireza_world':
        return (
          <section key={renderKey} className="w-full bg-white text-black py-10 md:py-14">
            <div className="w-full px-4 sm:px-6 lg:px-10 mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">
                  KIKI JONES &middot; House of Labels
                </p>
                <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-[0.04em] text-black">
                  Shop by Brand
                </h2>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => navigate('/brands')}
                  className="px-5 py-2 rounded-full border border-black text-[10.5px] font-bold uppercase tracking-[0.14em] text-black hover:bg-black hover:text-white transition-colors cursor-pointer"
                >
                  All Brands
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/categories')}
                  className="px-5 py-2 rounded-full bg-black text-white text-[10.5px] font-bold uppercase tracking-[0.14em] hover:bg-black/85 transition-colors cursor-pointer"
                >
                  All Categories
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 px-4 sm:px-6 lg:px-10">
              {BRAND_LINES.map((brand) => (
                <button
                  key={brand.slug}
                  type="button"
                  onClick={() => navigate(`/brand/${brand.slug}`)}
                  className="group text-left cursor-pointer flex flex-col"
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F5F5F5]">
                    <img
                      src={brand.heroImage}
                      alt={brand.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="pt-2.5 space-y-0.5">
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-black group-hover:underline underline-offset-4">
                      {brand.name}
                    </p>
                    <p className="text-[11px] font-light text-black/55 line-clamp-1">
                      {brand.tagline}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  const order = (storefrontConfig.sectionOrder || DEFAULT_STOREFRONT_CONFIG.sectionOrder).filter(
    (s) => s !== 'newsletter'
  );

  return <main className="bg-white">{order.map((sec, idx) => renderSection(sec, idx))}</main>;
}
