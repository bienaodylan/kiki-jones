import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { MotionConfig, useReducedMotion } from 'motion/react';

export type NavigationDirection = 'forward' | 'back' | 'replace';

export interface ProductTransitionOrigin {
  slug: string;
  imageUrl: string;
  rect: { top: number; left: number; width: number; height: number };
  timestamp: number;
}

interface MotionContextValue {
  prefersReducedMotion: boolean;
  isTouchDevice: boolean;
  isCompactViewport: boolean;
  navDirection: NavigationDirection;
  setNavDirection: (dir: NavigationDirection) => void;
  /** Currently morphing product slug for View Transitions API / FLIP continuity */
  transitionProductSlug: string | null;
  productTransitionOrigin: ProductTransitionOrigin | null;
  beginProductTransition: (slug: string, imageUrl?: string, sourceEl?: HTMLElement | null) => void;
  clearProductTransition: () => void;
  /** Increments every time an item is added to bag to animate cart badges */
  cartPulseKey: number;
  triggerCartPulse: () => void;
  /** Launches a restrained GPU-only product thumbnail glide toward the visible cart icon */
  triggerFlyToCart: (imageUrl?: string, sourceEl?: HTMLElement | null) => void;
  /** Tracks last toggled wishlist product id for localized heart animation */
  lastWishlistPulse: { productId: string; ts: number } | null;
  triggerWishlistPulse: (productId: string) => void;
}

