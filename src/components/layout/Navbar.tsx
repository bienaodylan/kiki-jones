import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { ShoppingBag, User, Search, Heart, Menu } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import {
  DivisionKey,
  FLOATING_SUBNAV_BY_DIVISION,
  MegaMenuKey,
  PRIMARY_NAV_ITEMS,
} from '../../lib/navigationData';
import { MegaMenu } from './MegaMenu';
import { MobileMenuDrawer } from './MobileMenuDrawer';

export function Navbar() {
  const {
    route,
    navigate,
    cartCount,
    setCartOpen,
    wishlistCount,
    setSearchOpen,
  } = useStore();
  const { isAdmin } = useAuth();
  const shouldReduceMotion = useReducedMotion();

  const isHome = route.page === 'home';
  const { scrollY } = useScroll();

  const [viewport, setViewport] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1280,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  }));
  const [scrolledSolid, setScrolledSolid] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<MegaMenuKey | null>(null);
  const [hoveredDivision, setHoveredDivision] = useState<DivisionKey | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const updateViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    updateViewport();
    window.addEventListener('resize', updateViewport, { passive: true });
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  useEffect(() => {
    const threshold = isHome ? Math.max(240, Math.round(viewport.height * 0.48)) : 10;
    const onScroll = () => {
      setScrolledSolid(window.scrollY > threshold);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome, viewport.height]);

  useEffect(() => {
    setActiveMegaMenu(null);
    setHoveredDivision(null);
    setMobileMenuOpen(false);
  }, [route]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    };
  }, []);

  // Derive active Fashion Nova–style division from current route
  const routeDivision: DivisionKey = useMemo(() => {
    if (route.page === 'audience') {
      if (route.audience === 'men') return 'men';
      if (route.audience === 'girls' || route.audience === 'boys') return 'kids';
      return 'women';
    }
    if (route.page === 'brand') {
      if (route.slug === 'kiki-men') return 'men';
      if (route.slug === 'kiki-curve') return 'curve';
      if (route.slug === 'kiki-sport') return 'sport';
      if (route.slug === 'kiki-kids') return 'kids';
      return 'women';
    }
    if (route.page === 'collection' && route.slug === 'sport') return 'sport';
    if (route.page === 'category' && route.slug === 'activewear') return 'sport';
    return 'women';
  }, [route]);

  const activeDivision: DivisionKey = hoveredDivision ?? routeDivision;
  const floatingItems = FLOATING_SUBNAV_BY_DIVISION[activeDivision] || FLOATING_SUBNAV_BY_DIVISION.women;

  const openMegaMenu = (key: MegaMenuKey, division?: DivisionKey) => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (division) setHoveredDivision(division);
    setActiveMegaMenu(key);
  };

  const scheduleCloseMegaMenu = () => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => {
      setActiveMegaMenu(null);
      setHoveredDivision(null);
    }, 160);
  };

  const cancelCloseMegaMenu = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  // Hero-to-header scroll-docking wordmark animation on Homepage
  const heroCenterY = Math.max(150, Math.round(viewport.height * 0.47 - 28));
  const dockEnd = Math.max(220, Math.round(viewport.height * 0.44));
  const logoY = useTransform(scrollY, [0, dockEnd], [heroCenterY, 0]);
  const initialScale = viewport.width >= 1024 ? 2.15 : viewport.width >= 640 ? 1.8 : 1.45;
  const logoScale = useTransform(scrollY, [0, dockEnd], [initialScale, 1]);

  const isSolid = !isHome || scrolledSolid || activeMegaMenu !== null;

  const isItemActive = (key: string) => {
    if (key === 'women') {
      return (
        (route.page === 'audience' && route.audience === 'women') ||
        (route.page === 'brand' && (route.slug === 'kiki-luxe' || route.slug === 'kiki-sculpt'))
      );
    }
    if (key === 'curve') return route.page === 'brand' && route.slug === 'kiki-curve';
    if (key === 'men') {
      return (
        (route.page === 'audience' && route.audience === 'men') ||
        (route.page === 'brand' && route.slug === 'kiki-men')
      );
    }
    if (key === 'sport') {
      return (
        (route.page === 'brand' && route.slug === 'kiki-sport') ||
        (route.page === 'collection' && route.slug === 'sport') ||
        (route.page === 'category' && route.slug === 'activewear')
      );
    }
    if (key === 'kids') {
      return (
        (route.page === 'brand' && route.slug === 'kiki-kids') ||
        (route.page === 'audience' && (route.audience === 'girls' || route.audience === 'boys'))
      );
    }
    if (key === 'brands') return route.page === 'brands';
    if (key === 'categories') return route.page === 'categories' || route.page === 'category';
    return false;
  };

  if (route.page === 'admin') {
    return null;
  }

  return (
    <>
      <header
        onMouseLeave={scheduleCloseMegaMenu}
        onMouseEnter={cancelCloseMegaMenu}
        className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-250 ${
          isSolid
            ? 'bg-white text-black shadow-[0_1px_0_rgba(0,0,0,0.08)]'
            : 'bg-transparent text-white'
        }`}
      >
        {/* Subtle dark top scrim over hero at scroll 0 so white nav stays legible */}
        {!isSolid && (
          <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/30 to-transparent pointer-events-none" />
        )}

        {/* ROW 1: Fashion Nova–Style Primary Division Header + Centered Wordmark + Utilities */}
        <div className="relative max-w-[1440px] mx-auto px-3 sm:px-6 xl:px-10 h-[52px] lg:h-[56px] grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 lg:gap-4">
          {/* LEFT ZONE: Mobile Controls (< lg) + Desktop Division Tabs (>= lg) */}
          <div className="flex items-center justify-start min-w-0">
            {/* Mobile Left Icons: Menu + Search */}
            <div className="flex lg:hidden items-center gap-0.5">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
                className="p-2 -ml-1.5 inline-flex items-center justify-center hover:opacity-70 transition-opacity cursor-pointer"
              >
                <Menu className="w-5 h-5" strokeWidth={1.65} />
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="p-2 inline-flex items-center justify-center hover:opacity-70 transition-opacity cursor-pointer"
              >
                <Search className="w-[18px] h-[18px]" strokeWidth={1.65} />
              </button>
            </div>

            {/* Desktop Division Tabs (Women · Curve · Men · Sport · Kids · Brands · Categories) */}
            <nav
              aria-label="Primary Divisions"
              className="hidden lg:flex items-center justify-start gap-3 xl:gap-4 text-[10px] xl:text-[10.5px] font-bold uppercase tracking-[0.09em] xl:tracking-[0.12em]"
            >
              {PRIMARY_NAV_ITEMS.map((item) => {
                const active = isItemActive(item.key);
                const megaKey: MegaMenuKey | null = item.hasMegaMenu
                  ? (item.key as MegaMenuKey)
                  : null;
                const isMenuOpen = Boolean(megaKey && activeMegaMenu === megaKey);
                const divisionForHover: DivisionKey | undefined =
                  item.key === 'women' ||
                  item.key === 'curve' ||
                  item.key === 'men' ||
                  item.key === 'sport' ||
                  item.key === 'kids'
                    ? item.key
                    : undefined;

                return (
                  <div
                    key={item.key}
                    onMouseEnter={() => {
                      if (megaKey) {
                        openMegaMenu(megaKey, divisionForHover);
                      } else {
                        setActiveMegaMenu(null);
                      }
                    }}
                    className="py-4"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setActiveMegaMenu(null);
                        setHoveredDivision(null);
                        navigate(item.href);
                      }}
                      className={`whitespace-nowrap shrink-0 leading-none transition-opacity cursor-pointer ${
                        active || isMenuOpen
                          ? 'opacity-100 underline underline-offset-[6px] decoration-[1.5px]'
                          : 'opacity-80 hover:opacity-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  </div>
                );
              })}
            </nav>
          </div>

          {/* CENTER ZONE: KIKI JONES Prominent Wordmark */}
          <div className="flex items-center justify-center">
            {isHome && !shouldReduceMotion && activeMegaMenu === null ? (
              <motion.button
                type="button"
                onClick={() => navigate('/')}
                aria-label="KIKI JONES Home"
                style={{
                  y: logoY,
                  scale: logoScale,
                }}
                className={`font-bold text-base sm:text-lg xl:text-xl tracking-[0.22em] sm:tracking-[0.26em] uppercase whitespace-nowrap shrink-0 leading-none cursor-pointer transition-colors ${
                  isSolid ? 'text-black' : 'text-white'
                }`}
              >
                KIKI JONES
              </motion.button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/')}
                aria-label="KIKI JONES Home"
                className={`font-bold text-base sm:text-lg xl:text-xl tracking-[0.22em] sm:tracking-[0.26em] uppercase whitespace-nowrap shrink-0 leading-none cursor-pointer transition-colors ${
                  isSolid ? 'text-black' : 'text-white'
                }`}
              >
                KIKI JONES
              </button>
            )}
          </div>

          {/* RIGHT ZONE: Utility Icons (Search, Account, Wishlist, Shopping Bag) */}
          <div className="flex items-center justify-end gap-0.5 sm:gap-1.5 shrink-0">
            {isAdmin && (
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className={`hidden xl:inline-flex px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.14em] whitespace-nowrap shrink-0 border transition-colors cursor-pointer mr-1 ${
                  isSolid
                    ? 'border-black/25 text-black hover:bg-black hover:text-white'
                    : 'border-white/50 text-white hover:bg-white hover:text-black'
                }`}
              >
                Admin
              </button>
            )}

            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="hidden lg:inline-flex p-2 items-center justify-center hover:opacity-65 transition-opacity cursor-pointer"
            >
              <Search className="w-[17px] h-[17px]" strokeWidth={1.65} />
            </button>

            <button
              type="button"
              onClick={() => navigate('/account')}
              aria-label="Account"
              className="hidden lg:inline-flex p-2 items-center justify-center hover:opacity-65 transition-opacity cursor-pointer"
            >
              <User className="w-[17px] h-[17px]" strokeWidth={1.65} />
            </button>

            <button
              type="button"
              onClick={() => navigate('/wishlist')}
              aria-label={`Wishlist (${wishlistCount})`}
              className="relative p-2 inline-flex items-center justify-center hover:opacity-65 transition-opacity cursor-pointer"
            >
              <Heart className="w-[17px] h-[17px]" strokeWidth={1.65} />
              {wishlistCount > 0 && (
                <span
                  className={`absolute top-1 right-0.5 min-w-[14px] h-[14px] px-0.5 rounded-full text-[8.5px] font-bold flex items-center justify-center tabular-nums ${
                    isSolid ? 'bg-black text-white' : 'bg-white text-black'
                  }`}
                >
                  {wishlistCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label={`Shopping bag (${cartCount})`}
              className="relative p-2 -mr-1 inline-flex items-center justify-center hover:opacity-65 transition-opacity cursor-pointer"
            >
              <ShoppingBag className="w-[17px] h-[17px]" strokeWidth={1.65} />
              {cartCount > 0 && (
                <span
                  className={`absolute top-1 right-0.5 min-w-[14px] h-[14px] px-0.5 rounded-full text-[8.5px] font-bold flex items-center justify-center tabular-nums ${
                    isSolid ? 'bg-black text-white' : 'bg-white text-black'
                  }`}
                >
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ROW 2: Fashion Nova–Style Floating Warm-Climate Sub-Navigation Ribbon */}
        <nav
          aria-label="Floating Collection Navigation"
          className={`relative border-t transition-colors duration-250 ${
            isSolid
              ? 'bg-white/98 backdrop-blur-md border-black/10 border-b border-b-black/10 text-black'
              : 'bg-black/25 backdrop-blur-sm border-white/15 text-white'
          }`}
        >
          <div className="max-w-[1440px] mx-auto px-3 sm:px-6 xl:px-10 h-9 lg:h-10 flex items-center lg:justify-center gap-4 sm:gap-5 xl:gap-6 overflow-x-auto no-scrollbar">
            {floatingItems.map((sub) => {
              const isSubMenuOpen = Boolean(sub.megaMenuKey && activeMegaMenu === sub.megaMenuKey);
              return (
                <button
                  key={`${activeDivision}-${sub.label}`}
                  type="button"
                  onMouseEnter={() => {
                    if (sub.megaMenuKey) {
                      openMegaMenu(sub.megaMenuKey);
                    }
                  }}
                  onClick={() => {
                    setActiveMegaMenu(null);
                    setHoveredDivision(null);
                    navigate(sub.href);
                  }}
                  className={`whitespace-nowrap shrink-0 text-[10px] lg:text-[10.5px] uppercase tracking-[0.11em] py-2 leading-none transition-opacity cursor-pointer ${
                    sub.highlight
                      ? 'font-bold underline underline-offset-4'
                      : isSubMenuOpen
                        ? 'font-bold opacity-100 underline underline-offset-[5px]'
                        : 'font-medium opacity-85 hover:opacity-100'
                  }`}
                >
                  {sub.label}
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Desktop Floating Mega Menu (triggered by both Row 1 divisions & Row 2 floating ribbon) */}
      <MegaMenu
        activeKey={activeMegaMenu}
        onClose={() => {
          setActiveMegaMenu(null);
          setHoveredDivision(null);
        }}
        onNavigate={navigate}
        onMouseEnter={cancelCloseMegaMenu}
        onMouseLeave={scheduleCloseMegaMenu}
      />

      {/* Mobile Expandable Drawer with Fashion Nova Division Switcher */}
      <MobileMenuDrawer
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onNavigate={navigate}
        wishlistCount={wishlistCount}
        isAdmin={isAdmin}
      />
    </>
  );
}
