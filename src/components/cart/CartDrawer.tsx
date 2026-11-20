import React from 'react';
import { X, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatXOF } from '../../lib/format';

export function CartDrawer() {
  const {
    cart,
    cartOpen,
    setCartOpen,
    updateCartQty,
    removeFromCart,
    cartSubtotalXof,
    storefrontConfig,
    navigate,
  } = useStore();

  if (!cartOpen) return null;

  const freeThreshold = storefrontConfig.freeShippingThresholdXof || 75000;
  const remainingForFree = Math.max(0, freeThreshold - cartSubtotalXof);
  const progressPct = Math.min(100, Math.round((cartSubtotalXof / freeThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="fixed inset-0 bg-black/45 transition-opacity"
        onClick={() => setCartOpen(false)}
      />
      <aside
        aria-label="Shopping Bag"
        className="relative w-full max-w-md bg-white h-full flex flex-col rounded-none shadow-2xl"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-black/10 flex items-center justify-between">
          <div>
            <h2 className="font-editorial text-2xl text-black">Shopping Bag</h2>
            <p className="text-[11px] font-light uppercase tracking-[0.16em] text-black/55 tabular-nums">
              {cart.reduce((s, i) => s + i.quantity, 0)} Items Selected
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCartOpen(false)}
            aria-label="Close bag"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-black hover:opacity-65 cursor-pointer"
          >
            <X className="w-5 h-5" strokeWidth={1.6} />
          </button>
        </div>

        {/* Free Delivery Progress */}
        <div className="px-6 py-3 bg-[#F5F5F5] space-y-2">
          <p className="text-xs font-light text-black">
            {remainingForFree === 0
              ? 'Complimentary standard delivery unlocked.'
              : `Add ${formatXOF(remainingForFree)} more for complimentary standard delivery.`}
          </p>
          <div className="h-[2px] bg-black/15 w-full overflow-hidden">
            <div
              className="h-full bg-black transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Line Items */}
        <div className="flex-1 overflow-y-auto px-6 py-5 divide-y divide-black/10">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
              <p className="font-editorial text-2xl text-black">Your bag is empty</p>
              <p className="text-xs font-light text-black/65 max-w-xs leading-relaxed">
                Explore the latest KIKI JONES arrivals across Women, Men, Girls, Boys, and Accessories.
              </p>
              <button
                type="button"
                onClick={() => {
                  setCartOpen(false);
                  navigate('/new-in');
                }}
                className="px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-[0.18em] hover:bg-black/85 transition-colors cursor-pointer"
              >
                Shop New In
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.variantId} className="flex gap-4 py-4 first:pt-0">
                <button
                  type="button"
                  onClick={() => {
                    setCartOpen(false);
                    navigate(`/product/${item.slug}`);
                  }}
                  className="w-20 aspect-[4/5] bg-[#F5F5F5] shrink-0 overflow-hidden cursor-pointer self-start"
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top block"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[9px] font-bold tracking-[0.16em] uppercase text-black/60">
                      KIKI JONES
                    </div>
                  )}
                </button>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xs font-bold uppercase tracking-[0.06em] text-black truncate">
                        {item.name}
                      </h3>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.variantId)}
                        aria-label={`Remove ${item.name}`}
                        className="text-black/45 hover:text-black p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs font-light text-black/65 mt-0.5">
                      {item.color} &middot; Size {item.size}
                    </p>
                    <p className="text-[11px] font-light text-black/45 mt-0.5">{item.sku}</p>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-black/15">
                      <button
                        type="button"
                        onClick={() => updateCartQty(item.variantId, item.quantity - 1)}
                        aria-label="Decrease quantity"
                        className="w-8 h-8 flex items-center justify-center hover:bg-black/5 cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-xs tabular-nums font-bold">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCartQty(item.variantId, item.quantity + 1)}
                        aria-label="Increase quantity"
                        className="w-8 h-8 flex items-center justify-center hover:bg-black/5 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-xs font-bold tabular-nums">
                      {formatXOF(item.unitPriceXof * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        {cart.length > 0 && (
          <div className="p-6 bg-[#F5F5F5] border-t border-black/10 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-light text-black/75">Estimated Subtotal</span>
              <span className="font-bold tabular-nums text-black">
                {formatXOF(cartSubtotalXof)}
              </span>
            </div>
            <p className="text-[11px] font-light text-black/55">
              Taxes included. Shipping and promo codes applied at checkout.
            </p>
            <div className="grid grid-cols-1 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setCartOpen(false);
                  navigate('/checkout');
                }}
                className="w-full py-3.5 px-6 bg-black text-white text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-black/85 transition-colors cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setCartOpen(false);
                  navigate('/cart');
                }}
                className="w-full py-3 px-6 border border-black/15 bg-white text-black text-xs font-bold uppercase tracking-[0.2em] hover:border-black hover:bg-black hover:text-white transition-colors cursor-pointer"
              >
                View Full Bag
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
