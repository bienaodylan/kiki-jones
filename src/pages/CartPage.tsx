import React from 'react';
import { Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import { useExperienceMode } from '../context/ExperienceContext';
import { formatXOF } from '../lib/format';

export function CartPage() {
  const { cart, updateCartQty, removeFromCart, cartSubtotalXof, storefrontConfig, navigate } =
    useStore();
  const { tr } = useLanguage();
  const { isAppMode } = useExperienceMode();

  const freeThreshold = storefrontConfig.freeShippingThresholdXof || 75000;
  const shippingEstimate =
    cartSubtotalXof >= freeThreshold ? 0 : storefrontConfig.standardShippingXof || 3500;

  return (
    <main
      className={`${
        isAppMode ? 'pt-5 pb-10' : 'pt-28 pb-24'
      } max-w-[1440px] mx-auto px-4 md:px-10 min-h-[75vh]`}
    >
      <div className="pb-6 flex items-end justify-between">
        <div>
          <p className="text-[10.5px] font-bold uppercase tracking-[0.24em] text-black/50">KIKI JONES</p>
          <h1 className="font-editorial text-4xl text-black mt-1">
            {tr('Votre panier', 'Shopping Bag')}
          </h1>
        </div>
        <button
          type="button"
          onClick={() => navigate('/shop')}
          className="text-xs font-bold uppercase tracking-[0.18em] text-black underline underline-offset-4 cursor-pointer"
        >
          {tr('Continuer vos achats', 'Continue Shopping')}
        </button>
      </div>

      {cart.length === 0 ? (
        <div className="py-20 text-center space-y-5">
          <p className="font-editorial text-3xl text-black">
            {tr('Votre panier est vide', 'Your bag is empty')}
          </p>
          <button
            type="button"
            onClick={() => navigate('/new-in')}
            className="px-8 py-3.5 bg-black text-white text-xs font-bold uppercase tracking-[0.2em] cursor-pointer"
          >
            {tr('Voir les nouveautés', 'Shop New In')}
          </button>
        </div>
      ) : (
        <div className="pt-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-6">
            {cart.map((item) => (
              <div key={item.variantId} className="p-4 bg-[#F7F7F7]/60 flex gap-6 items-start">
                <div className="w-24 bg-[#F7F7F7] shrink-0 overflow-hidden">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-auto block"
                    />
                  )}
                </div>
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => navigate(`/product/${item.slug}`)}
                      className="font-bold text-base text-black hover:opacity-65 cursor-pointer text-left"
                    >
                      {item.name}
                    </button>
                    <p className="text-xs font-light text-black/65">
                      {item.color} &middot; {tr('Taille', 'Size')} {item.size}
                    </p>
                    <p className="text-[11px] font-light text-black/50">{item.sku}</p>
                    <p className="text-xs font-light tabular-nums text-black/80 pt-1">
                      {formatXOF(item.unitPriceXof)} {tr('unité', 'each')}
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center bg-white">
                      <button
                        type="button"
                        onClick={() => updateCartQty(item.variantId, item.quantity - 1)}
                        className="w-9 h-9 flex items-center justify-center hover:bg-black/5 cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-9 text-center text-xs font-bold tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCartQty(item.variantId, item.quantity + 1)}
                        className="w-9 h-9 flex items-center justify-center hover:bg-black/5 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="w-28 text-right text-sm font-bold tabular-nums">
                      {formatXOF(item.unitPriceXof * item.quantity)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.variantId)}
                      aria-label={tr("Retirer l'article", 'Remove item')}
                      className="text-black/50 hover:text-black cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-4 bg-[#F7F7F7] p-6 space-y-5 h-fit">
            <h2 className="font-editorial text-2xl text-black">
              {tr('Récapitulatif', 'Order Summary')}
            </h2>
            <div className="space-y-3 text-sm pb-2">
              <div className="flex justify-between">
                <span className="font-light text-black/75">{tr('Sous-total', 'Subtotal')}</span>
                <span className="tabular-nums font-bold">{formatXOF(cartSubtotalXof)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-light text-black/75">
                  {tr('Livraison standard estimée', 'Estimated Standard Shipping')}
                </span>
                <span className="tabular-nums font-light">
                  {shippingEstimate === 0 ? tr('Offerte', 'Complimentary') : formatXOF(shippingEstimate)}
                </span>
              </div>
            </div>
            <div className="flex justify-between text-base font-bold">
              <span>{tr('Total estimé', 'Estimated Total')}</span>
              <span className="tabular-nums">{formatXOF(cartSubtotalXof + shippingEstimate)}</span>
            </div>
            <button
              type="button"
              onClick={() => navigate('/checkout')}
              className="w-full py-4 px-6 bg-black text-white text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-black/85 cursor-pointer"
            >
              <span>{tr('Passer la commande', 'Proceed to Checkout')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
