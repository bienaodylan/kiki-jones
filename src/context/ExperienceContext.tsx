import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type ExperienceMode = 'web' | 'app';

interface ExperienceContextValue {
  mode: ExperienceMode;
  isAppMode: boolean;
  isStandalone: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isMobileViewport: boolean;
}

const ExperienceContext = createContext<ExperienceContextValue | undefined>(undefined);
const OVERRIDE_STORAGE_KEY = 'kikijones_experience_override_v1';

function detectStandaloneRuntime(): boolean {
  if (typeof window === 'undefined') return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  const ua = window.navigator.userAgent || '';
  const win = window as unknown as {
    Capacitor?: { isNativePlatform?: () => boolean };
    cordova?: unknown;
  };
  const isNativeAppWrapper =
    Boolean(win.Capacitor?.isNativePlatform?.()) ||
    Boolean(win.cordova) ||
    /\bwv\b/i.test(ua) ||
    /Median|GoNative|PWABuilder/i.test(ua);

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches ||
    nav.standalone === true ||
    document.referrer.startsWith('android-app://') ||
    isNativeAppWrapper
  );
}

function readExplicitModeOverride(): ExperienceMode | null {
  if (typeof window === 'undefined') return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const paramMode = (params.get('mode') || params.get('experience') || '').toLowerCase();
    if (paramMode === 'app') {
      sessionStorage.setItem(OVERRIDE_STORAGE_KEY, 'app');
      return 'app';
    }
    if (paramMode === 'web') {
      sessionStorage.removeItem(OVERRIDE_STORAGE_KEY);
      return 'web';
    }
    const stored = sessionStorage.getItem(OVERRIDE_STORAGE_KEY);
    if (stored === 'app') return 'app';
  } catch {
    // ignore storage errors
  }
  return null;
}

function detectPlatform() {
  if (typeof window === 'undefined') {
    return { isIOS: false, isAndroid: false };
  }
  const ua = window.navigator.userAgent || '';
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(ua);
  return { isIOS, isAndroid };
}

export function ExperienceProvider({ children }: { children: React.ReactNode }) {
  const [isStandalone, setIsStandalone] = useState<boolean>(() => detectStandaloneRuntime());
  const [overrideMode, setOverrideMode] = useState<ExperienceMode | null>(() =>
    readExplicitModeOverride()
  );
  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  const { isIOS, isAndroid } = useMemo(() => detectPlatform(), []);

  useEffect(() => {
    const standaloneQuery = window.matchMedia('(display-mode: standalone)');
    const fullscreenQuery = window.matchMedia('(display-mode: fullscreen)');
    const minimalQuery = window.matchMedia('(display-mode: minimal-ui)');

    const syncDisplayMode = () => {
      setIsStandalone(detectStandaloneRuntime());
    };

    const handleResize = () => {
      setIsMobileViewport(window.innerWidth < 768);
    };

    const handlePopState = () => {
      const next = readExplicitModeOverride();
      if (next !== null) setOverrideMode(next);
    };

    syncDisplayMode();
    standaloneQuery.addEventListener('change', syncDisplayMode);
    fullscreenQuery.addEventListener('change', syncDisplayMode);
    minimalQuery.addEventListener('change', syncDisplayMode);
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('popstate', handlePopState);

    return () => {
      standaloneQuery.removeEventListener('change', syncDisplayMode);
      fullscreenQuery.removeEventListener('change', syncDisplayMode);
      minimalQuery.removeEventListener('change', syncDisplayMode);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Strictly determined by standalone/installed display mode or explicit URL override —
  // NEVER auto-triggered by viewport width alone.
  const mode: ExperienceMode = useMemo(() => {
    if (overrideMode === 'app') return 'app';
    if (overrideMode === 'web') return 'web';
    return isStandalone ? 'app' : 'web';
  }, [isStandalone, overrideMode]);

  useEffect(() => {
    document.documentElement.dataset.experience = mode;
    return () => {
      delete document.documentElement.dataset.experience;
    };
  }, [mode]);

  const value = useMemo<ExperienceContextValue>(
    () => ({
      mode,
      isAppMode: mode === 'app',
      isStandalone,
      isIOS,
      isAndroid,
      isMobileViewport,
    }),
    [mode, isStandalone, isIOS, isAndroid, isMobileViewport]
  );

  return <ExperienceContext.Provider value={value}>{children}</ExperienceContext.Provider>;
}

export function useExperienceMode(): ExperienceContextValue {
  const ctx = useContext(ExperienceContext);
  if (!ctx) {
    throw new Error('useExperienceMode must be used inside ExperienceProvider');
  }
  return ctx;
}
