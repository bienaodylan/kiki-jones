import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { InventoryMovement, InventoryReservation, Product, ProductVariant } from '../../types/commerce';
import { adjustVariantStock } from '../../lib/firestoreService';
import { formatTimestamp, getAvailableStock, getColorHex } from '../../lib/format';
import { useAuth } from '../../context/AuthContext';

interface AdminInventoryProps {
  products: Product[];
  variants: ProductVariant[];
  movements: InventoryMovement[];
  reservations: InventoryReservation[];
  actorEmail: string;
  onToast: (msg: string, tone?: 'default' | 'error' | 'success') => void;
}

export function AdminInventory({
  products,
  variants,
  movements,
  reservations,
  actorEmail,
  onToast,
}: AdminInventoryProps) {
  const { idToken } = useAuth();
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [search, setSearch] = useState('');
  const [adjusting, setAdjusting] = useState<ProductVariant | null>(null);
  const [adjType, setAdjType] = useState<'addition' | 'reduction' | 'correction'>('addition');
  const [adjQty, setAdjQty] = useState(5);
  const [adjReason, setAdjReason] = useState('');
  const [releasing, setReleasing] = useState(false);

  const productMap = new Map(products.map((p) => [p.id, p]));

  const filteredVariants = variants.filter((v) => {
    const avail = getAvailableStock(v);
    if (filterLowStock && avail > (v.lowStockThreshold ?? 5)) return false;
    if (search.trim()) {
      const pName = productMap.get(v.productId)?.name || '';
      const q = search.toLowerCase();
      return (
        v.sku.toLowerCase().includes(q) ||
        v.color.toLowerCase().includes(q) ||
        pName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjusting) return;
    try {
      await adjustVariantStock(adjusting, adjType, adjQty, adjReason, actorEmail);
      setAdjusting(null);
      setAdjReason('');
      onToast(`Inventory updated for ${adjusting.sku}.`, 'success');
    } catch {
      onToast('Failed to update variant inventory.', 'error');
    }
  };

  const handleReleaseExpired = async () => {
    if (!idToken) return;
    setReleasing(true);
    try {
      const res = await fetch('/api/checkout/release-expired', {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const data = await res.json();
      if (res.ok) {
        onToast(`Released ${data.releasedCount} expired reservation(s).`, 'success');
      } else {
        onToast(data.error || 'Could not release reservations.', 'error');
      }
    } catch {
      onToast('Reservation sweep failed.', 'error');
    } finally {
      setReleasing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-editorial text-3xl text-black">Variant Inventory</h1>
          <p className="text-xs font-light text-black/60 mt-0.5">
            Independent color/size stock control, active reservations, and immutable movement audit trail.
          </p>
        </div>
        <button
          type="button"
          disabled={releasing}
          onClick={handleReleaseExpired}
          className="px-4 py-2.5 border border-black text-xs font-bold uppercase tracking-[0.14em] inline-flex items-center gap-2 hover:bg-black hover:text-white cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{releasing ? 'Sweeping...' : 'Release Expired Holds'}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          type="search"
          placeholder="Filter by SKU, product, or color..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:w-72 bg-white border border-black/25 px-4 py-2 text-xs font-light"
        />
        <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
          <input
            type="checkbox"
            checked={filterLowStock}
            onChange={(e) => setFilterLowStock(e.target.checked)}
            className="accent-black"
          />
          <span>Show Low Stock &amp; Sold Out Only</span>
        </label>
      </div>

      {/* Variant Stock Matrix */}
      <div className="bg-white overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-[11px] font-bold uppercase tracking-[0.14em] text-black/60 bg-black/[0.03]">
              <th className="py-3 px-4">Product</th>
              <th className="py-3 px-4">Color / Size</th>
              <th className="py-3 px-4">SKU</th>
              <th className="py-3 px-4 text-right">On Hand</th>
              <th className="py-3 px-4 text-right">Reserved</th>
              <th className="py-3 px-4 text-right">Available</th>
              <th className="py-3 px-4">State</th>
              <th className="py-3 px-4 text-right">Adjust</th>
            </tr>
          </thead>
          <tbody>
            {filteredVariants.map((v, idx) => {
              const prod = productMap.get(v.productId);
              const avail = getAvailableStock(v);
              const state =
                avail <= 0
                  ? 'SOLD OUT'
                  : avail <= (v.lowStockThreshold ?? 5)
                    ? 'LOW STOCK'
                    : 'IN STOCK';
              return (
                <tr key={v.id} className={`hover:bg-black/[0.04] ${idx % 2 === 1 ? 'bg-black/[0.015]' : ''}`}>
                  <td className="py-3 px-4 font-bold text-black">
                    {prod?.name || v.productId}
                  </td>
                  <td className="py-3 px-4 font-light">
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-none"
                        style={{ backgroundColor: getColorHex(v.color) }}
                      />
                      {v.color} / {v.size}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-light">{v.sku}</td>
                  <td className="py-3 px-4 text-right tabular-nums">{v.stockQty}</td>
                  <td className="py-3 px-4 text-right tabular-nums">{v.reservedQty}</td>
                  <td className="py-3 px-4 text-right font-bold tabular-nums">
                    {avail}
                  </td>
                  <td className="py-3 px-4 font-bold text-[11px]">{state}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setAdjusting(v);
                        setAdjType('addition');
                        setAdjQty(5);
                      }}
                      className="px-3 py-1 rounded-none bg-[#F7F7F7] font-bold hover:bg-black hover:text-white cursor-pointer"
                    >
                      Adjust
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Active Reservations */}
      <div className="bg-white p-6 space-y-4">
        <h2 className="font-editorial text-2xl text-black">
          Checkout Stock Reservations ({reservations.length})
        </h2>
        {reservations.length === 0 ? (
          <p className="text-xs font-light text-black/60">No active or historical reservations logged.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[11px] font-bold uppercase tracking-[0.14em] text-black/60 bg-black/[0.03]">
                  <th className="py-2 pr-4 pl-2">Order ID</th>
                  <th className="py-2 pr-4">Variant</th>
                  <th className="py-2 pr-4 text-right">Qty</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 text-right pr-2">Expires At</th>
                </tr>
              </thead>
              <tbody>
                {reservations.slice(0, 15).map((r, idx) => (
                  <tr key={r.id} className={idx % 2 === 1 ? 'bg-black/[0.015]' : ''}>
                    <td className="py-2 pr-4 pl-2 font-bold">{r.orderId}</td>
                    <td className="py-2 pr-4 font-light">{r.variantId}</td>
                    <td className="py-2 pr-4 text-right tabular-nums">{r.qty}</td>
                    <td className="py-2 pr-4 uppercase font-bold">{r.status}</td>
                    <td className="py-2 text-right pr-2 font-light text-black/60">{r.expiresAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Movement History */}
      <div className="bg-white p-6 space-y-4">
        <h2 className="font-editorial text-2xl text-black">Inventory Movement History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-[11px] font-bold uppercase tracking-[0.14em] text-black/60 bg-black/[0.03]">
                <th className="py-2 pr-4 pl-2">SKU</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4 text-right">Delta</th>
                <th className="py-2 pr-4 text-right">Prev &rarr; New</th>
                <th className="py-2 pr-4">Reason</th>
                <th className="py-2 pr-4">Actor</th>
                <th className="py-2 text-right pr-2">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {movements.slice(0, 30).map((m, idx) => (
                <tr key={m.id} className={idx % 2 === 1 ? 'bg-black/[0.015]' : ''}>
                  <td className="py-2.5 pr-4 pl-2 font-bold">{m.sku}</td>
                  <td className="py-2.5 pr-4 uppercase font-bold text-[11px]">{m.type}</td>
                  <td className="py-2.5 pr-4 text-right tabular-nums">
                    {m.deltaQty >= 0 ? `+${m.deltaQty}` : m.deltaQty}
                  </td>
                  <td className="py-2.5 pr-4 text-right tabular-nums">
                    {m.previousQty} &rarr; {m.newQty}
                  </td>
                  <td className="py-2.5 pr-4 font-light">{m.reason}</td>
                  <td className="py-2.5 pr-4 font-light text-black/60">{m.actorEmail}</td>
                  <td className="py-2.5 text-right pr-2 font-light text-black/60">
                    {formatTimestamp(m.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjustment Modal */}
      {adjusting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setAdjusting(null)} />
          <form
            onSubmit={handleAdjust}
            className="relative w-full max-w-md bg-white border border-black p-6 space-y-4"
          >
            <h3 className="font-editorial text-2xl text-black">Adjust Stock: {adjusting.sku}</h3>
            <p className="text-xs font-light text-black/60">
              {adjusting.color} / {adjusting.size} &middot; Current On-Hand: {adjusting.stockQty}
            </p>
            <div className="space-y-3 text-xs">
              <label className="block space-y-1">
                <span className="font-bold uppercase tracking-wider text-black/60">Movement Type</span>
                <select
                  value={adjType}
                  onChange={(e) => setAdjType(e.target.value as any)}
                  className="w-full bg-white border border-black/25 px-3 py-2.5"
                >
                  <option value="addition">Stock Addition (+)</option>
                  <option value="reduction">Stock Reduction (-)</option>
                  <option value="correction">Manual Set Exact Count (=)</option>
                </select>
              </label>
              <label className="block space-y-1">
                <span className="font-bold uppercase tracking-wider text-black/60">Quantity</span>
                <input
                  type="number"
                  min={0}
                  required
                  value={adjQty}
                  onChange={(e) => setAdjQty(Number(e.target.value))}
                  className="w-full bg-white border border-black/25 px-3 py-2.5 tabular-nums"
                />
              </label>
              <label className="block space-y-1">
                <span className="font-bold uppercase tracking-wider text-black/60">Reason *</span>
                <input
                  required
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  placeholder="e.g. Atelier restock shipment #12"
                  className="w-full bg-white border border-black/25 px-3 py-2.5"
                />
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAdjusting(null)}
                className="px-4 py-2 border border-black/25 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-black text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Apply Adjustment
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
