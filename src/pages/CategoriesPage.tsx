import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import { useExperienceMode } from '../context/ExperienceContext';
import { getLocalizedCategories } from '../lib/i18n';
import { getSectionImage } from '../lib/storefrontMedia';

export function CategoriesPage() {
  const { products, storefrontConfig, navigate } = useStore();
  const { lang, tr } = useLanguage();
  const { isAppMode } = useExperienceMode();
  const categories = getLocalizedCategories(lang);

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
              {tr('KIKI JONES · Répertoire Garde-Robe', 'KIKI JONES · Wardrobe Directory')}
            </p>
            <h1 className="font-editorial text-3xl sm:text-5xl text-black leading-[1.04]">
              {tr('Acheter par Catégorie', 'Shop by Category')}
            </h1>
            <p className="text-xs sm:text-sm font-light text-black/65 leading-relaxed">
              {tr(
                'Parcourez nos essentiels par type de pièce — Robes, Ensembles, Combinaisons, Sport, Shorts, Jeans, Chaussures, Lunettes, Sacs et Bijoux.',
                'Browse warm-climate essentials by piece — Dresses, Matching Sets, Rompers, Activewear, Shorts, Jeans, Shoes, Sunglasses, Bags, and Jewelry.'
              )}
            </p>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/50 tabular-nums">
            {categories.length} {tr('Catégories', 'Categories')}
          </p>
        </div>
      </section>

      {/* Edge-to-Edge 4-Column Category Grid */}
      <section className="w-full bg-black">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-0">
          {categories.map((cat) => {
            const count = products.filter((p) => {
              if (p.subCategory === cat.slug) return true;
              if (cat.matchSubCategories?.includes(p.subCategory || '')) return true;
              return false;
            }).length;

            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => navigate(`/category/${cat.slug}`)}
                className="group relative aspect-[3/4] w-full overflow-hidden bg-black text-left cursor-pointer border-r border-b border-white/10"
              >
                <img
                  src={getSectionImage(storefrontConfig, `category:${cat.slug}`, cat.imageUrl)}
                  alt={cat.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 md:bottom-7 md:left-6 md:right-6 space-y-2">
                  <p className="text-[9.5px] font-bold uppercase tracking-[0.2em] text-white/75">
                    {cat.subtitle} &middot; {count} {tr('pièces', 'Pieces')}
                  </p>
                  <div className="flex items-end justify-between gap-2">
                    <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-[0.06em] text-white underline decoration-white/60 underline-offset-[6px] group-hover:decoration-white">
                      {cat.name}
                    </h2>
                    <span className="w-8 h-8 rounded-full bg-white text-black inline-flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:translate-x-0.5">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
}
