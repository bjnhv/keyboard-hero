'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
  Bomb,
  ArrowLeft,
  Volume2,
  VolumeX,
  Trophy,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  Flame,
  Clock,
  Play,
} from 'lucide-react';
import { AppBar } from '@/components/navigation';
import { C4BombProp } from '@/components/arcade/c4-bomb-prop';
import { csAudio } from '@/core/audio/cs-audio';
import {
  useBombDefusalStore,
  DEFUSAL_TIERS,
  DefusalDifficulty,
} from '@/stores/use-bomb-defusal-store';
import { loadArcadeScores, ArcadeScoreRecord } from '@/local-db';

export default function BombDefusalPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [highScores, setHighScores] = useState<ArcadeScoreRecord[]>([]);

  const {
    status,
    difficulty,
    soundEnabled,
    setDifficulty,
    toggleSound,
    startGame,
    resetGame,
    handleInputKey,
    tick,
  } = useBombDefusalStore();

  const lastTickTimeRef = useRef<number>(0);

  // Client hydration & Audio Preloading
  useEffect(() => {
    setIsMounted(true);
    csAudio.preload();
    loadArcadeScores('defuse').then(setHighScores).catch(() => {});
  }, [status]);

  // Global Keydown Listener for Typing Input
  useEffect(() => {
    if (!isMounted) return;

    const onKeyDown = (e: KeyboardEvent) => {
      // Ignore functional browser shortcuts
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key === 'Tab') {
        e.preventDefault();
        return;
      }

      if (e.key === ' ' || e.key.length === 1 || e.key === 'Backspace') {
        if (status === 'running') {
          e.preventDefault();
          handleInputKey(e.key);
        } else if (status === 'ready' && e.key === 'Enter') {
          e.preventDefault();
          startGame();
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMounted, status, handleInputKey, startGame]);

  // High-precision Animation Frame Timer Loop
  useEffect(() => {
    if (status !== 'running') return;

    let animId: number;
    lastTickTimeRef.current = performance.now();

    const loop = (currentTime: number) => {
      const deltaSeconds = (currentTime - lastTickTimeRef.current) / 1000;
      lastTickTimeRef.current = currentTime;

      tick(deltaSeconds);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animId);
  }, [status, tick]);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between px-4 sm:px-6 3xl:px-10 2k:px-14 pt-2 sm:pt-3 pb-8 max-w-5xl xl:max-w-6xl 3xl:max-w-7xl 2k:max-w-[1700px] mx-auto w-full gap-6">
      {/* Top Header */}
      <AppBar>
        <div className="flex items-center gap-2">
          <Link
            href="/arcade"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Arcade Hub</span>
          </Link>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold">
            <Bomb className="w-3.5 h-3.5 text-rose-400" />
            <span>Bomb Defusal Protocol</span>
          </span>
        </div>
      </AppBar>

      {/* Hero Title & Tier Selection Toolbar */}
      <section className="flex flex-col md:flex-row items-center justify-between gap-4 py-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 uppercase tracking-widest border border-rose-500/30">
              Counter-Strike Protocol
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            Bomb Defusal Protocol
          </h1>
        </div>

        {/* Controls: Difficulty Tiers & Sound */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Difficulty Tiers */}
          <div className="inline-flex p-1 rounded-xl bg-secondary/80 border border-border">
            {(Object.keys(DEFUSAL_TIERS) as DefusalDifficulty[]).map((tierKey) => {
              const cfg = DEFUSAL_TIERS[tierKey];
              const isSelected = difficulty === tierKey;

              return (
                <button
                  key={tierKey}
                  type="button"
                  disabled={status === 'running'}
                  onClick={() => setDifficulty(tierKey)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer disabled:opacity-50 ${
                    isSelected
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {cfg.name}
                </button>
              );
            })}
          </div>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={toggleSound}
            className={`p-2 rounded-xl border text-xs font-medium transition cursor-pointer ${
              soundEnabled
                ? 'bg-primary/10 border-primary/30 text-primary'
                : 'bg-secondary text-muted-foreground border-border'
            }`}
            title={soundEnabled ? 'Mute Audio' : 'Enable Audio'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </section>

      {/* Main Interactive C4 Prop */}
      <main className="flex-1 flex flex-col items-center justify-center w-full py-4">
        <C4BombProp />
      </main>

      {/* Footer Leaderboard / High Scores */}
      {highScores.length > 0 && (
        <section className="w-full max-w-4xl mx-auto p-4 rounded-2xl bg-card/60 border border-border/70 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Defusal Hall of Fame</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {highScores.slice(0, 3).map((hs, i) => (
              <div
                key={hs.id}
                className="flex items-center justify-between p-3 rounded-xl bg-secondary/40 border border-border/80 text-xs font-mono"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-400">#{i + 1}</span>
                  <span className="capitalize text-foreground font-semibold">{hs.difficulty}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-400 font-bold">{hs.wpm} WPM</span>
                  <span className="text-cyan-400 font-black">{hs.score} PTS</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
