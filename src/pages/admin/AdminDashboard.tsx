import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  Users,
  CreditCard,
  Megaphone,
  LayoutTemplate,
  BarChart3,
  Settings,
  FileSpreadsheet,
  ArrowLeft,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import {
  AuditLog,
  ImportJob,
  InventoryMovement,
  InventoryReservation,
  Order,
  PaymentRecord,
  Promotion,
  UserProfile,
} from '../../types/commerce';
import { AdminOverview } from './AdminOverview';
import { AdminProducts } from './AdminProducts';
import { AdminImportCenter } from './AdminImportCenter';
import { AdminInventory } from './AdminInventory';
import { AdminOrders } from './AdminOrders';
import { AdminCustomers } from './AdminCustomers';
import { AdminPayments } from './AdminPayments';
import { AdminMarketing } from './AdminMarketing';
import { AdminStorefront } from './AdminStorefront';
import { AdminAnalytics, AdminSettings } from './AdminAnalyticsSettings';

type AdminTab =
  | 'overview'
  | 'products'
  | 'import'
  | 'inventory'
  | 'orders'
  | 'customers'
  | 'payments'
  | 'marketing'
  | 'storefront'
  | 'analytics'
  | 'settings';

export function AdminDashboard() {
  const { user, authReady, isAdmin, adminVerifiedServer, loginWithGoogle, logout } = useAuth();
  const {
    allProductsAdmin,
    variants,
    categories,
    storefrontConfig,
    navigate,
    toast,
    initializeCatalog,
  } = useStore();

  const [tab, setTab] = useState<AdminTab>('overview');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [reservations, setReservations] = useState<InventoryReservation[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
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
        collection(db, 'inventory_movements'),
        (s) =>
          setMovements(
            s.docs
              .map((d) => ({ id: d.id, ...(d.data() as any) }))
              .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0))
          ),
        (e) => handleFirestoreError(e, OperationType.LIST, 'inventory_movements')
      ),
      onSnapshot(
        collection(db, 'inventory_reservations'),
        (s) => setReservations(s.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))),
        (e) => handleFirestoreError(e, OperationType.LIST, 'inventory_reservations')
      ),
      onSnapshot(
        collection(db, 'users'),
        (s) => setUsers(s.docs.map((d) => ({ ...(d.data() as any) }))),
        (e) => handleFirestoreError(e, OperationType.LIST, 'users')
      ),
      onSnapshot(
        collection(db, 'payments'),
        (s) => setPayments(s.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))),
        (e) => handleFirestoreError(e, OperationType.LIST, 'payments')
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
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/60">Verifying Session...</p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-md w-full border border-black/20 bg-white p-8 md:p-10 space-y-6">
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-black/60">
              KIKI JONES Administration
            </p>
            <h1 className="font-editorial text-3xl text-black">Protected Console</h1>
            <p className="text-xs font-light text-black/75 leading-relaxed">
              {user
                ? `Signed in as ${user.email}, which does not have administrator privileges.`
                : 'Sign in with your authorized KIKI JONES administrator Google account. Public admin registration is disabled.'}
            </p>
          </div>

          <div className="space-y-3">
            {!user ? (
              <button
                type="button"
                onClick={() => loginWithGoogle()}
                className="w-full py-3.5 bg-black text-white text-xs font-bold uppercase tracking-[0.18em] cursor-pointer"
              >
                Sign In with Google
              </button>
            ) : (
              <button
                type="button"
                onClick={() => logout()}
                className="w-full py-3.5 border border-black text-black text-xs font-bold uppercase tracking-[0.18em] cursor-pointer"
              >
                Sign Out
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full py-3 text-xs font-bold uppercase tracking-[0.16em] text-black/60 hover:text-black cursor-pointer"
            >
              Return to Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  const navItems: { id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'inventory', label: 'Inventory', icon: Boxes },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'marketing', label: 'Marketing', icon: Megaphone },
    { id: 'storefront', label: 'Storefront', icon: LayoutTemplate },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'import', label: 'CSV Import', icon: FileSpreadsheet },
  ];

  const actorEmail = user.email || 'admin';

  const SidebarList = () => (
    <nav className="space-y-1">
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
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs tracking-wide transition-colors cursor-pointer ${
              active
                ? 'bg-black text-white font-bold'
                : 'text-black/75 font-bold hover:bg-black/5'
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-white text-black flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col justify-between bg-white p-5 sticky top-0 h-screen">
        <div className="space-y-8">
          <div className="pb-2">
            <span className="font-bold text-xl tracking-[0.22em] uppercase text-black">
              KIKI JONES
            </span>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-black/60 mt-0.5">
              Admin Console
            </p>
          </div>
          <SidebarList />
        </div>

        <div className="pt-4 space-y-2 text-xs">
          <p className="truncate text-black font-bold">{actorEmail}</p>
          <p className="text-[10px] font-light uppercase tracking-wider text-black/60">
            {adminVerifiedServer ? 'Server Session Verified' : 'RBAC Active'}
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full py-2 rounded-none bg-[#F7F7F7] text-xs font-bold inline-flex items-center justify-center gap-1.5 hover:bg-black hover:text-white cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </button>
          <button
            type="button"
            onClick={() => logout()}
            className="w-full py-2 rounded-none text-xs font-bold text-black/60 hover:text-black inline-flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col bg-black/[0.02]">
        {/* Top Bar */}
        <header className="h-16 bg-white px-5 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden p-2 -ml-2 cursor-pointer"
              aria-label="Open admin menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-black/60">
              KIKI JONES / {navItems.find((n) => n.id === tab)?.label}
            </span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-4 py-2 border border-black/25 text-xs font-bold uppercase tracking-[0.14em] hover:border-black whitespace-nowrap cursor-pointer"
          >
            View Live Storefront
          </button>
        </header>

        <main className="flex-1 p-5 md:p-8 max-w-[1400px] w-full mx-auto">
          {tab === 'overview' && (
            <AdminOverview
              products={allProductsAdmin}
              variants={variants}
              orders={orders}
              onInitializeCatalog={initializeCatalog}
              onNavigateTab={(t) => setTab(t as AdminTab)}
            />
          )}
          {tab === 'products' && (
            <AdminProducts
              products={allProductsAdmin}
              variants={variants}
              categories={categories}
              actorEmail={actorEmail}
              onOpenImport={() => setTab('import')}
              onToast={toast}
            />
          )}
          {tab === 'import' && (
            <AdminImportCenter
              products={allProductsAdmin}
              variants={variants}
              categories={categories}
              importJobs={importJobs}
              actorEmail={actorEmail}
              onToast={toast}
            />
          )}
          {tab === 'inventory' && (
            <AdminInventory
              products={allProductsAdmin}
              variants={variants}
              movements={movements}
              reservations={reservations}
              actorEmail={actorEmail}
              onToast={toast}
            />
          )}
          {tab === 'orders' && (
            <AdminOrders orders={orders} actorEmail={actorEmail} onToast={toast} />
          )}
          {tab === 'customers' && <AdminCustomers users={users} orders={orders} />}
          {tab === 'payments' && <AdminPayments payments={payments} />}
          {tab === 'marketing' && (
            <AdminMarketing
              promotions={promotions}
              subscribers={subscribers}
              actorEmail={actorEmail}
              onToast={toast}
            />
          )}
          {tab === 'storefront' && (
            <AdminStorefront
              config={storefrontConfig}
              categories={categories}
              actorEmail={actorEmail}
              onToast={toast}
            />
          )}
          {tab === 'analytics' && (
            <AdminAnalytics
              orders={orders}
              products={allProductsAdmin}
              variants={variants}
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

      {/* Mobile Sidebar Drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="relative w-72 bg-white h-full p-5 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-2">
                <span className="font-bold text-lg tracking-[0.22em] uppercase text-black">
                  KIKI JONES
                </span>
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  className="p-2 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <SidebarList />
            </div>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="mt-6 w-full py-2.5 rounded-none bg-[#F7F7F7] text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Storefront
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
