import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { CartDrawer } from '../cart/CartDrawer';
import { SearchOverlay } from './SearchOverlay';
import { OfflineIndicator } from '../pwa/OfflineIndicator';

interface WebLayoutProps {
  children: React.ReactNode;
}

export function WebLayout({ children }: WebLayoutProps) {
  return (
    <div className="min-h-screen w-full max-w-full overflow-x-clip flex flex-col bg-white text-black font-light">
      <Navbar />
      <CartDrawer />
      <SearchOverlay />
      <div className="flex-1 w-full max-w-full min-w-0 overflow-x-clip">{children}</div>
      <Footer />
      <OfflineIndicator />
    </div>
  );
}
