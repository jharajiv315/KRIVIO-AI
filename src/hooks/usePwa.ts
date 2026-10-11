import { useState, useEffect, useCallback } from 'react';
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
  updateApp: (force?: boolean) => void;
  dismissUpdate: () => void;
}

// ---------------------------------------------------------------------------
// Single Managed PWA Manager (Singleton)
// Guarantees exactly one service worker registration, zero duplicate intervals,
// shared installation prompt state, and clean lifecycle management across all
// React mounts and Strict Mode re-mounts.
// ---------------------------------------------------------------------------

class PwaManager {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private isInstallable = false;
  private isInstalled = false;
  private isOffline = typeof navigator !== 'undefined' ? !navigator.onLine : false;
  private needRefresh = false;
  private isIos = false;

  private updateSwFn: ((reloadPage?: boolean) => Promise<void>) | null = null;
  private periodicUpdateTimer: ReturnType<typeof setInterval> | null = null;
  private initialized = false;

  private listeners = new Set<() => void>();
  private dirtyCheckers = new Set<() => boolean>();

  public getState() {
    return {
      isInstallable: this.isInstallable && !this.isInstalled,
      isInstalled: this.isInstalled,
      isOffline: this.isOffline,
      needRefresh: this.needRefresh,
      isIos: this.isIos,
    };
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public registerDirtyChecker(checker: () => boolean): () => void {
    this.dirtyCheckers.add(checker);
    return () => {
      this.dirtyCheckers.delete(checker);
    };
  }

  public hasUnsavedWork(): boolean {
    // 1. Check custom registered dirty checkers
    for (const checker of this.dirtyCheckers) {
      try {
        if (checker()) return true;
      } catch {}
    }

    // 2. DOM-level heuristic: check if any open modal/dialog or focused dirty form exists
    if (typeof document !== 'undefined') {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        const val = (activeEl as HTMLInputElement).value;
        if (val && val.trim().length > 0) return true;
      }
      // Check for active open product modals or full-screen editor overlays
      const openModals = document.querySelectorAll('[role="dialog"], .fixed.inset-0.z-50');
      if (openModals.length > 0) return true;
    }

    return false;
  }

  private notify() {
    for (const listener of this.listeners) {
      listener();
    }
  }

  public init() {
    if (this.initialized || typeof window === 'undefined') {
      return;
    }
    this.initialized = true;

    // Detect standalone mode
    const checkStandalone = () => {
      return (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://')
      );
    };
    this.isInstalled = checkStandalone();

    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    this.isIos =
      /iphone|ipad|ipod/.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    // Standalone change listener
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', (e) => {
      this.isInstalled = e.matches;
      this.notify();
    });

    // Online / Offline listeners
    window.addEventListener('online', () => {
      this.isOffline = false;
      this.notify();
    });
    window.addEventListener('offline', () => {
      this.isOffline = true;
      this.notify();
    });

    // Install prompt interception
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      this.isInstallable = true;
      this.notify();
    });

    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.isInstallable = false;
      this.isInstalled = true;
      this.notify();
    });

    // Register service worker using virtual:pwa-register (Single instance)
    if ('serviceWorker' in navigator) {
      try {
        this.updateSwFn = registerSW({
          immediate: true,
          onNeedRefresh: () => {
            this.needRefresh = true;
            this.notify();
          },
          onOfflineReady: () => {
            // App shell ready
          },
          onRegisteredSW: (_swUrl: string, registration?: ServiceWorkerRegistration) => {
            if (registration) {
              // Clear any existing interval before scheduling a single 60m periodic check
              if (this.periodicUpdateTimer) {
                clearInterval(this.periodicUpdateTimer);
              }
              this.periodicUpdateTimer = setInterval(() => {
                registration.update().catch(() => {});
              }, 60 * 60 * 1000);
            }
          },
          onRegisterError: (error: any) => {
            console.warn('[PWA] Service worker registration error:', error);
          },
        });
      } catch (err) {
        console.warn('[PWA] Service worker registration initialization failed:', err);
      }
    }
  }

  public async installApp(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }
    try {
      await this.deferredPrompt.prompt();
      const choice = await this.deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        this.deferredPrompt = null;
        this.isInstallable = false;
        this.notify();
        return true;
      }
      return false;
    } catch (err) {
      console.warn('[PWA] Error executing install prompt:', err);
      return false;
    }
  }

  public updateApp(force = false) {
    if (!force && this.hasUnsavedWork()) {
      const confirmed = window.confirm(
        'You have an active workspace session or unsaved edits. Are you sure you want to reload now to apply the update?'
      );
      if (!confirmed) {
        return;
      }
    }

    if (this.updateSwFn) {
      this.updateSwFn(true);
    } else {
      window.location.reload();
    }
  }

  public dismissUpdate() {
    this.needRefresh = false;
    this.notify();
  }
}

// Module-level singleton
const pwaManager = new PwaManager();

export function usePwa(): UsePwaReturn {
  const [state, setState] = useState(() => pwaManager.getState());

  useEffect(() => {
    pwaManager.init();
    // Update local state immediately on mount
    setState(pwaManager.getState());
    // Subscribe to shared state transitions
    const unsubscribe = pwaManager.subscribe(() => {
      setState(pwaManager.getState());
    });
    return unsubscribe;
  }, []);

  const installApp = useCallback(async () => {
    return pwaManager.installApp();
  }, []);

  const updateApp = useCallback((force = false) => {
    pwaManager.updateApp(force);
  }, []);

  const dismissUpdate = useCallback(() => {
    pwaManager.dismissUpdate();
  }, []);

  return {
    ...state,
    installApp,
    updateApp,
    dismissUpdate,
  };
}

export { pwaManager };
