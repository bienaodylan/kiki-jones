import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { Trash2, LogOut, ChevronRight } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import { useExperienceMode } from '../context/ExperienceContext';
import {
  getUserProfile,
  updateUserProfile,
  getUserAddresses,
  saveUserAddress,
  deleteUserAddress,
} from '../lib/firestoreService';
import { CustomerAddress, Order } from '../types/commerce';
import { formatXOF, formatTimestamp } from '../lib/format';
import { BrandLogo } from '../components/brand/BrandLogo';

export function AccountPage({ defaultTab = 'profile' }: { defaultTab?: 'profile' | 'orders' }) {
  const { user, authReady, isAdmin, loginWithGoogle, logout } = useAuth();
  const { navigate, toast } = useStore();
  const { tr } = useLanguage();
  const { isAppMode } = useExperienceMode();

  const [tab, setTab] = useState<'profile' | 'orders'>(defaultTab);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [newAddress, setNewAddress] = useState({
    label: 'Domicile',
    recipientName: '',
    phone: '',
    street: '',
    city: 'Abidjan',
    country: "Côte d'Ivoire",
    isDefault: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTab(defaultTab);
  }, [defaultTab]);

  useEffect(() => {
    if (!user) return;
    getUserProfile(user.uid).then((prof) => {
      if (prof) {
        setFullName(prof.fullName || user.displayName || '');
        setPhone(prof.phone || '');
      }
    });
    getUserAddresses(user.uid).then(setAddresses);

    const unsub = onSnapshot(
      query(collection(db, 'orders'), where('userId', '==', user.uid)),
      (snap) => {
        const list = snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as Omit<Order, 'id'>) }))
          .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
        setOrders(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'orders')
    );
    return () => unsub();
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await updateUserProfile(user.uid, { fullName, phone });
      toast(tr('Profil enregistré.', 'Profile saved.'), 'success');
    } catch {
      toast(tr('Impossible d’enregistrer le profil.', 'Failed to save profile.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newAddress.street || !newAddress.recipientName) return;
    await saveUserAddress(user.uid, newAddress);
    setAddresses(await getUserAddresses(user.uid));
    setNewAddress({
      label: 'Domicile',
      recipientName: '',
      phone: '',
      street: '',
      city: 'Abidjan',
      country: "Côte d'Ivoire",
      isDefault: false,
    });
    toast(tr('Adresse enregistrée.', 'Address saved.'), 'success');
  };

  const handleRemoveAddress = async (id: string) => {
    if (!user) return;
    await deleteUserAddress(user.uid, id);
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    toast(tr('Adresse supprimée.', 'Address removed.'), 'default');
  };

  const appInfoLinks = (
    <section className="mt-10 pt-6 border-t border-black/10 space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/45 mb-2">
        {tr('Service Client & Maison', 'Client Care & House Policies')}
      </p>
      <div className="divide-y divide-black/10 border-t border-b border-black/10">
        {[
          { label: tr('Livraison & Expédition', 'Shipping & Delivery'), href: '/legal/shipping' },
          { label: tr('Retours & Échanges', 'Returns & Exchanges'), href: '/legal/returns' },
          { label: tr('Confidentialité', 'Privacy Policy'), href: '/legal/privacy' },
          { label: tr('Conditions de vente', 'Terms of Sale'), href: '/legal/terms' },
        ].map((item) => (
          <button
            key={item.href}
            type="button"
            onClick={() => navigate(item.href)}
            className="w-full min-h-[48px] flex items-center justify-between text-xs font-medium text-black/80 active:text-black cursor-pointer"
          >
            <span>{item.label}</span>
            <ChevronRight className="w-4 h-4 text-black/40" />
          </button>
        ))}
      </div>
    </section>
  );

  if (!authReady) {
    return (
      <main className={`${isAppMode ? 'pt-8 pb-12' : 'pt-32 pb-24'} max-w-4xl mx-auto px-4 sm:px-5`}>
        <p className="text-sm font-light text-black/60">
          {tr('Chargement du compte...', 'Loading account...')}
        </p>
      </main>
    );
  }

  if (!user) {
    return (
      <main
        className={`${
          isAppMode ? 'pt-8 pb-12' : 'pt-32 pb-24'
        } max-w-lg mx-auto px-4 sm:px-5 min-h-[70vh] flex flex-col justify-center`}
      >
        <div className="border border-black/20 bg-white p-7 md:p-10 space-y-5 text-center">
          <div className="flex justify-center">
            <BrandLogo variant="card" tone="dark" />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-black/55">
            {tr('Espace Client', 'Client Account')}
          </p>
          <h1 className="font-editorial text-3xl sm:text-4xl text-black">
            {tr('Connexion KIKI JONES', 'Sign In to KIKI JONES')}
          </h1>
          <p className="text-sm font-light text-black/75 leading-relaxed">
            {tr(
              'Accédez à vos adresses enregistrées, suivez vos commandes en temps réel et gérez vos préférences.',
              'Access your saved shipping addresses, track real-time order statuses, and manage your personal preferences.'
            )}
          </p>
          <button
            type="button"
            onClick={() => loginWithGoogle()}
            className="w-full min-h-[48px] py-4 px-6 bg-black text-white text-xs font-bold uppercase tracking-[0.2em] hover:bg-black/85 cursor-pointer"
          >
            {tr('Continuer avec Google', 'Continue with Google')}
          </button>
        </div>
        {isAppMode && appInfoLinks}
      </main>
    );
  }

  return (
    <main
      className={`${
        isAppMode ? 'pt-4 pb-12' : 'pt-[100px] lg:pt-[116px] pb-20'
      } w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 min-h-[75vh] overflow-x-clip`}
    >
      <div className="pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-black/55 truncate">
            {user.email}
          </p>
          <h1 className="font-editorial text-2xl sm:text-4xl text-black mt-1">
            {tr('Mon compte', 'Client Account')}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {isAdmin && (
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="px-4 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-[0.14em] cursor-pointer whitespace-nowrap"
            >
              {tr('Ouvrir l’administration', 'Open Admin Console')}
            </button>
          )}
          <button
            type="button"
            onClick={() => logout()}
            className="px-4 py-2.5 bg-[#F7F7F7] text-xs font-bold uppercase tracking-[0.14em] inline-flex items-center gap-2 hover:bg-black hover:text-white cursor-pointer whitespace-nowrap"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{tr('Déconnexion', 'Sign Out')}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-5 sm:gap-8 mt-2 overflow-x-auto no-scrollbar border-b border-black/10 pb-2">
        <button
          type="button"
          onClick={() => setTab('profile')}
          className={`py-2 text-xs font-bold uppercase tracking-[0.16em] whitespace-nowrap shrink-0 cursor-pointer ${
            tab === 'profile' ? 'text-black underline underline-offset-4' : 'text-black/50'
          }`}
        >
          {tr('Profil & Adresses', 'Profile & Addresses')}
        </button>
        <button
          type="button"
          onClick={() => setTab('orders')}
          className={`py-2 text-xs font-bold uppercase tracking-[0.16em] whitespace-nowrap shrink-0 cursor-pointer ${
            tab === 'orders' ? 'text-black underline underline-offset-4' : 'text-black/50'
          }`}
        >
          {tr('Mes commandes', 'Order History')} ({orders.length})
        </button>
      </div>

      {tab === 'profile' ? (
        <div className="pt-10 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <form onSubmit={handleSaveProfile} className="lg:col-span-5 space-y-4">
            <h2 className="font-editorial text-2xl text-black">
              {tr('Informations personnelles', 'Personal Details')}
            </h2>
            <label className="block space-y-1.5 text-xs">
              <span className="font-bold uppercase tracking-[0.14em] text-black/60">
                {tr('Nom complet', 'Full Name')}
              </span>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-white border border-black/25 px-4 py-3 text-sm font-light"
              />
            </label>
            <label className="block space-y-1.5 text-xs">
              <span className="font-bold uppercase tracking-[0.14em] text-black/60">
                {tr('Téléphone', 'Phone Number')}
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white border border-black/25 px-4 py-3 text-sm font-light"
              />
            </label>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-[0.18em] cursor-pointer"
            >
              {saving ? tr('Enregistrement...', 'Saving...') : tr('Enregistrer le profil', 'Save Profile')}
            </button>
          </form>

          <div className="lg:col-span-7 space-y-6">
            <h2 className="font-editorial text-2xl text-black">
              {tr('Adresses enregistrées', 'Saved Addresses')}
            </h2>
            {addresses.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div key={addr.id} className="border border-black/20 p-4 space-y-1 text-xs relative">
                    <button
                      type="button"
                      onClick={() => handleRemoveAddress(addr.id)}
                      className="absolute top-3 right-3 text-black/50 hover:text-black cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <p className="font-bold uppercase tracking-[0.14em] text-black/60">{addr.label}</p>
                    <p className="font-bold text-sm text-black">{addr.recipientName}</p>
                    <p className="font-light">{addr.street}</p>
                    <p className="font-light">
                      {addr.city}, {addr.country}
                    </p>
                    <p className="font-light text-black/60">{addr.phone}</p>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleAddAddress} className="border border-black/15 p-5 space-y-3">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-black/60">
                {tr('Ajouter une adresse', 'Add Address')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-light">
                <input
                  placeholder={tr('Libellé (ex. Domicile)', 'Label (e.g. Home)')}
                  value={newAddress.label}
                  onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                  className="bg-white border border-black/25 px-3 py-2.5"
                />
                <input
                  placeholder={tr('Nom du destinataire', 'Recipient Name')}
                  required
                  value={newAddress.recipientName}
                  onChange={(e) => setNewAddress({ ...newAddress, recipientName: e.target.value })}
                  className="bg-white border border-black/25 px-3 py-2.5"
                />
                <input
                  placeholder={tr('Téléphone', 'Phone')}
                  required
                  value={newAddress.phone}
                  onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                  className="bg-white border border-black/25 px-3 py-2.5"
                />
                <input
                  placeholder={tr('Rue & Quartier', 'Street & District')}
                  required
                  value={newAddress.street}
                  onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                  className="bg-white border border-black/25 px-3 py-2.5"
                />
                <input
                  placeholder={tr('Ville', 'City')}
                  required
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  className="bg-white border border-black/25 px-3 py-2.5"
                />
                <input
                  placeholder={tr('Pays', 'Country')}
                  required
                  value={newAddress.country}
                  onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                  className="bg-white border border-black/25 px-3 py-2.5"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-[0.16em] cursor-pointer"
              >
                {tr('Enregistrer l’adresse', 'Save Address')}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="pt-10 space-y-4">
          {orders.length === 0 ? (
            <div className="border border-black/20 p-12 text-center space-y-4">
              <p className="font-editorial text-2xl">
                {tr('Aucune commande pour le moment', 'No orders placed yet')}
              </p>
              <button
                type="button"
                onClick={() => navigate('/shop')}
                className="px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-[0.18em] cursor-pointer"
              >
                {tr('Explorer la boutique', 'Explore Collection')}
              </button>
            </div>
          ) : (
            orders.map((ord) => (
              <div key={ord.id} className="bg-[#F7F7F7] p-4 sm:p-6 space-y-4 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-black/10">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-black break-all">{ord.orderNumber}</p>
                    <p className="text-xs font-light text-black/60">{formatTimestamp(ord.createdAt)}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
                    <div>
                      <span className="text-black/60 font-bold uppercase tracking-wider block">
                        {tr('Paiement', 'Payment')}
                      </span>
                      <span className="font-bold uppercase">{ord.paymentStatus}</span>
                    </div>
                    <div>
                      <span className="text-black/60 font-bold uppercase tracking-wider block">
                        {tr('Expédition', 'Fulfillment')}
                      </span>
                      <span className="font-bold uppercase">{ord.fulfillmentStatus}</span>
                    </div>
                    <div className="sm:text-right">
                      <span className="text-black/60 font-bold uppercase tracking-wider block">
                        Total
                      </span>
                      <span className="font-bold tabular-nums whitespace-nowrap">
                        {formatXOF(ord.totalXof)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-xs font-light">
                  {ord.items.map((item, idx) => (
                    <div key={idx} className="flex items-baseline justify-between gap-3 min-w-0">
                      <span className="min-w-0 flex-1 break-words">
                        {item.productName} ({item.color} / {item.size}) &times; {item.quantity}
                      </span>
                      <span className="font-bold tabular-nums whitespace-nowrap shrink-0">
                        {formatXOF(item.unitPriceXof * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                {ord.trackingNumber && (
                  <p className="text-xs font-light text-black/60">
                    {tr('Numéro de suivi :', 'Tracking Number:')}{' '}
                    <span className="font-bold text-black">{ord.trackingNumber}</span>
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}
      {isAppMode && appInfoLinks}
    </main>
  );
}
