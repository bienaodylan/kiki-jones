import { useEffect, useRef, useState } from 'react';

interface UseScrollHeaderVisibilityOptions {
  /** Scroll distance (px) before the header is allowed to hide when scrolling down. */
  hideAfter?: number;
  /** Keep header visible regardless of scroll direction (e.g. drawer or mega-menu open). */
  forceVisible?: boolean;
  /** Reset visibility to true whenever this key changes (e.g. route change). */
  resetKey?: string;
  /** Viewport width (px) at or above which the header remains permanently fixed. */
  desktopBreakpoint?: number;
}

function getScrollY(): number {
  if (typeof window === 'undefined') return 0;
  return Math.max(
    0,
    window.scrollY ||
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0
  );
}

/**
 * Hides the top header smoothly when scrolling down on mobile/tablet (< desktopBreakpoint)
 * and reveals it as soon as the user scrolls back up. Always stays visible on desktop.
 */
export function useScrollHeaderVisibility({
  hideAfter = 72,
  forceVisible = false,
  resetKey,
  desktopBreakpoint = 1024,
}: UseScrollHeaderVisibilityOptions = {}): boolean {
  const [visible, setVisible] = useState(true);
  const lastYRef = useRef(0);
  const tickingRef = useRef(false);

  // Always show header immediately on route change or when forced visible
  useEffect(() => {
    setVisible(true);
    lastYRef.current = getScrollY();
  }, [resetKey, forceVisible]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    lastYRef.current = getScrollY();

    const evaluateScroll = () => {
      tickingRef.current = false;

      if (window.innerWidth >= desktopBreakpoint || forceVisible) {
        setVisible(true);
        lastYRef.current = getScrollY();
        return;
      }

      const currentY = getScrollY();
      const docHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body?.scrollHeight || 0
      );
      const viewportHeight = window.innerHeight;
      const isAtBottomBounce =
        docHeight > viewportHeight + 40 && currentY + viewportHeight >= docHeight - 12;

      if (currentY <= 24) {
        setVisible(true);
        lastYRef.current = currentY;
        return;
      }

      if (isAtBottomBounce) {
        lastYRef.current = currentY;
        return;
      }

      const delta = currentY - lastYRef.current;

      if (delta > 6 && currentY > hideAfter) {
        setVisible(false);
        lastYRef.current = currentY;
      } else if (delta < -5) {
        setVisible(true);
        lastYRef.current = currentY;
      }
    };

    const onScroll = () => {
      if (!tickingRef.current) {
        tickingRef.current = true;
        window.requestAnimationFrame(evaluateScroll);
      }
    };

    const onResize = () => {
      if (window.innerWidth >= desktopBreakpoint) {
        setVisible(true);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [hideAfter, forceVisible, desktopBreakpoint]);

  return forceVisible ? true : visible;
}
