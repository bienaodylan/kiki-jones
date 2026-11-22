import React from 'react';
import { Heart, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import { useExperienceMode } from '../context/ExperienceContext';
import { ProductCard } from '../components/storefront/ProductCard';

export function WishlistPage() {
  const { products, wishlistIds, getProductVariants, navigate } = useStore();
  const { tr } = useLanguage();
  const { isAppMode } = useExperienceMode();

  const savedProducts = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <main
      className={`${
        isAppMode ? 'pt-3 pb-10' : 'pt-[88px] lg:pt-[96px] pb-12'
      } w-full max-w-[1440px] mx-auto px-4 sm:px-6 min-h-screen overflow-x-clip bg-white text-black`}
    >
      <div className="pt-4 pb-5 border-b border-black/10 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-black/45">
            {tr('Sélection enregistrée', 'Saved Selection')}
          </p>
          <div className="flex items-start gap-1.5">
            <h1 className="font-editorial text-3xl sm:text-4xl text-black">
              {tr('Favoris', 'Wishlist')}
            </h1>
            <sup className="text-xs font-bold text-black/50 tabular-nums mt-2">
              {savedProducts.length}
            </sup>
          </div>
        </div>

        {savedProducts.length > 0 && (
          <button
            type="button"
            onClick={() => navigate('/new-in')}
            className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-black hover:opacity-65 cursor-pointer"
          >
            <span>{tr('Continuer l’exploration', 'Continue Exploring')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {savedProducts.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center text-center space-y-5">
          <div className="w-12 h-12 border border-black/15 flex items-center justify-center">
            <Heart className="w-5 h-5 text-black/60" strokeWidth={1.5} />
          </div>
          <div className="space-y-2">
            <h2 className="font-editorial text-2xl sm:text-3xl text-black">
              {tr('Votre liste de favoris est vide', 'Your wishlist is empty')}
            </h2>
            <p className="text-xs sm:text-sm font-light text-black/65 max-w-md">
              {tr(
                'Cliquez sur l’icône cœur sur n’importe quelle pièce KIKI JONES pour la retrouver facilement ici.',
                'Tap the heart icon on any KIKI JONES piece to save it here for quick access later.'
              )}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/new-in')}
              className="px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-[0.18em] hover:bg-black/85 transition-colors cursor-pointer"
            >
              {tr('Voir les nouveautés', 'Shop New In')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/collections')}
              className="px-6 py-3 border border-black text-black text-xs font-bold uppercase tracking-[0.18em] hover:bg-black hover:text-white transition-colors cursor-pointer"
            >
              {tr('Explorer les collections', 'Explore Collections')}
            </button>
          </div>
        </div>
      ) : (
        <div className="pt-4 grid grid-cols-2 md:grid-cols-4 gap-x-1.5 gap-y-4 sm:gap-x-2 sm:gap-y-5 items-stretch">
          {savedProducts.map((p) => (
            <ProductCard key={p.id} product={p} variants={getProductVariants(p.id)} />
          ))}
        </div>
      )}
    </main>
  );
}
