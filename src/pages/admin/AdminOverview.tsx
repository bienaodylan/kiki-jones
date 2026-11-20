import React from 'react';
import { AlertTriangle, PackageCheck, ShoppingBag, TrendingUp, Layers } from 'lucide-react';
import { Order, Product, ProductVariant } from '../../types/commerce';
import { formatXOF, formatTimestamp, getAvailableStock } from '../../lib/format';

interface AdminOverviewProps {
  products: Product[];
  variants: ProductVariant[];
  orders: Order[];
  onInitializeCatalog: () => Promise<boolean>;
  onNavigateTab: (tab: string) => void;
}

export function AdminOverview({
  products,
  variants,
  orders,
  onInitializeCatalog,
  onNavigateTab,
}: AdminOverviewProps) {
  const paidOrders = orders.filter((o) => o.paymentStatus === 'paid');
  const totalRevenueXof = paidOrders.reduce((s, o) => s + (o.totalXof || 0), 0);
  const totalUnitsInStock = variants.reduce((s, v) => s + (v.stockQty || 0), 0);
  const lowStockVariants = variants.filter(
    (v) => v.isActive && getAvailableStock(v) <= (v.lowStockThreshold ?? 5)
  );

  // Best-selling products computed strictly from actual order items
  const salesByProduct = new Map<string, { name: string; units: number; revenueXof: number }>();
  for (const ord of orders) {
    if (ord.fulfillmentStatus === 'cancelled') continue;
    for (const item of ord.items || []) {
      const prev = salesByProduct.get(item.productId) || {
        name: item.productName,
        units: 0,
        revenueXof: 0,
      };
      prev.units += item.quantity || 0;
      prev.revenueXof += (item.unitPriceXof || 0) * (item.quantity || 0);
      salesByProduct.set(item.productId, prev);
    }
  }
  const bestSellers = Array.from(salesByProduct.values())
    .sort((a, b) => b.units - a.units)
    .slice(0, 5);

  const recentOrders = [...orders]
    .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0))
    .slice(0, 6);

  // Group daily order volume from actual orders
  const dailyMap = new Map<string, number>();
  for (const ord of orders) {
    const dt = ord.createdAt?.toDate ? ord.createdAt.toDate() : new Date();
    const key = dt.toISOString().slice(0, 10);
    dailyMap.set(key, (dailyMap.get(key) || 0) + (ord.totalXof || 0));
  }
  const dailyTrend = Array.from(dailyMap.entries()).sort((a, b) => a[0].localeCompare(b[0])).slice(-7);
  const maxDaily = Math.max(1, ...dailyTrend.map((d) => d[1]));

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-editorial text-3xl text-black">Operations Overview</h1>
          <p className="text-xs font-light text-black/60 mt-0.5">
            Live database metrics in XOF — zero simulated statistics.
          </p>
        </div>
        {products.length === 0 && (
          <button
            type="button"
            onClick={() => onInitializeCatalog()}
            className="px-5 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-[0.16em] cursor-pointer"
          >
            Initialize Launch Catalog
          </button>
        )}
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="border border-black/15 bg-white p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-black/60">
            <span className="font-bold uppercase tracking-[0.14em]">Verified Revenue</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold tabular-nums text-black">
            {formatXOF(totalRevenueXof)}
          </p>
          <p className="text-[11px] font-light text-black/60">{paidOrders.length} paid orders</p>
        </div>

        <div className="border border-black/15 bg-white p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-black/60">
            <span className="font-bold uppercase tracking-[0.14em]">Total Orders</span>
            <ShoppingBag className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold tabular-nums text-black">{orders.length}</p>
          <p className="text-[11px] font-light text-black/60">
            {orders.filter((o) => o.fulfillmentStatus === 'unfulfilled').length} awaiting fulfillment
          </p>
        </div>

        <div className="border border-black/15 bg-white p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-black/60">
            <span className="font-bold uppercase tracking-[0.14em]">Products</span>
            <Layers className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold tabular-nums text-black">{products.length}</p>
          <p className="text-[11px] font-light text-black/60">
            {products.filter((p) => p.status === 'published').length} published
          </p>
        </div>

        <div className="border border-black/15 bg-white p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-black/60">
            <span className="font-bold uppercase tracking-[0.14em]">Units in Stock</span>
            <PackageCheck className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold tabular-nums text-black">
            {totalUnitsInStock}
          </p>
          <p className="text-[11px] font-light text-black/60">Across {variants.length} variants</p>
        </div>

        <button
          type="button"
          onClick={() => onNavigateTab('inventory')}
          className="border border-black/15 bg-white p-5 space-y-2 text-left hover:border-black transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-black/60">
            <span className="font-bold uppercase tracking-[0.14em]">Low Stock Alerts</span>
            <AlertTriangle className="w-4 h-4 text-black/60" />
          </div>
          <p className="text-2xl font-bold tabular-nums text-black">
            {lowStockVariants.length}
          </p>
          <p className="text-[11px] font-light text-black/60">Variants at or below threshold</p>
        </button>
      </div>

      {/* Main Two-Column Operational View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-7 border border-black/15 bg-white p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-editorial text-2xl text-black">Recent Orders</h2>
            <button
              type="button"
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-bold uppercase tracking-[0.16em] text-black/60 hover:text-black cursor-pointer"
            >
              View All
            </button>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-xs font-light text-black/60 py-8 text-center">
              No orders recorded in Firestore yet. Orders placed during checkout will appear here in real time.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-[11px] font-bold uppercase tracking-[0.14em] text-black/60 bg-black/[0.03]">
                    <th className="py-2.5 pr-4 pl-2">Order</th>
                    <th className="py-2.5 pr-4">Client</th>
                    <th className="py-2.5 pr-4">Payment</th>
                    <th className="py-2.5 text-right pr-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o, idx) => (
                    <tr key={o.id} className={`hover:bg-black/[0.04] ${idx % 2 === 1 ? 'bg-black/[0.015]' : ''}`}>
                      <td className="py-3 pr-4 pl-2 font-bold">{o.orderNumber}</td>
                      <td className="py-3 pr-4">
                        <div className="font-bold text-black">{o.customerName}</div>
                        <div className="text-[11px] font-light text-black/60">
                          {formatTimestamp(o.createdAt)}
                        </div>
                      </td>
                      <td className="py-3 pr-4 font-bold uppercase text-[11px]">
                        {o.paymentStatus}
                      </td>
                      <td className="py-3 text-right tabular-nums font-bold">
                        {formatXOF(o.totalXof)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Best-Selling & Sales Trend */}
        <div className="lg:col-span-5 space-y-6">
          <div className="border border-black/15 bg-white p-6 space-y-4">
            <h2 className="font-editorial text-2xl text-black">Order Volume Trend</h2>
            {dailyTrend.length === 0 ? (
              <p className="text-xs font-light text-black/60 py-4">
                Order trend bars populate automatically as customer orders are created.
              </p>
            ) : (
              <div className="space-y-2.5">
                {dailyTrend.map(([day, val]) => (
                  <div key={day} className="space-y-1 text-xs">
                    <div className="flex justify-between font-bold text-[11px]">
                      <span>{day}</span>
                      <span className="tabular-nums">{formatXOF(val)}</span>
                    </div>
                    <div className="h-2 bg-black/10">
                      <div
                        className="h-full bg-black"
                        style={{ width: `${Math.round((val / maxDaily) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border border-black/15 bg-white p-6 space-y-4">
            <h2 className="font-editorial text-2xl text-black">Best-Selling Pieces</h2>
            {bestSellers.length === 0 ? (
              <p className="text-xs font-light text-black/60">No completed line items yet.</p>
            ) : (
              <div className="space-y-1 text-xs">
                {bestSellers.map((b, i) => (
                  <div key={i} className={`py-2.5 px-2 flex items-center justify-between ${i % 2 === 1 ? 'bg-black/[0.02]' : ''}`}>
                    <div>
                      <p className="font-bold text-black">{b.name}</p>
                      <p className="text-[11px] font-light text-black/60 tabular-nums">{b.units} units</p>
                    </div>
                    <span className="font-bold tabular-nums">{formatXOF(b.revenueXof)}</span>
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
