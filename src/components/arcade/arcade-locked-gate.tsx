'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, ShieldAlert, Sparkles, ArrowRight, CheckCircle2, Unlock } from 'lucide-react';
import { useArcadeUnlock, ARCADE_REQUIRED_STAGE, ARCADE_REQUIRED_MASTERED_KEYS } from '@/core/arcade/unlock-manager';

export const ArcadeLockedGate: React.FC = () => {
  const {
    currentStage,
    requiredStage,
    masteredKeysCount,
    requiredKeysCount,
    progressPercentage,
    unlockImmediately,
  } = useArcadeUnlock();

  return (
    <div className="relative w-full max-w-2xl mx-auto rounded-3xl border-2 border-amber-500/40 bg-zinc-950/90 p-6 sm:p-8 shadow-2xl overflow-hidden backdrop-blur-xl animate-in zoom-in-95 duration-200">
      {/* Top hazard tape banner */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-[repeating-linear-gradient(45deg,#f59e0b,#f59e0b_15px,#000_15px,#000_30px)] opacity-70" />

      <div className="flex flex-col items-center text-center gap-4 pt-2">
        {/* Glowing Padlock Icon */}
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-950/50">
          <Lock className="w-8 h-8 animate-pulse" />
        </div>

        {/* Clearance Alert Header */}
        <div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
            CLEARANCE REQUIRED // STAGE 3
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-foreground mt-2">
            Arcade Mode Locked
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto mt-1 leading-relaxed">
            High-stress arcade challenges (<strong className="text-foreground">Redline RPM</strong>,{' '}
            <strong className="text-foreground">C4 Bomb Defusal</strong>) demand blind muscle memory.
            Master your Home Row anchors to gain full security clearance.
          </p>
        </div>

        {/* Progression Progress Card */}
        <div className="w-full p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-left flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-400 font-semibold">Unlock Clearance Progress</span>
            <span className="text-amber-400 font-bold">{progressPercentage}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300 rounded-full"
              style={{ width: `${Math.max(5, progressPercentage)}%` }}
            />
          </div>

          {/* Dual Unlock Milestones */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs font-mono">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
              <span className={`w-2 h-2 rounded-full ${currentStage >= ARCADE_REQUIRED_STAGE ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-amber-400'}`} />
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 uppercase">Primary Goal</span>
                <span className="text-zinc-300">
                  Reach Stage {requiredStage} ({currentStage}/{requiredStage})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
              <span className={`w-2 h-2 rounded-full ${masteredKeysCount >= ARCADE_REQUIRED_MASTERED_KEYS ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-amber-400'}`} />
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 uppercase">Alternate Goal</span>
                <span className="text-zinc-300">
                  Master {requiredKeysCount} Keys ({masteredKeysCount}/{requiredKeysCount})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Actions */}
        <div className="flex flex-col items-center gap-2.5 w-full pt-1">
          <Link
            href="/learn"
            className="w-full sm:w-auto py-3 px-8 rounded-xl font-black text-sm tracking-wide bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-xl shadow-amber-950/40 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>Practice in Lab to Unlock</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Quick-unlock bypass for experienced touch typists */}
          <button
            type="button"
            onClick={unlockImmediately}
            className="text-[11px] text-zinc-500 hover:text-zinc-300 transition flex items-center gap-1.5 cursor-pointer underline underline-offset-4"
          >
            <Unlock className="w-3 h-3" />
            <span>Already an experienced typist? Unlock immediately</span>
          </button>
        </div>
      </div>
    </div>
  );
};

