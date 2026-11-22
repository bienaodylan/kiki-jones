import React from 'react';
import { Home, Search, Heart, ShoppingBag, User } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useLanguage } from '../../context/LanguageContext';

export function AppBottomNavigation() {
  const { route, navigate, cartCount, wishlistCount } = useStore();
  const { tr } = useLanguage();

  // Auto-hide bottom tab bar on dedicated checkout and product detail flows
  // so sticky Add-to-Bag / Checkout CTAs and form inputs never collide.
  if (route.page === 'checkout' || route.page === 'product' || route.page === 'admin') {
    return null;
  }

  const tabs = [
    {
      key: 'home',
      label: tr('Accueil', 'Home'),
      href: '/',
      icon: Home,
      active: route.page === 'home',
      badge: 0,
    },
    {
      key: 'discover',
      label: tr('Explorer', 'Discover'),
      href: '/search',
      icon: Search,
      active:
        route.page === 'search' ||
        route.page === 'shop' ||
        route.page === 'new-in' ||
        route.page === 'sale' ||
        route.page === 'brands' ||
        route.page === 'brand' ||
        route.page === 'categories' ||
        route.page === 'category' ||
        route.page === 'collections' ||
        route.page === 'collection' ||
        route.page === 'audience' ||
        route.page === 'accessories',
      badge: 0,
    },
    {
      key: 'wishlist',
      label: tr('Favoris', 'Wishlist'),
      href: '/wishlist',
      icon: Heart,
      active: route.page === 'wishlist',
      badge: wishlistCount,
    },
    {
      key: 'cart',
      label: tr('Panier', 'Bag'),
      href: '/cart',
      icon: ShoppingBag,
      active: route.page === 'cart',
      badge: cartCount,
    },
    {
      key: 'account',
      label: tr('Compte', 'Account'),
      href: '/account',
      icon: User,
      active: route.page === 'account' || route.page === 'orders' || route.page === 'legal',
      badge: 0,
    },
  ];

  return (
    <nav
      aria-label={tr('Navigation principale de l’application', 'App primary navigation')}
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-black/10 pb-safe"
    >
      <div className="max-w-lg mx-auto grid grid-cols-5 items-center h-[58px]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => navigate(tab.href)}
              aria-current={tab.active ? 'page' : undefined}
              className={`relative h-full min-h-[44px] flex flex-col items-center justify-center gap-0.5 transition-colors active:opacity-60 cursor-pointer ${
                tab.active ? 'text-black' : 'text-black/45 hover:text-black/75'
              }`}
            >
              {tab.active && (
                <span
                  aria-hidden="true"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-black"
                />
              )}
              <span className="relative inline-flex items-center justify-center">
                <Icon
                  className="w-[20px] h-[20px]"
                  strokeWidth={tab.active ? 2.1 : 1.6}
                  fill={tab.active && tab.key === 'wishlist' ? '#000000' : 'none'}
                />
                {tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[15px] h-[15px] px-1 rounded-full bg-black text-white text-[9px] font-bold flex items-center justify-center tabular-nums leading-none">
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </span>
                )}
              </span>
              <span
                className={`text-[10px] tracking-[0.02em] leading-none mt-0.5 ${
                  tab.active ? 'font-bold text-black' : 'font-medium'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
