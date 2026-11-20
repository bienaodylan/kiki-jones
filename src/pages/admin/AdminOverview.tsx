import React, { useMemo, useState } from 'react';
import {
  Plus,
  FolderPlus,
  ShoppingBag,
  LayoutTemplate,
  Sparkles,
  ArrowUpRight,
  Database,
} from 'lucide-react';
import { Order, Product, ProductVariant, UserProfile } from '../../types/commerce';
import { useLanguage } from '../../context/LanguageContext';
import { formatXOF, getAvailableStock } from '../../lib/format';

type DateRangeKey = 'today' | '7d' | '30d' | 'month' | 'custom';

interface AdminOverviewProps {
  products: Product[];
  variants: ProductVariant[];
  orders: Order[];
  users: UserProfile[];
  onInitializeCatalog: () => Promise<boolean | void>;
  onNavigateTab: (tab: string, options?: { openCreate?: boolean; orderId?: string }) => void;
  onOpenAiAssistant: () => void;
}

function getOrderDate(order: Order): Date | null {
  if (!order.createdAt) return null;
  const d =
    typeof order.createdAt.toDate === 'function'
      ? order.createdAt.toDate()
      : new Date(order.createdAt);
  return Number.isNaN(d.getTime()) ? null : d;
}

function toYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function AdminOverview({
  products,
  variants,
  orders,
  users,
  onInitializeCatalog,
  onNavigateTab,
  onOpenAiAssistant,
}: AdminOverviewProps) {
  const { lang, tr } = useLanguage();
  const [range, setRange] = useState<DateRangeKey>('30d');
  const [customStart, setCustomStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 14);
    return toYmd(d);
  });
  const [customEnd, setCustomEnd] = useState(() => toYmd(new Date()));
  const [seeding, setSeeding] = useState(false);

  const { startDate, endDate } = useMemo(() => {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    if (range === 'today') {
      return { startDate: start, endDate: end };
    }
    if (range === '7d') {
      start.setDate(start.getDate() - 6);
      return { startDate: start, endDate: end };
    }
    if (range === '30d') {
      start.setDate(start.getDate() - 29);
      return { startDate: start, endDate: end };
    }
    if (range === 'month') {
      return {
        startDate: new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0),
        endDate: end,
      };
    }
    const cs = customStart ? new Date(`${customStart}T00:00:00`) : start;
    const ce = customEnd ? new Date(`${customEnd}T23:59:59`) : end;
    return {
      startDate: Number.isNaN(cs.getTime()) ? start : cs,
      endDate: Number.isNaN(ce.getTime()) ? end : ce,
    };
  }, [range, customStart, customEnd]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const d = getOrderDate(o);
      if (!d) return false;
      return d >= startDate && d <= endDate;
    });
  }, [orders, startDate, endDate]);

  const activeOrders = useMemo(
    () =>
      filteredOrders.filter(
        (o) => o.fulfillmentStatus !== 'cancelled' && o.paymentStatus !== 'failed'
      ),
    [filteredOrders]
  );

  const totalSalesXof = useMemo(
    () => activeOrders.reduce((sum, o) => sum + (o.totalXof || 0), 0),
    [activeOrders]
  );

  const avgOrderValue = activeOrders.length > 0 ? totalSalesXof / activeOrders.length : 0;

  const uniqueCustomersCount = useMemo(() => {
    const emails = new Set<string>();
    users.forEach((u) => {
      if (u.email) emails.add(u.email.toLowerCase());
    });
    orders.forEach((o) => {
      if (o.customerEmail) emails.add(o.customerEmail.toLowerCase());
    });
    return emails.size;
  }, [users, orders]);

  // Build daily revenue buckets for the clean monochrome chart
  const chartSeries = useMemo(() => {
    const dayMs = 24 * 60 * 60 * 1000;
    const rawDays = Math.max(1, Math.min(31, Math.round((endDate.getTime() - startDate.getTime()) / dayMs) + 1));
    const buckets: { key: string; label: string; total: number; count: number }[] = [];
    for (let i = 0; i < rawDays; i++) {
      const d = new Date(startDate.getTime() + i * dayMs);
      const key = toYmd(d);
      buckets.push({
        key,
        label: new Intl.DateTimeFormat(lang === 'fr' ? 'fr-FR' : 'en-GB', {
          day: '2-digit',
          month: 'short',
        }).format(d),
        total: 0,
        count: 0,
      });
    }
    const map = new Map(buckets.map((b) => [b.key, b]));
    activeOrders.forEach((o) => {
      const d = getOrderDate(o);
      if (!d) return;
      const b = map.get(toYmd(d));
      if (b) {
        b.total += o.totalXof || 0;
        b.count += 1;
      }
    });
    return buckets;
  }, [activeOrders, startDate, endDate, lang]);

  const maxChartVal = Math.max(1, ...chartSeries.map((c) => c.total));

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => (getOrderDate(b)?.getTime() || 0) - (getOrderDate(a)?.getTime() || 0))
      .slice(0, 6);
  }, [orders]);

  const bestSellers = useMemo(() => {
    const map = new Map<
      string,
      { productId: string; name: string; imageUrl: string; units: number; revenue: number }
    >();
    orders
      .filter((o) => o.fulfillmentStatus !== 'cancelled' && o.paymentStatus !== 'failed')
      .forEach((o) => {
        (o.items || []).forEach((item) => {
          const prev = map.get(item.productId) || {
            productId: item.productId,
            name: item.productName,
            imageUrl: item.imageUrl,
            units: 0,
            revenue: 0,
          };
          prev.units += item.quantity || 1;
          prev.revenue += (item.unitPriceXof || 0) * (item.quantity || 1);
          map.set(item.productId, prev);
        });
      });
    return Array.from(map.values())
      .sort((a, b) => b.units - a.units)
      .slice(0, 5);
  }, [orders]);

  const lowStockProducts = useMemo(() => {
    return products
      .map((p) => {
        const pVars = variants.filter((v) => v.productId === p.id && v.isActive);
        const totalAvail = pVars.reduce((sum, v) => sum + getAvailableStock(v), 0);
        return { product: p, totalAvail };
      })
      .filter(({ product, totalAvail }) => totalAvail <= (product.lowStockThreshold ?? 5))
      .sort((a, b) => a.totalAvail - b.totalAvail)
      .slice(0, 6);
  }, [products, variants]);

  const statusLabel = (status: Order['fulfillmentStatus']) => {
    const map: Record<Order['fulfillmentStatus'], [string, string]> = {
      unfulfilled: ['En attente', 'Pending'],
      processing: ['En préparation', 'Processing'],
      shipped: ['Expédiée', 'Shipped'],
      delivered: ['Livrée', 'Delivered'],
      cancelled: ['Annulée', 'Cancelled'],
    };
    return tr(map[status]?.[0] || status, map[status]?.[1] || status);
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await onInitializeCatalog();
    } finally {
      setSeeding(false);
    }
  };

  const rangeOptions: { key: DateRangeKey; label: string }[] = [
    { key: 'today', label: tr('Aujourd’hui', 'Today') },
    { key: '7d', label: tr('7 jours', '7 days') },
    { key: '30d', label: tr('30 jours', '30 days') },
    { key: 'month', label: tr('Ce mois', 'This month') },
    { key: 'custom', label: tr('Personnalisé', 'Custom') },
  ];

  return (
    <div className="space-y-6">
      {/* Header + Period Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-black">
            {tr('Tableau de bord', 'Dashboard')}
          </h1>
          <p className="text-xs text-black/55 mt-0.5">
            {tr('Vue d’ensemble en temps réel de votre activité KIKI JONES.', 'Real-time overview of your KIKI JONES store.')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex border border-[#E8E8E8] bg-white">
            {rangeOptions.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setRange(opt.key)}
                className={`px-3 py-1.5 text-xs transition-colors cursor-pointer ${
                  range === opt.key
                    ? 'bg-black text-white font-medium'
                    : 'text-black/65 hover:text-black'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {range === 'custom' && (
            <div className="flex items-center gap-1.5 text-xs bg-white border border-[#E8E8E8] px-2.5 py-1">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="text-xs focus:outline-none tabular-nums"
              />
              <span className="text-black/35">&rarr;</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="text-xs focus:outline-none tabular-nums"
              />
            </div>
          )}
        </div>
      </div>

      {/* Empty Catalog Setup Callout (Only shown if catalog is empty) */}
      {products.length === 0 && (
        <div className="bg-white border border-black p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Database className="w-5 h-5 text-black shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-black">
                {tr('Catalogue vide', 'Catalog not initialized')}
              </p>
              <p className="text-xs text-black/60 mt-0.5">
                {tr(
                  'Initialisez les collections et produits KIKI JONES pour démarrer immédiatement.',
                  'Initialize the KIKI JONES collections and starter catalog to launch immediately.'
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={seeding}
            onClick={handleSeed}
            className="px-4 py-2 bg-black text-white text-xs font-medium hover:bg-black/85 disabled:opacity-50 cursor-pointer shrink-0"
          >
            {seeding ? tr('Initialisation...', 'Initializing...') : tr('Initialiser le catalogue', 'Initialize Catalog')}
          </button>
        </div>
      )}

      {/* 4 Essential KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: tr('Ventes totales', 'Total sales'),
            value: formatXOF(totalSalesXof),
            meta: `${activeOrders.length} ${tr('commandes valides', 'valid orders')}`,
          },
          {
            label: tr('Commandes', 'Orders'),
            value: String(filteredOrders.length),
            meta: `${orders.filter((o) => o.fulfillmentStatus === 'unfulfilled').length} ${tr('en attente', 'pending')}`,
          },
          {
            label: tr('Clients', 'Customers'),
            value: String(uniqueCustomersCount),
            meta: `${users.length} ${tr('comptes inscrits', 'registered accounts')}`,
          },
          {
            label: tr('Panier moyen', 'Average order'),
            value: formatXOF(avgOrderValue),
            meta: `${products.filter((p) => p.status === 'published').length} ${tr('produits en ligne', 'live products')}`,
          },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white border border-[#E8E8E8] p-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-black/50">
              {kpi.label}
            </p>
            <p className="text-2xl font-semibold text-black tabular-nums mt-2 tracking-tight">
              {kpi.value}
            </p>
            <p className="text-[11px] text-black/45 mt-1.5 tabular-nums">{kpi.meta}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          type="button"
          onClick={() => onNavigateTab('products', { openCreate: true })}
          className="bg-black text-white px-4 py-3 text-xs font-medium flex items-center justify-between hover:bg-black/85 transition-colors cursor-pointer"
        >
          <span>{tr('Ajouter un produit', 'Add product')}</span>
          <Plus className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onNavigateTab('collections', { openCreate: true })}
          className="bg-white border border-[#E8E8E8] hover:border-black text-black px-4 py-3 text-xs font-medium flex items-center justify-between transition-colors cursor-pointer"
        >
          <span>{tr('Créer une collection', 'Create collection')}</span>
          <FolderPlus className="w-3.5 h-3.5 text-black/60" />
        </button>
        <button
          type="button"
          onClick={() => onNavigateTab('orders')}
          className="bg-white border border-[#E8E8E8] hover:border-black text-black px-4 py-3 text-xs font-medium flex items-center justify-between transition-colors cursor-pointer"
        >
          <span>{tr('Voir les commandes', 'View orders')}</span>
          <ShoppingBag className="w-3.5 h-3.5 text-black/60" />
        </button>
        <button
          type="button"
          onClick={() => onNavigateTab('storefront')}
          className="bg-white border border-[#E8E8E8] hover:border-black text-black px-4 py-3 text-xs font-medium flex items-center justify-between transition-colors cursor-pointer"
        >
          <span>{tr('Modifier la boutique', 'Edit store')}</span>
          <LayoutTemplate className="w-3.5 h-3.5 text-black/60" />
        </button>
        <button
          type="button"
          onClick={onOpenAiAssistant}
          className="col-span-2 sm:col-span-1 bg-[#F5F5F5] border border-[#E8E8E8] hover:border-black text-black px-4 py-3 text-xs font-medium flex items-center justify-between transition-colors cursor-pointer"
        >
          <span>{tr('Assistant IA', 'AI Assistant')}</span>
          <Sparkles className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Minimal Sales Chart */}
      <div className="bg-white border border-[#E8E8E8] p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-black">
              {tr('Évolution des ventes', 'Sales over time')}
            </h2>
            <p className="text-[11px] text-black/50 mt-0.5">
              {tr('Chiffre d’affaires quotidien sur la période sélectionnée', 'Daily revenue across the selected period')}
            </p>
          </div>
          <span className="text-xs font-semibold tabular-nums text-black">
            {formatXOF(totalSalesXof)}
          </span>
        </div>

        <div className="h-44 flex items-end gap-1 pt-4 border-t border-[#F0F0F0]">
          {chartSeries.map((day) => {
            const pct = day.total > 0 ? Math.max(6, Math.round((day.total / maxChartVal) * 100)) : 2;
            return (
              <div
                key={day.key}
                className="group relative flex-1 h-full flex flex-col justify-end items-center"
              >
                <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute -top-9 left-1/2 -translate-x-1/2 bg-black text-white px-2 py-1 text-[10px] whitespace-nowrap z-10 tabular-nums">
                  {day.label} &middot; {formatXOF(day.total)}
                </div>
                <div
                  style={{ height: `${pct}%` }}
                  className={`w-full transition-colors ${
                    day.total > 0 ? 'bg-black group-hover:bg-black/75' : 'bg-[#EBEBEB]'
                  }`}
                />
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between text-[10.5px] text-black/45 mt-2 tabular-nums">
          <span>{chartSeries[0]?.label}</span>
          <span>{chartSeries[Math.floor(chartSeries.length / 2)]?.label}</span>
          <span>{chartSeries[chartSeries.length - 1]?.label}</span>
        </div>
      </div>

      {/* Lower Grid: Recent Orders + Best Sellers / Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white border border-[#E8E8E8]">
          <div className="px-5 py-4 border-b border-[#E8E8E8] flex items-center justify-between">
            <h2 className="text-sm font-semibold text-black">
              {tr('Commandes récentes', 'Recent orders')}
            </h2>
            <button
              type="button"
              onClick={() => onNavigateTab('orders')}
              className="text-xs text-black/60 hover:text-black inline-flex items-center gap-1 cursor-pointer"
            >
              <span>{tr('Tout voir', 'View all')}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-xs text-black/50">
              {tr('Aucune commande enregistrée pour le moment.', 'No orders recorded yet.')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-[11px] font-medium text-black/45 border-b border-[#E8E8E8]">
                    <th className="py-3 px-5">{tr('Commande', 'Order')}</th>
                    <th className="py-3 px-3">{tr('Client', 'Customer')}</th>
                    <th className="py-3 px-3">{tr('Statut', 'Status')}</th>
                    <th className="py-3 px-5 text-right">{tr('Total', 'Total')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F0F0]">
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => onNavigateTab('orders', { orderId: order.id })}
                      className="hover:bg-[#FAFAFA] cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-5 font-medium text-black tabular-nums">
                        {order.orderNumber}
                      </td>
                      <td className="py-3 px-3 text-black/75 truncate max-w-[180px]">
                        {order.customerName}
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-block px-2 py-0.5 text-[10.5px] border border-[#E8E8E8] bg-[#F5F5F5] text-black/80">
                          {statusLabel(order.fulfillmentStatus)}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-right font-medium tabular-nums text-black">
                        {formatXOF(order.totalXof)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Best Sellers + Low Stock */}
        <div className="space-y-6">
          {/* Best-Selling Products */}
          <div className="bg-white border border-[#E8E8E8]">
            <div className="px-5 py-4 border-b border-[#E8E8E8]">
              <h2 className="text-sm font-semibold text-black">
                {tr('Produits les plus vendus', 'Best-selling products')}
              </h2>
            </div>
            {bestSellers.length === 0 ? (
              <p className="p-5 text-xs text-black/50">
                {tr('Les meilleures ventes apparaîtront dès les premières commandes.', 'Best sellers will appear once orders are placed.')}
              </p>
            ) : (
              <div className="divide-y divide-[#F0F0F0]">
                {bestSellers.map((item) => (
                  <div key={item.productId} className="px-5 py-3 flex items-center gap-3">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-9 h-11 object-cover bg-[#F5F5F5] shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-11 bg-[#F5F5F5] shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-black truncate">{item.name}</p>
                      <p className="text-[11px] text-black/50 tabular-nums">
                        {item.units} {tr('vendus', 'sold')} &middot; {formatXOF(item.revenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-white border border-[#E8E8E8]">
            <div className="px-5 py-4 border-b border-[#E8E8E8] flex items-center justify-between">
              <h2 className="text-sm font-semibold text-black">
                {tr('Stock faible', 'Low stock')}
              </h2>
              <button
                type="button"
                onClick={() => onNavigateTab('products')}
                className="text-xs text-black/60 hover:text-black cursor-pointer"
              >
                {tr('Gérer', 'Manage')}
              </button>
            </div>
            {lowStockProducts.length === 0 ? (
              <p className="p-5 text-xs text-black/50">
                {tr('Tous vos produits ont un niveau de stock confortable.', 'All products have healthy stock levels.')}
              </p>
            ) : (
              <div className="divide-y divide-[#F0F0F0]">
                {lowStockProducts.map(({ product, totalAvail }) => (
                  <div key={product.id} className="px-5 py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-black truncate">{product.name}</p>
                      <p className="text-[11px] text-black/45">{product.categoryName}</p>
                    </div>
                    <span
                      className={`text-xs font-semibold tabular-nums shrink-0 px-2 py-0.5 border ${
                        totalAvail === 0
                          ? 'bg-black text-white border-black'
                          : 'bg-[#F5F5F5] text-black border-[#E8E8E8]'
                      }`}
                    >
                      {totalAvail === 0 ? tr('Épuisé', 'Out') : `${totalAvail} ${tr('rest.', 'left')}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
