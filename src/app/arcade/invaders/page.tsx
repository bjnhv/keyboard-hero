'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
  Rocket,
  ArrowLeft,
  Volume2,
  VolumeX,
  Trophy,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  Flame,
  Play,
  Crosshair,
  Lock,
} from 'lucide-react';
import { AppBar } from '@/components/navigation';
import { WordInvadersBattlefield } from '@/components/arcade/word-invaders-battlefield';
import { invadersAudio } from '@/core/audio/invaders-audio';
import {
  useWordInvadersStore,
  InvadersGameStatus,
} from '@/stores/use-word-invaders-store';
import { INVADER_TIERS, InvaderDifficulty } from '@/core/arcade/invaders-words';
import { useArcadeUnlock } from '@/core/arcade/unlock-manager';
import { ArcadeLockedGate } from '@/components/arcade/arcade-locked-gate';
import { loadArcadeScores, ArcadeScoreRecord } from '@/local-db';
import { useTypingStore } from '@/stores/use-typing-store';

export default function WordInvadersPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [highScores, setHighScores] = useState<ArcadeScoreRecord[]>([]);
  const { isUnlocked } = useArcadeUnlock();
  const currentLayout = useTypingStore((s) => s.keyboardLayout);

  const {
    status,
    difficulty,
    soundEnabled,
    wave,
    score,
    shields,
    wordsDestroyed,
    totalKeystrokes,
    totalErrors,
    elapsedSeconds,
    setDifficulty,
    setLayout,
    toggleSound,
    startGame,
    resetGame,
    handleInputKey,
    tickGameLoop,
  } = useWordInvadersStore();

  const lastTickTimeRef = useRef<number>(0);

  // Client hydration & Audio Preloading
  useEffect(() => {
    setIsMounted(true);
    invadersAudio.preload();
    setLayout(currentLayout);
    loadArcadeScores('invaders').then(setHighScores).catch(() => {});
  }, [currentLayout, setLayout, status]);

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

      if (status === 'running') {
        if (e.key.length === 1 || e.key === ' ') {
          e.preventDefault();
          handleInputKey(e.key);
        }
      } else if ((status === 'ready' || status === 'gameover') && e.key === 'Enter') {
        e.preventDefault();
        startGame();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMounted, status, handleInputKey, startGame]);

  // 60FPS Game Loop using RequestAnimationFrame
  useEffect(() => {
    if (status !== 'running') return;

    let animId: number;
    lastTickTimeRef.current = performance.now();

    const loop = (currentTime: number) => {
      const deltaSeconds = Math.min(0.1, (currentTime - lastTickTimeRef.current) / 1000);
      lastTickTimeRef.current = currentTime;

      tickGameLoop(deltaSeconds);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animId);
  }, [status, tickGameLoop]);

  if (!isMounted) return null;

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-between px-4 sm:px-6 3xl:px-10 2k:px-14 pt-2 sm:pt-3 pb-8 max-w-5xl xl:max-w-6xl 3xl:max-w-7xl 2k:max-w-[1700px] mx-auto w-full gap-6">
        <AppBar>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold">
            <Rocket className="w-3.5 h-3.5 text-rose-400" />
            <span>Word Invaders</span>
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

  const rollingWpm =
    elapsedSeconds > 0
      ? Math.round((totalKeystrokes / 5) / (elapsedSeconds / 60))
      : 0;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between px-4 sm:px-6 3xl:px-10 2k:px-14 pt-2 sm:pt-3 pb-8 max-w-5xl xl:max-w-6xl 3xl:max-w-7xl 2k:max-w-[1700px] mx-auto w-full gap-4">
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
          <span className="text-border">/</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono">
            <Rocket className="w-3.5 h-3.5" />
            <span>Word Invaders 1978</span>
          </span>
        </div>
      </AppBar>

      {/* Control Toolbar */}
      <section className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-card/60 border border-border/80 backdrop-blur-sm">
        {/* Difficulty Tier Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(Object.keys(INVADER_TIERS) as InvaderDifficulty[]).map((tierKey) => {
            const cfg = INVADER_TIERS[tierKey];
            const isActive = difficulty === tierKey;

            return (
              <button
                key={tierKey}
                onClick={() => setDifficulty(tierKey)}
                disabled={status === 'running'}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-950/40 font-black'
                    : 'bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary'
                } ${status === 'running' ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span>{cfg.name}</span>
              </button>
            );
          })}
        </div>

        {/* Audio Toggle & Restart */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            className={`p-2 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              soundEnabled
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                : 'bg-secondary border-border text-muted-foreground'
            }`}
            title={soundEnabled ? 'Mute 1978 Arcade Audio' : 'Unmute 1978 Arcade Audio'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline font-mono">
              {soundEnabled ? '1978 SFX ON' : 'MUTED'}
            </span>
          </button>

          {status === 'running' && (
            <button
              onClick={resetGame}
              className="p-2 rounded-xl bg-secondary hover:bg-rose-500/20 text-muted-foreground hover:text-rose-400 border border-border transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title="Abort Mission"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Abort</span>
            </button>
          )}
        </div>
      </section>

      {/* Main Interactive Battlefield Arena */}
      <div className="relative w-full">
        <WordInvadersBattlefield />

        {/* READY / START OVERLAY */}
        {status === 'ready' && (
          <div className="absolute inset-0 bg-zinc-950/85 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center gap-5 z-40 animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-950/50">
              <Crosshair className="w-8 h-8 animate-pulse" />
            </div>

            <div className="max-w-md flex flex-col gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full mx-auto">
                AUTHENTIC 1978 ARCADE NOSTALGIA
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-foreground">
                Word <span className="text-emerald-400">Invaders</span>
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Alien armada approaching Earth orbit! Type the target words overhead to fire your plasma laser cannon.
                Beware the accelerating 4-note fleet march and snipe the Mystery UFO for massive bonus points!
              </p>
            </div>

            <div className="flex flex-col items-center gap-2">
              <button
                onClick={startGame}
                className="py-3.5 px-8 rounded-xl font-black text-sm bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-xl shadow-emerald-950/50 transition flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>ENGAGE FLEET (ENTER)</span>
              </button>
              <span className="text-[11px] text-zinc-500 font-mono">
                Physical keyboard required • Press Enter anytime
              </span>
            </div>
          </div>
        )}

        {/* GAME OVER OVERLAY */}
        {status === 'gameover' && (
          <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center gap-5 z-40 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border-2 border-rose-500/40 flex items-center justify-center text-rose-500 shadow-xl shadow-rose-950/50">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-rose-400 uppercase bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-full">
                PLANETARY SHIELDS BREACHED
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-foreground mt-2">
                Game Over
              </h2>
            </div>

            {/* Performance Metric Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-lg font-mono">
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col items-center">
                <span className="text-[10px] text-zinc-500 uppercase">Final Score</span>
                <span className="text-lg font-black text-emerald-400">{score}</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col items-center">
                <span className="text-[10px] text-zinc-500 uppercase">Sector Wave</span>
                <span className="text-lg font-black text-cyan-400">Wave {wave}</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col items-center">
                <span className="text-[10px] text-zinc-500 uppercase">Burst WPM</span>
                <span className="text-lg font-black text-primary">{rollingWpm}</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col items-center">
                <span className="text-[10px] text-zinc-500 uppercase">Accuracy</span>
                <span className="text-lg font-black text-foreground">{accuracyPct}%</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={startGame}
                className="py-3 px-6 rounded-xl font-black text-xs sm:text-sm bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-950/40 transition flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry Sector (ENTER)</span>
              </button>
              <Link
                href="/arcade"
                className="py-3 px-6 rounded-xl font-bold text-xs sm:text-sm bg-secondary hover:bg-secondary/80 text-foreground border border-border transition flex items-center gap-2 cursor-pointer"
              >
                <span>Arcade Hub</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Local High Scores Section */}
      {highScores.length > 0 && (
        <section className="flex flex-col gap-3 mt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              Word Invaders High Scores
            </h3>
            <span className="text-xs text-muted-foreground font-mono">Stored in IndexedDB</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {highScores.slice(0, 3).map((record) => (
              <div
                key={record.id}
                className="p-3 rounded-xl bg-card/60 border border-border/80 flex items-center justify-between font-mono"
              >
                <div>
                  <span className="text-xs font-bold text-foreground capitalize block">
                    {record.difficulty} Tier
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(record.achievedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-emerald-400 block">
                    {record.score} PTS
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    {record.wpm} WPM • {record.accuracy}% Acc
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

