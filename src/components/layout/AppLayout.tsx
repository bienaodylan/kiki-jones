import React from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { AppHeader } from '../app/AppHeader';
import { AppBottomNavigation } from '../app/AppBottomNavigation';
import { MobileMenuDrawer } from './MobileMenuDrawer';
import { CartDrawer } from '../cart/CartDrawer';
import { SearchOverlay } from './SearchOverlay';
import { OfflineIndicator } from '../pwa/OfflineIndicator';
import { isInfoBarActive } from '../../lib/infoBar';
import { PageTransition } from '../../motion/PageTransition';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const {
    route,
    navigate,
    mobileMenuOpen,
    setMobileMenuOpen,
    wishlistCount,
    storefrontConfig,
  } = useStore();
  const { isAdmin } = useAuth();

  const routeKey = JSON.stringify(route);
  const showsBottomNav = route.page !== 'checkout' && route.page !== 'product';
  const infoBarActive = isInfoBarActive(storefrontConfig);
  const topOffsetClass = infoBarActive
    ? 'pt-[calc(80px+env(safe-area-inset-top,0px))]'
    : 'pt-[calc(52px+env(safe-area-inset-top,0px))]';

  return (
    <div className="min-h-dvh w-full max-w-full max-md:overflow-x-clip flex flex-col bg-white text-black font-light">
      <AppHeader />

      {/* Preserved KIKI JONES full category & brand drawer menu */}
      <MobileMenuDrawer
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onNavigate={navigate}
        wishlistCount={wishlistCount}
        isAdmin={isAdmin}
      />

      <CartDrawer />
      <SearchOverlay />

      <PageTransition
        routeKey={routeKey}
        isAppMode
        className={`flex-1 w-full max-w-full min-w-0 max-md:overflow-x-clip ${topOffsetClass} ${
          showsBottomNav ? 'pb-[calc(5.5rem+env(safe-area-inset-bottom))]' : 'pb-safe'
        }`}
      >
        {children}
      </PageTransition>

      <OfflineIndicator />
      <AppBottomNavigation />
    </div>
  );
}
