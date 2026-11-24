import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useMotionSystem } from './MotionProvider';
import { KJ_DURATION, KJ_EASE, KJ_VIEWPORT } from './motionConfig';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  duration?: number;
}

/**
 * Editorial scroll-triggered reveal using IntersectionObserver via Motion.
 * Only animates compositor properties (transform + opacity).
 */
export function ScrollReveal({
  children,
  className = '',
  delay = 0,
  y = 18,
  duration = KJ_DURATION.editorialReveal,
}: ScrollRevealProps) {
  const { prefersReducedMotion, isCompactViewport } = useMotionSystem();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const offset = isCompactViewport ? Math.min(y, 12) : y;

  return (
    <motion.div
      initial={{ opacity: 0, y: offset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={KJ_VIEWPORT}
      transition={{
        duration: isCompactViewport ? Math.min(duration, 0.48) : duration,
        delay,
        ease: KJ_EASE.editorial,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface EditorialImageRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

/**
 * Restrained luxury fashion image reveal: subtle settle from 1.045 -> 1.0 scale with smooth fade.
 */
export function EditorialImageReveal({
  children,
  className = '',
  delay = 0,
}: EditorialImageRevealProps) {
  const { prefersReducedMotion } = useMotionSystem();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0.72, scale: 1.045 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={KJ_VIEWPORT}
      transition={{
        duration: KJ_DURATION.editorialReveal,
        delay,
        ease: KJ_EASE.editorial,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface ParallaxImageProps {
  src: string;
  alt: string;
  className?: string;
  /** Subtle vertical travel percentage on desktop (default 4%) */
  strength?: number;
}

/**
 * GPU-accelerated subtle vertical parallax for large editorial campaign photography.
 * Automatically degrades to a static image on touch devices or reduced-motion.
 */
export function ParallaxImage({
  src,
  alt,
  className = 'w-full h-full object-cover object-top',
  strength = 4,
}: ParallaxImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { prefersReducedMotion, isTouchDevice } = useMotionSystem();
  const disableParallax = prefersReducedMotion || isTouchDevice;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [`-${strength}%`, `${strength}%`]);

  return (
    <div ref={containerRef} className="w-full h-full overflow-hidden">
      {disableParallax ? (
        <img src={src} alt={alt} referrerPolicy="no-referrer" className={className} />
      ) : (
        <motion.img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          style={{ y, scale: 1 + strength * 0.025 }}
          className={`${className} will-change-transform`}
        />
      )}
    </div>
  );
}
