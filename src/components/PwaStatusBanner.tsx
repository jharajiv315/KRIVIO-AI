import React from 'react';
import { WifiOff, RefreshCw, X } from 'lucide-react';
import { UsePwaReturn } from '../hooks/usePwa';

interface PwaStatusBannerProps {
  pwa: UsePwaReturn;
}

export const PwaStatusBanner: React.FC<PwaStatusBannerProps> = ({ pwa }) => {
  const { isOffline, needRefresh, updateApp, dismissUpdate } = pwa;

  if (!isOffline && !needRefresh) {
    return null;
  }

  return (
    <>
      {/* 1. Offline Mode Alert Banner */}
      {isOffline && (
        <div
          role="status"
          aria-live="polite"
          className="sticky top-0 z-50 bg-amber-500/95 dark:bg-amber-600/95 text-stone-950 dark:text-stone-900 px-4 py-2.5 backdrop-blur-md border-b border-amber-600/30 shadow-md transition-all animate-in fade-in slide-in-from-top-1 duration-200"
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-full bg-black/10 shrink-0">
                <WifiOff className="w-4 h-4 text-stone-950" />
              </div>
              <p className="text-xs sm:text-sm font-medium font-inter">
                <strong className="font-bold font-poppins">You're offline</strong> — Some KRIVIO features need an internet connection. Reconnect to continue.
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1 bg-stone-950 hover:bg-stone-800 text-amber-400 font-poppins font-bold text-xs rounded-lg shadow-xs transition-all active:scale-95 cursor-pointer shrink-0"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* 2. Version Update Available Floating Card */}
      {needRefresh && (
        <div
          role="alert"
          aria-live="assertive"
          className="fixed bottom-5 right-5 z-50 max-w-sm bg-white dark:bg-[#13251B] border border-[#0F5132]/25 dark:border-emerald-700/60 p-4 rounded-2xl shadow-2xl space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="p-2 rounded-xl bg-[#0F5132]/10 dark:bg-emerald-950 text-[#0F5132] dark:text-emerald-300 shrink-0">
                <RefreshCw className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white font-poppins">
                  Update available
                </h4>
                <p className="text-xs text-stone-600 dark:text-emerald-200/80 font-inter mt-0.5 leading-relaxed">
                  A new version of KRIVIO AI is ready. Reload to apply improvements without losing saved settings.
                </p>
              </div>
            </div>
            <button
              onClick={dismissUpdate}
              aria-label="Dismiss update notification"
              className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1 border-t border-stone-100 dark:border-emerald-900/30">
            <button
              onClick={dismissUpdate}
              className="px-3 py-1.5 text-xs font-semibold text-stone-600 dark:text-emerald-300 hover:bg-stone-100 dark:hover:bg-emerald-950/60 rounded-xl transition-colors font-poppins cursor-pointer"
            >
              Later
            </button>
            <button
              onClick={updateApp}
              className="px-4 py-1.5 bg-[#0F5132] hover:bg-[#0B3D26] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 font-poppins cursor-pointer active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Update — Reload</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
