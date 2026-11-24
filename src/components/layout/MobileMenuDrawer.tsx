import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, User, Shield, Globe } from 'lucide-react';
import { DivisionKey } from '../../lib/navigationData';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { MobileShopDirectory } from './MobileShopDirectory';
import { BrandLogo } from '../brand/BrandLogo';
import { KJ_DURATION, KJ_EASE, KJ_TRANSITION } from '../../motion/motionConfig';
import { useMotionSystem } from '../../motion/MotionProvider';

interface MobileMenuDrawerProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
  wishlistCount: number;
  isAdmin: boolean;
}

export function MobileMenuDrawer({
  open,
  onClose,
  onNavigate,
  wishlistCount,
  isAdmin,
}: MobileMenuDrawerProps) {
  const { lang, setLang, tr } = useLanguage();
  const { route } = useStore();
  const { prefersReducedMotion } = useMotionSystem();
  const [selectedDivision, setSelectedDivision] = useState<DivisionKey>('women');

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  // Sync active division with the current route whenever the drawer opens
  useEffect(() => {
    if (!open) return;
    if (route.page === 'audience') {
      if (route.audience === 'men') setSelectedDivision('men');
      else if (route.audience === 'girls' || route.audience === 'boys') setSelectedDivision('kids');
      else setSelectedDivision('women');
    } else if (route.page === 'brand') {
      if (route.slug === 'kiki-men') setSelectedDivision('men');
      else if (route.slug === 'kiki-curve') setSelectedDivision('curve');
      else if (route.slug === 'kiki-sport') setSelectedDivision('sport');
      else if (route.slug === 'kiki-kids') setSelectedDivision('kids');
      else setSelectedDivision('women');
    } else if (
      (route.page === 'collection' && route.slug === 'sport') ||
      (route.page === 'category' && route.slug === 'activewear')
    ) {
      setSelectedDivision('sport');
    }
  }, [open, route]);

  const go = (path: string) => {
    onNavigate(path);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={KJ_TRANSITION.backdrop}
            onClick={onClose}
            className="fixed inset-0 bg-black/45 backdrop-blur-md z-50"
          />

          <motion.aside
            initial={prefersReducedMotion ? { opacity: 0 } : { x: '-100%' }}
            animate={{ x: 0, opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { x: '-100%' }}
            transition={{
              duration: prefersReducedMotion ? 0.14 : KJ_DURATION.menu,
              ease: KJ_EASE.editorial,
            }}
            aria-label={tr('Navigation mobile', 'Mobile Navigation')}
            className="fixed top-0 left-0 bottom-0 w-full sm:max-w-[430px] bg-white/94 backdrop-blur-2xl backdrop-saturate-[1.85] text-black z-50 flex flex-col shadow-2xl pt-safe"
          >
            {/* Pure KIKI JONES Architectural Header */}
            <div className="px-4 h-[54px] border-b border-black/[0.08] bg-white/80 backdrop-blur-xl flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => go('/')}
                aria-label={tr('Accueil KIKI JONES', 'KIKI JONES Home')}
                className="inline-flex items-center gap-2.5 text-black cursor-pointer"
              >
                <BrandLogo variant="drawer" tone="dark" />
                <span className="h-3.5 w-px bg-black/20" />
                <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-black/45">
                  {tr('Menu', 'Index')}
                </span>
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
                  className="inline-flex items-center gap-1 min-h-[34px] px-2.5 rounded-full border border-black/15 bg-white/80 text-[10px] font-bold uppercase tracking-[0.12em] text-black hover:border-black cursor-pointer transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" strokeWidth={1.7} />
                  <span>{lang === 'fr' ? 'FR / EN' : 'EN / FR'}</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label={tr('Fermer le menu', 'Close navigation menu')}
                  className="min-h-[40px] min-w-[40px] -mr-1.5 inline-flex items-center justify-center text-black/75 hover:text-black cursor-pointer"
                >
                  <X className="w-5 h-5" strokeWidth={1.7} />
                </button>
              </div>
            </div>

            {/* Scrollable Editorial Directory (100% Desktop Mega-Menu Parity + Dynamic Sub-Menus) */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <MobileShopDirectory
                selectedDivision={selectedDivision}
                onSelectDivision={setSelectedDivision}
                onNavigate={go}
              />
            </div>

            {/* Bottom Account, Wishlist & Install Bar */}
            <div className="px-4 pt-3 pb-[calc(0.85rem+env(safe-area-inset-bottom))] border-t border-black/[0.08] bg-white/85 backdrop-blur-xl space-y-2 shrink-0">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => go('/account')}
                  className="min-h-[44px] flex items-center justify-center gap-2 py-2 border border-black/15 bg-white/90 text-[11px] font-bold uppercase tracking-[0.14em] text-black hover:border-black cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  {tr('Compte', 'Account')}
                </button>
                <button
                  type="button"
                  onClick={() => go('/wishlist')}
                  className="min-h-[44px] flex items-center justify-center gap-2 py-2 border border-black/15 bg-white/90 text-[11px] font-bold uppercase tracking-[0.14em] text-black hover:border-black cursor-pointer"
                >
                  <Heart className="w-3.5 h-3.5" />
                  {tr('Favoris', 'Wishlist')} {wishlistCount > 0 ? `(${wishlistCount})` : ''}
                </button>
              </div>
              <PWAInstallButton variant="drawer" />
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => go('/admin')}
                  className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2 bg-black text-white text-[11px] font-bold uppercase tracking-[0.16em] cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5" />
                  {tr('Administration', 'Admin Studio')}
                </button>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
