import React, { useEffect, useMemo, useState } from 'react';
import { Search, X, Check } from 'lucide-react';
import { FulfillmentStatus, Order, PaymentStatus } from '../../types/commerce';
import { useLanguage } from '../../context/LanguageContext';
import { formatTimestamp, formatXOF } from '../../lib/format';
import { recordRefundAdmin, updateOrderAdmin } from '../../lib/firestoreService';

interface AdminOrdersProps {
  orders: Order[];
  actorEmail: string;
  initialOrderId?: string | null;
  onClearInitialOrder?: () => void;
  onToast: (msg: string, tone?: 'default' | 'error' | 'success') => void;
}

type OrderTabFilter = 'all' | 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export function AdminOrders({
  orders,
  actorEmail,
  initialOrderId,
  onClearInitialOrder,
  onToast,
}: AdminOrdersProps) {
  const { tr } = useLanguage();
  const [statusTab, setStatusTab] = useState<OrderTabFilter>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7d' | '30d'>('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(initialOrderId || null);

  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');
  const [fulfillmentStatus, setFulfillmentStatus] = useState<FulfillmentStatus>('unfulfilled');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const [showRefund, setShowRefund] = useState(false);
  const [refundAmount, setRefundAmount] = useState(0);
  const [refundReason, setRefundReason] = useState('');

  useEffect(() => {
    if (initialOrderId) {
      setSelectedId(initialOrderId);
      onClearInitialOrder?.();
    }
  }, [initialOrderId, onClearInitialOrder]);

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedId) || null,
    [orders, selectedId]
  );

  useEffect(() => {
    if (!selectedOrder) return;
    setPaymentStatus(selectedOrder.paymentStatus);
    setFulfillmentStatus(selectedOrder.fulfillmentStatus);
    setTrackingNumber(selectedOrder.trackingNumber || '');
    setNotes(selectedOrder.notes || '');
    setRefundAmount(selectedOrder.totalXof || 0);
    setRefundReason('');
    setShowRefund(false);
  }, [selectedOrder]);

  const filtered = useMemo(() => {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    return [...orders]
      .sort((a, b) => {
        const ta = a.createdAt?.toMillis?.() || new Date(a.createdAt || 0).getTime() || 0;
        const tb = b.createdAt?.toMillis?.() || new Date(b.createdAt || 0).getTime() || 0;
        return tb - ta;
      })
      .filter((o) => {
        if (statusTab === 'pending' && o.fulfillmentStatus !== 'unfulfilled') return false;
        if (statusTab === 'paid' && o.paymentStatus !== 'paid') return false;
        if (statusTab === 'processing' && o.fulfillmentStatus !== 'processing') return false;
        if (statusTab === 'shipped' && o.fulfillmentStatus !== 'shipped') return false;
        if (statusTab === 'delivered' && o.fulfillmentStatus !== 'delivered') return false;
        if (statusTab === 'cancelled' && o.fulfillmentStatus !== 'cancelled') return false;

        if (dateFilter !== 'all') {
          const ts = o.createdAt?.toMillis?.() || new Date(o.createdAt || 0).getTime() || 0;
          const cutoff =
            dateFilter === 'today' ? now - dayMs : dateFilter === '7d' ? now - 7 * dayMs : now - 30 * dayMs;
          if (ts < cutoff) return false;
        }

        if (search.trim()) {
          const q = search.trim().toLowerCase();
          return (
            o.orderNumber.toLowerCase().includes(q) ||
            o.customerName.toLowerCase().includes(q) ||
            o.customerEmail.toLowerCase().includes(q) ||
            (o.customerPhone || '').toLowerCase().includes(q)
          );
        }
        return true;
      });
  }, [orders, statusTab, dateFilter, search]);

  const paymentLabel = (s: PaymentStatus) => {
    const map: Record<PaymentStatus, [string, string]> = {
      pending: ['En attente', 'Pending'],
      awaiting_verification: ['À vérifier', 'Awaiting check'],
      paid: ['Payée', 'Paid'],
      failed: ['Échouée', 'Failed'],
      refunded: ['Remboursée', 'Refunded'],
    };
    return tr(map[s][0], map[s][1]);
  };

  const fulfillmentLabel = (s: FulfillmentStatus) => {
    const map: Record<FulfillmentStatus, [string, string]> = {
      unfulfilled: ['En attente', 'Pending'],
      processing: ['En préparation', 'Processing'],
      shipped: ['Expédiée', 'Shipped'],
      delivered: ['Livrée', 'Delivered'],
      cancelled: ['Annulée', 'Cancelled'],
    };
    return tr(map[s][0], map[s][1]);
  };

  const handleSaveOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setSaving(true);
    try {
      await updateOrderAdmin(
        selectedOrder.id,
        {
          paymentStatus,
          fulfillmentStatus,
          trackingNumber: trackingNumber.trim() || null,
          notes: notes.trim() || null,
        },
        actorEmail
      );
      onToast(
        tr(`Commande ${selectedOrder.orderNumber} mise à jour.`, `Order ${selectedOrder.orderNumber} updated.`),
        'success'
      );
    } catch (err: any) {
      onToast(err?.message || tr('Échec de la mise à jour.', 'Update failed.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || refundAmount <= 0) return;
    setSaving(true);
    try {
      await recordRefundAdmin(
        selectedOrder.id,
        refundAmount,
        refundReason.trim() || tr('Remboursement administrateur', 'Administrator refund'),
        actorEmail
      );
      setShowRefund(false);
      onToast(tr('Remboursement enregistré.', 'Refund recorded.'), 'success');
    } catch (err: any) {
      onToast(err?.message || tr('Échec du remboursement.', 'Refund failed.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const tabs: { key: OrderTabFilter; label: string }[] = [
    { key: 'all', label: tr('Toutes', 'All') },
    { key: 'pending', label: tr('En attente', 'Pending') },
    { key: 'paid', label: tr('Payées', 'Paid') },
    { key: 'processing', label: tr('En préparation', 'Processing') },
    { key: 'shipped', label: tr('Expédiées', 'Shipped') },
    { key: 'delivered', label: tr('Livrées', 'Delivered') },
    { key: 'cancelled', label: tr('Annulées', 'Cancelled') },
  ];

  const timelineSteps = (order: Order) => {
    const isCancelled = order.fulfillmentStatus === 'cancelled';
    return [
      { label: tr('Commande créée', 'Order placed'), done: true },
      { label: tr('Paiement validé', 'Payment confirmed'), done: order.paymentStatus === 'paid' },
      {
        label: tr('En préparation', 'Processing'),
        done: ['processing', 'shipped', 'delivered'].includes(order.fulfillmentStatus),
      },
      {
        label: isCancelled ? tr('Annulée', 'Cancelled') : tr('Livrée', 'Delivered'),
        done: order.fulfillmentStatus === 'delivered' || isCancelled,
      },
    ];
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-black">
            {tr('Commandes', 'Orders')}
          </h1>
          <p className="text-xs text-black/55 mt-0.5 tabular-nums">
            {orders.length} {tr('commandes au total', 'total orders')}
          </p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white border border-[#E8E8E8]">
        <div className="flex items-center overflow-x-auto border-b border-[#E8E8E8] px-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setStatusTab(t.key)}
              className={`px-3.5 py-3 text-xs whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                statusTab === t.key
                  ? 'border-black text-black font-semibold'
                  : 'border-transparent text-black/55 hover:text-black'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-3.5 flex flex-col sm:flex-row gap-3 border-b border-[#E8E8E8]">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-black/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={tr(
                'Rechercher par n° commande, nom, email ou téléphone...',
                'Search by order #, customer name, email, or phone...'
              )}
              className="w-full pl-9 pr-3 py-2 text-xs border border-[#E8E8E8] focus:border-black focus:outline-none bg-white"
            />
          </div>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
            className="px-3 py-2 text-xs border border-[#E8E8E8] focus:border-black focus:outline-none bg-white"
          >
            <option value="all">{tr('Toutes les dates', 'All dates')}</option>
            <option value="today">{tr('Dernières 24h', 'Last 24h')}</option>
            <option value="7d">{tr('7 derniers jours', 'Last 7 days')}</option>
            <option value="30d">{tr('30 derniers jours', 'Last 30 days')}</option>
          </select>
        </div>

        {/* Orders Table */}
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-xs text-black/50">
            {tr('Aucune commande ne correspond à ces filtres.', 'No orders match the current filters.')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[11px] font-medium text-black/45 border-b border-[#E8E8E8]">
                  <th className="py-3 px-4">{tr('Commande', 'Order')}</th>
                  <th className="py-3 px-3">{tr('Client', 'Customer')}</th>
                  <th className="py-3 px-3">{tr('Date', 'Date')}</th>
                  <th className="py-3 px-3">{tr('Articles', 'Items')}</th>
                  <th className="py-3 px-3">{tr('Paiement', 'Payment')}</th>
                  <th className="py-3 px-3">{tr('Livraison', 'Fulfillment')}</th>
                  <th className="py-3 px-4 text-right">{tr('Total', 'Total')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0F0]">
                {filtered.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => setSelectedId(order.id)}
                    className={`hover:bg-[#FAFAFA] cursor-pointer transition-colors ${
                      selectedId === order.id ? 'bg-[#F5F5F5]' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-semibold text-black tabular-nums">
                      {order.orderNumber}
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-medium text-black">{order.customerName}</p>
                      <p className="text-[11px] text-black/50">{order.customerEmail}</p>
                    </td>
                    <td className="py-3 px-3 text-black/60 tabular-nums whitespace-nowrap">
                      {formatTimestamp(order.createdAt)}
                    </td>
                    <td className="py-3 px-3 text-black/75 tabular-nums">
                      {order.items.reduce((s, i) => s + (i.quantity || 1), 0)}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10.5px] border ${
                          order.paymentStatus === 'paid'
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-black/75 border-[#E8E8E8]'
                        }`}
                      >
                        {paymentLabel(order.paymentStatus)}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-block px-2 py-0.5 text-[10.5px] border border-[#E8E8E8] bg-[#F5F5F5] text-black/80">
                        {fulfillmentLabel(order.fulfillmentStatus)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold tabular-nums text-black whitespace-nowrap">
                      {formatXOF(order.totalXof)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-Over Order Detail Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/35" onClick={() => setSelectedId(null)} />
          <aside className="relative w-full max-w-xl bg-white h-full border-l border-[#E8E8E8] flex flex-col z-10 overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E8E8E8] flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-black tabular-nums">
                  {selectedOrder.orderNumber}
                </h2>
                <p className="text-[11px] text-black/50 tabular-nums">
                  {formatTimestamp(selectedOrder.createdAt)} &middot; {selectedOrder.paymentMethod.replace('_', ' ').toUpperCase()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="p-2 text-black/60 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Order Timeline */}
              <div className="grid grid-cols-4 gap-2">
                {timelineSteps(selectedOrder).map((step, i) => (
                  <div key={i} className="space-y-1.5">
                    <div
                      className={`h-1 w-full ${step.done ? 'bg-black' : 'bg-[#E8E8E8]'}`}
                    />
                    <div className="flex items-center gap-1 text-[10.5px]">
                      {step.done && <Check className="w-3 h-3 text-black shrink-0" />}
                      <span className={step.done ? 'font-medium text-black' : 'text-black/45'}>
                        {step.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Customer & Shipping */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="border border-[#E8E8E8] p-4 space-y-1">
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-black/45">
                    {tr('Client', 'Customer')}
                  </p>
                  <p className="font-semibold text-black">{selectedOrder.customerName}</p>
                  <p className="text-black/65">{selectedOrder.customerEmail}</p>
                  <p className="text-black/65 tabular-nums">{selectedOrder.customerPhone}</p>
                </div>

                <div className="border border-[#E8E8E8] p-4 space-y-1">
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-black/45">
                    {tr('Livraison', 'Shipping')}
                  </p>
                  <p className="font-semibold text-black">{selectedOrder.shippingAddress.recipientName}</p>
                  <p className="text-black/65">{selectedOrder.shippingAddress.street}</p>
                  <p className="text-black/65">
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.country}
                  </p>
                  <p className="text-[11px] text-black/45 pt-0.5">{selectedOrder.deliveryMethod}</p>
                </div>
              </div>

              {/* Line Items */}
              <div className="border border-[#E8E8E8]">
                <div className="px-4 py-3 border-b border-[#E8E8E8] text-[11px] font-semibold uppercase tracking-[0.1em] text-black/50">
                  {tr('Articles commandés', 'Ordered items')} ({selectedOrder.items.length})
                </div>
                <div className="divide-y divide-[#F0F0F0]">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3.5 flex items-center gap-3 text-xs">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="w-11 h-14 object-cover bg-[#F5F5F5] shrink-0"
                        />
                      ) : (
                        <div className="w-11 h-14 bg-[#F5F5F5] shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-black truncate">{item.productName}</p>
                        <p className="text-[11px] text-black/50">
                          {item.color} / {item.size} &middot; {item.sku}
                        </p>
                      </div>
                      <div className="text-right tabular-nums shrink-0">
                        <p className="font-medium text-black">
                          {formatXOF(item.unitPriceXof * item.quantity)}
                        </p>
                        <p className="text-[11px] text-black/45">
                          {item.quantity} &times; {formatXOF(item.unitPriceXof)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 border-t border-[#E8E8E8] bg-[#FAFAFA] space-y-1.5 text-xs tabular-nums">
                  <div className="flex justify-between text-black/65">
                    <span>{tr('Sous-total', 'Subtotal')}</span>
                    <span>{formatXOF(selectedOrder.subtotalXof)}</span>
                  </div>
                  {selectedOrder.discountXof > 0 && (
                    <div className="flex justify-between text-black/65">
                      <span>
                        {tr('Remise', 'Discount')} {selectedOrder.promoCode ? `(${selectedOrder.promoCode})` : ''}
                      </span>
                      <span>-{formatXOF(selectedOrder.discountXof)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-black/65">
                    <span>{tr('Livraison', 'Shipping')}</span>
                    <span>
                      {selectedOrder.shippingFeeXof === 0
                        ? tr('Offerte', 'Free')
                        : formatXOF(selectedOrder.shippingFeeXof)}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold text-black pt-1.5 border-t border-[#E8E8E8]">
                    <span>{tr('Total', 'Total')}</span>
                    <span>{formatXOF(selectedOrder.totalXof)}</span>
                  </div>
                </div>
              </div>

              {/* Status Management Form */}
              <form onSubmit={handleSaveOrder} className="border border-[#E8E8E8] p-4 space-y-4 text-xs">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-black/50">
                  {tr('Gestion de la commande', 'Order management')}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="block space-y-1">
                    <span className="text-black/60">{tr('Statut du paiement', 'Payment status')}</span>
                    <select
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                      className="w-full border border-[#E8E8E8] focus:border-black px-3 py-2 bg-white focus:outline-none"
                    >
                      <option value="pending">{tr('En attente', 'Pending')}</option>
                      <option value="awaiting_verification">{tr('À vérifier', 'Awaiting check')}</option>
                      <option value="paid">{tr('Payée', 'Paid')}</option>
                      <option value="failed">{tr('Échouée', 'Failed')}</option>
                      <option value="refunded">{tr('Remboursée', 'Refunded')}</option>
                    </select>
                  </label>

                  <label className="block space-y-1">
                    <span className="text-black/60">{tr('Statut de livraison', 'Fulfillment status')}</span>
                    <select
                      value={fulfillmentStatus}
                      onChange={(e) => setFulfillmentStatus(e.target.value as FulfillmentStatus)}
                      className="w-full border border-[#E8E8E8] focus:border-black px-3 py-2 bg-white focus:outline-none"
                    >
                      <option value="unfulfilled">{tr('En attente', 'Pending')}</option>
                      <option value="processing">{tr('En préparation', 'Processing')}</option>
                      <option value="shipped">{tr('Expédiée', 'Shipped')}</option>
                      <option value="delivered">{tr('Livrée', 'Delivered')}</option>
                      <option value="cancelled">{tr('Annulée', 'Cancelled')}</option>
                    </select>
                  </label>
                </div>

                <label className="block space-y-1">
                  <span className="text-black/60">{tr('Numéro de suivi', 'Tracking number')}</span>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder={tr('Ex : ABJ-EXP-84920', 'e.g. ABJ-EXP-84920')}
                    className="w-full border border-[#E8E8E8] focus:border-black px-3 py-2 focus:outline-none"
                  />
                </label>

                <label className="block space-y-1">
                  <span className="text-black/60">{tr('Note interne', 'Internal note')}</span>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full border border-[#E8E8E8] focus:border-black px-3 py-2 focus:outline-none resize-none"
                  />
                </label>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 bg-black text-white text-xs font-medium hover:bg-black/85 disabled:opacity-50 cursor-pointer"
                  >
                    {saving ? tr('Enregistrement...', 'Saving...') : tr('Enregistrer les modifications', 'Save changes')}
                  </button>

                  {selectedOrder.paymentStatus !== 'refunded' && (
                    <button
                      type="button"
                      onClick={() => setShowRefund((v) => !v)}
                      className="px-3.5 py-2 border border-[#E8E8E8] hover:border-black text-xs text-black/75 hover:text-black cursor-pointer"
                    >
                      {tr('Rembourser', 'Refund')}
                    </button>
                  )}
                </div>
              </form>

              {showRefund && (
                <form onSubmit={handleRefund} className="border border-black p-4 space-y-3 text-xs">
                  <p className="font-semibold text-black">
                    {tr('Enregistrer un remboursement', 'Record a refund')}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="block space-y-1">
                      <span className="text-black/60">{tr('Montant (XOF)', 'Amount (XOF)')}</span>
                      <input
                        type="number"
                        min={1}
                        max={selectedOrder.totalXof}
                        value={refundAmount}
                        onChange={(e) => setRefundAmount(Number(e.target.value))}
                        className="w-full border border-[#E8E8E8] px-3 py-2 tabular-nums focus:border-black focus:outline-none"
                      />
                    </label>
                    <label className="block space-y-1">
                      <span className="text-black/60">{tr('Motif', 'Reason')}</span>
                      <input
                        type="text"
                        required
                        value={refundReason}
                        onChange={(e) => setRefundReason(e.target.value)}
                        placeholder={tr('Ex : Retour client', 'e.g. Customer return')}
                        className="w-full border border-[#E8E8E8] px-3 py-2 focus:border-black focus:outline-none"
                      />
                    </label>
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-black text-white text-xs font-medium cursor-pointer"
                  >
                    {tr('Confirmer le remboursement', 'Confirm refund')}
                  </button>
                </form>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
