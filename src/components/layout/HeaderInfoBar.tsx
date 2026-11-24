import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useReducedMotion } from 'motion/react';
import { useStore } from '../../context/StoreContext';
import { useLanguage } from '../../context/LanguageContext';
import { extractInfoBarMessages, isInfoBarActive } from '../../lib/infoBar';

interface HeaderInfoBarProps {
  /** Apply iPhone safe-area top inset directly to this bar when it sits at the very top edge. */
  withSafeTop?: boolean;
}

export function HeaderInfoBar({ withSafeTop = false }: HeaderInfoBarProps) {
  const { storefrontConfig, navigate } = useStore();
  const { lang, tr } = useLanguage();
  const shouldReduceMotion = useReducedMotion();

  const active = isInfoBarActive(storefrontConfig);
  const messages = useMemo(
    () => extractInfoBarMessages(storefrontConfig),
    [storefrontConfig]
  );

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index >= messages.length) {
      setIndex(0);
    }
  }, [messages.length, index]);

  useEffect(() => {
    if (!active || messages.length <= 1 || shouldReduceMotion) return;
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [active, messages.length, shouldReduceMotion]);

  if (!active || messages.length === 0) {
    return null;
  }

  const current = messages[index % messages.length];
  const displayText =
    lang === 'en' && current.textEn ? current.textEn : current.textFr;
  const hasMultiple = messages.length > 1;
  const isClickable = Boolean(current.href);

  const goPrev = () => setIndex((prev) => (prev - 1 + messages.length) % messages.length);
  const goNext = () => setIndex((prev) => (prev + 1) % messages.length);

  return (
    <div
      role="region"
      aria-label={tr("Barre d'informations", 'Store announcements')}
      className={`w-full max-w-full overflow-hidden bg-black text-white border-b border-white/10 ${
        withSafeTop ? 'pt-safe' : ''
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 xl:px-10 h-[28px] flex items-center justify-between gap-2">
        {hasMultiple ? (
          <button
            type="button"
            onClick={goPrev}
            aria-label={tr('Annonce précédente', 'Previous announcement')}
            className="shrink-0 w-6 h-6 inline-flex items-center justify-center text-white/65 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.8} />
          </button>
        ) : (
          <span className="hidden sm:block w-6 shrink-0" aria-hidden="true" />
        )}

        <div className="flex-1 min-w-0 flex items-center justify-center">
          {isClickable ? (
            <button
              type="button"
              onClick={() => navigate(current.href)}
              className="max-w-full truncate text-[9.5px] sm:text-[10.5px] font-medium uppercase tracking-[0.14em] text-white/95 hover:text-white hover:underline underline-offset-4 transition-colors cursor-pointer"
            >
              {displayText}
            </button>
          ) : (
            <p className="max-w-full truncate text-[9.5px] sm:text-[10.5px] font-medium uppercase tracking-[0.14em] text-white/95 text-center">
              {displayText}
            </p>
          )}
        </div>

        {hasMultiple ? (
          <button
            type="button"
            onClick={goNext}
            aria-label={tr('Annonce suivante', 'Next announcement')}
            className="shrink-0 w-6 h-6 inline-flex items-center justify-center text-white/65 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.8} />
          </button>
        ) : (
          <span className="hidden sm:block w-6 shrink-0" aria-hidden="true" />
        )}
      </div>
    </div>
  );
}
