import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { AppHeader } from '../app/AppHeader';
import { AppBottomNavigation } from '../app/AppBottomNavigation';
import { MobileMenuDrawer } from './MobileMenuDrawer';
import { CartDrawer } from '../cart/CartDrawer';
import { SearchOverlay } from './SearchOverlay';
import { OfflineIndicator } from '../pwa/OfflineIndicator';

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
  } = useStore();
  const { isAdmin } = useAuth();
  const shouldReduceMotion = useReducedMotion();

  const routeKey = JSON.stringify(route);
  const showsBottomNav = route.page !== 'checkout' && route.page !== 'product';

  return (
    <div className="min-h-dvh flex flex-col bg-white text-black font-light">
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

      <motion.div
        key={routeKey}
        initial={shouldReduceMotion ? false : { opacity: 0.92, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.16, ease: 'easeOut' }}
        className={`flex-1 w-full ${
          showsBottomNav ? 'pb-[calc(5.5rem+env(safe-area-inset-bottom))]' : 'pb-safe'
        }`}
      >
        {children}
      </motion.div>

      <OfflineIndicator />
      <AppBottomNavigation />
    </div>
  );
}
