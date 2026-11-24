import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { useExperienceMode } from '../../context/ExperienceContext';
import { useLanguage } from '../../context/LanguageContext';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  const { isAppMode } = useExperienceMode();
  const { tr } = useLanguage();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-[60] bg-black text-white px-4 py-2.5 border border-white/15 flex items-center justify-center gap-2 text-[11px] font-medium tracking-[0.06em] shadow-lg ${
        isAppMode
          ? 'bottom-[calc(4.5rem+env(safe-area-inset-bottom))]'
          : 'bottom-[calc(1rem+env(safe-area-inset-bottom))]'
      }`}
    >
      <WifiOff className="w-3.5 h-3.5 shrink-0" strokeWidth={1.7} />
      <span>
        {tr(
          'Connexion internet interrompue — reconnexion en cours.',
          'Internet connection lost — reconnecting.'
        )}
      </span>
    </div>
  );
}