const MotionSystemContext = createContext<MotionContextValue | undefined>(undefined);

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const osReduced = useReducedMotion();
  const prefersReducedMotion = Boolean(osReduced);

  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isCompactViewport, setIsCompactViewport] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  const [navDirection, setNavDirection] = useState<NavigationDirection>('forward');
  const [transitionProductSlug, setTransitionProductSlug] = useState<string | null>(null);
  const [productTransitionOrigin, setProductTransitionOrigin] =
    useState<ProductTransitionOrigin | null>(null);
  const [cartPulseKey, setCartPulseKey] = useState(0);
  const [lastWishlistPulse, setLastWishlistPulse] = useState<{
    productId: string;
    ts: number;
  } | null>(null);

  const clearTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const coarse = window.matchMedia('(pointer: coarse)');
    const sync = () => {
      setIsTouchDevice(coarse.matches || navigator.maxTouchPoints > 0);
      setIsCompactViewport(window.innerWidth < 768);
    };
    sync();
    coarse.addEventListener('change', sync);
    window.addEventListener('resize', sync, { passive: true });
    return () => {
      coarse.removeEventListener('change', sync);
      window.removeEventListener('resize', sync);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (clearTimerRef.current) window.clearTimeout(clearTimerRef.current);
    };
  }, []);

  const clearProductTransition = useCallback(() => {
    if (clearTimerRef.current) {
      window.clearTimeout(clearTimerRef.current);
      clearTimerRef.current = null;
    }
    setTransitionProductSlug(null);
    setProductTransitionOrigin(null);
  }, []);

  const beginProductTransition = useCallback(
    (slug: string, imageUrl?: string, sourceEl?: HTMLElement | null) => {
      if (clearTimerRef.current) {
        window.clearTimeout(clearTimerRef.current);
      }
      setTransitionProductSlug(slug);
      if (sourceEl && imageUrl && !prefersReducedMotion) {
        const r = sourceEl.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          setProductTransitionOrigin({
            slug,
            imageUrl,
            rect: { top: r.top, left: r.left, width: r.width, height: r.height },
            timestamp: Date.now(),
          });
        }
      } else {
        setProductTransitionOrigin(null);
      }
      // Auto-clean stale transition state after animation settles
      clearTimerRef.current = window.setTimeout(() => {
        setTransitionProductSlug(null);
        setProductTransitionOrigin(null);
      }, 850);
    },
    [prefersReducedMotion]
  );

  const triggerCartPulse = useCallback(() => {
    setCartPulseKey((k) => k + 1);
  }, []);

  const triggerWishlistPulse = useCallback((productId: string) => {
    setLastWishlistPulse({ productId, ts: Date.now() });
  }, []);

  const triggerFlyToCart = useCallback(
    (imageUrl?: string, sourceEl?: HTMLElement | null) => {
      setCartPulseKey((k) => k + 1);
      if (prefersReducedMotion || typeof document === 'undefined' || !sourceEl || !imageUrl) {
        return;
      }

      // Locate the currently visible shopping bag icon target
      const candidates = Array.from(
        document.querySelectorAll<HTMLElement>('[data-kj-cart-target="true"]')
      );
      const target = candidates.find((el) => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.left >= 0;
      });
      if (!target) return;

      const srcRect = sourceEl.getBoundingClientRect();
      const dstRect = target.getBoundingClientRect();
      if (srcRect.width === 0 || srcRect.height === 0) return;

      const ghost = document.createElement('div');
      ghost.setAttribute('aria-hidden', 'true');
      Object.assign(ghost.style, {
        position: 'fixed',
        top: `${srcRect.top}px`,
        left: `${srcRect.left}px`,
        width: `${Math.min(srcRect.width, 76)}px`,
        height: `${Math.min(srcRect.height, 95)}px`,
        zIndex: '9999',
        pointerEvents: 'none',
        overflow: 'hidden',
        backgroundColor: '#F5F5F5',
        boxShadow: '0 10px 28px rgba(0,0,0,0.16)',
        willChange: 'transform, opacity',
        transformOrigin: 'center center',
      });

      const img = document.createElement('img');
      img.src = imageUrl;
      img.referrerPolicy = 'no-referrer';
      Object.assign(img.style, {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: 'top',
        display: 'block',
      });
      ghost.appendChild(img);
      document.body.appendChild(ghost);

      const startX = srcRect.left + Math.min(srcRect.width, 76) / 2;
      const startY = srcRect.top + Math.min(srcRect.height, 95) / 2;
      const endX = dstRect.left + dstRect.width / 2;
      const endY = dstRect.top + dstRect.height / 2;
      const dx = endX - startX;
      const dy = endY - startY;

      const animation = ghost.animate(
        [
          { transform: 'translate3d(0, 0, 0) scale(1)', opacity: 0.95 },
          {
            transform: `translate3d(${dx * 0.55}px, ${dy * 0.55 - 26}px, 0) scale(0.55)`,
            opacity: 0.9,
            offset: 0.55,
          },
          { transform: `translate3d(${dx}px, ${dy}px, 0) scale(0.18)`, opacity: 0 },
        ],
        {
          duration: 480,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          fill: 'forwards',
        }
      );

      animation.onfinish = () => {
        ghost.remove();
      };
      animation.oncancel = () => {
        ghost.remove();
      };
    },
    [prefersReducedMotion]
  );

  const value = useMemo<MotionContextValue>(
    () => ({
      prefersReducedMotion,
      isTouchDevice,
      isCompactViewport,
      navDirection,
      setNavDirection,
      transitionProductSlug,
      productTransitionOrigin,
      beginProductTransition,
      clearProductTransition,
      cartPulseKey,
      triggerCartPulse,
      triggerFlyToCart,
      lastWishlistPulse,
      triggerWishlistPulse,
    }),
    [
      prefersReducedMotion,
      isTouchDevice,
      isCompactViewport,
      navDirection,
      transitionProductSlug,
      productTransitionOrigin,
      beginProductTransition,
      clearProductTransition,
      cartPulseKey,
      triggerCartPulse,
      triggerFlyToCart,
      lastWishlistPulse,
      triggerWishlistPulse,
    ]
  );

  return (
    <MotionConfig reducedMotion="user">
      <MotionSystemContext.Provider value={value}>{children}</MotionSystemContext.Provider>
    </MotionConfig>
  );
}

export function useMotionSystem(): MotionContextValue {
  const ctx = useContext(MotionSystemContext);
  if (!ctx) {
    throw new Error('useMotionSystem must be used inside MotionProvider');
  }
  return ctx;
}
