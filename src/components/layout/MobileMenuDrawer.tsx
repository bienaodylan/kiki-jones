import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronDown, ArrowRight, Heart, User, Shield, Globe } from 'lucide-react';
import { DivisionKey, MegaMenuKey, PRIMARY_NAV_ITEMS } from '../../lib/navigationData';
import { useLanguage } from '../../context/LanguageContext';
import { getFloatingSubnav, getMegaMenuLocalized, getPrimaryNavLabel } from '../../lib/i18n';
import { PWAInstallButton } from '../pwa/PWAInstallButton';

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
  const [selectedDivision, setSelectedDivision] = useState<DivisionKey>('women');
  const [expandedKey, setExpandedKey] = useState<MegaMenuKey | null>('brands');

  const mobileDivisions: { key: DivisionKey; label: string }[] = [
    { key: 'women', label: tr('Femme', 'Women') },
    { key: 'curve', label: 'Curve' },
    { key: 'men', label: tr('Homme', 'Men') },
    { key: 'sport', label: 'Sport' },
    { key: 'kids', label: tr('Enfants', 'Kids') },
  ];

  const go = (path: string) => {
    onNavigate(path);
    onClose();
  };

  const quickLinks = getFloatingSubnav(selectedDivision, lang);
  const selectedDivLabel =
    mobileDivisions.find((d) => d.key === selectedDivision)?.label || selectedDivision;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/45 z-50"
          />

          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            aria-label={tr('Navigation mobile', 'Mobile Navigation')}
            className="fixed top-0 left-0 bottom-0 w-full max-w-[360px] bg-white text-black z-50 flex flex-col shadow-2xl pt-safe"
          >
            {/* Header */}
            <div className="px-5 h-14 border-b border-black/10 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => go('/')}
                className="font-bold text-base tracking-[0.22em] uppercase text-black cursor-pointer"
              >
                KIKI JONES
              </button>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 border border-black/15 text-[10px] font-bold uppercase tracking-[0.12em] text-black hover:border-black cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{lang === 'fr' ? 'FR / EN' : 'EN / FR'}</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label={tr('Fermer le menu', 'Close navigation menu')}
                  className="p-2 -mr-2 text-black/70 hover:text-black cursor-pointer"
                >
                  <X className="w-5 h-5" strokeWidth={1.6} />
                </button>
              </div>
            </div>

            {/* Division Tabs */}
            <div className="grid grid-cols-5 border-b border-black/10 shrink-0 bg-[#FAFAFA]">
              {mobileDivisions.map((div) => {
                const active = selectedDivision === div.key;
                return (
                  <button
                    key={div.key}
                    type="button"
                    onClick={() => setSelectedDivision(div.key)}
                    className={`py-2.5 text-[10px] uppercase tracking-[0.12em] cursor-pointer transition-colors ${
                      active
                        ? 'font-bold text-black border-b-2 border-black bg-white'
                        : 'font-light text-black/55 hover:text-black'
                    }`}
                  >
                    {div.label}
                  </button>
                );
              })}
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              {/* Division Quick Collections */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/45">
                  {selectedDivLabel.toUpperCase()} &middot; {tr('Sélections du moment', 'Warm-Climate Collections')}
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {quickLinks.map((q) => (
                    <button
                      key={`${selectedDivision}-${q.label}`}
                      type="button"
                      onClick={() => go(q.href)}
                      className={`text-left px-3 py-2 text-xs transition-colors cursor-pointer ${
                        q.highlight
                          ? 'bg-black text-white font-bold uppercase tracking-[0.12em]'
                          : 'bg-[#F5F5F5] text-black hover:bg-black/10 font-light'
                      }`}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Expandable Directory */}
              <div className="divide-y divide-black/10 border-t border-black/10">
                {PRIMARY_NAV_ITEMS.map((item) => {
                  const megaKey: MegaMenuKey | null = item.hasMegaMenu
                    ? (item.key as MegaMenuKey)
                    : null;
                  const mega = getMegaMenuLocalized(megaKey, lang);
                  const isExpanded = Boolean(megaKey && expandedKey === megaKey);
                  const itemLabel = getPrimaryNavLabel(item.key, item.label, lang);

                  if (!mega || !megaKey) return null;

                  return (
                    <div key={item.key} className="py-3">
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => go(item.href)}
                          className="text-xs font-bold uppercase tracking-[0.18em] text-black py-1 cursor-pointer"
                        >
                          {itemLabel}
                        </button>
                        <button
                          type="button"
                          onClick={() => setExpandedKey(isExpanded ? null : megaKey)}
                          aria-label={tr(`Afficher ${itemLabel}`, `Toggle ${itemLabel} categories`)}
                          aria-expanded={isExpanded}
                          className="p-1.5 text-black/70 hover:text-black cursor-pointer"
                        >
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-200 ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                      </div>

                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-3 pb-2 space-y-4 pl-1">
                              {mega.columns.map((col) => (
                                <div key={col.heading} className="space-y-2">
                                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-black/45">
                                    {col.heading}
                                  </p>
                                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                                    {col.links.map((link) => (
                                      <button
                                        key={`${col.heading}-${link.label}`}
                                        type="button"
                                        onClick={() => go(link.href)}
                                        className="text-left text-xs font-light text-black/80 hover:text-black py-0.5 cursor-pointer"
                                      >
                                        {link.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              ))}

                              <button
                                type="button"
                                onClick={() => go(mega.editorial.href)}
                                className="w-full flex items-center justify-between bg-[#F5F5F5] px-3.5 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-black cursor-pointer"
                              >
                                <span>{tr(`Tout voir · ${itemLabel}`, `Shop All ${itemLabel}`)}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Account & Utility Links */}
            <div className="px-5 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] border-t border-black/10 bg-[#FAFAFA] space-y-2.5 shrink-0">
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => go('/account')}
                  className="min-h-[44px] flex items-center justify-center gap-2 py-2.5 border border-black/15 bg-white text-[11px] font-bold uppercase tracking-[0.14em] text-black hover:border-black cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  {tr('Compte', 'Account')}
                </button>
                <button
                  type="button"
                  onClick={() => go('/wishlist')}
                  className="min-h-[44px] flex items-center justify-center gap-2 py-2.5 border border-black/15 bg-white text-[11px] font-bold uppercase tracking-[0.14em] text-black hover:border-black cursor-pointer"
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
                  className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2.5 bg-black text-white text-[11px] font-bold uppercase tracking-[0.16em] cursor-pointer"
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
