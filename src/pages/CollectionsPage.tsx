import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { EDITORIAL_COLLECTIONS } from '../lib/navigationData';
import { ProductCard } from '../components/storefront/ProductCard';

export function CollectionsPage() {
  const { products, getProductVariants, navigate } = useStore();

  const leadCollection = EDITORIAL_COLLECTIONS[0];
  const secondaryCollections = EDITORIAL_COLLECTIONS.slice(1);

  return (
    <main className="pt-[88px] lg:pt-[96px] pb-10 bg-white text-black min-h-screen">
      {/* Editorial Directory Header */}
      <section className="max-w-[1440px] mx-auto px-2.5 sm:px-4 lg:px-6 pt-5 pb-5 border-b border-black/10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.24em] text-black/50">
              KIKI JONES &middot; Archive &amp; Seasonal Capsules
            </p>
            <h1 className="font-editorial text-3xl sm:text-5xl text-black leading-[1.02]">
              Collections
            </h1>
            <p className="text-sm font-light text-black/70 leading-relaxed pt-1">
              Curated fashion capsules across Women, Men, Girls, and Boys. Designed to scale seamlessly season after season.
            </p>
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-black/50 tabular-nums">
            {EDITORIAL_COLLECTIONS.length} Active Editions
          </p>
        </div>
      </section>

      {/* Featured Lead Editorial Campaign */}
      {leadCollection && (
        <section className="w-full bg-black">
          <div className="group relative w-full aspect-[16/10] sm:aspect-[2/1] lg:aspect-[1800/780] overflow-hidden bg-black">
            <img
              src={leadCollection.campaignImage}
              alt={leadCollection.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 max-w-[1440px] mx-auto px-5 sm:px-8 xl:px-10 pb-8 md:pb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="max-w-xl space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/75">
                  {leadCollection.seasonTag} &middot; {leadCollection.audiences.join(' / ')}
                </p>
                <h2 className="font-editorial text-3xl sm:text-5xl text-white leading-tight">
                  {leadCollection.title}
                </h2>
                <p className="text-xs sm:text-sm font-light text-white/85 leading-relaxed">
                  {leadCollection.description}
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate(`/collection/${leadCollection.slug}`)}
                className="px-7 py-3.5 bg-white text-black text-[11px] font-bold uppercase tracking-[0.18em] inline-flex items-center gap-2 hover:bg-white/85 transition-colors cursor-pointer self-start md:self-end shrink-0"
              >
                <span>Shop Collection</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Editorial Collection Magazine Chapters */}
      <div className="max-w-[1440px] mx-auto px-2.5 sm:px-4 lg:px-6 py-6 space-y-8">
        {secondaryCollections.map((col, idx) => {
          const matchingProducts = products
            .filter((p) => (p.collectionSlugs || []).includes(col.slug))
            .slice(0, 4);

          const isReversed = idx % 2 === 1;

          return (
            <article key={col.slug} className="space-y-4 border-b border-black/10 pb-8 last:border-b-0">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                <div
                  className={`lg:col-span-7 overflow-hidden bg-[#F5F5F5] ${
                    isReversed ? 'lg:order-2' : 'lg:order-1'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => navigate(`/collection/${col.slug}`)}
                    className="group block w-full aspect-[16/10] overflow-hidden cursor-pointer"
                  >
                    <img
                      src={col.campaignImage}
                      alt={col.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  </button>
                </div>

                <div
                  className={`lg:col-span-5 space-y-3 ${
                    isReversed ? 'lg:order-1 lg:pr-4' : 'lg:order-2 lg:pl-4'
                  }`}
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">
                    {String(idx + 2).padStart(2, '0')} &middot; {col.seasonTag} &middot; {col.audiences.join(' / ')}
                  </p>
                  <h2 className="font-editorial text-2xl sm:text-4xl text-black leading-tight">
                    {col.title}
                  </h2>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-black/60">
                    {col.subtitle}
                  </p>
                  <p className="text-sm font-light text-black/75 leading-relaxed">
                    {col.description}
                  </p>
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => navigate(`/collection/${col.slug}`)}
                      className="px-5 py-2.5 bg-black text-white text-[11px] font-bold uppercase tracking-[0.18em] inline-flex items-center gap-2 hover:bg-black/85 transition-colors cursor-pointer"
                    >
                      <span>Shop {col.title}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {matchingProducts.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-1.5 gap-y-4 sm:gap-x-2 sm:gap-y-5 items-stretch">
                  {matchingProducts.map((p) => (
                    <ProductCard key={p.id} product={p} variants={getProductVariants(p.id)} />
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </main>
  );
}
