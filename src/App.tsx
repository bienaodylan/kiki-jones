import React, { Suspense, lazy } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ExperienceProvider, useExperienceMode } from './context/ExperienceContext';
import { MotionProvider } from './motion/MotionProvider';
import { StoreProvider, useStore } from './context/StoreContext';
import { WebLayout } from './components/layout/WebLayout';
import { AppLayout } from './components/layout/AppLayout';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { CollectionsPage } from './pages/CollectionsPage';
import { BrandsPage } from './pages/BrandsPage';

const DoupiShowroomPage = lazy(() =>
  import('./pages/DoupiShowroomPage').then((m) => ({ default: m.DoupiShowroomPage }))
);
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
  const { isAppMode } = useExperienceMode();

  if (route.page === 'admin') {
    return <AdminDashboard />;
  }

  const pageContent = (
    <>
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
      {route.page === 'collection' &&
        (route.slug === 'kiki-jones-doupi' ? (
          <Suspense
            fallback={
              <main className="w-full flex-1 min-h-[75dvh] bg-[#F4F3EF] flex items-center justify-center">
                <p className="text-[11px] font-light uppercase tracking-[0.26em] text-black/50">
                  NEW COLLECTION | KIKI JONES DOUPI
                </p>
              </main>
            }
          >
            <DoupiShowroomPage />
          </Suspense>
        ) : (
          <CatalogPage mode="collection" collectionSlug={route.slug} />
        ))}
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
    </>
  );

  return isAppMode ? <AppLayout>{pageContent}</AppLayout> : <WebLayout>{pageContent}</WebLayout>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <ExperienceProvider>
          <MotionProvider>
            <AuthProvider>
              <StoreProvider>
                <AppRouter />
              </StoreProvider>
            </AuthProvider>
          </MotionProvider>
        </ExperienceProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

