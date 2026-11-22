import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  Users,
  Tag,
  LayoutTemplate,
  Settings,
  ArrowLeft,
  LogOut,
  Menu,
  X,
  Globe,
  Sparkles,
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  AuditLog,
  Category,
  ImportJob,
  Order,
  Promotion,
  UserProfile,
} from '../../types/commerce';
import { AdminOverview } from './AdminOverview';
import { AdminOrders } from './AdminOrders';
import { AdminProducts } from './AdminProducts';
import { AdminCollections } from './AdminCollections';
import { AdminCustomers } from './AdminCustomers';
import { AdminPromotions } from './AdminPromotions';
import { AdminStorefront } from './AdminStorefront';
import { AdminSettings } from './AdminSettings';
import { AdminAiAssistant } from '../../components/admin/AdminAiAssistant';
import {
  detectMissingMenusFromInventory,
  extractDynamicSubMenus,
} from '../../lib/menuDiscovery';

type AdminTab =
  | 'overview'
  | 'orders'
  | 'products'
  | 'collections'
  | 'customers'
  | 'promotions'
  | 'storefront'
  | 'settings';

export function AdminDashboard() {
  const { user, authReady, isAdmin, loginWithGoogle, logout } = useAuth();
  const {
    allProductsAdmin,
    variants,
    categories,
    storefrontConfig,
    navigate,
    toast,
    initializeCatalog,
  } = useStore();
  const { lang, toggleLang, tr } = useLanguage();

  const [tab, setTab] = useState<AdminTab>('overview');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  // Deep-link states from Dashboard / Customers
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [openCreateProduct, setOpenCreateProduct] = useState(false);
  const [openCreateCollection, setOpenCreateCollection] = useState(false);
  const [menuSuggestionTick, setMenuSuggestionTick] = useState(0);

  const [orders, setOrders] = useState<Order[]>([]);
  const [adminCategories, setAdminCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [importJobs, setImportJobs] = useState<ImportJob[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    if (!authReady || !isAdmin) return;

    const unsubs = [
      onSnapshot(
        collection(db, 'orders'),
        (s) => setOrders(s.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))),
        (e) => handleFirestoreError(e, OperationType.LIST, 'orders')
      ),
      onSnapshot(
        collection(db, 'categories'),
        (s) =>
          setAdminCategories(
            s.docs
              .map((d) => ({ id: d.id, ...(d.data() as any) }))
              .sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99))
          ),
        (e) => handleFirestoreError(e, OperationType.LIST, 'categories')
      ),
      onSnapshot(
        collection(db, 'users'),
        (s) => setUsers(s.docs.map((d) => ({ ...(d.data() as any) }))),
        (e) => handleFirestoreError(e, OperationType.LIST, 'users')
      ),
      onSnapshot(
        collection(db, 'promotions'),
        (s) => setPromotions(s.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))),
        (e) => handleFirestoreError(e, OperationType.LIST, 'promotions')
      ),
      onSnapshot(
        collection(db, 'newsletter_subscribers'),
        (s) => setSubscribers(s.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))),
        (e) => handleFirestoreError(e, OperationType.LIST, 'newsletter_subscribers')
      ),
      onSnapshot(
        collection(db, 'import_jobs'),
        (s) =>
          setImportJobs(
            s.docs
              .map((d) => ({ id: d.id, ...(d.data() as any) }))
              .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0))
          ),
        (e) => handleFirestoreError(e, OperationType.LIST, 'import_jobs')
      ),
      onSnapshot(
        collection(db, 'audit_logs'),
        (s) =>
          setAuditLogs(
            s.docs
              .map((d) => ({ id: d.id, ...(d.data() as any) }))
              .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0))
          ),
        (e) => handleFirestoreError(e, OperationType.LIST, 'audit_logs')
      ),
    ];

    return () => unsubs.forEach((u) => u());
  }, [authReady, isAdmin]);

  if (!authReady) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-black/50">
          {tr('Vérification de la session...', 'Verifying session...')}
        </p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6">
        <div className="max-w-md w-full border border-[#E8E8E8] bg-white p-8 md:p-10 space-y-6">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-black/45">
              KIKI JONES Administration
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-black">
              {tr('Accès protégé', 'Protected Console')}
            </h1>
            <p className="text-xs text-black/60 leading-relaxed">
              {user
                ? tr(
                    `Connecté en tant que ${user.email}, qui ne dispose pas des droits administrateur.`,
                    `Signed in as ${user.email}, which does not have administrator privileges.`
                  )
                : tr(
                    'Connectez-vous avec votre compte Google administrateur KIKI JONES autorisé.',
                    'Sign in with your authorized KIKI JONES administrator Google account.'
                  )}
            </p>
          </div>

          <div className="space-y-2.5">
            {!user ? (
              <button
                type="button"
                onClick={() => loginWithGoogle()}
                className="w-full py-3 bg-black text-white text-xs font-medium hover:bg-black/85 cursor-pointer"
              >
                {tr('Se connecter avec Google', 'Sign in with Google')}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => logout()}
                className="w-full py-3 border border-black text-black text-xs font-medium cursor-pointer"
              >
                {tr('Se déconnecter', 'Sign out')}
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full py-2.5 text-xs text-black/55 hover:text-black cursor-pointer"
            >
              {tr('Retour à la boutique', 'Return to storefront')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const pendingOrdersCount = orders.filter((o) => o.fulfillmentStatus === 'unfulfilled').length;

  let dismissedMenuSlugs: string[] = [];
  try {
    const raw =
      typeof window !== 'undefined'
        ? window.localStorage.getItem('kikijones_dismissed_menu_suggestions_v1')
        : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) dismissedMenuSlugs = parsed.map(String);
    }
  } catch {
    dismissedMenuSlugs = [];
  }
  void menuSuggestionTick;
  const pendingMenuSuggestionsCount = detectMissingMenusFromInventory(
    allProductsAdmin,
    extractDynamicSubMenus(storefrontConfig),
    dismissedMenuSlugs
  ).length;

  const navItems: {
    id: AdminTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
  }[] = [
    { id: 'overview', label: tr('Tableau de bord', 'Dashboard'), icon: LayoutDashboard },
    {
      id: 'orders',
      label: tr('Commandes', 'Orders'),
      icon: ShoppingBag,
      count: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
    },
    { id: 'products', label: tr('Produits', 'Products'), icon: Package },
    { id: 'collections', label: tr('Collections', 'Collections'), icon: Layers },
    { id: 'customers', label: tr('Clients', 'Customers'), icon: Users },
    { id: 'promotions', label: tr('Promotions', 'Promotions'), icon: Tag },
    {
      id: 'storefront',
      label: tr('Boutique', 'Store'),
      icon: LayoutTemplate,
      count: pendingMenuSuggestionsCount > 0 ? pendingMenuSuggestionsCount : undefined,
    },
    { id: 'settings', label: tr('Paramètres', 'Settings'), icon: Settings },
  ];

  const actorEmail = user.email || 'admin';
  const effectiveAdminCategories = adminCategories.length > 0 ? adminCategories : categories;

  const handleNavigateFromOverview = (
    targetTab: string,
    options?: { openCreate?: boolean; orderId?: string }
  ) => {
    setTab(targetTab as AdminTab);
    if (options?.orderId) setPendingOrderId(options.orderId);
    if (options?.openCreate && targetTab === 'products') setOpenCreateProduct(true);
    if (options?.openCreate && targetTab === 'collections') setOpenCreateCollection(true);
  };

  const SidebarList = () => (
    <nav className="space-y-0.5">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = tab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setTab(item.id);
              setMobileNavOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors cursor-pointer ${
              active
                ? 'bg-black text-white font-medium'
                : 'text-black/70 hover:text-black hover:bg-[#F5F5F5]'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </span>
            {item.count !== undefined && (
              <span
                className={`text-[10.5px] tabular-nums px-1.5 py-0.5 ${
                  active ? 'bg-white/20 text-white' : 'bg-[#EFEFEF] text-black/70'
                }`}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );

  const currentTabLabel = navItems.find((n) => n.id === tab)?.label || '';

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-black flex">
      {/* Desktop Sidebar (240px) */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col justify-between bg-white border-r border-[#E8E8E8] p-4 sticky top-0 h-screen">
        <div className="space-y-6">
          <div className="px-2 pt-1">
            <span className="font-bold text-base tracking-[0.22em] uppercase text-black block">
              KIKI JONES
            </span>
            <span className="text-[10.5px] uppercase tracking-[0.14em] text-black/45">
              {tr('Administration', 'Admin')}
            </span>
          </div>
          <SidebarList />
        </div>

        <div className="pt-4 border-t border-[#E8E8E8] space-y-2 text-xs">
          <p className="px-2 truncate text-black/75 font-medium">{actorEmail}</p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full py-2 px-3 bg-[#F5F5F5] hover:bg-black hover:text-white text-xs font-medium inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{tr('Voir la boutique', 'View store')}</span>
          </button>
          <button
            type="button"
            onClick={() => logout()}
            className="w-full py-1.5 px-3 text-xs text-black/50 hover:text-black inline-flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{tr('Déconnexion', 'Sign out')}</span>
          </button>
        </div>
      </aside>

      {/* Main Column */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Clean Top Header */}
        <header className="h-14 bg-white border-b border-[#E8E8E8] px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden p-1.5 -ml-1.5 text-black cursor-pointer"
              aria-label={tr('Ouvrir le menu', 'Open menu')}
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xs font-medium text-black/45">KIKI JONES</span>
            <span className="text-xs text-black/25">/</span>
            <span className="text-xs font-semibold text-black">{currentTabLabel}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <button
              type="button"
              onClick={toggleLang}
              aria-label={tr('Changer la langue', 'Switch language')}
              className="px-2.5 py-1.5 border border-[#E8E8E8] hover:border-black bg-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lang.toUpperCase()}</span>
            </button>

            {/* AI Store Assistant Launcher */}
            <button
              type="button"
              onClick={() => setAiOpen(true)}
              className="px-3 py-1.5 bg-black text-white text-xs font-medium hover:bg-black/85 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tr('Assistant IA', 'AI Assistant')}</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="hidden sm:inline-flex px-3 py-1.5 border border-[#E8E8E8] hover:border-black bg-white text-xs font-medium cursor-pointer"
            >
              {tr('Boutique', 'Storefront')}
            </button>
          </div>
        </header>

        {/* Active Section Body */}
        <main className="flex-1 p-5 md:p-8 max-w-[1360px] w-full mx-auto">
          {tab === 'overview' && (
            <AdminOverview
              products={allProductsAdmin}
              variants={variants}
              orders={orders}
              users={users}
              onInitializeCatalog={initializeCatalog}
              onNavigateTab={handleNavigateFromOverview}
              onOpenAiAssistant={() => setAiOpen(true)}
            />
          )}

          {tab === 'orders' && (
            <AdminOrders
              orders={orders}
              actorEmail={actorEmail}
              initialOrderId={pendingOrderId}
              onClearInitialOrder={() => setPendingOrderId(null)}
              onToast={toast}
            />
          )}

          {tab === 'products' && (
            <AdminProducts
              products={allProductsAdmin}
              variants={variants}
              categories={effectiveAdminCategories}
              importJobs={importJobs}
              actorEmail={actorEmail}
              initialCreate={openCreateProduct}
              onClearInitialCreate={() => setOpenCreateProduct(false)}
              onToast={toast}
            />
          )}

          {tab === 'collections' && (
            <AdminCollections
              categories={effectiveAdminCategories}
              products={allProductsAdmin}
              actorEmail={actorEmail}
              initialCreate={openCreateCollection}
              onClearInitialCreate={() => setOpenCreateCollection(false)}
              onToast={toast}
            />
          )}

          {tab === 'customers' && (
            <AdminCustomers
              users={users}
              orders={orders}
              onOpenOrder={(orderId) => {
                setPendingOrderId(orderId);
                setTab('orders');
              }}
            />
          )}

          {tab === 'promotions' && (
            <AdminPromotions
              promotions={promotions}
              subscribers={subscribers}
              actorEmail={actorEmail}
              onToast={toast}
            />
          )}

          {tab === 'storefront' && (
            <AdminStorefront
              config={storefrontConfig}
              categories={effectiveAdminCategories}
              products={allProductsAdmin}
              actorEmail={actorEmail}
              onOpenAiAssistant={() => setAiOpen(true)}
              onOpenLiveStore={() => navigate('/')}
              onSuggestionsChanged={() => setMenuSuggestionTick((t) => t + 1)}
              onToast={toast}
            />
          )}

          {tab === 'settings' && (
            <AdminSettings
              config={storefrontConfig}
              auditLogs={auditLogs}
              actorEmail={actorEmail}
              onToast={toast}
            />
          )}
        </main>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setMobileNavOpen(false)} />
          <div className="relative w-64 bg-white h-full p-4 flex flex-col justify-between overflow-y-auto z-10 border-r border-[#E8E8E8]">
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <span className="font-bold text-base tracking-[0.22em] uppercase text-black">
                  KIKI JONES
                </span>
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  className="p-1.5 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <SidebarList />
            </div>

            <div className="pt-4 border-t border-[#E8E8E8] space-y-2">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full py-2 bg-[#F5F5F5] text-xs font-medium cursor-pointer"
              >
                {tr('Voir la boutique', 'View store')}
              </button>
              <button
                type="button"
                onClick={() => logout()}
                className="w-full py-1.5 text-xs text-black/55 cursor-pointer"
              >
                {tr('Déconnexion', 'Sign out')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Integrated AI Store Assistant Drawer */}
      <AdminAiAssistant
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        config={storefrontConfig}
        categories={effectiveAdminCategories}
        products={allProductsAdmin}
        promotions={promotions}
        actorEmail={actorEmail}
        onToast={toast}
      />
    </div>
  );
}
