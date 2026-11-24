import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { CartDrawer } from '../cart/CartDrawer';
import { SearchOverlay } from './SearchOverlay';
import { OfflineIndicator } from '../pwa/OfflineIndicator';
import { useStore } from '../../context/StoreContext';
import { isInfoBarActive } from '../../lib/infoBar';
import { PageTransition } from '../../motion/PageTransition';

interface WebLayoutProps {
  children: React.ReactNode;
}

export function WebLayout({ children }: WebLayoutProps) {
  const { storefrontConfig, route } = useStore();
  const hasInfoBarOffset = isInfoBarActive(storefrontConfig) && route.page !== 'home';
  const routeKey = JSON.stringify(route);

  return (
    <div className="min-h-screen w-full max-w-full max-md:overflow-x-clip flex flex-col bg-white text-black font-light">
      <Navbar />
      <CartDrawer />
      <SearchOverlay />
      <PageTransition
        routeKey={routeKey}
        className={`flex-1 w-full max-w-full min-w-0 max-md:overflow-x-clip ${
          hasInfoBarOffset ? 'pt-[28px]' : ''
        }`}
      >
        {children}
      </PageTransition>
      <Footer />
      <OfflineIndicator />
    </div>
  );
}
