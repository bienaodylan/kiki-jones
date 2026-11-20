import React from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { SearchOverlay } from './components/layout/SearchOverlay';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { CollectionsPage } from './pages/CollectionsPage';
import { BrandsPage } from './pages/BrandsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { SearchPage } from './pages/SearchPage';
import { WishlistPage } from './pages/WishlistPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { AccountPage } from './pages/AccountPage';
import { LegalPage } from './pages/LegalPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';

function AppRouter() {
  const { route } = useStore();

  if (route.page === 'admin') {
    return <AdminDashboard />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-black font-light">
      <Navbar />
      <CartDrawer />
      <SearchOverlay />
      <div className="flex-1">
        {route.page === 'home' && <HomePage />}
        {route.page === 'shop' && <CatalogPage mode="all" />}
        {route.page === 'new-in' && <CatalogPage mode="new-in" />}
        {route.page === 'sale' && <CatalogPage mode="sale" />}
        {route.page === 'brands' && <BrandsPage />}
        {route.page === 'brand' && <CatalogPage mode="brand" brandSlug={route.slug} />}
        {route.page === 'categories' && <CategoriesPage />}
        {route.page === 'audience' && (
          <CatalogPage mode="audience" audience={route.audience} subSlug={route.subSlug} />
        )}
        {route.page === 'accessories' && (
          <CatalogPage mode="accessories" audience="accessories" subSlug={route.subSlug} />
        )}
        {route.page === 'collections' && <CollectionsPage />}
        {route.page === 'collection' && (
          <CatalogPage mode="collection" collectionSlug={route.slug} />
        )}
        {route.page === 'category' && (
          <CatalogPage mode="category" categorySlug={route.slug} />
        )}
        {route.page === 'product' && <ProductDetailPage slug={route.slug} />}
        {route.page === 'search' && <SearchPage initialQuery={route.query} />}
        {route.page === 'wishlist' && <WishlistPage />}
        {route.page === 'cart' && <CartPage />}
        {route.page === 'checkout' && <CheckoutPage />}
        {route.page === 'account' && <AccountPage defaultTab="profile" />}
        {route.page === 'orders' && <AccountPage defaultTab="orders" />}
        {route.page === 'legal' && <LegalPage docType={route.docType} />}
      </div>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <StoreProvider>
            <AppRouter />
          </StoreProvider>
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
