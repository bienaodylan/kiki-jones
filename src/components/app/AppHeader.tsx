import React, { useMemo } from 'react';
import { ChevronLeft, Globe, Heart, Menu, Search, ShoppingBag } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  getLocalizedBrands,
  getLocalizedCategories,
  getLocalizedCollections,
  localizeAudienceLabel,
} from '../../lib/i18n';

export function AppHeader() {
  const {
    route,
    navigate,
    products,
    cartCount,
    setCartOpen,
    setMobileMenuOpen,
    setSearchOpen,
    isWishlisted,
    toggleWishlist,
  } = useStore();
  const { lang, toggleLang, tr } = useLanguage();

  const isTopLevelTab =
    route.page === 'home' ||
    route.page === 'search' ||
    route.page === 'wishlist' ||
    route.page === 'cart' ||
    route.page === 'account';

  const activeProduct = useMemo(() => {
    if (route.page !== 'product') return null;
    return products.find((p) => p.slug === route.slug) || null;
  }, [route, products]);

  const headerTitle = useMemo(() => {
    switch (route.page) {
      case 'home':
        return null;
      case 'search':
        return tr('Explorer', 'Discover');
      case 'wishlist':
        return tr('Favoris', 'Wishlist');
      case 'cart':
        return tr('Panier', 'Shopping Bag');
      case 'checkout':
        return tr('Paiement', 'Checkout');
      case 'account':
        return tr('Compte', 'Account');
      case 'orders':
        return tr('Commandes', 'Orders');
      case 'shop':
        return tr('Boutique', 'Shop All');
      case 'new-in':
        return tr('Nouveautés', 'New In');
      case 'sale':
        return tr('Soldes', 'Sale');
      case 'brands':
        return tr('Marques', 'Brands');
      case 'brand': {
        const b = getLocalizedBrands(lang).find((x) => x.slug === route.slug);
        return b ? b.name : route.slug;
      }
      case 'categories':
        return tr('Catégories', 'Categories');
      case 'category': {
        const c = getLocalizedCategories(lang).find((x) => x.slug === route.slug);
        return c ? c.name : route.slug;
      }
      case 'collections':
        return 'Collections';
      case 'collection': {
        const col = getLocalizedCollections(lang).find((x) => x.slug === route.slug);
        return col ? col.title : route.slug;
      }
      case 'audience':
        return localizeAudienceLabel(route.audience, lang);
      case 'accessories':
        return tr('Accessoires', 'Accessories');
      case 'product':
        return activeProduct?.brandName || 'KIKI JONES';
      case 'legal':
        return tr('Informations', 'Information');
      default:
        return 'KIKI JONES';
    }
  }, [route, lang, tr, activeProduct]);

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate('/');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/75 backdrop-blur-2xl backdrop-saturate-[1.85] border-b border-black/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.04)] pt-safe">
      <div className="max-w-[1440px] mx-auto px-2 sm:px-4 h-[52px] grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
        {/* LEFT SLOT: Drawer Trigger on top-level tabs, Back + optional Drawer on nested screens */}
        <div className="flex items-center justify-start gap-0.5 min-w-0">
          {!isTopLevelTab ? (
            <>
              <button
                type="button"
                onClick={handleBack}
                aria-label={tr('Retour', 'Go back')}
                className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-black active:opacity-50 transition-opacity cursor-pointer"
              >
                <ChevronLeft className="w-[22px] h-[22px]" strokeWidth={1.75} />
              </button>
              {route.page !== 'checkout' && route.page !== 'product' && (
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(true)}
                  aria-label={tr('Ouvrir le menu', 'Open menu')}
                  className="min-h-[44px] min-w-[40px] inline-flex items-center justify-center text-black/80 active:opacity-50 transition-opacity cursor-pointer"
                >
                  <Menu className="w-[19px] h-[19px]" strokeWidth={1.65} />
                </button>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label={tr('Ouvrir le menu', 'Open menu')}
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-black active:opacity-50 transition-opacity cursor-pointer"
            >
              <Menu className="w-[20px] h-[20px]" strokeWidth={1.7} />
            </button>
          )}
        </div>

        {/* CENTER SLOT: Wordmark on Home, Contextual Title on other pages */}
        <div className="flex items-center justify-center min-w-0 max-w-[200px] sm:max-w-xs">
          {headerTitle === null ? (
            <button
              type="button"
              onClick={() => navigate('/')}
              aria-label={tr('Accueil KIKI JONES', 'KIKI JONES Home')}
              className="font-bold text-[15px] tracking-[0.22em] uppercase text-black whitespace-nowrap cursor-pointer"
            >
              KIKI JONES
            </button>
          ) : (
            <span className="text-[12px] font-bold uppercase tracking-[0.16em] text-black truncate">
              {headerTitle}
            </span>
          )}
        </div>

        {/* RIGHT SLOT: Contextual Utility */}
        <div className="flex items-center justify-end gap-0.5 shrink-0">
          {route.page === 'product' && activeProduct ? (
            <>
              <button
                type="button"
                onClick={() => toggleWishlist(activeProduct.id, activeProduct.name)}
                aria-label={
                  isWishlisted(activeProduct.id)
                    ? tr('Retirer des favoris', 'Remove from wishlist')
                    : tr('Ajouter aux favoris', 'Save to wishlist')
                }
                className="min-h-[44px] min-w-[42px] inline-flex items-center justify-center text-black active:opacity-50 transition-opacity cursor-pointer"
              >
                <Heart
                  className="w-[19px] h-[19px]"
                  strokeWidth={1.7}
                  fill={isWishlisted(activeProduct.id) ? '#000000' : 'none'}
                />
              </button>
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                aria-label={tr(`Panier (${cartCount})`, `Shopping bag (${cartCount})`)}
                className="relative min-h-[44px] min-w-[42px] inline-flex items-center justify-center text-black active:opacity-50 transition-opacity cursor-pointer"
              >
                <ShoppingBag className="w-[19px] h-[19px]" strokeWidth={1.7} />
                {cartCount > 0 && (
                  <span className="absolute top-2 right-1.5 min-w-[15px] h-[15px] px-0.5 rounded-full bg-black text-white text-[9px] font-bold flex items-center justify-center tabular-nums">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>
            </>
          ) : (
            <>
              {route.page !== 'search' && route.page !== 'checkout' && (
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  aria-label={tr('Rechercher', 'Search')}
                  className="min-h-[44px] min-w-[40px] inline-flex items-center justify-center text-black active:opacity-50 transition-opacity cursor-pointer"
                >
                  <Search className="w-[18px] h-[18px]" strokeWidth={1.7} />
                </button>
              )}
              <button
                type="button"
                onClick={toggleLang}
                aria-label={tr('Changer la langue', 'Switch language')}
                className="min-h-[44px] px-2 inline-flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-black active:opacity-50 transition-opacity cursor-pointer"
              >
                <Globe className="w-[14px] h-[14px]" strokeWidth={1.7} />
                <span>{lang.toUpperCase()}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
