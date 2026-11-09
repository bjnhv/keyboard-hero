'use client';

import React, { useState } from 'react';
import { usePWA } from './pwa-provider';
import { Download, Monitor, X, Check } from 'lucide-react';

export const InstallAppButton: React.FC<{ className?: string; compact?: boolean }> = ({
  className = '',
  compact = false,
}) => {
  const { isInstallable, isStandalone, installApp } = usePWA();
  const [showGuideModal, setShowGuideModal] = useState(false);

  // If already running as an installed standalone desktop app, hide install button
  if (isStandalone) return null;

  const handleClick = async () => {
    if (isInstallable) {
      await installApp();
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium transition cursor-pointer shrink-0 animate-in fade-in duration-200 ${className}`}
        title="Install Keyboard Hero as an offline desktop app"
      >
        <Download className="w-3.5 h-3.5 shrink-0" />
        <span className={compact ? 'hidden md:inline' : 'hidden sm:inline'}>Install App</span>
      </button>

      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm p-5 bg-card border border-emerald-500/30 rounded-2xl shadow-2xl text-card-foreground">
            <button
              onClick={() => setShowGuideModal(false)}
              className="absolute top-3.5 right-3.5 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                <Monitor className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Install Keyboard Hero</h3>
            </div>

            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
              Install Keyboard Hero to your desktop or taskbar for instantaneous launch and 100% offline practice.
            </p>

            <div className="space-y-2 p-3 bg-secondary/50 border border-border/70 rounded-xl text-xs text-muted-foreground mb-4">
              <div className="flex items-start gap-2">
                <span className="font-semibold text-emerald-400 shrink-0">Chrome / Edge:</span>
                <span>Click the install icon (🖥️ or ➕) in the right side of the address bar.</span>
              </div>
              <div className="flex items-start gap-2 pt-1 border-t border-border/40">
                <span className="font-semibold text-cyan-400 shrink-0">Safari (macOS):</span>
                <span>Click <strong>File ➔ Add to Dock</strong> in the top menu.</span>
              </div>
              <div className="flex items-start gap-2 pt-1 border-t border-border/40">
                <span className="font-semibold text-indigo-400 shrink-0">Standalone:</span>
                <span>Works 100% offline with zero latency and full audio engine support.</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2 px-3 text-xs font-semibold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition cursor-pointer text-center"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
