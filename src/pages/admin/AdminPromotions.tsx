import React, { useState } from 'react';
import { Plus, Trash2, Download, X } from 'lucide-react';
import { Promotion } from '../../types/commerce';
import { useLanguage } from '../../context/LanguageContext';
import { formatXOF } from '../../lib/format';
import { deletePromotionAdmin, savePromotion } from '../../lib/firestoreService';

interface AdminPromotionsProps {
  promotions: Promotion[];
  subscribers: any[];
  actorEmail: string;
  onToast: (msg: string, tone?: 'default' | 'error' | 'success') => void;
}

export function AdminPromotions({
  promotions,
  subscribers,
  actorEmail,
  onToast,
}: AdminPromotionsProps) {
  const { tr } = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 15,
    minOrderXof: 25000,
    maxUses: 200,
    endsAt: '',
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = form.code.trim().toUpperCase();
    if (!cleanCode) return;
    setSaving(true);
    try {
      await savePromotion(
        null,
        {
          code: cleanCode,
          type: form.type,
          value: Math.max(1, Math.round(Number(form.value) || 1)),
          minOrderXof: Math.max(0, Math.round(Number(form.minOrderXof) || 0)),
          maxUses: Math.max(0, Math.round(Number(form.maxUses) || 0)),
          usedCount: 0,
          startsAt: new Date().toISOString().slice(0, 10),
          endsAt: form.endsAt || null,
          isActive: true,
        },
        actorEmail
      );
      setModalOpen(false);
      setForm({ code: '', type: 'percentage', value: 15, minOrderXof: 25000, maxUses: 200, endsAt: '' });
      onToast(tr(`Code promo ${cleanCode} créé.`, `Discount code ${cleanCode} created.`), 'success');
    } catch (err: any) {
      onToast(err?.message || tr('Création impossible.', 'Failed to create promotion.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (promo: Promotion) => {
    try {
      await savePromotion(
        promo.id,
        {
          code: promo.code,
          type: promo.type,
          value: Math.max(1, Math.round(promo.value)),
          minOrderXof: Math.max(0, Math.round(promo.minOrderXof || 0)),
          maxUses: Math.max(0, Math.round(promo.maxUses || 0)),
          usedCount: Math.max(0, Math.round(promo.usedCount || 0)),
          startsAt: promo.startsAt ?? null,
          endsAt: promo.endsAt ?? null,
          isActive: !promo.isActive,
        },
        actorEmail
      );
      onToast(
        !promo.isActive
          ? tr(`Code ${promo.code} activé.`, `Code ${promo.code} activated.`)
          : tr(`Code ${promo.code} mis en pause.`, `Code ${promo.code} paused.`),
        'success'
      );
    } catch (err: any) {
      onToast(err?.message || tr('Mise à jour impossible.', 'Update failed.'), 'error');
    }
  };

  const handleDelete = async (promo: Promotion) => {
    try {
      await deletePromotionAdmin(promo.id, actorEmail);
      onToast(tr(`Code ${promo.code} supprimé.`, `Code ${promo.code} deleted.`), 'success');
    } catch (err: any) {
      onToast(err?.message || tr('Suppression impossible.', 'Delete failed.'), 'error');
    }
  };

  const exportSubscribers = () => {
    const csv = ['Email,Source', ...subscribers.map((s) => `${s.email},${s.source || 'storefront'}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kikijones_newsletter_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-black">
            {tr('Promotions', 'Promotions')}
          </h1>
          <p className="text-xs text-black/55 mt-0.5">
            {tr('Codes de réduction actifs et abonnés à la newsletter.', 'Active discount codes and newsletter subscribers.')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-black text-white text-xs font-medium hover:bg-black/85 inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{tr('Créer un code promo', 'Create discount')}</span>
        </button>
      </div>

      {/* Discount Codes Table */}
      <div className="bg-white border border-[#E8E8E8]">
        {promotions.length === 0 ? (
          <div className="p-10 text-center text-xs text-black/50">
            {tr('Aucun code promo configuré.', 'No discount codes created yet.')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[11px] font-medium text-black/45 border-b border-[#E8E8E8]">
                  <th className="py-3 px-4">{tr('Code', 'Code')}</th>
                  <th className="py-3 px-3">{tr('Réduction', 'Discount')}</th>
                  <th className="py-3 px-3">{tr('Minimum', 'Min. order')}</th>
                  <th className="py-3 px-3">{tr('Utilisations', 'Usage')}</th>
                  <th className="py-3 px-3">{tr('Expiration', 'Expires')}</th>
                  <th className="py-3 px-3">{tr('Statut', 'Status')}</th>
                  <th className="py-3 px-4 text-right">{tr('Actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0F0]">
                {promotions.map((promo) => (
                  <tr key={promo.id} className="hover:bg-[#FAFAFA]">
                    <td className="py-3 px-4 font-semibold tracking-wider text-black">{promo.code}</td>
                    <td className="py-3 px-3 tabular-nums font-medium text-black">
                      {promo.type === 'percentage' ? `-${promo.value}%` : `-${formatXOF(promo.value)}`}
                    </td>
                    <td className="py-3 px-3 tabular-nums text-black/65">
                      {promo.minOrderXof > 0 ? formatXOF(promo.minOrderXof) : tr('Aucun', 'None')}
                    </td>
                    <td className="py-3 px-3 tabular-nums text-black/65">
                      {promo.usedCount || 0} / {promo.maxUses === 0 ? '∞' : promo.maxUses}
                    </td>
                    <td className="py-3 px-3 tabular-nums text-black/55">
                      {promo.endsAt || tr('Sans limite', 'No expiry')}
                    </td>
                    <td className="py-3 px-3">
                      <button
                        type="button"
                        onClick={() => handleToggle(promo)}
                        className={`px-2 py-0.5 text-[10.5px] border cursor-pointer ${
                          promo.isActive
                            ? 'bg-black text-white border-black'
                            : 'bg-[#F5F5F5] text-black/65 border-[#E8E8E8]'
                        }`}
                      >
                        {promo.isActive ? tr('Actif', 'Active') : tr('En pause', 'Paused')}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(promo)}
                        className="p-1.5 text-black/45 hover:text-black cursor-pointer"
                        title={tr('Supprimer', 'Delete')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Compact Newsletter Bar */}
      <div className="bg-white border border-[#E8E8E8] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-black">
            {tr('Abonnés Newsletter', 'Newsletter subscribers')}
          </h2>
          <p className="text-xs text-black/55 mt-0.5 tabular-nums">
            {subscribers.length} {tr('contacts enregistrés', 'registered contacts')}
          </p>
        </div>
        <button
          type="button"
          disabled={subscribers.length === 0}
          onClick={exportSubscribers}
          className="px-4 py-2 border border-[#E8E8E8] hover:border-black disabled:opacity-40 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{tr('Exporter CSV', 'Export CSV')}</span>
        </button>
      </div>

      {/* Create Promotion Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/35" onClick={() => setModalOpen(false)} />
          <form
            onSubmit={handleCreate}
            className="relative bg-white border border-[#E8E8E8] w-full max-w-md p-6 space-y-4 z-10 text-xs"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E8E8]">
              <h2 className="text-sm font-semibold text-black">
                {tr('Nouveau code promo', 'New discount code')}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 text-black/60 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <label className="block space-y-1">
              <span className="font-medium text-black">{tr('Code', 'Code')}</span>
              <input
                type="text"
                required
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="KIKI15"
                className="w-full border border-[#E8E8E8] focus:border-black px-3 py-2 uppercase tracking-wider focus:outline-none"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1">
                <span className="text-black/60">{tr('Type', 'Type')}</span>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                  className="w-full border border-[#E8E8E8] focus:border-black px-3 py-2 bg-white focus:outline-none"
                >
                  <option value="percentage">{tr('Pourcentage (%)', 'Percentage (%)')}</option>
                  <option value="fixed">{tr('Montant fixe (XOF)', 'Fixed amount (XOF)')}</option>
                </select>
              </label>

              <label className="block space-y-1">
                <span className="text-black/60">{tr('Valeur', 'Value')}</span>
                <input
                  type="number"
                  min={1}
                  required
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                  className="w-full border border-[#E8E8E8] focus:border-black px-3 py-2 tabular-nums focus:outline-none"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1">
                <span className="text-black/60">{tr('Minimum commande (XOF)', 'Min order (XOF)')}</span>
                <input
                  type="number"
                  min={0}
                  value={form.minOrderXof}
                  onChange={(e) => setForm({ ...form, minOrderXof: Number(e.target.value) })}
                  className="w-full border border-[#E8E8E8] focus:border-black px-3 py-2 tabular-nums focus:outline-none"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-black/60">{tr('Limite d’utilisations (0 = illimité)', 'Usage limit (0 = unlimited)')}</span>
                <input
                  type="number"
                  min={0}
                  value={form.maxUses}
                  onChange={(e) => setForm({ ...form, maxUses: Number(e.target.value) })}
                  className="w-full border border-[#E8E8E8] focus:border-black px-3 py-2 tabular-nums focus:outline-none"
                />
              </label>
            </div>

            <label className="block space-y-1">
              <span className="text-black/60">{tr('Date d’expiration (optionnel)', 'Expiration date (optional)')}</span>
              <input
                type="date"
                value={form.endsAt}
                onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                className="w-full border border-[#E8E8E8] focus:border-black px-3 py-2 tabular-nums focus:outline-none"
              />
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 border border-[#E8E8E8] hover:border-black cursor-pointer"
              >
                {tr('Annuler', 'Cancel')}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-black text-white font-medium hover:bg-black/85 disabled:opacity-50 cursor-pointer"
              >
                {saving ? tr('Création...', 'Creating...') : tr('Créer', 'Create')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
