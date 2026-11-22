import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertCircle, Lock } from 'lucide-react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useExperienceMode } from '../context/ExperienceContext';
import { db } from '../lib/firebase';
import { formatXOF, sanitizeId } from '../lib/format';
import { validatePromoCode } from '../lib/firestoreService';
import { PaymentMethod, PaymentProviderStatus, Promotion } from '../types/commerce';

export function CheckoutPage() {
  const { cart, cartSubtotalXof, storefrontConfig, clearCart, navigate, toast } = useStore();
  const { user, idToken, loginWithGoogle } = useAuth();
  const { tr } = useLanguage();
  const { isAppMode } = useExperienceMode();

  const [customerName, setCustomerName] = useState(user?.displayName || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('Abidjan');
  const [country, setCountry] = useState("Côte d'Ivoire");
  const [deliveryMethod, setDeliveryMethod] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wave');

  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<Promotion | null>(null);
  const [providers, setProviders] = useState<PaymentProviderStatus[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [orderConfirmation, setOrderConfirmation] = useState<{
    orderNumber: string;
    orderId: string;
    totalXof: number;
    paymentStatus: string;
    providerConfigured: boolean;
    missingEnvVars: string[];
    reservationExpiresAt?: string;
  } | null>(null);

  useEffect(() => {
    if (user) {
      if (!customerName && user.displayName) setCustomerName(user.displayName);
      if (!customerEmail && user.email) setCustomerEmail(user.email);
    }
  }, [user, customerName, customerEmail]);

  useEffect(() => {
    fetch('/api/payments/providers')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.providers)) setProviders(data.providers);
      })
      .catch(() => {});
  }, []);

  const discountXof = appliedPromo
    ? appliedPromo.type === 'percentage'
      ? Math.round((cartSubtotalXof * appliedPromo.value) / 100)
      : Math.min(cartSubtotalXof, appliedPromo.value)
    : 0;

  const discountedSubtotal = Math.max(0, cartSubtotalXof - discountXof);
  const freeThreshold = storefrontConfig.freeShippingThresholdXof || 75000;
  const shippingFeeXof =
    deliveryMethod === 'express'
      ? storefrontConfig.expressShippingXof || 7500
      : discountedSubtotal >= freeThreshold
        ? 0
        : storefrontConfig.standardShippingXof || 3500;

  const totalXof = discountedSubtotal + shippingFeeXof;

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    try {
      const promo = await validatePromoCode(promoInput, cartSubtotalXof);
      if (!promo) {
        toast(
          tr(
            'Code promo invalide, expiré ou montant minimum non atteint.',
            'Invalid, expired, or minimum-spend unmet discount code.'
          ),
          'error'
        );
        setAppliedPromo(null);
      } else {
        setAppliedPromo(promo);
        toast(tr(`Code ${promo.code} appliqué.`, `Code ${promo.code} applied.`), 'success');
      }
    } catch {
      toast(
        tr('Impossible de vérifier le code promo.', 'Could not validate promotion code.'),
        'error'
      );
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast(tr('Votre panier est vide.', 'Your bag is empty.'), 'error');
      return;
    }
    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim() || !street.trim()) {
      toast(
        tr('Veuillez remplir tous les champs de livraison obligatoires.', 'Please complete all required delivery fields.'),
        'error'
      );
      return;
    }

    setSubmitting(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (idToken) headers['Authorization'] = `Bearer ${idToken}`;

      const res = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim(),
          customerPhone: customerPhone.trim(),
          shippingAddress: {
            recipientName: customerName.trim(),
            phone: customerPhone.trim(),
            street: street.trim(),
            city: city.trim(),
            country: country.trim(),
          },
          deliveryMethod,
          promoCode: appliedPromo?.code || null,
          paymentMethod,
          items: cart.map((c) => ({
            variantId: c.variantId,
            quantity: c.quantity,
          })),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        clearCart();
        setOrderConfirmation(data);
        toast(
          tr(`Commande ${data.orderNumber} réservée.`, `Order ${data.orderNumber} reserved.`),
          'success'
        );
        return;
      }

      if (res.status >= 500 || data.code === 'SERVER_ADC_UNAVAILABLE') {
        if (!user) {
          toast(
            tr(
              'Veuillez vous connecter avec Google ci-dessus pour finaliser et suivre votre commande.',
              'Please sign in with Google above to place and track your order.'
            ),
            'error'
          );
          return;
        }
        const orderId = sanitizeId(`ord_${Date.now()}`);
        const orderNumber = `KJ-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
        await setDoc(doc(db, 'orders', orderId), {
          orderNumber,
          userId: user.uid,
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim().toLowerCase(),
          customerPhone: customerPhone.trim(),
          shippingAddress: {
            recipientName: customerName.trim(),
            phone: customerPhone.trim(),
            street: street.trim(),
            city: city.trim(),
            country: country.trim(),
          },
          deliveryMethod:
            deliveryMethod === 'express' ? 'Express Courier (24h)' : 'Standard Delivery',
          shippingFeeXof,
          promoCode: appliedPromo?.code || null,
          discountXof,
          subtotalXof: cartSubtotalXof,
          totalXof,
          currency: 'XOF',
          paymentMethod,
          paymentStatus: 'awaiting_verification',
          fulfillmentStatus: 'unfulfilled',
          items: cart.map((c) => ({
            productId: c.productId,
            variantId: c.variantId,
            productName: c.name,
            sku: c.sku,
            color: c.color,
            size: c.size,
            unitPriceXof: c.unitPriceXof,
            quantity: c.quantity,
            imageUrl: c.imageUrl,
          })),
          trackingNumber: null,
          notes: 'Created via authenticated checkout; awaiting verified payment gateway webhook.',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        const sel = providers.find((p) => p.id === paymentMethod);
        clearCart();
        setOrderConfirmation({
          orderId,
          orderNumber,
          totalXof,
          paymentStatus: 'awaiting_verification',
          providerConfigured: Boolean(sel?.configured),
          missingEnvVars: sel?.missingEnvVars || [],
        });
        toast(tr(`Commande ${orderNumber} enregistrée.`, `Order ${orderNumber} placed.`), 'success');
        return;
      }

      throw new Error(data.error || tr('Impossible de finaliser la commande.', 'Checkout could not be completed.'));
    } catch (err: any) {
      toast(err?.message || tr('Erreur lors de la création de la commande.', 'Unable to create order.'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (orderConfirmation) {
    return (
      <main
        className={`${
          isAppMode ? 'pt-6 pb-12' : 'pt-28 pb-24'
        } max-w-2xl mx-auto px-4 sm:px-5`}
      >
        <div className="border border-black/20 bg-white p-8 md:p-10 space-y-6">
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-black/60">
              {tr('Commande créée · Stock réservé', 'Order Created · Stock Reserved')}
            </p>
            <h1 className="font-editorial text-3xl md:text-4xl text-black">
              {tr('Commande', 'Order')} {orderConfirmation.orderNumber}
            </h1>
            <p className="text-sm font-light text-black/75">
              {tr('Total à régler :', 'Total due:')}{' '}
              <span className="font-bold tabular-nums text-black">
                {formatXOF(orderConfirmation.totalXof)}
              </span>
            </p>
          </div>

          <div className="p-4 border border-black/15 bg-black/[0.02] space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase tracking-[0.14em] text-black/60">
                {tr('Statut paiement', 'Payment State')}
              </span>
              <span className="uppercase font-bold text-black">
                {orderConfirmation.paymentStatus}
              </span>
            </div>
            {orderConfirmation.reservationExpiresAt && (
              <div className="flex items-center justify-between">
                <span className="font-bold uppercase tracking-[0.14em] text-black/60">
                  {tr('Stock réservé jusqu’à', 'Stock Hold Until')}
                </span>
                <span className="font-light text-black">
                  {new Date(orderConfirmation.reservationExpiresAt).toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>

          {!orderConfirmation.providerConfigured ? (
            <div className="p-4 border border-black bg-black/[0.03] space-y-2 text-xs text-black">
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4 text-black shrink-0" />
                <span>
                  {tr(
                    'Identifiants passerelle de paiement non configurés',
                    'External Payment Gateway Credentials Not Supplied'
                  )}
                </span>
              </div>
              <p className="font-light leading-relaxed text-black/80">
                {tr(
                  'Votre commande est enregistrée en attente de vérification. Seule une notification webhook vérifiée du prestataire marque une commande comme payée.',
                  'Your order is securely stored in awaiting_verification state. Only a verified server-side webhook from the payment provider marks an order as paid.'
                )}
              </p>
              {orderConfirmation.missingEnvVars.length > 0 && (
                <p className="font-light text-[11px] text-black/70">
                  {tr('Configuration manquante :', 'Missing configuration:')}{' '}
                  {orderConfirmation.missingEnvVars.join(', ')}
                </p>
              )}
            </div>
          ) : (
            <div className="p-4 border border-black/15 bg-black/[0.02] text-xs font-light text-black">
              {tr(
                'En attente de confirmation vérifiée du prestataire avant préparation de la commande.',
                'Awaiting verified payment notification from provider webhook before fulfillment begins.'
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/orders')}
              className="px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-[0.18em] cursor-pointer"
            >
              {tr('Voir mes commandes', 'View Order History')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/shop')}
              className="px-6 py-3 border border-black text-black text-xs font-bold uppercase tracking-[0.18em] cursor-pointer"
            >
              {tr('Continuer vos achats', 'Continue Shopping')}
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      className={`${
        isAppMode ? 'pt-5 pb-12' : 'pt-28 pb-24'
      } max-w-[1440px] mx-auto px-4 md:px-10`}
    >
      <div className="pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[10.5px] font-bold uppercase tracking-[0.24em] text-black/50">
            {tr('Paiement KIKI JONES', 'KIKI JONES Checkout')}
          </p>
          <h1 className="font-editorial text-4xl text-black mt-1">
            {tr('Livraison & Paiement', 'Delivery & Payment')}
          </h1>
        </div>
        {!user && (
          <button
            type="button"
            onClick={() => loginWithGoogle()}
            className="text-xs font-bold uppercase tracking-[0.16em] text-black bg-[#F7F7F7] px-4 py-2.5 hover:bg-black hover:text-white cursor-pointer"
          >
            {tr('Se connecter avec Google pour le suivi', 'Sign in with Google for Order Tracking')}
          </button>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="py-16 text-center space-y-4">
          <p className="font-editorial text-2xl">
            {tr('Aucun article dans votre panier.', 'No items in your bag to check out.')}
          </p>
          <button
            type="button"
            onClick={() => navigate('/shop')}
            className="px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-[0.18em] cursor-pointer"
          >
            {tr('Parcourir la boutique', 'Browse Catalog')}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmitOrder} className="pt-10 grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Checkout Form */}
          <div className="lg:col-span-7 space-y-10">
            <section className="space-y-4">
              <h2 className="font-editorial text-2xl text-black">
                {tr('1. Coordonnées client', '1. Client Details')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block space-y-1.5 text-xs">
                  <span className="font-bold uppercase tracking-[0.14em] text-black/60">
                    {tr('Nom complet *', 'Full Name *')}
                  </span>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-white border border-black/25 px-4 py-3 text-sm font-light focus:outline-none focus:border-black"
                  />
                </label>
                <label className="block space-y-1.5 text-xs">
                  <span className="font-bold uppercase tracking-[0.14em] text-black/60">
                    {tr('E-mail *', 'Email *')}
                  </span>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full bg-white border border-black/25 px-4 py-3 text-sm font-light focus:outline-none focus:border-black"
                  />
                </label>
                <label className="block space-y-1.5 text-xs sm:col-span-2">
                  <span className="font-bold uppercase tracking-[0.14em] text-black/60">
                    {tr('Téléphone (Mobile Money / Livreur) *', 'Phone (Mobile Money / Courier) *')}
                  </span>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+225 07 00 00 00 00"
                    className="w-full bg-white border border-black/25 px-4 py-3 text-sm font-light focus:outline-none focus:border-black"
                  />
                </label>
              </div>
            </section>

            <section className="space-y-4 pt-4">
              <h2 className="font-editorial text-2xl text-black">
                {tr('2. Adresse de livraison', '2. Shipping Destination')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block space-y-1.5 text-xs sm:col-span-2">
                  <span className="font-bold uppercase tracking-[0.14em] text-black/60">
                    {tr('Rue / Quartier *', 'Street Address / District *')}
                  </span>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full bg-white border border-black/25 px-4 py-3 text-sm font-light focus:outline-none focus:border-black"
                  />
                </label>
                <label className="block space-y-1.5 text-xs">
                  <span className="font-bold uppercase tracking-[0.14em] text-black/60">
                    {tr('Ville *', 'City *')}
                  </span>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-white border border-black/25 px-4 py-3 text-sm font-light focus:outline-none focus:border-black"
                  />
                </label>
                <label className="block space-y-1.5 text-xs">
                  <span className="font-bold uppercase tracking-[0.14em] text-black/60">
                    {tr('Pays *', 'Country *')}
                  </span>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-white border border-black/25 px-4 py-3 text-sm font-light focus:outline-none focus:border-black"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('standard')}
                  className={`p-4 border text-left cursor-pointer ${
                    deliveryMethod === 'standard'
                      ? 'border-black bg-black text-white'
                      : 'border-black/20 bg-white text-black'
                  }`}
                >
                  <div className="flex justify-between text-xs font-bold">
                    <span>{tr('Livraison standard', 'Standard Delivery')}</span>
                    <span className="tabular-nums">
                      {discountedSubtotal >= freeThreshold
                        ? tr('Offerte', 'Complimentary')
                        : formatXOF(storefrontConfig.standardShippingXof || 3500)}
                    </span>
                  </div>
                  <p
                    className={`text-[11px] font-light mt-1 ${
                      deliveryMethod === 'standard' ? 'text-white/75' : 'text-black/60'
                    }`}
                  >
                    {tr('2 à 4 jours ouvrés', '2–4 business days')}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('express')}
                  className={`p-4 border text-left cursor-pointer ${
                    deliveryMethod === 'express'
                      ? 'border-black bg-black text-white'
                      : 'border-black/20 bg-white text-black'
                  }`}
                >
                  <div className="flex justify-between text-xs font-bold">
                    <span>{tr('Coursier Express', 'Express Courier')}</span>
                    <span className="tabular-nums">
                      {formatXOF(storefrontConfig.expressShippingXof || 7500)}
                    </span>
                  </div>
                  <p
                    className={`text-[11px] font-light mt-1 ${
                      deliveryMethod === 'express' ? 'text-white/75' : 'text-black/60'
                    }`}
                  >
                    {tr('Expédition le jour même ou lendemain', 'Same / Next day dispatch')}
                  </p>
                </button>
              </div>
            </section>

            <section className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <h2 className="font-editorial text-2xl text-black">
                  {tr('3. Moyen de paiement (FCFA)', '3. Payment Method (XOF)')}
                </h2>
                <span className="inline-flex items-center gap-1 text-[11px] font-light text-black/60">
                  <Lock className="w-3 h-3" />
                  {tr('Sécurisé par webhook', 'Webhook-Verified')}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    id: 'wave' as PaymentMethod,
                    label: 'Wave',
                    note: tr('Paiement mobile instantané (FCFA)', 'Instant Mobile Payment (XOF)'),
                  },
                  {
                    id: 'orange_money' as PaymentMethod,
                    label: 'Orange Money',
                    note: tr('Portefeuille UEMOA (FCFA)', 'UEMOA Mobile Wallet (XOF)'),
                  },
                  {
                    id: 'mobile_money' as PaymentMethod,
                    label: 'Mobile Money',
                    note: tr('MTN / Moov Money (FCFA)', 'MTN / Moov Money (XOF)'),
                  },
                  {
                    id: 'visa' as PaymentMethod,
                    label: 'Visa',
                    note: tr('Carte bancaire 3DS sécurisée', '3DS Secure Card Payment'),
                  },
                  {
                    id: 'mastercard' as PaymentMethod,
                    label: 'Mastercard',
                    note: tr('Carte bancaire 3DS sécurisée', '3DS Secure Card Payment'),
                  },
                ].map((m) => {
                  const status = providers.find((p) => p.id === m.id);
                  const active = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`p-4 border text-left cursor-pointer transition-colors ${
                        active ? 'border-black bg-black text-white' : 'border-black/20 bg-white text-black'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold">{m.label}</span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-[0.14em] ${
                            active ? 'text-white/80' : 'text-black/60'
                          }`}
                        >
                          {status?.configured ? tr('Prêt', 'Ready') : tr('En attente', 'Config Pending')}
                        </span>
                      </div>
                      <p
                        className={`text-[11px] font-light mt-1 ${
                          active ? 'text-white/75' : 'text-black/65'
                        }`}
                      >
                        {m.note}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Right Summary */}
          <div className="lg:col-span-5">
            <div className="bg-[#F7F7F7] p-6 md:p-8 space-y-6 sticky top-24">
              <h2 className="font-editorial text-2xl text-black">
                {tr('Résumé du panier', 'Bag Summary')}
              </h2>

              <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.variantId} className="flex justify-between gap-3 text-xs">
                    <div>
                      <p className="font-bold text-black">{item.name}</p>
                      <p className="font-light text-black/60">
                        {item.color} / {item.size} &times; {item.quantity}
                      </p>
                    </div>
                    <span className="tabular-nums font-bold">
                      {formatXOF(item.unitPriceXof * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex gap-2">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder={tr('Code promo (ex. KIKIJONES10)', 'Promo code (e.g. KIKIJONES10)')}
                  className="flex-1 bg-white px-3 py-2.5 text-xs font-light uppercase focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="px-4 py-2.5 bg-white text-xs font-bold uppercase tracking-[0.14em] hover:bg-black hover:text-white cursor-pointer"
                >
                  {tr('Appliquer', 'Apply')}
                </button>
              </div>

              <div className="space-y-2.5 text-sm pt-2">
                <div className="flex justify-between">
                  <span className="font-light text-black/75">{tr('Sous-total', 'Subtotal')}</span>
                  <span className="tabular-nums font-bold">{formatXOF(cartSubtotalXof)}</span>
                </div>
                {discountXof > 0 && (
                  <div className="flex justify-between text-black">
                    <span className="font-light">
                      {tr('Réduction', 'Discount')} ({appliedPromo?.code})
                    </span>
                    <span className="tabular-nums font-bold">-{formatXOF(discountXof)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="font-light text-black/75">{tr('Livraison', 'Shipping')}</span>
                  <span className="tabular-nums font-light">
                    {shippingFeeXof === 0 ? tr('Offerte', 'Complimentary') : formatXOF(shippingFeeXof)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold pt-2">
                  <span>Total</span>
                  <span className="tabular-nums">{formatXOF(totalXof)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 px-6 bg-black text-white text-xs font-bold uppercase tracking-[0.2em] hover:bg-black/85 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {submitting
                  ? tr('Réservation du stock...', 'Reserving Inventory...')
                  : tr(`Confirmer la commande (${formatXOF(totalXof)})`, `Place Order (${formatXOF(totalXof)})`)}
              </button>

              <p className="text-[11px] font-light text-black/60 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {tr(
                    'Le stock est réservé de manière sécurisée pendant 15 minutes dès validation.',
                    'Inventory is reserved transactionally for 15 minutes upon order placement.'
                  )}
                </span>
              </p>
            </div>
          </div>
        </form>
      )}
    </main>
  );
}
