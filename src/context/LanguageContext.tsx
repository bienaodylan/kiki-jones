import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type Lang = 'fr' | 'en';
export type AppLanguage = Lang;

interface LanguageContextValue {
  lang: Lang;
  setLang: (next: Lang) => void;
  toggleLang: () => void;
  tr: (fr: string, en: string) => string;
}

const LANG_STORAGE_KEY = 'kikijones_lang_v1';

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const stored = localStorage.getItem(LANG_STORAGE_KEY);
      if (stored === 'en' || stored === 'fr') return stored;
    } catch {
      // ignore storage errors
    }
    return 'fr';
  });

  useEffect(() => {
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      // ignore
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
  }, []);

  const toggleLang = useCallback(() => {
    setLangState((prev) => (prev === 'fr' ? 'en' : 'fr'));
  }, []);

  const tr = useCallback(
    (fr: string, en: string) => (lang === 'fr' ? fr : en),
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, tr }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return ctx;
}
