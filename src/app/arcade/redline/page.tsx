'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Flame,
  RotateCcw,
  Trophy,
  Zap,
  Play,
  Volume2,
  VolumeX,
  Gauge,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { AppBar } from '@/components/navigation';
import { SpeedometerGauge } from '@/components/arcade/speedometer-gauge';
import { useArcadeUnlock } from '@/core/arcade/unlock-manager';
import { ArcadeLockedGate } from '@/components/arcade/arcade-locked-gate';
import {
  useRedlineStore,
  REDLINE_TIERS,
  RedlineDifficulty,
} from '@/stores/use-redline-store';
import { arcadeAudio } from '@/core/audio/arcade-audio';

export default function RedlineGamePage() {
  const [isMounted, setIsMounted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isUnlocked } = useArcadeUnlock();

  const status = useRedlineStore((s) => s.status);
  const difficulty = useRedlineStore((s) => s.difficulty);
  const textStream = useRedlineStore((s) => s.textStream);
  const charIndex = useRedlineStore((s) => s.charIndex);
  const peakWpm = useRedlineStore((s) => s.peakWpm);
  const currentRollingWpm = useRedlineStore((s) => s.currentRollingWpm);
  const totalKeystrokes = useRedlineStore((s) => s.totalKeystrokes);
  const totalErrors = useRedlineStore((s) => s.totalErrors);
  const elapsedSeconds = useRedlineStore((s) => s.elapsedSeconds);
  const isRedlining = useRedlineStore((s) => s.isRedlining);

  const setDifficulty = useRedlineStore((s) => s.setDifficulty);
  const startGame = useRedlineStore((s) => s.startGame);
  const resetGame = useRedlineStore((s) => s.resetGame);
  const handleInputKey = useRedlineStore((s) => s.handleInputKey);
  const tickTimer = useRedlineStore((s) => s.tickTimer);

  const currentConfig = REDLINE_TIERS[difficulty];

  useEffect(() => {
    setIsMounted(true);
    inputRef.current?.focus();
  }, []);

  // 100ms game loop interval
  useEffect(() => {
    if (status !== 'running') return;
    const interval = setInterval(() => {
      tickTimer();
    }, 100);
    return () => clearInterval(interval);
  }, [status, tickTimer]);

  // Keep input focused
  useEffect(() => {
    inputRef.current?.focus();
  }, [charIndex, status]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      resetGame();
      return;
    }

    if (e.key === 'Backspace' || e.key === ' ') {
      e.preventDefault();
    }

    handleInputKey(e.key);
  };

  const toggleAudio = () => {
    const next = !soundEnabled;
    arcadeAudio.setEnabled(next);
    setSoundEnabled(next);
  };

  if (!isMounted) return null;

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-between px-4 sm:px-6 3xl:px-10 2k:px-14 pt-2 sm:pt-3 pb-8 max-w-5xl xl:max-w-6xl 3xl:max-w-7xl 2k:max-w-[1700px] mx-auto w-full gap-6">
        <AppBar>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold">
            <Gauge className="w-3.5 h-3.5 text-rose-400" />
            <span>Redline RPM</span>
          </span>
        </AppBar>
        <div className="my-auto py-8">
          <ArcadeLockedGate />
        </div>
      </div>
    );
  }

  const accuracyPct =
    totalKeystrokes > 0
      ? Math.round(((totalKeystrokes - totalErrors) / totalKeystrokes) * 100)
      : 100;

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="min-h-screen lg:h-screen lg:max-h-screen lg:overflow-hidden bg-background text-foreground flex flex-col justify-between px-4 sm:px-6 3xl:px-10 2k:px-14 py-2 sm:py-3 max-w-5xl xl:max-w-6xl 3xl:max-w-7xl 2k:max-w-[1700px] mx-auto w-full select-none cursor-text"
    >
      {/* Hidden input to capture keystrokes */}
      <input
        ref={inputRef}
        type="text"
        className="opacity-0 absolute -left-[9999px] -top-[9999px]"
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        onKeyDown={onKeyDown}
      />

      {/* Top Header */}
      <AppBar subTitle="Redline RPM" subIcon={<Gauge className="w-3.5 h-3.5 text-primary" />}>
        {/* Tier Selector & Audio Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Difficulty Dropdown */}
          <div className="flex items-center gap-1 bg-secondary/60 p-1 rounded-xl border border-border/80">
            {(Object.keys(REDLINE_TIERS) as RedlineDifficulty[]).map((tierKey) => {
              const tier = REDLINE_TIERS[tierKey];
              const isSelected = difficulty === tierKey;
              return (
                <button
                  key={tierKey}
                  onClick={() => setDifficulty(tierKey)}
                  className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-xs font-bold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tier.name} ({tier.targetWpm} WPM)
                </button>
              );
            })}
          </div>

          <button
            onClick={toggleAudio}
            title={soundEnabled ? 'Disable Engine SFX' : 'Enable Engine SFX'}
            className="p-1.5 sm:p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground border border-border transition cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>
        </div>
      </AppBar>

      {/* Main Game Stage */}
      <main className="flex-1 flex flex-col items-center justify-center gap-6 my-auto">
        {/* Speedometer Instrument Cluster */}
        <SpeedometerGauge />

        {/* Rolling Word Highway Stream */}
        <div
          className={`w-full max-w-3xl 3xl:max-w-4xl p-6 sm:p-8 rounded-2xl 3xl:rounded-3xl border transition-all duration-200 relative overflow-hidden ${
            isRedlining
              ? 'bg-gradient-to-b from-rose-950/20 via-card to-card border-rose-500/50 shadow-2xl shadow-rose-900/20'
              : 'bg-card border-border/80 shadow-lg'
          }`}
        >
          {/* Active Status Badge */}
          <div className="flex items-center justify-between mb-3 text-xs text-muted-foreground font-mono">
            <span className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  status === 'running'
                    ? isRedlining
                      ? 'bg-rose-500 animate-ping'
                      : 'bg-emerald-500 animate-pulse'
                    : 'bg-muted-foreground/40'
                }`}
              />
              {status === 'running'
                ? isRedlining
                  ? 'REDLINE ACTIVE - MAINTAIN CADENCE!'
                  : 'RACING - ACCELERATE!'
                : 'START TYPING ANYTIME TO LAUNCH'}
            </span>
            <span>Accuracy: {accuracyPct}%</span>
          </div>

          {/* Text Flow Container */}
          <div className="font-mono text-2xl sm:text-3xl 3xl:text-4xl tracking-wider leading-relaxed text-left flex flex-wrap min-h-[90px] items-center">
            {textStream
              .slice(Math.max(0, charIndex - 15), charIndex + 45)
              .split('')
              .map((char, relIdx) => {
                const absIdx = Math.max(0, charIndex - 15) + relIdx;
                const isTyped = absIdx < charIndex;
                const isCurrent = absIdx === charIndex;

                let color = 'text-muted-foreground/35';
                if (isTyped) {
                  color = 'text-foreground/90 font-medium';
                } else if (isCurrent) {
                  color = isRedlining
                    ? 'text-rose-400 bg-rose-500/20 px-0.5 rounded ring-2 ring-rose-500/50 animate-pulse font-bold'
                    : 'text-primary bg-primary/20 px-0.5 rounded ring-2 ring-primary/40 animate-pulse font-bold';
                }

                return (
                  <span key={absIdx} className={`relative inline-block ${color}`}>
                    {char === ' ' ? '\u00A0' : char}
                    {isCurrent && (
                      <span
                        className={`absolute -left-[1px] top-1 bottom-1 w-0.5 ${
                          isRedlining ? 'bg-rose-500' : 'bg-primary'
                        } animate-pulse`}
                      />
                    )}
                  </span>
                );
              })}
          </div>
        </div>
      </main>

      {/* Footer Instructions */}
      <footer className="w-full text-center text-[11px] sm:text-xs text-muted-foreground/60 pt-2 border-t border-border/30 shrink-0">
        Tip: Press <span className="font-mono text-foreground font-semibold">Tab</span> to reset
        the speedometer. Keep cadence steady through word spaces to avoid losing turbo boost.
      </footer>

      {/* Victory Modal Overlay */}
      {status === 'won' && (
        <div className="fixed inset-0 z-50 bg-background/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-emerald-500/50 rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 animate-bounce">
              <Trophy className="w-8 h-8" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-1">
              FINISH LINE CROSSED! 🏁
            </h2>
            <p className="text-xs text-emerald-400 font-semibold mb-6">
              You held above {currentConfig.targetWpm} WPM for {currentConfig.requiredHoldSeconds}s on{' '}
              {currentConfig.vehicleName}!
            </p>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-3 gap-3 w-full mb-6 text-center">
              <div className="p-3 bg-secondary/50 rounded-xl border border-border">
                <span className="text-[10px] text-muted-foreground block uppercase font-medium">
                  Peak Speed
                </span>
                <span className="text-2xl font-black text-primary font-mono">{peakWpm}</span>
                <span className="text-[10px] text-muted-foreground block">WPM</span>
              </div>
              <div className="p-3 bg-secondary/50 rounded-xl border border-border">
                <span className="text-[10px] text-muted-foreground block uppercase font-medium">
                  Hold Time
                </span>
                <span className="text-2xl font-black text-emerald-400 font-mono">
                  {currentConfig.requiredHoldSeconds}s
                </span>
                <span className="text-[10px] text-muted-foreground block">Redlined</span>
              </div>
              <div className="p-3 bg-secondary/50 rounded-xl border border-border">
                <span className="text-[10px] text-muted-foreground block uppercase font-medium">
                  Accuracy
                </span>
                <span className="text-2xl font-black text-foreground font-mono">
                  {accuracyPct}%
                </span>
                <span className="text-[10px] text-muted-foreground block">Correct</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 w-full">
              <button
                onClick={resetGame}
                className="flex-1 py-3 px-4 rounded-xl font-semibold bg-secondary hover:bg-secondary/80 text-foreground border border-border flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Race Again</span>
              </button>

              <Link
                href="/arcade"
                className="flex-1 py-3 px-4 rounded-xl font-bold bg-primary hover:opacity-90 text-primary-foreground flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-primary/20"
              >
                <span>Arcade Hub</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

