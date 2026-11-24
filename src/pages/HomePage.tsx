import React from 'react';
import { useReducedMotion } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import { useExperienceMode } from '../context/ExperienceContext';
import { DEFAULT_STOREFRONT_CONFIG } from '../lib/catalogDefaults';
import { KJ_IMAGES } from '../lib/navigationData';
import { getSectionImage } from '../lib/storefrontMedia';
import {
  getLocalizedBrands,
  getLocalizedCategories,
  getLocalizedCollections,
} from '../lib/i18n';
import { CustomHomepageSection } from '../types/commerce';
import { ProductCard } from '../components/storefront/ProductCard';
import { BrandLogo } from '../components/brand/BrandLogo';

export function HomePage() {
  const { storefrontConfig, products, getProductVariants, navigate } = useStore();
  const { lang, tr } = useLanguage();
  const { isAppMode } = useExperienceMode();
  const shouldReduceMotion = useReducedMotion();

  const brands = getLocalizedBrands(lang);
  const categories = getLocalizedCategories(lang);
  const collections = getLocalizedCollections(lang);

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

  const renderProductGridSection = (
    renderKey: string,
    eyebrow: string,
    heading: string,
    ctaLabel: string,
    ctaHref: string,
    items: typeof products
  ) => {
    if (items.length === 0) return null;
    return (
      <section key={renderKey} className="w-full bg-white text-black py-10 md:py-14 border-b border-black/10">
        <div className="w-full px-4 sm:px-6 lg:px-10 mb-5 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">{eyebrow}</p>
            <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-[0.04em] text-black mt-0.5">
              {heading}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigate(ctaHref)}
            className="shrink-0 whitespace-nowrap px-4 sm:px-5 py-2 rounded-full border border-black text-[10.5px] font-bold uppercase tracking-[0.14em] text-black hover:bg-black hover:text-white transition-colors cursor-pointer"
          >
            {ctaLabel}
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-2 gap-y-4 px-4 sm:px-6 lg:px-10">
          {items.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} variants={getProductVariants(p.id)} />
          ))}
        </div>
      </section>
    );
  };

  const renderSection = (key: string, idx: number) => {
    if (key.startsWith('hidden:')) return null;
    const renderKey = `${key}_${idx}`;

    if (key.startsWith('custom:')) {
      const customId = key.slice('custom:'.length);
      const found = (storefrontConfig.customSections || []).find((s) => s.id === customId);
      return found ? renderCustomSection(found, renderKey) : null;
    }

    switch (key) {
      case 'hero_split':
      case 'hero': {
        const headline =
          lang === 'fr'
            ? storefrontConfig.heroHeadline || 'NOUVELLE SAISON'
            : storefrontConfig.heroHeadline === DEFAULT_STOREFRONT_CONFIG.heroHeadline
              ? 'NEW SEASON DROP'
              : storefrontConfig.heroHeadline || 'NEW SEASON DROP';
        const subheadline =
          lang === 'fr'
            ? storefrontConfig.heroSubheadline ||
              'Silhouettes contemporaines pour Kiki Men, Kiki Luxe, Kiki Sculpt, Kiki Curve et Kiki Kids.'
            : storefrontConfig.heroSubheadline === DEFAULT_STOREFRONT_CONFIG.heroSubheadline
              ? 'Contemporary silhouettes across Kiki Men, Kiki Luxe, Kiki Sculpt, Kiki Curve, and Kiki Kids.'
              : storefrontConfig.heroSubheadline || '';
        const primaryCta =
          lang === 'fr'
            ? storefrontConfig.heroCtaLabel || 'Nouveautés'
            : storefrontConfig.heroCtaLabel === DEFAULT_STOREFRONT_CONFIG.heroCtaLabel
              ? 'Shop New Arrivals'
              : storefrontConfig.heroCtaLabel || 'Shop New Arrivals';
        const secondaryCta =
          lang === 'fr'
            ? storefrontConfig.heroSecondaryCtaLabel || 'Par Marque'
            : storefrontConfig.heroSecondaryCtaLabel === DEFAULT_STOREFRONT_CONFIG.heroSecondaryCtaLabel
              ? 'Shop by Brand'
              : storefrontConfig.heroSecondaryCtaLabel || 'Shop by Brand';

        return (
          <React.Fragment key={renderKey}>
          <section
            className={`relative w-full overflow-hidden bg-black ${
              isAppMode ? 'h-[76svh] min-h-[480px] max-h-[760px]' : 'h-screen min-h-[620px]'
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 h-full w-full">
              <div className="relative h-full w-full overflow-hidden bg-black">
                <img
                  src={getSectionImage(storefrontConfig, 'hero_left', storefrontConfig.heroImageUrl || KJ_IMAGES.womenSatinEvening)}
                  alt={tr('Campagne Femme KIKI JONES', 'KIKI JONES Women Campaign')}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="relative hidden md:block h-full w-full overflow-hidden bg-black">
                <img
                  src={getSectionImage(storefrontConfig, 'hero_right', KJ_IMAGES.menEditorial)}
                  alt={tr('Campagne Homme KIKI JONES', 'KIKI JONES Men Campaign')}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

            {shouldReduceMotion && (
              <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none px-6">
                <BrandLogo variant="hero" tone="light" />
              </div>
            )}

            <div className="absolute bottom-8 left-5 right-5 md:bottom-12 md:left-10 md:right-10 z-20 max-w-xl space-y-3">
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold uppercase tracking-[-0.025em] text-white leading-[1.0]">
                {headline}
              </h1>
              <p className="text-xs sm:text-sm font-light text-white/85 leading-relaxed max-w-md">
                {subheadline}
              </p>
              <div className="pt-1 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate(storefrontConfig.heroCtaHref || '/new-in')}
                  className="px-6 py-2.5 rounded-full bg-white text-black text-[11px] font-bold uppercase tracking-[0.14em] hover:bg-white/90 transition-colors cursor-pointer whitespace-nowrap"
                >
                  {primaryCta}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(storefrontConfig.heroSecondaryCtaHref || '/brands')}
                  className="px-6 py-2.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/80 text-white text-[11px] font-bold uppercase tracking-[0.14em] hover:bg-white hover:text-black transition-colors cursor-pointer whitespace-nowrap"
                >
                  {secondaryCta}
                </button>
              </div>
            </div>
          </section>
          {isAppMode && (
            <nav
              aria-label={tr('Navigation rapide', 'Quick Divisions')}
              className="w-full bg-white border-b border-black/10"
            >
              <div className="flex items-center gap-2 px-3 py-2.5 overflow-x-auto no-scrollbar">
                {[
                  { label: tr('Nouveautés', 'New In'), href: '/new-in', solid: true },
                  { label: tr('Femme', 'Women'), href: '/women' },
                  { label: tr('Homme', 'Men'), href: '/men' },
                  { label: 'Curve', href: '/brand/kiki-curve' },
                  { label: 'Sculpt', href: '/brand/kiki-sculpt' },
                  { label: 'Sport', href: '/brand/kiki-sport' },
                  { label: tr('Enfants', 'Kids'), href: '/brand/kiki-kids' },
                  { label: tr('Accessoires', 'Accessories'), href: '/accessories' },
                  { label: tr('Soldes', 'Sale'), href: '/sale' },
                ].map((item) => (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => navigate(item.href)}
                    className={`min-h-[38px] px-3.5 text-[10.5px] font-bold uppercase tracking-[0.14em] whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                      item.solid
                        ? 'bg-black text-white'
                        : 'bg-[#F5F5F5] text-black hover:bg-black hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </nav>
          )}
          </React.Fragment>
        );
      }

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
                    src={getSectionImage(storefrontConfig, 'new_arrivals_1', KJ_IMAGES.heroCampaign)}
                    alt={tr('Nouveautés Robes KIKI JONES', 'KIKI JONES New Arrivals Dress')}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                </div>
                <div className="relative hidden md:block aspect-[4/5] w-full overflow-hidden bg-black">
                  <img
                    src={getSectionImage(storefrontConfig, 'new_arrivals_2', KJ_IMAGES.jumpsuitsFeature)}
                    alt={tr('Combinaisons KIKI JONES', 'KIKI JONES Tailored Romper')}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                </div>
                <div className="relative hidden md:block aspect-[4/5] w-full overflow-hidden bg-black">
                  <img
                    src={getSectionImage(storefrontConfig, 'new_arrivals_3', KJ_IMAGES.womenResortSet)}
                    alt={tr('Ensembles Resort KIKI JONES', 'KIKI JONES Matching Resort Set')}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                </div>
              </div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
              <div className="absolute bottom-8 left-5 right-5 md:bottom-12 md:left-10 z-10 max-w-lg space-y-3">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-white/75">
                  {tr('Nouvel arrivage · Collection Soleil', 'Just Landed · Warm-Climate Drop')}
                </p>
                <h2 className="text-3xl sm:text-5xl font-bold uppercase tracking-[-0.025em] text-white leading-[1.02]">
                  {tr('Nouveautés', 'New Arrivals')}
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
                    {tr('Découvrir', 'Shop Now')}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/collection/formal');
                    }}
                    className="px-6 py-2.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/80 text-white text-[11px] font-bold uppercase tracking-[0.14em] hover:bg-white hover:text-black transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {tr('Soirée & Cérémonie', 'Formal & Occasion')}
                  </button>
                </div>
              </div>
            </div>
          </section>
        );

      case 'shop_by_category_strip':
      case 'categories': {
        const featuredCats = categories.slice(0, 4);
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
                    src={getSectionImage(storefrontConfig, `category:${cat.slug}`, cat.imageUrl)}
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
                    src={getSectionImage(storefrontConfig, 'kiki_men_left', KJ_IMAGES.menMeshShirt)}
                    alt={tr('Chemises de soirée Kiki Men', 'Kiki Men Night Out Shirts')}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  />
                </div>
                <div className="relative hidden md:block aspect-[4/5] md:aspect-[5/6] w-full overflow-hidden bg-black">
                  <img
                    src={getSectionImage(storefrontConfig, 'kiki_men_right', KJ_IMAGES.menStreetDenim)}
                    alt={tr('Denim Stacked Kiki Men', 'Kiki Men Stacked Flare Denim')}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  />
                </div>
              </div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
              <div className="absolute bottom-8 left-5 right-5 md:bottom-12 md:left-10 z-10 max-w-lg space-y-3">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-white/75">
                  {tr('Par Marque · Mode Homme', 'Shop by Brand · Menswear')}
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
                    {tr('Découvrir', 'Shop Now')}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/men/shoes');
                    }}
                    className="px-6 py-2.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/80 text-white text-[11px] font-bold uppercase tracking-[0.14em] hover:bg-white hover:text-black transition-colors cursor-pointer"
                  >
                    {tr('Chaussures Homme', "Men's Footwear")}
                  </button>
                </div>
              </div>
            </div>
          </section>
        );

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
                    src={getSectionImage(storefrontConfig, 'kiki_sculpt_1', KJ_IMAGES.sculptFeature)}
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
                    src={getSectionImage(storefrontConfig, 'kiki_sculpt_2', KJ_IMAGES.sculptBodysuitFeature)}
                    alt="Kiki Sculpt Bodysuit"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                </div>
                <div
                  onClick={() => navigate('/brand/kiki-curve')}
                  className="group relative hidden md:block aspect-[3/4] w-full overflow-hidden bg-black cursor-pointer"
                >
                  <img
                    src={getSectionImage(storefrontConfig, 'kiki_sculpt_3', KJ_IMAGES.curveFeature)}
                    alt="Kiki Curve"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                </div>
              </div>

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
              <div className="absolute bottom-8 left-5 right-5 md:bottom-12 md:left-10 z-10 max-w-lg space-y-3">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-white/75">
                  {tr('Coupe Sculptée · Seconde Peau', 'Sculpted Fit · Second-Skin Confidence')}
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
                    {tr('Voir Kiki Sculpt', 'Shop Kiki Sculpt')}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/brand/kiki-curve')}
                    className="px-6 py-2.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/80 text-white text-[11px] font-bold uppercase tracking-[0.14em] hover:bg-white hover:text-black transition-colors cursor-pointer"
                  >
                    {tr('Voir Kiki Curve', 'Shop Kiki Curve')}
                  </button>
                </div>
              </div>
            </div>
          </section>
        );

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
                    src={getSectionImage(storefrontConfig, 'kiki_luxe_left', KJ_IMAGES.formalFeature)}
                    alt="Kiki Luxe"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  />
                </div>
                <div className="relative hidden md:block aspect-[4/5] md:aspect-[5/6] w-full overflow-hidden bg-black">
                  <img
                    src={getSectionImage(storefrontConfig, 'kiki_luxe_right', KJ_IMAGES.curveGownCampaign)}
                    alt="Kiki Curve Evening"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  />
                </div>
              </div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
              <div className="absolute bottom-8 left-5 right-5 md:bottom-12 md:left-10 z-10 max-w-lg space-y-3">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-white/75">
                  {tr('Gala · Soirée · Resort', 'Formal · Evening · Resort')}
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
                    {tr('Découvrir', 'Shop Now')}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/category/dresses');
                    }}
                    className="px-6 py-2.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/80 text-white text-[11px] font-bold uppercase tracking-[0.14em] hover:bg-white hover:text-black transition-colors cursor-pointer"
                  >
                    {tr('Voir les robes', 'Shop Dresses')}
                  </button>
                </div>
              </div>
            </div>
          </section>
        );

      case 'dual_spotlight':
      case 'next_drop':
        return (
          <section key={renderKey} className="w-full bg-black">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              <div
                onClick={() => navigate(storefrontConfig.nextDropLeftCtaHref || '/brand/kiki-kids')}
                className="group relative aspect-[4/5] md:aspect-[5/6] w-full overflow-hidden bg-black cursor-pointer md:border-r md:border-white/10"
              >
                <img
                  src={getSectionImage(
                    storefrontConfig,
                    'dual_left',
                    storefrontConfig.nextDropLeftImageUrl || KJ_IMAGES.girlsEditorial
                  )}
                  alt={storefrontConfig.nextDropLeftTitle || 'Kiki Kids'}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-8 left-6 right-6 md:bottom-12 md:left-10 space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/75">
                    {tr('Filles & Garçons', 'Girls & Boys')}
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
                      {lang === 'fr'
                        ? storefrontConfig.nextDropLeftCtaLabel || 'Voir Enfants'
                        : 'Shop Kids'}
                    </button>
                  </div>
                </div>
              </div>

              <div
                onClick={() => navigate(storefrontConfig.nextDropRightCtaHref || '/brand/kiki-sport')}
                className="group relative aspect-[4/5] md:aspect-[5/6] w-full overflow-hidden bg-black cursor-pointer"
              >
                <img
                  src={getSectionImage(
                    storefrontConfig,
                    'dual_right',
                    storefrontConfig.nextDropRightImageUrl || KJ_IMAGES.sportFeature
                  )}
                  alt={storefrontConfig.nextDropRightTitle || 'Kiki Sport'}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-8 left-6 right-6 md:bottom-12 md:left-10 space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/75">
                    {tr('Activewear Respirant', 'Heat-Ready Activewear')}
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
                      {tr('Voir Sport', 'Shop Sport')}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/category/activewear');
                      }}
                      className="px-6 py-2.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/80 text-white text-[11px] font-bold uppercase tracking-[0.14em] hover:bg-white hover:text-black transition-colors cursor-pointer"
                    >
                      {tr('Cyclistes', 'Biker Shorts')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );

      case 'shop_by_brand_strip':
      case 'brand_intro':
      case 'mireza_world':
        return (
          <section key={renderKey} className="w-full bg-white text-black py-10 md:py-14">
            <div className="w-full px-4 sm:px-6 lg:px-10 mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">
                  {tr('KIKI JONES · Nos Maisons', 'KIKI JONES · House of Labels')}
                </p>
                <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-[0.04em] text-black">
                  {tr('Acheter par Marque', 'Shop by Brand')}
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/brands')}
                  className="shrink-0 whitespace-nowrap px-4 sm:px-5 py-2 rounded-full border border-black text-[10.5px] font-bold uppercase tracking-[0.14em] text-black hover:bg-black hover:text-white transition-colors cursor-pointer"
                >
                  {tr('Toutes les marques', 'All Brands')}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/categories')}
                  className="shrink-0 whitespace-nowrap px-4 sm:px-5 py-2 rounded-full bg-black text-white text-[10.5px] font-bold uppercase tracking-[0.14em] hover:bg-black/85 transition-colors cursor-pointer"
                >
                  {tr('Toutes les catégories', 'All Categories')}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 px-4 sm:px-6 lg:px-10">
              {brands.map((brand) => (
                <button
                  key={brand.slug}
                  type="button"
                  onClick={() => navigate(`/brand/${brand.slug}`)}
                  className="group text-left cursor-pointer flex flex-col"
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F5F5F5]">
                    <img
                      src={getSectionImage(storefrontConfig, `brand:${brand.slug}`, brand.heroImage)}
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

      case 'trending_now_grid': {
        const list = products.filter((p) => p.isTrending || p.isFeatured);
        return renderProductGridSection(
          renderKey,
          tr('Sélection tendance', 'Curated Edit'),
          tr('Tendances actuelles', 'Trending Now'),
          tr('Tout voir', 'View All'),
          '/shop',
          list.length > 0 ? list : products
        );
      }

      case 'best_sellers_grid': {
        const list = products.filter((p) => p.isBestSeller || p.isFeatured);
        return renderProductGridSection(
          renderKey,
          tr('Pièces les plus demandées', 'Most Wanted'),
          'Best-Sellers',
          tr('Tout voir', 'View All'),
          '/shop',
          list.length > 0 ? list : products
        );
      }

      case 'new_arrivals_grid': {
        const list = products.filter((p) => p.isNewDrop);
        return renderProductGridSection(
          renderKey,
          tr('Vient d’arriver', 'Just Landed'),
          tr('Nouveautés', 'New Arrivals'),
          tr('Voir les nouveautés', 'Shop New In'),
          '/new-in',
          list.length > 0 ? list : products
        );
      }

      case 'featured_collections_grid':
        return (
          <section key={renderKey} className="w-full bg-white text-black py-10 md:py-14 border-b border-black/10">
            <div className="w-full px-4 sm:px-6 lg:px-10 mb-5 flex flex-wrap items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">
                  {tr('Éditions saisonnières', 'Seasonal Capsules')}
                </p>
                <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-[0.04em] text-black mt-0.5">
                  {tr('Collections à la une', 'Featured Collections')}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => navigate('/collections')}
                className="shrink-0 whitespace-nowrap px-4 sm:px-5 py-2 rounded-full border border-black text-[10.5px] font-bold uppercase tracking-[0.14em] text-black hover:bg-black hover:text-white transition-colors cursor-pointer"
              >
                {tr('Toutes les collections', 'All Collections')}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 px-4 sm:px-6 lg:px-10">
              {collections.slice(0, 3).map((col) => (
                <button
                  key={col.slug}
                  type="button"
                  onClick={() => navigate(`/collection/${col.slug}`)}
                  className="group relative aspect-[4/5] w-full overflow-hidden bg-black text-left cursor-pointer"
                >
                  <img
                    src={getSectionImage(storefrontConfig, `collection:${col.slug}`, col.campaignImage)}
                    alt={col.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-6 left-5 right-5 text-white space-y-1">
                    <p className="text-[9.5px] font-bold uppercase tracking-[0.2em] text-white/75">
                      {col.seasonTag}
                    </p>
                    <p className="text-xl font-bold uppercase tracking-[-0.01em]">{col.title}</p>
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

  return (
    <main className="w-full max-w-full overflow-x-clip bg-white">
      {storefrontConfig.campaignBannerEnabled && storefrontConfig.campaignBannerText && (
        <div
          className={
            isAppMode
              ? 'w-full bg-black text-white text-center py-2 px-4 text-[10px] font-medium uppercase tracking-[0.16em]'
              : 'fixed top-[88px] lg:top-[96px] inset-x-0 z-30 bg-black text-white text-center py-1.5 px-4 text-[10.5px] font-medium uppercase tracking-[0.16em]'
          }
        >
          {storefrontConfig.campaignBannerText}
        </div>
      )}
      {order.map((sec, idx) => renderSection(sec, idx))}
    </main>
  );
}
