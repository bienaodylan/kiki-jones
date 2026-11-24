import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useMotionSystem } from './MotionProvider';
import { KJ_DURATION, KJ_EASE } from './motionConfig';

interface PageTransitionProps {
  routeKey: string;
  children: React.ReactNode;
  className?: string;
  /** Native app mode uses a crisp horizontal-hint directional transition */
  isAppMode?: boolean;
}

/**
 * KIKI JONES Unified Page-to-Page Transition Wrapper
 *
 * Orchestrates smooth exit of the outgoing view and restrained editorial entry
 * of the incoming view for both forward navigation and browser Back/Forward.
 */
export function PageTransition({
  routeKey,
  children,
  className = '',
  isAppMode = false,
}: PageTransitionProps) {
  const { prefersReducedMotion, isCompactViewport, navDirection } = useMotionSystem();

  const isBack = navDirection === 'back';
  const enterDuration =
    isAppMode || isCompactViewport ? KJ_DURATION.pageEnterMobile : KJ_DURATION.pageEnter;

  const initialVariant = prefersReducedMotion
    ? { opacity: 0 }
    : isAppMode
      ? { opacity: 0, x: isBack ? -14 : 14 }
      : { opacity: 0, y: isBack ? -10 : 14 };

  const exitVariant = prefersReducedMotion
    ? { opacity: 0 }
    : isAppMode
      ? { opacity: 0, x: isBack ? 10 : -10 }
      : { opacity: 0, y: isBack ? 8 : -8 };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={routeKey}
        initial={initialVariant}
        animate={{ opacity: 1, x: 0, y: 0 }}
        exit={exitVariant}
        transition={{
          duration: enterDuration,
          ease: KJ_EASE.editorial,
        }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
