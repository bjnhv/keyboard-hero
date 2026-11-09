'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/stores/use-auth-store';
import { AuthModal } from './auth-modal';
import { LogIn, LogOut, User, Check, ChevronDown, RefreshCw } from 'lucide-react';
import { syncManager } from '@/local-db';

export const AccountButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { user, isLoading, openAuthModal, signOut, initAuth } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loggedOutNotice, setLoggedOutNotice] = useState(false);
  const [isSyncingNow, setIsSyncingNow] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Initialize session on client mount
  useEffect(() => {
    setMounted(true);
    initAuth();
  }, [initAuth]);

  const handleManualSync = async () => {
    if (!user || isSyncingNow) return;
    setIsSyncingNow(true);
    setSyncSuccess(false);
    try {
      await syncManager.triggerSync();
      await syncManager.hydrateFromCloud(user.id);
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 2000);
    } catch {
      // ignore
    } finally {
      setIsSyncingNow(false);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setDropdownOpen(false);
    await signOut();
    setLoggedOutNotice(true);
    setTimeout(() => setLoggedOutNotice(false), 2500);
  };

  return (
    <>
      <div className="relative inline-flex items-center min-h-[30px]" ref={menuRef}>
        {!mounted || (isLoading && !user) ? (
          <div className="w-16 sm:w-20 h-7 rounded-lg bg-secondary/40 animate-pulse shrink-0" />
        ) : loggedOutNotice ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-lg animate-in fade-in duration-200">
            <Check className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Logged out</span>
          </span>
        ) : user ? (
          <div className="flex items-center gap-1 sm:gap-1.5 animate-in fade-in duration-150">
            {/* User Pill Button (opens dropdown) */}
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1 rounded-lg bg-secondary/80 hover:bg-secondary text-xs text-foreground border border-border/80 transition cursor-pointer max-w-[130px] sm:max-w-[180px]"
              title={`Logged in as ${user.email}`}
            >
              <div className="relative shrink-0">
                <User className="w-3.5 h-3.5 text-primary" />
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              </div>
              <span className="truncate font-medium text-xs">
                {user.name || user.email.split('@')[0]}
              </span>
              <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
            </button>

            {/* Quick Direct Logout Button on desktop */}
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center justify-center p-1 sm:px-2 sm:py-1 rounded-lg text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/30 transition cursor-pointer"
              title="Log Out of Account"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden md:inline ml-1">Log Out</span>
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-56 p-2 bg-card border border-border rounded-xl shadow-xl z-50 text-card-foreground animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-2 py-1.5 border-b border-border/50 mb-1">
                  <p className="text-xs font-semibold truncate text-foreground">
                    {user.name || 'Hero Player'}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                  <div className="flex items-center gap-1.5 mt-1 text-[10px] text-emerald-400">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    <span>Cloud Sync Active</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleManualSync}
                  disabled={isSyncingNow}
                  className="w-full flex items-center justify-between px-2 py-1.5 text-xs text-foreground hover:bg-secondary/70 rounded-lg transition cursor-pointer font-medium disabled:opacity-50 mb-1"
                >
                  <div className="flex items-center gap-2">
                    <RefreshCw className={`w-3.5 h-3.5 text-primary ${isSyncingNow ? 'animate-spin' : ''}`} />
                    <span>{isSyncingNow ? 'Syncing...' : 'Sync Now'}</span>
                  </div>
                  {syncSuccess && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </button>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-destructive hover:bg-destructive/10 rounded-lg transition cursor-pointer font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out of Account</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => openAuthModal('signin')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 text-xs font-semibold transition cursor-pointer"
            title="Sign in to sync your stats"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>

      <AuthModal />
    </>
  );
};
