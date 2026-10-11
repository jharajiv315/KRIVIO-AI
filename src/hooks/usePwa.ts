import { useState, useEffect, useCallback, useRef } from 'react';
// @ts-ignore - virtual module provided by vite-plugin-pwa
import { registerSW } from 'virtual:pwa-register';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export interface UsePwaReturn {
  isInstallable: boolean;
  isInstalled: boolean;
  isOffline: boolean;
  needRefresh: boolean;
  isIos: boolean;
  installApp: () => Promise<boolean>;
  updateApp: () => void;
  dismissUpdate: () => void;
}

export function usePwa(): UsePwaReturn {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [needRefresh, setNeedRefresh] = useState(false);
  const [isIos, setIsIos] = useState(false);

  const updateSwRef = useRef<((reloadPage?: boolean) => Promise<void>) | null>(null);

  // 1. Detect Standalone Mode and iOS device
  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    setIsInstalled(isStandalone);

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice =
      /iphone|ipad|ipod/.test(userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIos(isIosDevice);

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      setIsInstalled(e.matches);
    };
    mediaQuery.addEventListener('change', handleDisplayModeChange);
    return () => mediaQuery.removeEventListener('change', handleDisplayModeChange);
  }, []);

  // 2. Online / Offline Connectivity Listeners
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 3. Native Installation Prompt Interception
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent browser mini-infobar on mobile
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstallable(false);
      setIsInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // 4. Service Worker Registration with controlled update prompt
  useEffect(() => {
    if ('serviceWorker' in navigator && typeof window !== 'undefined') {
      try {
        const updateSW = registerSW({
          immediate: true,
          onNeedRefresh() {
            setNeedRefresh(true);
          },
          onOfflineReady() {
            // App shell is precached and ready to work offline
          },
          onRegisteredSW(swUrl: string, registration?: ServiceWorkerRegistration) {
            // Periodically check for updates (every 60 minutes)
            if (registration) {
              setInterval(() => {
                registration.update().catch(() => {});
              }, 60 * 60 * 1000);
            }
          },
          onRegisterError(error: any) {
            console.warn('[PWA] Service worker registration failed:', error);
          },
        });

        updateSwRef.current = updateSW;
      } catch (err) {
        console.warn('[PWA] Error initializing registerSW:', err);
      }
    }
  }, []);

  // Action: Trigger Install Prompt
  const installApp = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false;
    }
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstallable(false);
        return true;
      }
      return false;
    } catch (err) {
      console.warn('[PWA] Error executing install prompt:', err);
      return false;
    }
  }, [deferredPrompt]);

  // Action: Trigger Controlled Update Reload
  const updateApp = useCallback(() => {
    if (updateSwRef.current) {
      updateSwRef.current(true);
    } else {
      window.location.reload();
    }
  }, []);

  const dismissUpdate = useCallback(() => {
    setNeedRefresh(false);
  }, []);

  return {
    isInstallable: isInstallable && !isInstalled,
    isInstalled,
    isOffline,
    needRefresh,
    isIos,
    installApp,
    updateApp,
    dismissUpdate,
  };
}
