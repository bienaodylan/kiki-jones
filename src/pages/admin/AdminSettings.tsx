import React, { useEffect, useState } from 'react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { db } from '../../lib/firebase';
import { AuditLog, PaymentProviderStatus, StorefrontConfig } from '../../types/commerce';
import { useLanguage } from '../../context/LanguageContext';
import { formatTimestamp, sanitizeId } from '../../lib/format';
import { logAudit, saveStorefrontConfig } from '../../lib/firestoreService';

interface AdminSettingsProps {
  config: StorefrontConfig;
  auditLogs: AuditLog[];
  actorEmail: string;
  onToast: (msg: string, tone?: 'default' | 'error' | 'success') => void;
}

export function AdminSettings({
  config,
  auditLogs,
  actorEmail,
  onToast,
}: AdminSettingsProps) {
  const { tr } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [providers, setProviders] = useState<PaymentProviderStatus[]>([]);
  const [showAudit, setShowAudit] = useState(false);

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

  useEffect(() => {
    fetch('/api/payments/providers')
      .then((r) => r.json())
      .then((d) => setProviders(Array.isArray(d.providers) ? d.providers : []))
      .catch(() => setProviders([]));
  }, []);

  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveStorefrontConfig({ ...config, ...shipping }, actorEmail);
      onToast(tr('Paramètres enregistrés.', 'Store settings saved.'), 'success');
    } catch (err: any) {
      onToast(err?.message || tr('Échec de l’enregistrement.', 'Failed to save settings.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleGrantAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminUid.trim() || !newAdminEmail.trim()) return;
    setSaving(true);
    try {
      const cleanUid = sanitizeId(newAdminUid.trim());
      await setDoc(doc(db, 'admins', cleanUid), {
        uid: cleanUid,
        email: newAdminEmail.trim().toLowerCase(),
        role: 'operations',
        createdAt: serverTimestamp(),
      });
      await logAudit(actorEmail, 'GRANT_ADMIN_ROLE', 'admin', cleanUid, newAdminEmail.trim().toLowerCase());
      setNewAdminUid('');
      setNewAdminEmail('');
      onToast(tr('Accès administrateur attribué.', 'Administrator access granted.'), 'success');
    } catch (err: any) {
      onToast(err?.message || tr('Attribution impossible.', 'Failed to grant admin role.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-black">
          {tr('Paramètres', 'Settings')}
        </h1>
        <p className="text-xs text-black/55 mt-0.5">
          {tr('Livraison, moyens de paiement et accès administrateurs.', 'Shipping rates, payment methods, and administrator access.')}
        </p>
      </div>

      {/* Shipping & Contact */}
      <form onSubmit={handleSaveStore} className="bg-white border border-[#E8E8E8] p-6 space-y-5 text-xs">
        <div>
          <h2 className="text-sm font-semibold text-black">
            {tr('Livraison & Contact (XOF)', 'Shipping & Contact (XOF)')}
          </h2>
          <p className="text-[11px] text-black/50 mt-0.5">
            {tr('Tarifs appliqués automatiquement lors du paiement.', 'Rates applied automatically at checkout.')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label className="block space-y-1">
            <span className="text-black/60">{tr('Livraison standard (XOF)', 'Standard shipping (XOF)')}</span>
            <input
              type="number"
              min={0}
              value={shipping.standardShippingXof}
              onChange={(e) => setShipping({ ...shipping, standardShippingXof: Number(e.target.value) })}
              className="w-full border border-[#E8E8E8] focus:border-black px-3 py-2 tabular-nums focus:outline-none"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-black/60">{tr('Livraison express (XOF)', 'Express shipping (XOF)')}</span>
            <input
              type="number"
              min={0}
              value={shipping.expressShippingXof}
              onChange={(e) => setShipping({ ...shipping, expressShippingXof: Number(e.target.value) })}
              className="w-full border border-[#E8E8E8] focus:border-black px-3 py-2 tabular-nums focus:outline-none"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-black/60">{tr('Seuil livraison offerte (XOF)', 'Free shipping threshold (XOF)')}</span>
            <input
              type="number"
              min={0}
              value={shipping.freeShippingThresholdXof}
              onChange={(e) => setShipping({ ...shipping, freeShippingThresholdXof: Number(e.target.value) })}
              className="w-full border border-[#E8E8E8] focus:border-black px-3 py-2 tabular-nums focus:outline-none"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block space-y-1">
            <span className="text-black/60">{tr('Email support client', 'Support email')}</span>
            <input
              type="email"
              value={shipping.supportEmail}
              onChange={(e) => setShipping({ ...shipping, supportEmail: e.target.value })}
              className="w-full border border-[#E8E8E8] focus:border-black px-3 py-2 focus:outline-none"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-black/60">{tr('Téléphone / WhatsApp', 'Phone / WhatsApp')}</span>
            <input
              type="text"
              value={shipping.supportPhone}
              onChange={(e) => setShipping({ ...shipping, supportPhone: e.target.value })}
              className="w-full border border-[#E8E8E8] focus:border-black px-3 py-2 focus:outline-none"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 bg-black text-white font-medium hover:bg-black/85 disabled:opacity-50 cursor-pointer"
        >
          {saving ? tr('Enregistrement...', 'Saving...') : tr('Enregistrer', 'Save settings')}
        </button>
      </form>

      {/* Payment Providers */}
      <div className="bg-white border border-[#E8E8E8] p-6 space-y-4 text-xs">
        <div>
          <h2 className="text-sm font-semibold text-black">
            {tr('Passerelles de paiement', 'Payment providers')}
          </h2>
          <p className="text-[11px] text-black/50 mt-0.5">
            {tr('Statut de configuration des fournisseurs Mobile Money & Cartes.', 'Configuration status for Mobile Money & Card gateways.')}
          </p>
        </div>

        <div className="divide-y divide-[#F0F0F0] border border-[#E8E8E8]">
          {providers.map((p) => (
            <div key={p.id} className="px-4 py-3 flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-black">{p.name}</p>
                <p className="text-[11px] text-black/45">{p.region}</p>
              </div>
              <span
                className={`px-2 py-0.5 text-[10.5px] border ${
                  p.configured
                    ? 'bg-black text-white border-black'
                    : 'bg-[#F5F5F5] text-black/65 border-[#E8E8E8]'
                }`}
              >
                {p.configured ? tr('Connecté', 'Connected') : tr('Clés requises', 'Keys required')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Admin Access */}
      <form onSubmit={handleGrantAdmin} className="bg-white border border-[#E8E8E8] p-6 space-y-4 text-xs">
        <div>
          <h2 className="text-sm font-semibold text-black">
            {tr('Accès administrateurs', 'Administrator access')}
          </h2>
          <p className="text-[11px] text-black/50 mt-0.5">
            {tr('Ajoutez un collaborateur autorisé via son identifiant Firebase UID.', 'Grant console access to a team member using their Firebase User UID.')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block space-y-1">
            <span className="text-black/60">Firebase User UID</span>
            <input
              type="text"
              required
              value={newAdminUid}
              onChange={(e) => setNewAdminUid(e.target.value)}
              className="w-full border border-[#E8E8E8] focus:border-black px-3 py-2 focus:outline-none"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-black/60">{tr('Email vérifié', 'Verified email')}</span>
            <input
              type="email"
              required
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              className="w-full border border-[#E8E8E8] focus:border-black px-3 py-2 focus:outline-none"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 border border-black bg-white hover:bg-black hover:text-white font-medium transition-colors cursor-pointer"
        >
          {tr('Ajouter un administrateur', 'Add administrator')}
        </button>
      </form>

      {/* Collapsible Audit Trail */}
      <div className="bg-white border border-[#E8E8E8]">
        <button
          type="button"
          onClick={() => setShowAudit((v) => !v)}
          className="w-full px-6 py-4 flex items-center justify-between text-xs font-semibold text-black cursor-pointer"
        >
          <span>
            {tr('Journal d’activité récent', 'Recent activity log')} ({auditLogs.length})
          </span>
          {showAudit ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {showAudit && (
          <div className="border-t border-[#E8E8E8] overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[11px] font-medium text-black/45 border-b border-[#E8E8E8]">
                  <th className="py-2.5 px-6">{tr('Action', 'Action')}</th>
                  <th className="py-2.5 px-3">{tr('Utilisateur', 'Actor')}</th>
                  <th className="py-2.5 px-3">{tr('Détails', 'Details')}</th>
                  <th className="py-2.5 px-6 text-right">{tr('Date', 'Time')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0F0]">
                {auditLogs.slice(0, 20).map((log) => (
                  <tr key={log.id}>
                    <td className="py-2.5 px-6 font-medium text-black">{log.action}</td>
                    <td className="py-2.5 px-3 text-black/60">{log.actorEmail}</td>
                    <td className="py-2.5 px-3 text-black/65">{log.details}</td>
                    <td className="py-2.5 px-6 text-right text-black/45 tabular-nums whitespace-nowrap">
                      {formatTimestamp(log.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
