import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { Promotion } from '../../types/commerce';
import { formatTimestamp, formatXOF } from '../../lib/format';
import { savePromotion } from '../../lib/firestoreService';

interface AdminMarketingProps {
  promotions: Promotion[];
  subscribers: { id: string; email: string; source: string; createdAt?: any }[];
  actorEmail: string;
  onToast: (msg: string, tone?: 'default' | 'error' | 'success') => void;
}

export function AdminMarketing({
  promotions,
  subscribers,
  actorEmail,
  onToast,
}: AdminMarketingProps) {
  const [form, setForm] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 15,
    minOrderXof: 20000,
    maxUses: 100,
    startsAt: '2026-01-01',
    endsAt: '2027-12-31',
    isActive: true,
  });

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) return;
    try {
      await savePromotion(
        null,
        {
          code: form.code.trim().toUpperCase(),
          type: form.type,
          value: Math.round(Number(form.value)),
          minOrderXof: Math.round(Number(form.minOrderXof)),
          maxUses: Math.round(Number(form.maxUses)),
          usedCount: 0,
          startsAt: form.startsAt || null,
          endsAt: form.endsAt || null,
          isActive: form.isActive,
        },
        actorEmail
      );
      setForm({ ...form, code: '' });
      onToast('Promotion code created.', 'success');
    } catch {
      onToast('Failed to create promotion code.', 'error');
    }
  };

  const togglePromo = async (p: Promotion) => {
    await savePromotion(p.id, { ...p, isActive: !p.isActive }, actorEmail);
    onToast(`${p.code} ${!p.isActive ? 'activated' : 'paused'}.`, 'default');
  };

  const exportSubscribers = () => {
    const csv = [
      'Email,Source,Date',
      ...subscribers.map((s) => `${s.email},${s.source},${formatTimestamp(s.createdAt)}`),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mireza_newsletter_subscribers.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-editorial text-3xl text-black">Marketing &amp; Promotions</h1>
        <p className="text-xs font-light text-black/60 mt-0.5">
          Manage discount codes in XOF / percentage, usage caps, validity windows, and newsletter subscribers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <form
          onSubmit={handleCreatePromo}
          className="lg:col-span-5 border border-black/15 bg-white p-6 space-y-4 text-xs h-fit"
        >
          <h2 className="font-editorial text-2xl text-black">New Discount Code</h2>
          <label className="block space-y-1">
            <span className="font-bold uppercase tracking-wider text-black/60">Code *</span>
            <input
              required
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="ATELIER15"
              className="w-full border border-black/25 px-3 py-2 font-bold uppercase"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1">
              <span className="font-bold uppercase tracking-wider text-black/60">Type</span>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                className="w-full border border-black/25 px-3 py-2"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed XOF</option>
              </select>
            </label>
            <label className="block space-y-1">
              <span className="font-bold uppercase tracking-wider text-black/60">Value</span>
              <input
                type="number"
                required
                min={1}
                value={form.value}
                onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                className="w-full border border-black/25 px-3 py-2 tabular-nums"
              />
            </label>
            <label className="block space-y-1">
              <span className="font-bold uppercase tracking-wider text-black/60">Min Order (XOF)</span>
              <input
                type="number"
                min={0}
                value={form.minOrderXof}
                onChange={(e) => setForm({ ...form, minOrderXof: Number(e.target.value) })}
                className="w-full border border-black/25 px-3 py-2 tabular-nums"
              />
            </label>
            <label className="block space-y-1">
              <span className="font-bold uppercase tracking-wider text-black/60">Usage Limit</span>
              <input
                type="number"
                min={0}
                value={form.maxUses}
                onChange={(e) => setForm({ ...form, maxUses: Number(e.target.value) })}
                className="w-full border border-black/25 px-3 py-2 tabular-nums"
              />
            </label>
            <label className="block space-y-1">
              <span className="font-bold uppercase tracking-wider text-black/60">Starts At</span>
              <input
                type="date"
                value={form.startsAt}
                onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                className="w-full border border-black/25 px-3 py-2"
              />
            </label>
            <label className="block space-y-1">
              <span className="font-bold uppercase tracking-wider text-black/60">Ends At</span>
              <input
                type="date"
                value={form.endsAt}
                onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                className="w-full border border-black/25 px-3 py-2"
              />
            </label>
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-black text-white font-bold uppercase tracking-[0.16em] cursor-pointer"
          >
            Create Discount Code
          </button>
        </form>

        <div className="lg:col-span-7 space-y-6">
          <div className="border border-black/15 bg-white p-6 space-y-4">
            <h2 className="font-editorial text-2xl text-black">Active &amp; Scheduled Codes</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-[11px] font-bold uppercase tracking-[0.14em] text-black/60 bg-black/[0.03]">
                    <th className="py-2 pr-4 pl-2">Code</th>
                    <th className="py-2 pr-4">Discount</th>
                    <th className="py-2 pr-4">Min Order</th>
                    <th className="py-2 pr-4 text-right">Uses</th>
                    <th className="py-2 text-right pr-2">State</th>
                  </tr>
                </thead>
                <tbody>
                  {promotions.map((p, idx) => (
                    <tr key={p.id} className={idx % 2 === 1 ? 'bg-black/[0.015]' : ''}>
                      <td className="py-2.5 pr-4 pl-2 font-bold">{p.code}</td>
                      <td className="py-2.5 pr-4 tabular-nums">
                        {p.type === 'percentage' ? `${p.value}%` : formatXOF(p.value)}
                      </td>
                      <td className="py-2.5 pr-4 tabular-nums font-light">{formatXOF(p.minOrderXof)}</td>
                      <td className="py-2.5 pr-4 text-right tabular-nums">
                        {p.usedCount} / {p.maxUses || '∞'}
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => togglePromo(p)}
                          className={`px-2.5 py-1 font-bold text-[10px] uppercase cursor-pointer ${
                            p.isActive
                              ? 'bg-black text-white'
                              : 'bg-black/10 text-black/60'
                          }`}
                        >
                          {p.isActive ? 'Active' : 'Paused'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border border-black/15 bg-white p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-editorial text-2xl text-black">
                Newsletter Subscribers ({subscribers.length})
              </h2>
              {subscribers.length > 0 && (
                <button
                  type="button"
                  onClick={exportSubscribers}
                  className="px-3 py-1.5 border border-black/25 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              )}
            </div>
            {subscribers.length === 0 ? (
              <p className="text-xs font-light text-black/60">No subscribers recorded yet.</p>
            ) : (
              <div className="space-y-1 text-xs max-h-60 overflow-y-auto">
                {subscribers.map((s, idx) => (
                  <div key={s.id} className={`py-2 px-2 flex justify-between ${idx % 2 === 1 ? 'bg-black/[0.015]' : ''}`}>
                    <span className="font-light">{s.email}</span>
                    <span className="font-light text-black/60">{formatTimestamp(s.createdAt)}</span>
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
