import React, { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Order, UserProfile } from '../../types/commerce';
import { useLanguage } from '../../context/LanguageContext';
import { formatTimestamp, formatXOF } from '../../lib/format';

interface AdminCustomersProps {
  users: UserProfile[];
  orders: Order[];
  onOpenOrder?: (orderId: string) => void;
}

interface CustomerRow {
  email: string;
  name: string;
  phone: string;
  registered: boolean;
  orders: Order[];
  totalSpentXof: number;
  lastOrderAt: any;
}

export function AdminCustomers({ users, orders, onOpenOrder }: AdminCustomersProps) {
  const { tr } = useLanguage();
  const [search, setSearch] = useState('');
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  const customers = useMemo(() => {
    const map = new Map<string, CustomerRow>();

    users.forEach((u) => {
      if (!u.email) return;
      const key = u.email.trim().toLowerCase();
      map.set(key, {
        email: key,
        name: u.fullName || key.split('@')[0],
        phone: u.phone || '—',
        registered: true,
        orders: [],
        totalSpentXof: 0,
        lastOrderAt: null,
      });
    });

    orders.forEach((o) => {
      const key = (o.customerEmail || '').trim().toLowerCase();
      if (!key) return;
      const prev = map.get(key) || {
        email: key,
        name: o.customerName || key.split('@')[0],
        phone: o.customerPhone || '—',
        registered: false,
        orders: [],
        totalSpentXof: 0,
        lastOrderAt: null,
      };
      if (!prev.name && o.customerName) prev.name = o.customerName;
      if ((prev.phone === '—' || !prev.phone) && o.customerPhone) prev.phone = o.customerPhone;
      prev.orders.push(o);
      if (o.fulfillmentStatus !== 'cancelled' && o.paymentStatus !== 'failed') {
        prev.totalSpentXof += o.totalXof || 0;
      }
      const orderTs = o.createdAt?.toMillis?.() || new Date(o.createdAt || 0).getTime() || 0;
      const prevTs = prev.lastOrderAt?.toMillis?.() || new Date(prev.lastOrderAt || 0).getTime() || 0;
      if (orderTs >= prevTs) prev.lastOrderAt = o.createdAt;
      map.set(key, prev);
    });

    return Array.from(map.values()).sort((a, b) => b.totalSpentXof - a.totalSpentXof);
  }, [users, orders]);

  const filtered = useMemo(() => {
    if (!search.trim()) return customers;
    const q = search.trim().toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q)
    );
  }, [customers, search]);

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.email === selectedEmail) || null,
    [customers, selectedEmail]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-black">
          {tr('Clients', 'Customers')}
        </h1>
        <p className="text-xs text-black/55 mt-0.5 tabular-nums">
          {customers.length} {tr('clients enregistrés et acheteurs', 'registered & checkout customers')}
        </p>
      </div>

      <div className="bg-white border border-[#E8E8E8]">
        <div className="p-3.5 border-b border-[#E8E8E8]">
          <div className="relative max-w-md">
            <Search className="w-3.5 h-3.5 text-black/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={tr('Rechercher par nom, email ou téléphone...', 'Search by name, email, or phone...')}
              className="w-full pl-9 pr-3 py-2 text-xs border border-[#E8E8E8] focus:border-black focus:outline-none"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-10 text-center text-xs text-black/50">
            {tr('Aucun client trouvé.', 'No customers found.')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[11px] font-medium text-black/45 border-b border-[#E8E8E8]">
                  <th className="py-3 px-4">{tr('Client', 'Customer')}</th>
                  <th className="py-3 px-3">{tr('Email', 'Email')}</th>
                  <th className="py-3 px-3">{tr('Commandes', 'Orders')}</th>
                  <th className="py-3 px-3">{tr('Dépenses totales', 'Total spent')}</th>
                  <th className="py-3 px-3">{tr('Dernière commande', 'Last order')}</th>
                  <th className="py-3 px-4 text-right">{tr('Statut', 'Status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0F0]">
                {filtered.map((c) => (
                  <tr
                    key={c.email}
                    onClick={() => setSelectedEmail(c.email)}
                    className="hover:bg-[#FAFAFA] cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-medium text-black">{c.name}</td>
                    <td className="py-3 px-3 text-black/65">{c.email}</td>
                    <td className="py-3 px-3 tabular-nums text-black/75">{c.orders.length}</td>
                    <td className="py-3 px-3 tabular-nums font-medium text-black">
                      {formatXOF(c.totalSpentXof)}
                    </td>
                    <td className="py-3 px-3 tabular-nums text-black/55">
                      {c.lastOrderAt ? formatTimestamp(c.lastOrderAt) : '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10.5px] border ${
                          c.registered
                            ? 'bg-black text-white border-black'
                            : 'bg-[#F5F5F5] text-black/70 border-[#E8E8E8]'
                        }`}
                      >
                        {c.registered ? tr('Inscrit', 'Registered') : tr('Invité', 'Guest')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Profile Slide-Over */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/35" onClick={() => setSelectedEmail(null)} />
          <aside className="relative w-full max-w-lg bg-white h-full border-l border-[#E8E8E8] flex flex-col z-10">
            <div className="px-6 py-4 border-b border-[#E8E8E8] flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-black">{selectedCustomer.name}</h2>
                <p className="text-[11px] text-black/50">{selectedCustomer.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEmail(null)}
                className="p-1.5 text-black/60 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-[#E8E8E8] p-4">
                  <p className="text-[10.5px] uppercase tracking-[0.1em] text-black/45">
                    {tr('Total dépensé', 'Lifetime spend')}
                  </p>
                  <p className="text-lg font-semibold text-black tabular-nums mt-1">
                    {formatXOF(selectedCustomer.totalSpentXof)}
                  </p>
                </div>
                <div className="border border-[#E8E8E8] p-4">
                  <p className="text-[10.5px] uppercase tracking-[0.1em] text-black/45">
                    {tr('Commandes', 'Orders')}
                  </p>
                  <p className="text-lg font-semibold text-black tabular-nums mt-1">
                    {selectedCustomer.orders.length}
                  </p>
                </div>
              </div>

              <div className="border border-[#E8E8E8] p-4 space-y-1.5">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-black/45">
                  {tr('Coordonnées', 'Contact details')}
                </p>
                <p className="text-black">{selectedCustomer.email}</p>
                <p className="text-black/65 tabular-nums">{selectedCustomer.phone}</p>
              </div>

              <div className="space-y-2.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-black/50">
                  {tr('Historique des commandes', 'Order history')}
                </p>
                {selectedCustomer.orders.length === 0 ? (
                  <p className="text-black/50">
                    {tr('Aucune commande passée pour le moment.', 'No orders placed yet.')}
                  </p>
                ) : (
                  <div className="border border-[#E8E8E8] divide-y divide-[#F0F0F0]">
                    {selectedCustomer.orders.map((order) => (
                      <div
                        key={order.id}
                        onClick={() => {
                          setSelectedEmail(null);
                          onOpenOrder?.(order.id);
                        }}
                        className="p-3.5 flex items-center justify-between hover:bg-[#FAFAFA] cursor-pointer"
                      >
                        <div>
                          <p className="font-semibold text-black tabular-nums">{order.orderNumber}</p>
                          <p className="text-[11px] text-black/50 tabular-nums">
                            {formatTimestamp(order.createdAt)} &middot; {order.items.length} {tr('art.', 'items')}
                          </p>
                        </div>
                        <p className="font-semibold text-black tabular-nums">
                          {formatXOF(order.totalXof)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
