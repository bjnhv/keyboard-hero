'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/use-auth-store';
import { syncManager } from '@/local-db';
import { CloudUpload, ArrowRightLeft, Check, X, ShieldAlert, Sparkles, Loader2 } from 'lucide-react';

export const GuestMergeModal: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const [isOpen, setIsOpen] = useState(false);
  const [guestCount, setGuestCount] = useState(0);
  const [isMerging, setIsMerging] = useState(false);
  const [mergedCount, setMergedCount] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      setIsOpen(false);
      return;
    }

    let isMounted = true;

    const checkGuestData = async () => {
      try {
        const count = await syncManager.getGuestSessionCount();
        if (!isMounted) return;

        const dismissed = sessionStorage.getItem(`dismissed_merge_${user.id}`);
        if (count > 0 && !dismissed) {
          setGuestCount(count);
          setIsOpen(true);
        } else {
          // If no guest data needs merging, run cloud hydration silently
          syncManager.hydrateFromCloud(user.id).catch(() => {});
        }
      } catch (err) {
        console.warn('Failed to check guest sessions:', err);
      }
    };

    checkGuestData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  if (!isOpen || !user) return null;

  const handleMerge = async () => {
    setIsMerging(true);
    try {
      const merged = await syncManager.mergeGuestSessions(user.id);
      setMergedCount(merged);
      sessionStorage.setItem(`dismissed_merge_${user.id}`, 'true');
      setTimeout(() => {
        setIsOpen(false);
      }, 1800);
    } catch (err) {
      console.error('Failed to merge guest sessions:', err);
      setIsMerging(false);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem(`dismissed_merge_${user.id}`, 'true');
    setIsOpen(false);
    // Still hydrate cloud data in background
    syncManager.hydrateFromCloud(user.id).catch(() => {});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md p-6 bg-card border border-primary/30 rounded-2xl shadow-2xl overflow-hidden text-card-foreground">
        {/* Glow ambient accent */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={handleDismiss}
          disabled={isMerging}
          className="absolute top-4 right-4 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition cursor-pointer disabled:opacity-50"
          title="Dismiss for now"
        >
          <X className="w-4 h-4" />
        </button>

        {mergedCount !== null ? (
          <div className="text-center py-6 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Check className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Practice History Merged!</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Synced <span className="font-semibold text-emerald-400">{mergedCount}</span> offline session
              {mergedCount === 1 ? '' : 's'} to <span className="text-foreground">{user.email}</span>.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="w-3 h-3" />
                Offline Progress Found
              </span>
            </div>

            <div className="flex items-start gap-3.5 mb-4">
              <div className="p-2.5 rounded-xl bg-primary/15 border border-primary/25 text-primary shrink-0 mt-0.5">
                <CloudUpload className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground leading-snug">
                  Merge Local Practice History?
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  We found <span className="font-semibold text-primary">{guestCount}</span> practice session
                  {guestCount === 1 ? '' : 's'} recorded offline on this computer. Would you like to merge them
                  into your account?
                </p>
              </div>
            </div>

            <div className="p-3 mb-5 rounded-xl bg-secondary/50 border border-border/70 text-xs text-muted-foreground space-y-1.5">
              <div className="flex items-center gap-2 text-foreground font-medium">
                <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400" />
                <span>Account: {user.email}</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Merging preserves your typing speeds, unlocked curriculum stages, and heatmap confidence across
                all your devices.
              </p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-2">
              <button
                type="button"
                onClick={handleDismiss}
                disabled={isMerging}
                className="w-full sm:w-1/2 py-2 px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 rounded-xl transition cursor-pointer disabled:opacity-50"
              >
                Keep Local Only
              </button>
              <button
                type="button"
                onClick={handleMerge}
                disabled={isMerging}
                className="w-full sm:w-1/2 py-2 px-3 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl transition shadow-md shadow-primary/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isMerging ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Merging...</span>
                  </>
                ) : (
                  <>
                    <CloudUpload className="w-3.5 h-3.5" />
                    <span>Merge to Account</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

