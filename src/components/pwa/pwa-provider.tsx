'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAContextType {
  isInstallable: boolean;
  isStandalone: boolean;
  installApp: () => Promise<void>;
}

const PWAContext = createContext<PWAContextType>({
  isInstallable: false,
  isStandalone: false,
  installApp: async () => {},
});

export const usePWA = () => useContext(PWAContext);

export const PWAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Check if an early prompt was captured globally
    const earlyPrompt = (window as unknown as { __pwaInstallPrompt?: BeforeInstallPromptEvent })
      .__pwaInstallPrompt;
    if (earlyPrompt) {
      setInstallPrompt(earlyPrompt);
    }

    // 2. Register Service Worker with readyState check (fixes React hydration missing load event)
    if ('serviceWorker' in navigator) {
      const registerSW = () => {
        navigator.serviceWorker
          .register('/sw.js', { scope: '/' })
          .then((reg) => {
            console.log('[PWA] Service Worker registered with scope:', reg.scope);
            reg.onupdatefound = () => {
              const installingWorker = reg.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log('[PWA] New version installed and available.');
                  }
                };
              }
            };
          })
          .catch((err) => console.warn('[PWA] Service Worker registration failed:', err));
      };

      if (document.readyState === 'complete') {
        registerSW();
      } else {
        window.addEventListener('load', registerSW);
      }
    }

    // 3. Check standalone display mode (running as installed app)
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsStandalone(Boolean(isStandaloneMode));
    };

    checkStandalone();

    // 4. Capture beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      (window as unknown as { __pwaInstallPrompt?: BeforeInstallPromptEvent }).__pwaInstallPrompt = promptEvent;
      setInstallPrompt(promptEvent);
      console.log('[PWA] Captured beforeinstallprompt event.');
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      (window as unknown as { __pwaInstallPrompt?: BeforeInstallPromptEvent | null }).__pwaInstallPrompt = null;
      setIsStandalone(true);
      console.log('[PWA] App successfully installed.');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!installPrompt) {
      console.log('[PWA] Install prompt not available.');
      return;
    }
    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstallPrompt(null);
        (window as unknown as { __pwaInstallPrompt?: null }).__pwaInstallPrompt = null;
      }
    } catch (err) {
      console.warn('[PWA] Install prompt failed:', err);
    }
  };

  return (
    <PWAContext.Provider
      value={{
        isInstallable: Boolean(installPrompt) && !isStandalone,
        isStandalone,
        installApp,
      }}
    >
      {children}
    </PWAContext.Provider>
  );
};
