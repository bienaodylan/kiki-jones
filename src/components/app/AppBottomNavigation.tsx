import React from 'react';
import { Home, Search, Heart, ShoppingBag, User } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useLanguage } from '../../context/LanguageContext';

export function AppBottomNavigation() {
  const { route, navigate, cartCount, wishlistCount } = useStore();
  const { tr } = useLanguage();

  // Keep dedicated checkout, product detail, and admin screens clear of bottom chrome
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
      key: 'search',
      label: tr('Rechercher', 'Search'),
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
      key: 'bag',
      label: tr('Panier', 'Shopping Bag'),
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
    <div
      className="fixed inset-x-0 z-40 pointer-events-none flex justify-center px-4"
      style={{ bottom: 'max(14px, env(safe-area-inset-bottom))' }}
    >
      <nav
        aria-label={tr('Navigation principale de l’application', 'App primary navigation')}
        className="pointer-events-auto w-full max-w-[324px] h-[56px] rounded-full bg-white/70 backdrop-blur-2xl backdrop-saturate-[1.9] border border-black/[0.08] ring-1 ring-inset ring-white/75 shadow-[0_14px_38px_-10px_rgba(0,0,0,0.18),0_2px_10px_rgba(0,0,0,0.06)] grid grid-cols-5 items-center px-1.5"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => navigate(tab.href)}
              aria-label={tab.label}
              aria-current={tab.active ? 'page' : undefined}
              className="relative h-[44px] w-full flex items-center justify-center cursor-pointer active:opacity-70 transition-opacity"
            >
              <span
                className={`relative w-[42px] h-[42px] rounded-full inline-flex items-center justify-center transition-colors duration-200 ${
                  tab.active
                    ? 'bg-black text-white'
                    : 'text-black/55 hover:text-black'
                }`}
              >
                <Icon
                  className="w-[19px] h-[19px]"
                  strokeWidth={tab.active ? 1.95 : 1.65}
                  fill={tab.active && tab.key === 'wishlist' ? 'currentColor' : 'none'}
                />
                {tab.badge > 0 && (
                  <span
                    className={`absolute top-1.5 right-1 min-w-[14px] h-[14px] px-1 rounded-full text-[8.5px] font-bold flex items-center justify-center tabular-nums leading-none ${
                      tab.active
                        ? 'bg-white text-black'
                        : 'bg-black text-white'
                    }`}
                  >
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
