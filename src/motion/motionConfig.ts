import type { Transition, Variants } from 'motion/react';

/**
 * KIKI JONES MOTION SYSTEM — Centralized Motion Configuration
 *
 * Single source of truth for easing curves, durations, transitions,
 * viewport triggers, and shared-element View Transition identifiers.
 */

export const KJ_EASE = {
  /** Primary luxury editorial deceleration — silky, confident, never bouncy */
  editorial: [0.22, 1, 0.36, 1] as const,
  /** Fast, tactile Instagram-like response for buttons, icons & chips */
  snappy: [0.16, 1, 0.3, 1] as const,
  /** Calm crossfade curve for opacity and subtle surface changes */
  gentle: [0.25, 0.1, 0.25, 1] as const,
  /** Decisive, clean exit curve for leaving pages and overlays */
  exit: [0.4, 0, 1, 1] as const,
} as const;

/** Consistent timing presets (in seconds) calibrated to the KIKI JONES motion budget */
export const KJ_DURATION = {
  buttonPress: 0.12, // 120ms (100–140ms)
  hover: 0.18, // 180ms (160–200ms)
  icon: 0.22, // 220ms (180–250ms)
  dropdown: 0.24, // 240ms (200–260ms)
  menu: 0.34, // 340ms (280–380ms)
  pageEnter: 0.38, // 380ms (350–500ms)
  pageEnterMobile: 0.28,
  pageExit: 0.18,
  productImage: 0.52, // 520ms (450–650ms)
  editorialReveal: 0.64, // 640ms (550–800ms)
} as const;

export const KJ_TRANSITION: Record<string, Transition> = {
  buttonPress: {
    duration: KJ_DURATION.buttonPress,
    ease: KJ_EASE.snappy,
  },
  hover: {
    duration: KJ_DURATION.hover,
    ease: KJ_EASE.snappy,
  },
  icon: {
    duration: KJ_DURATION.icon,
    ease: KJ_EASE.snappy,
  },
  dropdown: {
    duration: KJ_DURATION.dropdown,
    ease: KJ_EASE.editorial,
  },
  menu: {
    duration: KJ_DURATION.menu,
    ease: KJ_EASE.editorial,
  },
  backdrop: {
    duration: 0.22,
    ease: KJ_EASE.gentle,
  },
  pageEnter: {
    duration: KJ_DURATION.pageEnter,
    ease: KJ_EASE.editorial,
  },
  pageEnterMobile: {
    duration: KJ_DURATION.pageEnterMobile,
    ease: KJ_EASE.editorial,
  },
  pageExit: {
    duration: KJ_DURATION.pageExit,
    ease: KJ_EASE.exit,
  },
  productImage: {
    duration: KJ_DURATION.productImage,
    ease: KJ_EASE.editorial,
  },
  editorialReveal: {
    duration: KJ_DURATION.editorialReveal,
    ease: KJ_EASE.editorial,
  },
};

export const KJ_VIEWPORT = {
  once: true,
  amount: 0.12 as const,
  margin: '0px 0px -40px 0px',
};

export const KJ_STAGGER_CONTAINER: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.055,
      delayChildren: 0.04,
    },
  },
};

export const KJ_STAGGER_ITEM: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.42,
      ease: KJ_EASE.editorial,
    },
  },
};

/**
 * Generates a valid, unique CSS `view-transition-name` for a product hero image.
 */
export function getProductTransitionName(slug: string): string {
  const safe = slug.toLowerCase().replace(/[^a-z0-9_-]/g, '-').slice(0, 48);
  return `kj-product-${safe || 'item'}`;
}
