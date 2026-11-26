import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import { useExperienceMode } from '../context/ExperienceContext';
import { getLocalizedBrands } from '../lib/i18n';
import { getSectionImage } from '../lib/storefrontMedia';

export function BrandsPage() {
  const { products, storefrontConfig, navigate } = useStore();
  const { lang, tr } = useLanguage();
  const { isAppMode } = useExperienceMode();
  const brands = getLocalizedBrands(lang);

  return (
    <main
      className={`${
        isAppMode ? 'pt-0 pb-10' : 'pt-[88px] lg:pt-[96px] pb-12'
      } bg-white text-black min-h-screen`}
    >
      {/* Header */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pt-8 pb-6 border-b border-black/10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-black/45">
              {tr('KIKI JONES · Nos Maisons', 'KIKI JONES · House of Brands')}
            </p>
            <h1 className="font-editorial text-3xl sm:text-5xl text-black leading-[1.04]">
              {tr('Acheter par Marque', 'Shop by Brand')}
            </h1>
            <p className="text-xs sm:text-sm font-light text-black/65 leading-relaxed">
              {tr(
                'Six marques KIKI JONES pensées pour un style contemporain sous les climats chauds — Kiki Men, Kiki Luxe, Kiki Curve, Kiki Sculpt, Kiki Sport et Kiki Kids.',
                'Six distinct KIKI JONES labels built for modern warm-climate style — Kiki Men, Kiki Luxe, Kiki Curve, Kiki Sculpt, Kiki Sport, and Kiki Kids.'
              )}
            </p>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/50 tabular-nums">
            {brands.length} {tr('Marques Signatures', 'Signature Labels')}
          </p>
        </div>
      </section>

      {/* Edge-to-Edge Full-Bleed Brand Campaigns */}
      <section className="w-full bg-black">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {brands.map((brand) => {
            const count = products.filter((p) => p.brandSlug === brand.slug).length;
            return (
              <div
                key={brand.slug}
                onClick={() => navigate(`/brand/${brand.slug}`)}
                className="group relative overflow-hidden bg-black cursor-pointer aspect-[4/5] sm:aspect-[5/6] border-r border-b border-white/10"
              >
                <img
                  src={getSectionImage(storefrontConfig, `brand:${brand.slug}`, brand.heroImage)}
                  alt={brand.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                <div className="absolute bottom-6 left-5 right-5 md:bottom-10 md:left-10 z-10 max-w-xl space-y-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/75">
                    {brand.tagline} &middot; {count} {tr('pièces', 'Pieces')}
                  </p>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-[-0.02em] text-white leading-[1.02]">
                    {brand.name}
                  </h2>
                  <p className="text-xs sm:text-sm font-light text-white/85 leading-relaxed max-w-md">
                    {brand.description}
                  </p>
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/brand/${brand.slug}`);
                      }}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-black text-[11px] font-bold uppercase tracking-[0.14em] hover:bg-white/90 transition-colors cursor-pointer"
                    >
                      <span>{tr(`Découvrir ${brand.name}`, `Shop ${brand.name}`)}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {brand.slug === 'kiki-luxe' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/premium/doupi-papillon');
                      }}
                      className="inline-flex items-center gap-2 border border-white/75 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white hover:bg-white hover:text-black transition-colors"
                    >
                      {tr('Kiki Jones × Doupi Papillon', 'Kiki Jones × Doupi Papillon')}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
