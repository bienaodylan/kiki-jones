import React, { useState, useEffect } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { AuditLog, Order, Product, ProductVariant, StorefrontConfig } from '../../types/commerce';
import { formatTimestamp, formatXOF, sanitizeId } from '../../lib/format';
import { saveStorefrontConfig, logAudit } from '../../lib/firestoreService';

export function AdminAnalytics({
  orders,
  products,
  variants,
}: {
  orders: Order[];
  products: Product[];
  variants: ProductVariant[];
}) {
  const inventoryRetailValue = variants.reduce(
    (s, v) => s + (v.stockQty || 0) * (v.priceXof || 0),
    0
  );

  const byPaymentMethod = new Map<string, { count: number; totalXof: number }>();
  for (const o of orders) {
    const prev = byPaymentMethod.get(o.paymentMethod) || { count: 0, totalXof: 0 };
    prev.count += 1;
    prev.totalXof += o.totalXof || 0;
    byPaymentMethod.set(o.paymentMethod, prev);
  }

  const byCategory = new Map<string, { products: number; units: number }>();
  for (const p of products) {
    const pVars = variants.filter((v) => v.productId === p.id);
    const units = pVars.reduce((s, v) => s + (v.stockQty || 0), 0);
    const prev = byCategory.get(p.categoryName) || { products: 0, units: 0 };
    prev.products += 1;
    prev.units += units;
    byCategory.set(p.categoryName, prev);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-editorial text-3xl text-black">Analytics</h1>
        <p className="text-xs font-light text-black/60 mt-0.5">
          Real-time inventory valuation, payment method mix, and category stock distribution.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-black/15 bg-white p-5 space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-black/60">
            Retail Inventory Valuation
          </p>
          <p className="text-2xl font-bold tabular-nums">{formatXOF(inventoryRetailValue)}</p>
        </div>
        <div className="border border-black/15 bg-white p-5 space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-black/60">
            Average Order Value
          </p>
          <p className="text-2xl font-bold tabular-nums">
            {orders.length > 0
              ? formatXOF(
                  orders.reduce((s, o) => s + (o.totalXof || 0), 0) / orders.length
                )
              : '0 XOF'}
          </p>
        </div>
        <div className="border border-black/15 bg-white p-5 space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-black/60">
            Active SKUs
          </p>
          <p className="text-2xl font-bold tabular-nums">{variants.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 space-y-4">
          <h2 className="font-editorial text-2xl text-black">Stock by Category</h2>
          <div className="space-y-1 text-xs">
            {Array.from(byCategory.entries()).map(([cat, stats], idx) => (
              <div key={cat} className={`py-2.5 px-2 flex justify-between ${idx % 2 === 1 ? 'bg-black/[0.02]' : ''}`}>
                <span className="font-bold">{cat}</span>
                <span className="font-light tabular-nums text-black/60">
                  {stats.products} products &middot; {stats.units} units
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 space-y-4">
          <h2 className="font-editorial text-2xl text-black">Payment Method Breakdown</h2>
          {byPaymentMethod.size === 0 ? (
            <p className="text-xs font-light text-black/60">No orders recorded yet.</p>
          ) : (
            <div className="space-y-1 text-xs">
              {Array.from(byPaymentMethod.entries()).map(([method, stats], idx) => (
                <div key={method} className={`py-2.5 px-2 flex justify-between ${idx % 2 === 1 ? 'bg-black/[0.02]' : ''}`}>
                  <span className="uppercase font-bold">{method}</span>
                  <span className="tabular-nums font-light">
                    {stats.count} orders &middot; {formatXOF(stats.totalXof)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AdminSettings({
  config,
  auditLogs,
  actorEmail,
  onToast,
}: {
  config: StorefrontConfig;
  auditLogs: AuditLog[];
  actorEmail: string;
  onToast: (msg: string, tone?: 'default' | 'error' | 'success') => void;
}) {
  const [shipping, setShipping] = useState({
    standardShippingXof: config.standardShippingXof,
    expressShippingXof: config.expressShippingXof,
    freeShippingThresholdXof: config.freeShippingThresholdXof,
    supportEmail: config.supportEmail || '',
    supportPhone: config.supportPhone || '',
  });
  const [newAdminUid, setNewAdminUid] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');

  useEffect(() => {
    setShipping({
      standardShippingXof: config.standardShippingXof,
      expressShippingXof: config.expressShippingXof,
      freeShippingThresholdXof: config.freeShippingThresholdXof,
      supportEmail: config.supportEmail || '',
      supportPhone: config.supportPhone || '',
    });
  }, [config]);

  const handleSaveShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveStorefrontConfig(
      {
        ...config,
        ...shipping,
      },
      actorEmail
    );
    onToast('Shipping rates and contact settings saved.', 'success');
  };

  const handleGrantAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminUid.trim() || !newAdminEmail.trim()) return;
    const cleanUid = sanitizeId(newAdminUid.trim());
    await setDoc(doc(db, 'admins', cleanUid), {
      uid: cleanUid,
      email: newAdminEmail.trim().toLowerCase(),
      role: 'operations',
      createdAt: serverTimestamp(),
    });
    await logAudit(actorEmail, 'GRANT_ADMIN_ROLE', 'admin', cleanUid, newAdminEmail);
    setNewAdminUid('');
    setNewAdminEmail('');
    onToast('Administrator role added.', 'success');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-editorial text-3xl text-black">Settings &amp; Audit</h1>
        <p className="text-xs font-light text-black/60 mt-0.5">
          Configure XOF shipping thresholds, support contact info, admin RBAC roles, and audit logs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form
          onSubmit={handleSaveShipping}
          className="border border-black/15 bg-white p-6 space-y-4 text-xs"
        >
          <h2 className="font-editorial text-2xl text-black">Shipping &amp; Contact (XOF)</h2>
          <label className="block space-y-1">
            <span className="font-bold uppercase tracking-wider text-black/60">Standard Shipping (XOF)</span>
            <input
              type="number"
              value={shipping.standardShippingXof}
              onChange={(e) =>
                setShipping({ ...shipping, standardShippingXof: Number(e.target.value) })
              }
              className="w-full border border-black/25 px-3 py-2 tabular-nums"
            />
          </label>
          <label className="block space-y-1">
            <span className="font-bold uppercase tracking-wider text-black/60">Express Shipping (XOF)</span>
            <input
              type="number"
              value={shipping.expressShippingXof}
              onChange={(e) =>
                setShipping({ ...shipping, expressShippingXof: Number(e.target.value) })
              }
              className="w-full border border-black/25 px-3 py-2 tabular-nums"
            />
          </label>
          <label className="block space-y-1">
            <span className="font-bold uppercase tracking-wider text-black/60">
              Complimentary Shipping Threshold (XOF)
            </span>
            <input
              type="number"
              value={shipping.freeShippingThresholdXof}
              onChange={(e) =>
                setShipping({ ...shipping, freeShippingThresholdXof: Number(e.target.value) })
              }
              className="w-full border border-black/25 px-3 py-2 tabular-nums"
            />
          </label>
          <label className="block space-y-1">
            <span className="font-bold uppercase tracking-wider text-black/60">Support Email</span>
            <input
              value={shipping.supportEmail}
              onChange={(e) => setShipping({ ...shipping, supportEmail: e.target.value })}
              className="w-full border border-black/25 px-3 py-2"
            />
          </label>
          <label className="block space-y-1">
            <span className="font-bold uppercase tracking-wider text-black/60">Support Phone</span>
            <input
              value={shipping.supportPhone}
              onChange={(e) => setShipping({ ...shipping, supportPhone: e.target.value })}
              className="w-full border border-black/25 px-3 py-2"
            />
          </label>
          <button
            type="submit"
            className="px-6 py-2.5 bg-black text-white font-bold uppercase tracking-wider cursor-pointer"
          >
            Save Store Settings
          </button>
        </form>

        <form
          onSubmit={handleGrantAdmin}
          className="border border-black/15 bg-white p-6 space-y-4 text-xs h-fit"
        >
          <h2 className="font-editorial text-2xl text-black">Administrator RBAC</h2>
          <p className="font-light text-black/60 leading-relaxed">
            No public admin registration exists. Only verified administrators can grant access to additional
            Firebase User UIDs.
          </p>
          <label className="block space-y-1">
            <span className="font-bold uppercase tracking-wider text-black/60">Firebase User UID</span>
            <input
              required
              value={newAdminUid}
              onChange={(e) => setNewAdminUid(e.target.value)}
              className="w-full border border-black/25 px-3 py-2"
            />
          </label>
          <label className="block space-y-1">
            <span className="font-bold uppercase tracking-wider text-black/60">Verified Email</span>
            <input
              type="email"
              required
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              className="w-full border border-black/25 px-3 py-2"
            />
          </label>
          <button
            type="submit"
            className="px-6 py-2.5 bg-black text-white font-bold uppercase tracking-wider cursor-pointer"
          >
            Assign Admin Role
          </button>
        </form>
      </div>

      {/* Audit Log */}
      <div className="bg-white p-6 space-y-4">
        <h2 className="font-editorial text-2xl text-black">Administrative Audit Log</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-[11px] font-bold uppercase tracking-[0.14em] text-black/60 bg-black/[0.03]">
                <th className="py-2 pr-4 pl-2">Action</th>
                <th className="py-2 pr-4">Actor</th>
                <th className="py-2 pr-4">Details</th>
                <th className="py-2 text-right pr-2">Time</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.slice(0, 25).map((log, idx) => (
                <tr key={log.id} className={idx % 2 === 1 ? 'bg-black/[0.015]' : ''}>
                  <td className="py-2 pr-4 pl-2 font-bold">{log.action}</td>
                  <td className="py-2 pr-4 font-light">{log.actorEmail}</td>
                  <td className="py-2 pr-4 font-light text-black/75">{log.details}</td>
                  <td className="py-2 text-right font-light text-black/60">
                    {formatTimestamp(log.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
