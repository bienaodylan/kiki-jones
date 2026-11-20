import React, { useState } from 'react';
import { X } from 'lucide-react';
import { FulfillmentStatus, Order, PaymentStatus } from '../../types/commerce';
import { formatTimestamp, formatXOF } from '../../lib/format';
import { recordRefundAdmin, updateOrderAdmin } from '../../lib/firestoreService';

interface AdminOrdersProps {
  orders: Order[];
  actorEmail: string;
  onToast: (msg: string, tone?: 'default' | 'error' | 'success') => void;
}

export function AdminOrders({ orders, actorEmail, onToast }: AdminOrdersProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [tracking, setTracking] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [refundAmount, setRefundAmount] = useState(0);

  const sortedOrders = [...orders]
    .filter((o) => (statusFilter === 'all' ? true : o.fulfillmentStatus === statusFilter))
    .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));

  const openOrder = (o: Order) => {
    setSelectedOrder(o);
    setTracking(o.trackingNumber || '');
    setRefundAmount(o.totalXof);
    setRefundReason('');
  };

  const handleUpdate = async (
    order: Order,
    updates: Partial<Pick<Order, 'paymentStatus' | 'fulfillmentStatus' | 'trackingNumber'>>
  ) => {
    try {
      await updateOrderAdmin(order.id, updates, actorEmail);
      setSelectedOrder({ ...order, ...updates });
      onToast(`Order ${order.orderNumber} updated.`, 'success');
    } catch {
      onToast('Failed to update order.', 'error');
    }
  };

  const handleRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || refundAmount <= 0 || !refundReason.trim()) return;
    try {
      await recordRefundAdmin(selectedOrder.id, refundAmount, refundReason, actorEmail);
      setSelectedOrder({ ...selectedOrder, paymentStatus: 'refunded' });
      onToast(`Refund recorded for ${selectedOrder.orderNumber}.`, 'success');
    } catch {
      onToast('Failed to record refund.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-editorial text-3xl text-black">Orders &amp; Fulfillment</h1>
          <p className="text-xs font-light text-black/60 mt-0.5">
            Track client orders, shipping dispatches, cancellations, and refunds.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5 bg-black/[0.04] p-1 text-xs">
          {['all', 'unfulfilled', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 uppercase tracking-wider cursor-pointer ${
                statusFilter === s ? 'bg-black text-white font-bold' : 'text-black/60 font-light'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="border border-black/15 bg-white overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-[11px] font-bold uppercase tracking-[0.14em] text-black/60 bg-black/[0.03]">
              <th className="py-3 px-4">Order #</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Method</th>
              <th className="py-3 px-4">Payment</th>
              <th className="py-3 px-4">Fulfillment</th>
              <th className="py-3 px-4 text-right">Total</th>
              <th className="py-3 px-4 text-right">Date</th>
            </tr>
          </thead>
          <tbody>
            {sortedOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center font-light text-black/60">
                  No orders found for this filter.
                </td>
              </tr>
            ) : (
              sortedOrders.map((o, idx) => (
                <tr
                  key={o.id}
                  onClick={() => openOrder(o)}
                  className={`hover:bg-black/[0.04] cursor-pointer ${idx % 2 === 1 ? 'bg-black/[0.015]' : ''}`}
                >
                  <td className="py-3 px-4 font-bold">{o.orderNumber}</td>
                  <td className="py-3 px-4">
                    <div className="font-bold">{o.customerName}</div>
                    <div className="text-[11px] font-light text-black/60">{o.customerEmail}</div>
                  </td>
                  <td className="py-3 px-4 uppercase font-light text-[11px]">{o.paymentMethod}</td>
                  <td className="py-3 px-4 uppercase font-bold text-[11px]">{o.paymentStatus}</td>
                  <td className="py-3 px-4 uppercase font-bold text-[11px]">
                    {o.fulfillmentStatus}
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums font-bold">
                    {formatXOF(o.totalXof)}
                  </td>
                  <td className="py-3 px-4 text-right font-light text-black/60">
                    {formatTimestamp(o.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Detail Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSelectedOrder(null)}
          />
          <div className="relative w-full max-w-xl bg-white h-full overflow-y-auto p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between pb-2">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-black/60">Order Detail</p>
                <h2 className="font-editorial text-2xl text-black">
                  {selectedOrder.orderNumber}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-2 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-[#F7F7F7] p-4">
              <div>
                <p className="font-bold uppercase tracking-wider text-black/60 mb-1">Client</p>
                <p className="font-bold">{selectedOrder.customerName}</p>
                <p className="font-light">{selectedOrder.customerEmail}</p>
                <p className="font-light">{selectedOrder.customerPhone}</p>
              </div>
              <div>
                <p className="font-bold uppercase tracking-wider text-black/60 mb-1">Shipping</p>
                <p className="font-light">{selectedOrder.shippingAddress?.street}</p>
                <p className="font-light">
                  {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.country}
                </p>
                <p className="font-light text-black/60 mt-1">{selectedOrder.deliveryMethod}</p>
              </div>
            </div>

            {/* Line Items */}
            <div className="bg-[#F7F7F7] p-4 space-y-3 text-xs">
              <p className="font-bold uppercase tracking-wider text-black/60">Items</p>
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between py-1.5">
                  <div>
                    <p className="font-bold">{item.productName}</p>
                    <p className="font-light text-black/60">
                      {item.color} / {item.size} &middot; {item.sku} &times; {item.quantity}
                    </p>
                  </div>
                  <span className="tabular-nums font-bold">
                    {formatXOF(item.unitPriceXof * item.quantity)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between pt-2 font-bold text-sm">
                <span>Total</span>
                <span className="tabular-nums">{formatXOF(selectedOrder.totalXof)}</span>
              </div>
            </div>

            {/* Status Management */}
            <div className="border border-black/15 bg-white p-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-1">
                  <span className="font-bold uppercase tracking-wider text-black/60">Fulfillment Status</span>
                  <select
                    value={selectedOrder.fulfillmentStatus}
                    onChange={(e) =>
                      handleUpdate(selectedOrder, {
                        fulfillmentStatus: e.target.value as FulfillmentStatus,
                      })
                    }
                    className="w-full border border-black/25 px-3 py-2"
                  >
                    <option value="unfulfilled">Unfulfilled</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </label>
                <label className="block space-y-1">
                  <span className="font-bold uppercase tracking-wider text-black/60">Payment Status</span>
                  <select
                    value={selectedOrder.paymentStatus}
                    onChange={(e) =>
                      handleUpdate(selectedOrder, {
                        paymentStatus: e.target.value as PaymentStatus,
                      })
                    }
                    className="w-full border border-black/25 px-3 py-2"
                  >
                    <option value="pending">Pending</option>
                    <option value="awaiting_verification">Awaiting Verification</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </label>
              </div>

              <div className="flex gap-2">
                <input
                  value={tracking}
                  onChange={(e) => setTracking(e.target.value)}
                  placeholder="Courier tracking number"
                  className="flex-1 border border-black/25 px-3 py-2"
                />
                <button
                  type="button"
                  onClick={() => handleUpdate(selectedOrder, { trackingNumber: tracking })}
                  className="px-4 py-2 bg-black text-white font-bold uppercase tracking-wider cursor-pointer"
                >
                  Save Tracking
                </button>
              </div>
            </div>

            {/* Refund Section */}
            <form
              onSubmit={handleRefund}
              className="border border-black/15 bg-white p-4 space-y-3 text-xs"
            >
              <p className="font-bold uppercase tracking-wider text-black/60">Issue Refund Record</p>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(Number(e.target.value))}
                  className="border border-black/25 px-3 py-2 tabular-nums"
                />
                <input
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Refund reason"
                  required
                  className="border border-black/25 px-3 py-2"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 border border-black text-black font-bold uppercase tracking-wider hover:bg-black hover:text-white cursor-pointer"
              >
                Record Refund
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
