import React, { useMemo } from 'react';
import { Order, UserProfile } from '../../types/commerce';
import { formatTimestamp, formatXOF } from '../../lib/format';

interface AdminCustomersProps {
  users: UserProfile[];
  orders: Order[];
}

export function AdminCustomers({ users, orders }: AdminCustomersProps) {
  const customerRows = useMemo(() => {
    const map = new Map<
      string,
      {
        email: string;
        name: string;
        phone: string;
        city: string;
        ordersCount: number;
        totalSpentXof: number;
        lastOrderAt: any;
      }
    >();

    for (const u of users) {
      map.set(u.email.toLowerCase(), {
        email: u.email,
        name: u.fullName || 'Registered Client',
        phone: u.phone || '—',
        city: '—',
        ordersCount: 0,
        totalSpentXof: 0,
        lastOrderAt: u.createdAt,
      });
    }

    for (const o of orders) {
      const key = o.customerEmail.toLowerCase();
      const prev = map.get(key) || {
        email: o.customerEmail,
        name: o.customerName,
        phone: o.customerPhone,
        city: o.shippingAddress?.city || '—',
        ordersCount: 0,
        totalSpentXof: 0,
        lastOrderAt: o.createdAt,
      };
      prev.name = o.customerName || prev.name;
      prev.phone = o.customerPhone || prev.phone;
      prev.city = o.shippingAddress?.city || prev.city;
      prev.ordersCount += 1;
      if (o.paymentStatus !== 'failed' && o.paymentStatus !== 'refunded') {
        prev.totalSpentXof += o.totalXof || 0;
      }
      prev.lastOrderAt = o.createdAt;
      map.set(key, prev);
    }

    return Array.from(map.values()).sort((a, b) => b.totalSpentXof - a.totalSpentXof);
  }, [users, orders]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-editorial text-3xl text-black">Customers</h1>
        <p className="text-xs font-light text-black/60 mt-0.5">
          Registered client profiles and checkout order history aggregated in XOF.
        </p>
      </div>

      <div className="bg-white overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-[11px] font-bold uppercase tracking-[0.14em] text-black/60 bg-black/[0.03]">
              <th className="py-3 px-4">Client</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Phone</th>
              <th className="py-3 px-4">City</th>
              <th className="py-3 px-4 text-right">Orders</th>
              <th className="py-3 px-4 text-right">Total Spend</th>
              <th className="py-3 px-4 text-right">Last Activity</th>
            </tr>
          </thead>
          <tbody>
            {customerRows.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center font-light text-black/60">
                  No customer profiles or orders recorded yet.
                </td>
              </tr>
            ) : (
              customerRows.map((c, idx) => (
                <tr key={c.email} className={`hover:bg-black/[0.04] ${idx % 2 === 1 ? 'bg-black/[0.015]' : ''}`}>
                  <td className="py-3 px-4 font-bold text-black">{c.name}</td>
                  <td className="py-3 px-4 font-light">{c.email}</td>
                  <td className="py-3 px-4 font-light">{c.phone}</td>
                  <td className="py-3 px-4 font-light">{c.city}</td>
                  <td className="py-3 px-4 text-right tabular-nums">{c.ordersCount}</td>
                  <td className="py-3 px-4 text-right tabular-nums font-bold">
                    {formatXOF(c.totalSpentXof)}
                  </td>
                  <td className="py-3 px-4 text-right font-light text-black/60">
                    {formatTimestamp(c.lastOrderAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
