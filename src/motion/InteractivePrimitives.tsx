import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { KJ_DURATION, KJ_EASE } from './motionConfig';
import { useMotionSystem } from './MotionProvider';

interface AnimatedAccordionContentProps {
  open: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * Smooth editorial disclosure for Product Detail accordions (Composition, Shipping & Returns).
 */
export function AnimatedAccordionContent({
  open,
  children,
  className = '',
}: AnimatedAccordionContentProps) {
  const { prefersReducedMotion } = useMotionSystem();

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          key="accordion-body"
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
          transition={{
            duration: prefersReducedMotion ? 0.12 : KJ_DURATION.dropdown,
            ease: KJ_EASE.editorial,
          }}
          className={`overflow-hidden ${className}`}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface AnimatedCountBadgeProps {
  count: number;
  pulseKey?: number;
  className?: string;
  max?: number;
}

/**
 * Tactile counter badge that pops gently whenever items are added to bag or wishlist.
 */
export function AnimatedCountBadge({
  count,
  pulseKey,
  className = '',
  max = 99,
}: AnimatedCountBadgeProps) {
  const { prefersReducedMotion } = useMotionSystem();

  if (count <= 0) return null;

  return (
    <motion.span
      key={`${count}-${pulseKey ?? 0}`}
      initial={prefersReducedMotion ? { opacity: 0.85 } : { scale: 0.72, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        duration: KJ_DURATION.icon,
        ease: KJ_EASE.snappy,
      }}
      className={className}
    >
      {count > max ? `${max}+` : count}
    </motion.span>
  );
}

interface AnimatedValueProps {
  valueKey: string | number;
  children: React.ReactNode;
  className?: string;
}

/**
 * Subtle vertical numeric settle for subtotals, totals, and quantity values.
 */
export function AnimatedValue({ valueKey, children, className = '' }: AnimatedValueProps) {
  const { prefersReducedMotion } = useMotionSystem();

  return (
    <motion.span
      key={String(valueKey)}
      initial={prefersReducedMotion ? false : { opacity: 0.65, y: 3 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: KJ_DURATION.hover, ease: KJ_EASE.snappy }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.span>
  );
}
