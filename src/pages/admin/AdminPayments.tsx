import React, { useEffect, useState } from 'react';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import { PaymentProviderStatus, PaymentRecord } from '../../types/commerce';
import { formatTimestamp, formatXOF } from '../../lib/format';

interface AdminPaymentsProps {
  payments: PaymentRecord[];
}

export function AdminPayments({ payments }: AdminPaymentsProps) {
  const [providers, setProviders] = useState<PaymentProviderStatus[]>([]);

  useEffect(() => {
    fetch('/api/payments/providers')
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.providers)) setProviders(d.providers);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-editorial text-3xl text-black">Payments &amp; Webhooks (XOF)</h1>
        <p className="text-xs font-light text-black/60 mt-0.5">
          Server-side gateway readiness, HMAC-SHA256 webhook verification, and idempotent payment ledger.
        </p>
      </div>

      {/* Gateway Readiness Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {providers.map((p) => (
          <div key={p.id} className="border border-black/15 bg-white p-5 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="font-bold text-sm text-black">{p.name}</h2>
                <p className="text-[11px] font-light text-black/60">{p.region}</p>
              </div>
              <span
                className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] ${
                  p.configured
                    ? 'bg-black text-white'
                    : 'border border-black/25 bg-white text-black'
                }`}
              >
                {p.configured ? 'Configured' : 'Credentials Missing'}
              </span>
            </div>

            <div className="text-[11px] space-y-1 pt-2">
              <p className="font-bold text-black/60">Webhook Endpoint</p>
              <p className="font-light text-black break-all">{p.webhookPath}</p>
            </div>

            {!p.configured && p.missingEnvVars.length > 0 && (
              <div className="p-2.5 bg-black/[0.03] border border-black/10 text-[11px] space-y-1">
                <p className="flex items-center gap-1.5 font-bold text-black">
                  <AlertCircle className="w-3.5 h-3.5 text-black" />
                  <span>Required Environment Secrets</span>
                </p>
                <p className="font-light text-black/75">{p.missingEnvVars.join(', ')}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Security Architecture Note */}
      <div className="border border-black/20 bg-black/[0.02] p-5 flex items-start gap-3 text-xs text-black">
        <ShieldCheck className="w-4 h-4 text-black shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Strict Payment Verification Policy</p>
          <p className="font-light text-black/80 leading-relaxed">
            Client applications cannot mark orders as paid. All incoming payment notifications are verified
            server-side using <span className="font-bold">crypto.timingSafeEqual</span> HMAC-SHA256 signatures and
            deduplicated against <span className="font-bold">payment_webhook_events</span> before converting reserved stock
            into final sales.
          </p>
        </div>
      </div>

      {/* Payment Ledger */}
      <div className="border border-black/15 bg-white p-6 space-y-4">
        <h2 className="font-editorial text-2xl text-black">Payment Transactions</h2>
        {payments.length === 0 ? (
          <p className="text-xs font-light text-black/60">No payment records recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[11px] font-bold uppercase tracking-[0.14em] text-black/60 bg-black/[0.03]">
                  <th className="py-2 pr-4 pl-2">Order</th>
                  <th className="py-2 pr-4">Provider</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Webhook Verified</th>
                  <th className="py-2 pr-4 text-right">Amount</th>
                  <th className="py-2 text-right pr-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p, idx) => (
                  <tr key={p.id} className={idx % 2 === 1 ? 'bg-black/[0.015]' : ''}>
                    <td className="py-2.5 pr-4 pl-2 font-bold">{p.orderNumber || p.orderId}</td>
                    <td className="py-2.5 pr-4 uppercase font-light">{p.provider}</td>
                    <td className="py-2.5 pr-4 uppercase font-bold">{p.status}</td>
                    <td className="py-2.5 pr-4 font-bold">
                      {p.webhookVerified ? 'YES' : 'NO'}
                    </td>
                    <td className="py-2.5 pr-4 text-right tabular-nums font-bold">
                      {formatXOF(p.amountXof)}
                    </td>
                    <td className="py-2.5 text-right font-light text-black/60">
                      {formatTimestamp(p.createdAt)}
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
