import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';
import { db, testFirestoreConnection, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  AudienceSlug,
  Category,
  Product,
  ProductVariant,
  StorefrontConfig,
  CartItem,
} from '../types/commerce';
import {
  ALL_SEED_PRODUCTS,
  DEFAULT_STOREFRONT_CONFIG,
  INITIAL_CATEGORIES,
  LEGACY_PLACEHOLDER_PRODUCT_IDS,
  OBSOLETE_CATEGORY_IDS,
  enrichProductMetadata,
} from '../lib/catalogDefaults';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import {
  seedInitialCatalogClient,
  ensureDefaultCategories,
  ensureFullSampleCatalog,
} from '../lib/firestoreService';
import { sanitizeId } from '../lib/format';

export type RouteView =
  | { page: 'home' }
  | { page: 'shop' }
  | { page: 'new-in' }
  | { page: 'sale' }
  | { page: 'brands' }
  | { page: 'brand'; slug: string }
  | { page: 'categories' }
  | { page: 'audience'; audience: Exclude<AudienceSlug, 'unisex'>; subSlug?: string }
  | { page: 'accessories'; subSlug?: string }
  | { page: 'collections' }
  | { page: 'collection'; slug: string }
  | { page: 'category'; slug: string }
  | { page: 'product'; slug: string }
  | { page: 'search'; query: string }
  | { page: 'wishlist' }
  | { page: 'cart' }
  | { page: 'checkout' }
  | { page: 'account' }
  | { page: 'orders' }
  | { page: 'legal'; docType: 'shipping' | 'returns' | 'privacy' | 'terms' }
  | { page: 'admin'; tab?: string };

