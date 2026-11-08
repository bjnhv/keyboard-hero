'use client';

import React from 'react';
import { usePWA } from './pwa-provider';
import { Download } from 'lucide-react';

export const InstallAppButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isInstallable, installApp } = usePWA();

  if (!isInstallable) return null;

  return (
    <button
      type="button"
      onClick={installApp}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium transition cursor-pointer animate-in fade-in duration-200 ${className}`}
      title="Install Keyboard Hero as a desktop app"
    >
      <Download className="w-3.5 h-3.5 shrink-0" />
      <span className="hidden sm:inline">Install App</span>
    </button>
  );
};
