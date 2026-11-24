import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Plus, Minus, Trash2, ArrowRight, Menu } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import { useExperienceMode } from '../context/ExperienceContext';
import { formatXOF } from '../lib/format';
import { KJ_DURATION, KJ_EASE } from '../motion/motionConfig';
import { useMotionSystem } from '../motion/MotionProvider';
import { AnimatedValue } from '../motion/InteractivePrimitives';

export function CartPage() {
  const {
    cart,
    updateCartQty,
    removeFromCart,
    cartSubtotalXof,
    storefrontConfig,
    navigate,
    setMobileMenuOpen,
  } = useStore();
  const { tr } = useLanguage();
  const { isAppMode } = useExperienceMode();
  const { prefersReducedMotion } = useMotionSystem();

  const freeThreshold = storefrontConfig.freeShippingThresholdXof || 75000;
  const remainingForFree = Math.max(0, freeThreshold - cartSubtotalXof);
  const progressPct = Math.min(100, Math.round((cartSubtotalXof / freeThreshold) * 100));
  const shippingEstimate =
    cartSubtotalXof >= freeThreshold ? 0 : storefrontConfig.standardShippingXof || 3500;
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const quickMenuLinks = [
    { label: tr('Nouveautés', 'New In'), href: '/new-in' },
    { label: tr('Femme', 'Women'), href: '/women' },
    { label: tr('Homme', 'Men'), href: '/men' },
    { label: 'Curve', href: '/brand/kiki-curve' },
    { label: 'Sport', href: '/brand/kiki-sport' },
    { label: tr('Enfants', 'Kids'), href: '/brand/kiki-kids' },
    { label: tr('Accessoires', 'Accessories'), href: '/accessories' },
    { label: tr('Soldes', 'Sale'), href: '/sale' },
  ];

  return (
    <main
      className={`${
        isAppMode ? 'pt-3 pb-12' : 'pt-[100px] lg:pt-[116px] pb-20'
      } w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 min-h-[75vh] overflow-x-clip bg-white text-black`}
    >
      {/* Quick Menu & Category Ribbon inside Cart Page */}
      <div className="w-full min-w-0 mb-5 pb-3 border-b border-black/10 flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          aria-label={tr('Ouvrir tous les menus', 'Open full menu')}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 bg-black text-white text-[10px] font-bold uppercase tracking-[0.14em] active:opacity-80 transition-opacity cursor-pointer"
        >
          <Menu className="w-3.5 h-3.5" strokeWidth={1.8} />
          <span>{tr('Menus', 'Menu')}</span>
        </button>
        <nav
          aria-label={tr('Accès rapide aux rayons', 'Quick department menu')}
          className="flex-1 min-w-0 flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5"
        >
          {quickMenuLinks.map((link) => (
            <button
              key={link.href}
              type="button"
              onClick={() => navigate(link.href)}
              className="shrink-0 whitespace-nowrap px-3 py-1.5 border border-black/15 bg-white text-[10.5px] font-medium uppercase tracking-[0.1em] text-black/80 hover:border-black hover:text-black transition-colors cursor-pointer"
            >
              {link.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Page Header */}
      <div className="pb-5 border-b border-black/10 flex flex-col sm:flex-row sm:items-end justify-between gap-2.5">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">
            KIKI JONES &middot; {totalItems}{' '}
            {tr(totalItems > 1 ? 'articles' : 'article', totalItems > 1 ? 'items' : 'item')}
          </p>
          <h1 className="font-editorial text-2xl sm:text-4xl text-black mt-0.5 leading-tight">
            {tr('Votre panier', 'Shopping Bag')}
          </h1>
        </div>
        <button
          type="button"
          onClick={() => navigate('/shop')}
          className="self-start sm:self-auto text-[11px] font-bold uppercase tracking-[0.16em] text-black underline underline-offset-4 hover:opacity-65 cursor-pointer whitespace-nowrap"
        >
          {tr('Continuer vos achats', 'Continue Shopping')}
        </button>
      </div>

      {cart.length === 0 ? (
        <div className="py-16 sm:py-20 text-center space-y-5 max-w-md mx-auto">
          <p className="font-editorial text-2xl sm:text-3xl text-black">
            {tr('Votre panier est vide', 'Your bag is empty')}
          </p>
          <p className="text-xs sm:text-sm font-light text-black/65 leading-relaxed">
            {tr(
              'Explorez nos rayons Femme, Homme, Curve, Sport, Enfants et Accessoires depuis le menu ci-dessus.',
              'Explore our Women, Men, Curve, Sport, Kids, and Accessories collections using the menu above.'
            )}
          </p>
          <div className="flex flex-wrap justify-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => navigate('/new-in')}
              className="px-6 py-3.5 bg-black text-white text-xs font-bold uppercase tracking-[0.18em] hover:bg-black/85 transition-colors cursor-pointer"
            >
              {tr('Voir les nouveautés', 'Shop New In')}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="px-6 py-3.5 border border-black text-black text-xs font-bold uppercase tracking-[0.18em] hover:bg-black hover:text-white transition-colors cursor-pointer"
            >
              {tr('Parcourir les menus', 'Browse Menus')}
            </button>
          </div>
        </div>
      ) : (
        <div className="pt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          {/* Cart Line Items */}
          <div className="lg:col-span-8 space-y-3.5 min-w-0 w-full">
            <AnimatePresence initial={false} mode="popLayout">
              {cart.map((item) => (
                <motion.div
                  key={item.variantId}
                  layout={!prefersReducedMotion}
                  initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -18 }}
                  transition={{ duration: KJ_DURATION.dropdown, ease: KJ_EASE.editorial }}
                  className="w-full min-w-0 p-3.5 sm:p-4 bg-[#F7F7F7]/75 border border-black/[0.06] flex gap-3.5 sm:gap-5 items-start"
                >
                  <button
                    type="button"
                    onClick={() => navigate(`/product/${item.slug}`)}
                    className="w-20 sm:w-24 aspect-[4/5] bg-[#EFEFEF] shrink-0 overflow-hidden cursor-pointer"
                  >
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-top block"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[9px] font-bold uppercase tracking-[0.14em] text-black/50">
                        KIKI JONES
                      </div>
                    )}
                  </button>

                  <div className="flex-1 min-w-0 flex flex-col justify-between gap-2.5">
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-start justify-between gap-2 min-w-0">
                        <button
                          type="button"
                          onClick={() => navigate(`/product/${item.slug}`)}
                          className="flex-1 min-w-0 font-bold text-[13px] sm:text-sm text-black leading-snug line-clamp-2 hover:opacity-65 cursor-pointer text-left"
                        >
                          {item.name}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.variantId)}
                          aria-label={tr("Retirer l'article", 'Remove item')}
                          className="shrink-0 -mt-1 -mr-1.5 min-w-[36px] min-h-[36px] inline-flex items-center justify-center text-black/45 hover:text-black cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-[11.5px] font-light text-black/65 truncate">
                        {item.color} &middot; {tr('Taille', 'Size')} {item.size}
                      </p>
                      <p className="text-[10.5px] font-light text-black/45 truncate">{item.sku}</p>
                      <p className="text-[11.5px] font-light tabular-nums text-black/75 pt-0.5">
                        {formatXOF(item.unitPriceXof)} / {tr('unité', 'each')}
                      </p>
                    </div>

                    {/* Quantity & Line Total Row — Strictly Framed Inside Viewport */}
                    <div className="flex items-center justify-between gap-2 flex-wrap pt-1 border-t border-black/[0.06]">
                      <div className="inline-flex items-center bg-white border border-black/15 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateCartQty(item.variantId, item.quantity - 1)}
                          aria-label={tr('Diminuer la quantité', 'Decrease quantity')}
                          className="w-8 h-8 flex items-center justify-center hover:bg-black/5 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <AnimatedValue
                          valueKey={item.quantity}
                          className="w-7 text-center text-xs font-bold tabular-nums"
                        >
                          {item.quantity}
                        </AnimatedValue>
                        <button
                          type="button"
                          onClick={() => updateCartQty(item.variantId, item.quantity + 1)}
                          aria-label={tr('Augmenter la quantité', 'Increase quantity')}
                          className="w-8 h-8 flex items-center justify-center hover:bg-black/5 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <AnimatedValue
                        valueKey={item.unitPriceXof * item.quantity}
                        className="text-[13px] sm:text-sm font-bold tabular-nums text-black whitespace-nowrap shrink-0 ml-auto"
                      >
                        {formatXOF(item.unitPriceXof * item.quantity)}
                      </AnimatedValue>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary Card */}
          <div className="lg:col-span-4 w-full min-w-0 bg-[#F7F7F7] border border-black/[0.06] p-4 sm:p-6 space-y-4 h-fit">
            <h2 className="font-editorial text-xl sm:text-2xl text-black">
              {tr('Récapitulatif', 'Order Summary')}
            </h2>

            {/* Free Delivery Progress */}
            <div className="space-y-1.5 pb-3 border-b border-black/10">
              <p className="text-[11.5px] font-light text-black/75 leading-snug">
                {remainingForFree === 0
                  ? tr('Livraison standard offerte débloquée.', 'Complimentary standard delivery unlocked.')
                  : tr(
                      `Ajoutez ${formatXOF(remainingForFree)} pour la livraison standard offerte.`,
                      `Add ${formatXOF(remainingForFree)} more for complimentary standard delivery.`
                    )}
              </p>
              <div className="h-[2px] bg-black/15 w-full overflow-hidden">
                <motion.div
                  className="h-full bg-black origin-left"
                  initial={false}
                  animate={{ scaleX: progressPct / 100 }}
                  transition={{ duration: KJ_DURATION.menu, ease: KJ_EASE.editorial }}
                />
              </div>
            </div>

            <div className="space-y-2.5 text-xs sm:text-sm pb-2 border-b border-black/10">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-light text-black/75 min-w-0">
                  {tr('Sous-total', 'Subtotal')}
                </span>
                <AnimatedValue
                  valueKey={cartSubtotalXof}
                  className="tabular-nums font-bold whitespace-nowrap shrink-0"
                >
                  {formatXOF(cartSubtotalXof)}
                </AnimatedValue>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-light text-black/75 min-w-0">
                  {tr('Livraison standard', 'Standard Shipping')}
                </span>
                <span className="tabular-nums font-light whitespace-nowrap shrink-0">
                  {shippingEstimate === 0
                    ? tr('Offerte', 'Complimentary')
                    : formatXOF(shippingEstimate)}
                </span>
              </div>
            </div>

            <div className="flex items-baseline justify-between gap-3 text-sm sm:text-base font-bold">
              <span className="min-w-0">{tr('Total estimé', 'Estimated Total')}</span>
              <AnimatedValue
                valueKey={cartSubtotalXof + shippingEstimate}
                className="tabular-nums whitespace-nowrap shrink-0"
              >
                {formatXOF(cartSubtotalXof + shippingEstimate)}
              </AnimatedValue>
            </div>

            <button
              type="button"
              onClick={() => navigate('/checkout')}
              className="w-full min-h-[48px] py-3.5 px-5 bg-black text-white text-xs font-bold uppercase tracking-[0.18em] flex items-center justify-center gap-2 hover:bg-black/85 transition-colors cursor-pointer"
            >
              <span>{tr('Passer la commande', 'Proceed to Checkout')}</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