function parseHashOrPath(): RouteView {
  const rawPathname = window.location.pathname.replace(/\/+$/, '') || '/';
  const searchParams = new URLSearchParams(window.location.search);

  if (rawPathname === '/shop') return { page: 'shop' };
  if (rawPathname === '/new-in' || rawPathname === '/new-drop') return { page: 'new-in' };
  if (rawPathname === '/sale') return { page: 'sale' };
  if (rawPathname === '/curve') return { page: 'brand', slug: 'kiki-curve' };
  if (rawPathname === '/sport') return { page: 'brand', slug: 'kiki-sport' };
  if (rawPathname === '/kids') return { page: 'brand', slug: 'kiki-kids' };
  if (rawPathname === '/formal') return { page: 'collection', slug: 'formal' };
  if (rawPathname === '/brands') return { page: 'brands' };
  if (rawPathname.startsWith('/brand/')) {
    return { page: 'brand', slug: rawPathname.replace('/brand/', '') };
  }
  if (rawPathname === '/categories') return { page: 'categories' };
  if (rawPathname === '/collections') return { page: 'collections' };
  if (rawPathname === '/wishlist') return { page: 'wishlist' };
  if (rawPathname === '/search') {
    return { page: 'search', query: searchParams.get('q') || '' };
  }

  for (const aud of ['women', 'men', 'girls', 'boys'] as const) {
    if (rawPathname === `/${aud}`) {
      return { page: 'audience', audience: aud };
    }
    if (rawPathname.startsWith(`/${aud}/`)) {
      return { page: 'audience', audience: aud, subSlug: rawPathname.slice(aud.length + 2) };
    }
  }

  if (rawPathname === '/accessories') {
    return { page: 'accessories' };
  }
  if (rawPathname.startsWith('/accessories/')) {
    return { page: 'accessories', subSlug: rawPathname.replace('/accessories/', '') };
  }

  if (rawPathname.startsWith('/category/')) {
    const slug = rawPathname.replace('/category/', '');
    if (slug === 'women' || slug === 'men' || slug === 'girls' || slug === 'boys') {
      return { page: 'audience', audience: slug };
    }
    if (slug === 'accessories') return { page: 'accessories' };
    return { page: 'category', slug };
  }

  if (rawPathname.startsWith('/collection/')) {
    return { page: 'collection', slug: rawPathname.replace('/collection/', '') };
  }
  if (rawPathname.startsWith('/product/')) {
    return { page: 'product', slug: rawPathname.replace('/product/', '') };
  }
  if (rawPathname === '/cart') return { page: 'cart' };
  if (rawPathname === '/checkout') return { page: 'checkout' };
  if (rawPathname === '/account') return { page: 'account' };
  if (rawPathname === '/orders') return { page: 'orders' };
  if (rawPathname.startsWith('/legal/')) {
    const t = rawPathname.replace('/legal/', '') as any;
    if (['shipping', 'returns', 'privacy', 'terms'].includes(t)) {
      return { page: 'legal', docType: t };
    }
  }
  if (rawPathname.startsWith('/admin')) {
    const tab = rawPathname.replace('/admin', '').replace(/^\//, '') || 'overview';
    return { page: 'admin', tab };
  }
  return { page: 'home' };
}

interface ToastMessage {
  id: number;
  text: string;
  tone: 'default' | 'error' | 'success';
}

interface StoreContextValue {
  route: RouteView;
  navigate: (path: string) => void;
  categories: Category[];
  products: Product[];
  allProductsAdmin: Product[];
  variants: ProductVariant[];
  storefrontConfig: StorefrontConfig;
  loadingCatalog: boolean;
  catalogEmpty: boolean;
  cart: CartItem[];
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (item: CartItem, openDrawer?: boolean) => void;
  updateCartQty: (variantId: string, qty: number) => void;
  removeFromCart: (variantId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotalXof: number;
  wishlistIds: string[];
  wishlistCount: number;
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (productId: string, productName?: string) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  recentSearches: string[];
  addRecentSearch: (term: string) => void;
  removeRecentSearch: (term: string) => void;
  clearRecentSearches: () => void;
  getProductVariants: (productId: string) => ProductVariant[];
  toast: (text: string, tone?: 'default' | 'error' | 'success') => void;
  initializeCatalog: () => Promise<boolean>;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);
const CART_STORAGE_KEY = 'kikijones_bag_v1';
const WISHLIST_STORAGE_KEY = 'kikijones_wishlist_v1';
const RECENT_SEARCH_KEY = 'kikijones_recent_searches_v1';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, authReady } = useAuth();
  const { tr } = useLanguage();
  const [route, setRoute] = useState<RouteView>(() => parseHashOrPath());
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [allProductsAdmin, setAllProductsAdmin] = useState<Product[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [storefrontConfig, setStorefrontConfig] = useState<StorefrontConfig>(
    DEFAULT_STOREFRONT_CONFIG
  );
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const syncedSampleRef = useRef(false);

  const fallbackCategories: Category[] = useMemo(
    () => INITIAL_CATEGORIES.map((c) => ({ ...c })),
    []
  );

  const { fallbackProducts, fallbackVariants } = useMemo(() => {
    const prods: Product[] = [];
    const vars: ProductVariant[] = [];
    for (const p of ALL_SEED_PRODUCTS) {
      prods.push({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        categoryId: p.categoryId,
        categoryName: p.categoryName,
        sku: p.sku,
        externalShopifyHandle: p.slug,
        images: p.images,
        runwayModelImageUrl: p.runwayModelImageUrl ?? null,
        colors: p.colors.map((c) => c.name),
        sizes: p.sizes,
        regularPriceXof: p.regularPriceXof,
        promoPriceXof: p.promoPriceXof,
        lowStockThreshold: p.lowStockThreshold,
        status: 'published',
        isNewDrop: p.isNewDrop,
        newDropOrder: p.newDropOrder,
        isFeatured: p.isFeatured,
        featuredOrder: p.featuredOrder,
        isPreorder: Boolean(p.isPreorder),
        preorderEstimateDate: p.preorderEstimateDate ?? null,
        audience: p.audience,
        subCategory: p.subCategory,
        brandSlug: p.brandSlug,
        brandName: p.brandName,
        collectionSlugs: p.collectionSlugs,
        styleTags: p.styleTags,
        isBestSeller: p.isBestSeller,
        isTrending: p.isTrending,
        materialDetails: p.materialDetails,
      });
      for (const color of p.colors) {
        for (const size of p.sizes) {
          const key = `${color.name}-${size}`;
          const qty = p.stockMatrix[key] ?? 8;
          const variantId = sanitizeId(
            `var_${p.sku}_${color.name.replace(/\s+/g, '')}_${size.replace(/\s+/g, '')}`
          );
          const sku = `${p.sku}-${color.name.slice(0, 3).toUpperCase()}-${size
            .replace(/\s+/g, '')
            .toUpperCase()}`;
          vars.push({
            id: variantId,
            productId: p.id,
            sku,
            color: color.name,
            colorHex: color.hex,
            size,
            priceXof: p.promoPriceXof ?? p.regularPriceXof,
            compareAtPriceXof: p.promoPriceXof ? p.regularPriceXof : null,
            stockQty: qty,
            reservedQty: 0,
            lowStockThreshold: p.lowStockThreshold,
            weightGrams: 300,
            isActive: true,
          });
        }
      }
    }
    return { fallbackProducts: prods, fallbackVariants: vars };
  }, []);

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(RECENT_SEARCH_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // ignore storage errors
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistIds));
    } catch {
      // ignore storage errors
    }
  }, [wishlistIds]);

  useEffect(() => {
    try {
      localStorage.setItem(RECENT_SEARCH_KEY, JSON.stringify(recentSearches));
    } catch {
      // ignore storage errors
    }
  }, [recentSearches]);

  useEffect(() => {
    const onPop = () => {
      setRoute(parseHashOrPath());
      window.scrollTo({ top: 0, behavior: 'auto' });
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((path: string) => {
    const currentFull = `${window.location.pathname}${window.location.search}`;
    if (currentFull !== path) {
      window.history.pushState({}, '', path);
    }
    setRoute(parseHashOrPath());
    setSearchOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const toast = useCallback((text: string, tone: 'default' | 'error' | 'success' = 'default') => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, text, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3600);
  }, []);

  // Test Firestore connection on boot
  useEffect(() => {
    testFirestoreConnection();
  }, []);

  // Subscribe to public storefront catalog
  useEffect(() => {
    const unsubConfig = onSnapshot(
      doc(db, 'storefront_config', 'main'),
      (snap) => {
        if (snap.exists()) {
          const raw = snap.data() as StorefrontConfig;
          const isLegacyPreRebrand =
            !raw.cmsVersion ||
            raw.cmsVersion < 9 ||
            (typeof raw.brandIntroTitle === 'string' && raw.brandIntroTitle.toLowerCase().includes('mireza')) ||
            (typeof raw.heroHeadline === 'string' && raw.heroHeadline.toLowerCase().includes('caribbean'));

          if (isLegacyPreRebrand) {
            setStorefrontConfig({
              ...DEFAULT_STOREFRONT_CONFIG,
              standardShippingXof: raw.standardShippingXof ?? DEFAULT_STOREFRONT_CONFIG.standardShippingXof,
              expressShippingXof: raw.expressShippingXof ?? DEFAULT_STOREFRONT_CONFIG.expressShippingXof,
              freeShippingThresholdXof:
                raw.freeShippingThresholdXof ?? DEFAULT_STOREFRONT_CONFIG.freeShippingThresholdXof,
            });
          } else {
            setStorefrontConfig({
              ...DEFAULT_STOREFRONT_CONFIG,
              ...raw,
              sectionOrder:
                Array.isArray(raw.sectionOrder) && raw.sectionOrder.length > 0
                  ? raw.sectionOrder
                  : DEFAULT_STOREFRONT_CONFIG.sectionOrder,
              collectionBanners:
                Array.isArray(raw.collectionBanners) && raw.collectionBanners.length > 0
                  ? raw.collectionBanners
                  : DEFAULT_STOREFRONT_CONFIG.collectionBanners,
              customSections: Array.isArray(raw.customSections) ? raw.customSections : [],
              galleryItems:
                Array.isArray(raw.galleryItems) && raw.galleryItems.length > 0
                  ? raw.galleryItems
                  : DEFAULT_STOREFRONT_CONFIG.galleryItems,
            });
          }
        }
      },
      (err) => {
        console.warn('Storefront config listener warning:', err);
      }
    );

    const unsubCategories = onSnapshot(
      query(collection(db, 'categories'), where('isActive', '==', true)),
      (snap) => {
        const mapped = snap.docs
          .filter((d) => !OBSOLETE_CATEGORY_IDS.includes(d.id))
          .map((d) => {
            const data = d.data() as Omit<Category, 'id'>;
            const defaultCat = INITIAL_CATEGORIES.find((c) => c.id === d.id);
            return {
              id: d.id,
              ...data,
              name: defaultCat ? defaultCat.name : data.name,
              slug: defaultCat ? defaultCat.slug : data.slug,
              imageUrl: defaultCat ? defaultCat.imageUrl : data.imageUrl,
            };
          });

        const existingIds = new Set(mapped.map((c) => c.id));
        const merged = [
          ...mapped,
          ...INITIAL_CATEGORIES.filter((c) => !existingIds.has(c.id)).map((c) => ({ ...c })),
        ].sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99));

        setCategories(merged);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'categories')
    );

    const unsubProducts = onSnapshot(
      query(collection(db, 'products'), where('status', '==', 'published')),
      (snap) => {
        const list = snap.docs
          .filter((d) => !LEGACY_PLACEHOLDER_PRODUCT_IDS.includes(d.id))
          .map((d) => {
            const raw = { id: d.id, ...(d.data() as Omit<Product, 'id'>) };
            return enrichProductMetadata(raw);
          });
        setProducts(list);
        setLoadingCatalog(false);
      },
      (err) => {
        setLoadingCatalog(false);
        handleFirestoreError(err, OperationType.LIST, 'products');
      }
    );

    const unsubVariants = onSnapshot(
      query(collection(db, 'variants'), where('isActive', '==', true)),
      (snap) => {
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<ProductVariant, 'id'>),
        }));
        setVariants(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'variants')
    );

    return () => {
      unsubConfig();
      unsubCategories();
      unsubProducts();
      unsubVariants();
    };
  }, []);

  // Admin full-catalog listener
  useEffect(() => {
    if (!authReady || !isAdmin) {
      setAllProductsAdmin([]);
      return;
    }
    const unsubAll = onSnapshot(
      collection(db, 'products'),
      (snap) => {
        const list = snap.docs
          .filter((d) => !LEGACY_PLACEHOLDER_PRODUCT_IDS.includes(d.id))
          .map((d) => enrichProductMetadata({ id: d.id, ...(d.data() as Omit<Product, 'id'>) }));
        setAllProductsAdmin(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'products')
    );
    return () => unsubAll();
  }, [authReady, isAdmin]);

  const initializeCatalog = useCallback(async () => {
    if (!user?.email || !isAdmin) {
      toast(
        tr(
          'Authentification administrateur requise pour initialiser le catalogue.',
          'Administrator authentication required to initialize catalog.'
        ),
        'error'
      );
      return false;
    }
    const res = await seedInitialCatalogClient(user.email);
    if (res.seeded) {
      toast(tr('Catalogue KIKI JONES initialisé.', 'KIKI JONES catalog initialized.'), 'success');
    } else {
      toast(tr('Le catalogue est déjà rempli.', 'Catalog is already populated.'), 'default');
    }
    return res.seeded;
  }, [user, isAdmin, toast, tr]);

  // Auto-seed or expand KIKI JONES catalog once when bootstrapped admin loads
  useEffect(() => {
    if (!authReady || !isAdmin || loadingCatalog || !user?.email || syncedSampleRef.current) return;
    syncedSampleRef.current = true;
    const adminEmail = user.email;
    if (products.length === 0 && categories.length === 0) {
      seedInitialCatalogClient(adminEmail)
        .then((res) => {
          if (res.seeded) {
            toast(
              tr('Catalogue KIKI JONES initialisé dans Firestore.', 'KIKI JONES catalog initialized in Firestore.'),
              'success'
            );
          }
        })
        .catch(() => {});
    } else {
      ensureFullSampleCatalog(adminEmail)
        .then((res) => {
          if (res.addedProducts > 0) {
            toast(
              tr(
                `${res.addedProducts} pièces KIKI JONES synchronisées.`,
                `Synced ${res.addedProducts} KIKI JONES pieces across all audiences.`
              ),
              'success'
            );
          }
        })
        .catch(() => {
          ensureDefaultCategories(adminEmail).catch(() => {});
        });
    }
  }, [authReady, isAdmin, loadingCatalog, products.length, categories.length, user?.email, toast, tr]);

  const effectiveCategories = useMemo(() => {
    if (!loadingCatalog && categories.length === 0) return fallbackCategories;
    return categories;
  }, [loadingCatalog, categories, fallbackCategories]);

  const effectiveProducts = useMemo(() => {
    if (!loadingCatalog && products.length === 0) return fallbackProducts;
    if (!loadingCatalog && products.length > 0) {
      const existingIds = new Set(products.map((p) => p.id));
      const missingSeeds = fallbackProducts.filter((fp) => !existingIds.has(fp.id));
      if (missingSeeds.length > 0) return [...products, ...missingSeeds];
    }
    return products;
  }, [loadingCatalog, products, fallbackProducts]);

  const effectiveVariants = useMemo(() => {
    if (!loadingCatalog && variants.length === 0 && products.length === 0) return fallbackVariants;
    if (!loadingCatalog) {
      const existingProdIds = new Set(variants.map((v) => v.productId));
      const missingVars = fallbackVariants.filter((fv) => !existingProdIds.has(fv.productId));
      if (missingVars.length > 0) return [...variants, ...missingVars];
    }
    return variants;
  }, [loadingCatalog, variants, products, fallbackVariants]);

  const getProductVariants = useCallback(
    (productId: string) => effectiveVariants.filter((v) => v.productId === productId),
    [effectiveVariants]
  );

  const addToCart = useCallback(
    (item: CartItem, openDrawer = true) => {
      const targetVariant = effectiveVariants.find((v) => v.id === item.variantId);
      const maxAvailable = targetVariant
        ? Math.max(0, targetVariant.stockQty - targetVariant.reservedQty)
        : 99;

      setCart((prev) => {
        const existing = prev.find((c) => c.variantId === item.variantId);
        if (existing) {
          const nextQty = item.isPreorder
            ? existing.quantity + item.quantity
            : Math.min(maxAvailable, existing.quantity + item.quantity);
          return prev.map((c) =>
            c.variantId === item.variantId ? { ...c, quantity: Math.max(1, nextQty) } : c
          );
        }
        return [...prev, item];
      });
      if (openDrawer) setCartOpen(true);
      toast(
        tr(
          `${item.name} (${item.color} / ${item.size}) ajouté au panier.`,
          `${item.name} (${item.color} / ${item.size}) added to bag.`
        ),
        'success'
      );
    },
    [effectiveVariants, toast, tr]
  );

  const updateCartQty = useCallback(
    (variantId: string, qty: number) => {
      if (qty <= 0) {
        setCart((prev) => prev.filter((c) => c.variantId !== variantId));
        return;
      }
      const targetVariant = effectiveVariants.find((v) => v.id === variantId);
      const maxAvailable = targetVariant
        ? Math.max(1, targetVariant.stockQty - targetVariant.reservedQty)
        : qty;

      setCart((prev) =>
        prev.map((c) =>
          c.variantId === variantId
            ? { ...c, quantity: c.isPreorder ? qty : Math.min(maxAvailable, qty) }
            : c
        )
      );
    },
    [effectiveVariants]
  );

  const removeFromCart = useCallback((variantId: string) => {
    setCart((prev) => prev.filter((c) => c.variantId !== variantId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const isWishlisted = useCallback(
    (productId: string) => wishlistIds.includes(productId),
    [wishlistIds]
  );

  const toggleWishlist = useCallback(
    (productId: string, productName?: string) => {
      setWishlistIds((prev) => {
        if (prev.includes(productId)) {
          if (productName) {
            toast(
              tr(`${productName} retiré des favoris.`, `${productName} removed from wishlist.`),
              'default'
            );
          }
          return prev.filter((id) => id !== productId);
        }
        if (productName) {
          toast(
            tr(`${productName} ajouté aux favoris.`, `${productName} saved to wishlist.`),
            'success'
          );
        }
        return [productId, ...prev];
      });
    },
    [toast, tr]
  );

  const addRecentSearch = useCallback((term: string) => {
    const clean = term.trim();
    if (!clean) return;
    setRecentSearches((prev) => [clean, ...prev.filter((x) => x.toLowerCase() !== clean.toLowerCase())].slice(0, 6));
  }, []);

  const removeRecentSearch = useCallback((term: string) => {
    setRecentSearches((prev) => prev.filter((x) => x !== term));
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
  }, []);

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const cartSubtotalXof = useMemo(
    () => cart.reduce((sum, item) => sum + item.unitPriceXof * item.quantity, 0),
    [cart]
  );
  const wishlistCount = wishlistIds.length;
  const catalogEmpty = !loadingCatalog && products.length === 0 && categories.length === 0;

  return (
    <StoreContext.Provider
      value={{
        route,
        navigate,
        categories: effectiveCategories,
        products: effectiveProducts,
        allProductsAdmin,
        variants: effectiveVariants,
        storefrontConfig,
        loadingCatalog,
        catalogEmpty,
        cart,
        cartOpen,
        setCartOpen,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        cartCount,
        cartSubtotalXof,
        wishlistIds,
        wishlistCount,
        isWishlisted,
        toggleWishlist,
        searchOpen,
        setSearchOpen,
        recentSearches,
        addRecentSearch,
        removeRecentSearch,
        clearRecentSearches,
        getProductVariants,
        toast,
        initializeCatalog,
      }}
    >
      {children}
      {toasts.length > 0 && (
        <div
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none"
        >
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`pointer-events-auto px-4 py-3 text-xs tracking-wide border transition-all ${
                t.tone === 'error'
                  ? 'bg-black text-white border-black font-bold'
                  : 'bg-white text-black border-black font-light'
              }`}
            >
              {t.text}
            </div>
          ))}
        </div>
      )}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
