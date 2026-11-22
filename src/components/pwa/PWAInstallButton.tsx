import React, { useState } from 'react';
import { Download, Share, PlusSquare, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useExperienceMode } from '../../context/ExperienceContext';
import { useLanguage } from '../../context/LanguageContext';

interface PWAInstallButtonProps {
  variant?: 'drawer' | 'footer' | 'inline';
  className?: string;
}

export function PWAInstallButton({
  variant = 'drawer',
  className = '',
}: PWAInstallButtonProps) {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { isAppMode, isStandalone } = useExperienceMode();
  const { tr } = useLanguage();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // Never display install controls inside an already-installed standalone app
  if (isInstalled || isStandalone || isAppMode) {
    return null;
  }

  // Only render when browser natively supports installation or on iOS Safari
  if (!isInstallable && !isIOS) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  return (
    <>
      {variant === 'drawer' && (
        <button
          type="button"
          onClick={handleClick}
          className={`w-full min-h-[44px] px-4 py-2.5 border border-black bg-black text-white text-[11px] font-bold uppercase tracking-[0.16em] inline-flex items-center justify-center gap-2 hover:bg-black/85 transition-colors cursor-pointer ${className}`}
        >
          <Smartphone className="w-3.5 h-3.5 shrink-0" strokeWidth={1.7} />
          <span>{tr("Installer l'application KIKI JONES", 'Install KIKI JONES App')}</span>
        </button>
      )}

      {variant === 'footer' && (
        <button
          type="button"
          onClick={handleClick}
          className={`min-h-[44px] px-4 py-2 border border-black/20 bg-white text-black text-[10.5px] font-bold uppercase tracking-[0.15em] inline-flex items-center gap-2 hover:border-black hover:bg-black hover:text-white transition-colors cursor-pointer ${className}`}
        >
          <Download className="w-3.5 h-3.5 shrink-0" strokeWidth={1.7} />
          <span>{tr("Installer l'app mobile", 'Install Mobile App')}</span>
        </button>
      )}

      {variant === 'inline' && (
        <button
          type="button"
          onClick={handleClick}
          className={`min-h-[44px] px-4 py-2.5 border border-black/20 bg-[#F5F5F5] text-black text-xs font-bold uppercase tracking-[0.14em] inline-flex items-center justify-center gap-2 hover:border-black transition-colors cursor-pointer ${className}`}
        >
          <Download className="w-4 h-4 shrink-0" strokeWidth={1.7} />
          <span>{tr("Installer l'application", 'Install App')}</span>
        </button>
      )}

      {showIOSGuide && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-[1px]"
            onClick={() => setShowIOSGuide(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={tr("Installer l'application KIKI JONES sur iPhone", 'Install KIKI JONES on iPhone')}
            className="relative w-full sm:max-w-md bg-white text-black border-t sm:border border-black/15 p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:pb-6 shadow-2xl space-y-5"
          >
            <div className="flex items-start justify-between gap-4 border-b border-black/10 pb-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">
                  KIKI JONES &middot; iOS
                </p>
                <h2 className="font-editorial text-xl text-black">
                  {tr("Ajouter à l'écran d'accueil", 'Add to Home Screen')}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                aria-label={tr('Fermer', 'Close')}
                className="min-h-[44px] min-w-[44px] -mr-2 -mt-2 flex items-center justify-center text-black/60 hover:text-black cursor-pointer"
              >
                <X className="w-5 h-5" strokeWidth={1.6} />
              </button>
            </div>

            <p className="text-xs font-light text-black/70 leading-relaxed">
              {tr(
                "Installez KIKI JONES sur votre iPhone pour profiter de l'expérience application plein écran avec navigation rapide au pouce.",
                'Install KIKI JONES on your iPhone for the full-screen shopping app experience with fast thumb navigation.'
              )}
            </p>

            <ol className="space-y-3.5 text-xs">
              <li className="flex items-start gap-3">
                <span className="w-7 h-7 shrink-0 bg-[#F5F5F5] border border-black/10 flex items-center justify-center font-bold text-[11px] tabular-nums">
                  1
                </span>
                <div className="pt-0.5 space-y-0.5">
                  <p className="font-bold text-black flex items-center gap-1.5">
                    <span>{tr('Touchez le bouton Partager', 'Tap the Share button')}</span>
                    <Share className="w-3.5 h-3.5 text-black/70" strokeWidth={1.7} />
                  </p>
                  <p className="font-light text-black/60">
                    {tr('Dans la barre inférieure de Safari.', 'In the Safari bottom toolbar.')}
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="w-7 h-7 shrink-0 bg-[#F5F5F5] border border-black/10 flex items-center justify-center font-bold text-[11px] tabular-nums">
                  2
                </span>
                <div className="pt-0.5 space-y-0.5">
                  <p className="font-bold text-black flex items-center gap-1.5">
                    <span>{tr("Sélectionnez « Sur l'écran d'accueil »", 'Select "Add to Home Screen"')}</span>
                    <PlusSquare className="w-3.5 h-3.5 text-black/70" strokeWidth={1.7} />
                  </p>
                  <p className="font-light text-black/60">
                    {tr('Faites défiler les actions si nécessaire.', 'Scroll down the share sheet actions if needed.')}
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="w-7 h-7 shrink-0 bg-[#F5F5F5] border border-black/10 flex items-center justify-center font-bold text-[11px] tabular-nums">
                  3
                </span>
                <div className="pt-0.5 space-y-0.5">
                  <p className="font-bold text-black">
                    {tr('Touchez « Ajouter » en haut à droite', 'Tap "Add" in the top-right corner')}
                  </p>
                  <p className="font-light text-black/60">
                    {tr(
                      "Ouvrez ensuite l'icône KIKI JONES depuis votre écran d'accueil.",
                      'Then launch the KIKI JONES icon directly from your home screen.'
                    )}
                  </p>
                </div>
              </li>
            </ol>

            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="w-full min-h-[44px] py-3 bg-black text-white text-xs font-bold uppercase tracking-[0.18em] hover:bg-black/85 transition-colors cursor-pointer"
            >
              {tr('Compris', 'Got It')}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
