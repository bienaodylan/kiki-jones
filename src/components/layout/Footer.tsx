import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { subscribeNewsletter } from '../../lib/firestoreService';

export function Footer() {
  const { navigate, storefrontConfig, toast } = useStore();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = email.trim();
    if (!clean || !clean.includes('@')) {
      toast('Please enter a valid email address.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await subscribeNewsletter(clean, 'footer');
      setSubscribed(true);
      setEmail('');
      toast('Welcome to the KIKI JONES list.', 'success');
    } catch {
      toast('Could not subscribe right now. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="bg-white text-black border-t border-black/10 overflow-hidden">
      {/* Main Columns matching Nude Project clean white editorial footer */}
      <div className="max-w-[1440px] mx-auto px-5 md:px-10 pt-14 pb-10 grid grid-cols-2 md:grid-cols-12 gap-x-8 gap-y-10">
        {/* Newsletter Column */}
        <div className="col-span-2 md:col-span-4 space-y-4 pr-0 md:pr-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-black">
            {storefrontConfig.newsletterTitle || 'Join the KIKI JONES List'}
          </p>
          <p className="text-xs font-light text-black/65 leading-relaxed max-w-sm">
            {storefrontConfig.newsletterBody ||
              'Early access to weekly drops, exclusive releases across Kiki Men, Kiki Curve, Kiki Sculpt, Kiki Luxe, and Kiki Kids.'}
          </p>
          {subscribed ? (
            <div className="px-4 py-3 rounded-full border border-black/20 bg-black/[0.03] text-xs font-medium text-black">
              Thank you — you are on the KIKI JONES list.
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex items-center gap-2 max-w-sm">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                aria-label="Email address for newsletter"
                className="flex-1 bg-white border border-black/25 rounded-full px-4 py-2.5 text-xs font-light text-black placeholder:text-black/40 focus:outline-none focus:border-black"
              />
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-black text-white text-[10.5px] font-bold uppercase tracking-[0.14em] hover:bg-black/85 transition-colors disabled:opacity-50 whitespace-nowrap cursor-pointer"
              >
                <span>{submitting ? 'Joining...' : 'Join'}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </form>
          )}
          <div className="text-[11px] font-light text-black/50 space-y-0.5 pt-2">
            <p>{storefrontConfig.supportEmail || 'care@kikijones.com'}</p>
            <p>{storefrontConfig.supportPhone || '+225 07 00 00 00 00'}</p>
          </div>
        </div>

        {/* Shop by Brand */}
        <div className="col-span-1 md:col-span-2 space-y-3">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-black">
            Shop by Brand
          </p>
          <ul className="space-y-2 text-xs font-light text-black/70">
            <li>
              <button onClick={() => navigate('/brands')} className="hover:text-black hover:underline underline-offset-4 cursor-pointer">
                All Brands
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/brand/kiki-men')} className="hover:text-black hover:underline underline-offset-4 cursor-pointer">
                Kiki Men
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/brand/kiki-curve')} className="hover:text-black hover:underline underline-offset-4 cursor-pointer">
                Kiki Curve
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/brand/kiki-sculpt')} className="hover:text-black hover:underline underline-offset-4 cursor-pointer">
                Kiki Sculpt
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/brand/kiki-luxe')} className="hover:text-black hover:underline underline-offset-4 cursor-pointer">
                Kiki Luxe
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/brand/kiki-sport')} className="hover:text-black hover:underline underline-offset-4 cursor-pointer">
                Kiki Sport
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/brand/kiki-kids')} className="hover:text-black hover:underline underline-offset-4 cursor-pointer">
                Kiki Kids
              </button>
            </li>
          </ul>
        </div>

        {/* Shop by Category */}
        <div className="col-span-1 md:col-span-2 space-y-3">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-black">
            Shop by Category
          </p>
          <ul className="space-y-2 text-xs font-light text-black/70">
            <li>
              <button onClick={() => navigate('/categories')} className="hover:text-black hover:underline underline-offset-4 cursor-pointer">
                All Categories
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/category/dresses')} className="hover:text-black hover:underline underline-offset-4 cursor-pointer">
                Dresses &amp; Formal
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/category/matching-sets')} className="hover:text-black hover:underline underline-offset-4 cursor-pointer">
                Matching Sets
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/category/jumpsuits')} className="hover:text-black hover:underline underline-offset-4 cursor-pointer">
                Jumpsuits &amp; Rompers
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/category/activewear')} className="hover:text-black hover:underline underline-offset-4 cursor-pointer">
                Activewear &amp; Sport
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/category/shoes')} className="hover:text-black hover:underline underline-offset-4 cursor-pointer">
                Shoes &amp; Sunglasses
              </button>
            </li>
          </ul>
        </div>

        {/* Client Care */}
        <div className="col-span-1 md:col-span-2 space-y-3">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-black">
            Client Care
          </p>
          <ul className="space-y-2 text-xs font-light text-black/70">
            <li>
              <button onClick={() => navigate('/new-in')} className="hover:text-black hover:underline underline-offset-4 cursor-pointer">
                New Arrivals
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/sale')} className="hover:text-black hover:underline underline-offset-4 cursor-pointer">
                Sale
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/account')} className="hover:text-black hover:underline underline-offset-4 cursor-pointer">
                Account &amp; Profile
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/wishlist')} className="hover:text-black hover:underline underline-offset-4 cursor-pointer">
                Wishlist
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/orders')} className="hover:text-black hover:underline underline-offset-4 cursor-pointer">
                Order History
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/legal/shipping')} className="hover:text-black hover:underline underline-offset-4 cursor-pointer">
                Shipping &amp; Delivery
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/legal/returns')} className="hover:text-black hover:underline underline-offset-4 cursor-pointer">
                Returns &amp; Exchanges
              </button>
            </li>
          </ul>
        </div>

        {/* House & Legal */}
        <div className="col-span-1 md:col-span-2 space-y-3">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-black">
            House &amp; Legal
          </p>
          <ul className="space-y-2 text-xs font-light text-black/70">
            <li>
              <button onClick={() => navigate('/collections')} className="hover:text-black hover:underline underline-offset-4 cursor-pointer">
                Collections
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/legal/privacy')} className="hover:text-black hover:underline underline-offset-4 cursor-pointer">
                Privacy Policy
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/legal/terms')} className="hover:text-black hover:underline underline-offset-4 cursor-pointer">
                Terms of Sale
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/admin')} className="hover:text-black hover:underline underline-offset-4 cursor-pointer">
                Store Administration
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Legal & Currency Bar */}
      <div className="border-t border-black/10">
        <div className="max-w-[1440px] mx-auto px-5 md:px-10 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-light text-black/55">
          <p>&copy; {new Date().getFullYear()} KIKI JONES. All rights reserved.</p>
          <p>West African CFA Franc (XOF) &middot; Wave &middot; Orange Money &middot; Visa &middot; Mastercard</p>
        </div>
      </div>

      {/* Giant Full-Width Editorial Wordmark Footer Signature (Nude Project Style) */}
      <div className="w-full px-3 md:px-6 pb-4 pt-2 select-none pointer-events-none">
        <div className="w-full text-center font-bold uppercase tracking-[-0.045em] leading-[0.82] text-[13.8vw] text-black whitespace-nowrap">
          KIKI JONES
        </div>
      </div>
    </footer>
  );
}
