import React from 'react';

export const OFFICIAL_LOGO_SRC =
  '/assets/aistudio/839010537_18461178919185802_2301844234641850613_n-removebg-preview_2493ffba.png';

export type BrandLogoVariant =
  | 'header'
  | 'app-header'
  | 'drawer'
  | 'footer'
  | 'footer-signature'
  | 'hero'
  | 'admin'
  | 'admin-compact'
  | 'card';

export type BrandLogoTone = 'dark' | 'light';

interface BrandLogoProps {
  variant?: BrandLogoVariant;
  tone?: BrandLogoTone;
  className?: string;
  alt?: string;
}

/**
 * Responsive official KIKI JONES brand logo.
 *
 * The source PNG (500x500) centers the 264x60 (4.4:1) hand-brushed wordmark
 * inside generous transparent margins. This frame optically crops the dead
 * padding so the actual lettering renders at true, standard fashion-brand
 * dimensions on mobile, tablet, and desktop viewports.
 */
const VARIANT_SIZE_CLASSES: Record<BrandLogoVariant, string> = {
  header:
    'h-[24px] w-[106px] sm:h-[28px] sm:w-[123px] lg:h-[30px] lg:w-[132px] xl:h-[34px] xl:w-[150px]',
  'app-header': 'h-[24px] w-[106px] sm:h-[28px] sm:w-[123px]',
  drawer: 'h-[22px] w-[97px] sm:h-[26px] sm:w-[114px]',
  footer: 'h-[26px] w-[114px] sm:h-[30px] sm:w-[132px] md:h-[32px] md:w-[141px]',
  'footer-signature':
    'h-[40px] w-[176px] sm:h-[56px] sm:w-[246px] md:h-[72px] md:w-[317px] lg:h-[84px] lg:w-[370px] max-w-full',
  hero: 'h-[38px] w-[167px] sm:h-[52px] sm:w-[229px] md:h-[64px] md:w-[282px]',
  admin: 'h-[24px] w-[106px] sm:h-[26px] sm:w-[114px]',
  'admin-compact': 'h-[18px] w-[79px] sm:h-[20px] sm:w-[88px]',
  card: 'h-[22px] w-[97px] sm:h-[26px] sm:w-[114px]',
};

const TONE_FILTER_CLASSES: Record<BrandLogoTone, string> = {
  dark: 'invert contrast-125',
  light: 'drop-shadow-[0_1px_6px_rgba(0,0,0,0.32)]',
};

export function BrandLogo({
  variant = 'header',
  tone = 'dark',
  className = '',
  alt = 'KIKI JONES',
}: BrandLogoProps) {
  return (
    <span
      className={`relative inline-block overflow-hidden shrink-0 select-none align-middle ${VARIANT_SIZE_CLASSES[variant]} ${className}`}
    >
      <img
        src={OFFICIAL_LOGO_SRC}
        alt={alt}
        draggable={false}
        className={`pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180%] max-w-none h-auto block transition-all duration-300 ${TONE_FILTER_CLASSES[tone]}`}
      />
    </span>
  );
}
