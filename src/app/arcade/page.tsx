'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Flame,
  Zap,
  Gauge,
  Bomb,
  Rocket,
  Code2,
  Trophy,
  Play,
  Sparkles,
  Gamepad2,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { loadArcadeScores, ArcadeScoreRecord } from '@/local-db';

export default function ArcadeHubPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [scores, setScores] = useState<ArcadeScoreRecord[]>([]);

  useEffect(() => {
    setIsMounted(true);
    loadArcadeScores('redline').then(setScores).catch(() => {});
  }, []);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col p-4 sm:p-6 3xl:p-10 max-w-5xl xl:max-w-6xl 3xl:max-w-7xl 2k:max-w-[1700px] mx-auto w-full gap-8">
      {/* Top Header */}
      <header className="flex items-center justify-between border-b border-border/50 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Home</span>
          </Link>
          <span className="text-border">/</span>
          <span className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Gamepad2 className="w-4 h-4 text-primary" />
            Arcade Hub
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/learn"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-xs font-semibold hover:bg-secondary/80 border border-border transition"
          >
            Curriculum
          </Link>
          <Link
            href="/stats"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-xs font-semibold hover:bg-secondary/80 border border-border transition"
          >
            Heatmap
          </Link>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="text-center flex flex-col items-center gap-3 py-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>High-Intensity Typing Mini-Games</span>
        </div>
        <h1 className="text-4xl sm:text-5xl 3xl:text-6xl font-black tracking-tight">
          Keyboard Hero <span className="text-primary">Arcade</span>
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-xl">
          Step outside the guided curriculum. Test your burst speed, rhythm under pressure, and
          composure in gamified arcade challenges.
        </p>
      </section>

      {/* Game Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* GAME 1: REDLINE RPM (ACTIVE) */}
        <div className="relative rounded-3xl border border-primary/40 bg-gradient-to-br from-card via-card to-primary/10 p-6 sm:p-8 flex flex-col justify-between shadow-2xl hover:border-primary/60 transition group overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold uppercase tracking-wider animate-pulse">
              Playable Now
            </span>
          </div>

          <div>
            <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary mb-4 shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              <Gauge className="w-7 h-7" />
            </div>

            <h2 className="text-2xl font-black text-foreground mb-2 flex items-center gap-2">
              Redline RPM
              <Flame className="w-5 h-5 text-rose-500" />
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground mb-6 leading-relaxed">
              Accelerate your typing speed above the dynamic redline threshold and hold it continuously
              for up to 25 seconds without dipping. Features an animated SVG speedometer and engine sound.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-2.5 py-1 rounded-lg bg-secondary text-foreground text-[11px] font-semibold border border-border">
                🏎️ 4 Vehicle Tiers (35 to 100+ WPM)
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-secondary text-foreground text-[11px] font-semibold border border-border">
                ⚡ Real-Time Tachometer
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-secondary text-foreground text-[11px] font-semibold border border-border">
                🔊 Audio Engine Revs
              </span>
            </div>
          </div>

          <Link
            href="/arcade/redline"
            className="w-full py-3.5 px-4 rounded-xl font-bold bg-primary hover:opacity-90 text-primary-foreground flex items-center justify-center gap-2 transition shadow-lg shadow-primary/20 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Launch Redline Sprint</span>
          </Link>
        </div>

        {/* GAME 2: BOMB DEFUSAL PROTOCOL (PREVIEW) */}
        <div className="relative rounded-3xl border border-rose-500/30 bg-gradient-to-br from-card via-card to-rose-950/20 p-6 sm:p-8 flex flex-col justify-between shadow-xl">
          <div className="absolute top-0 right-0 p-4">
            <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold uppercase tracking-wider">
              Next Release
            </span>
          </div>

          <div>
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-4 shadow-lg shadow-rose-900/20">
              <Bomb className="w-7 h-7" />
            </div>

            <h2 className="text-2xl font-black text-foreground mb-2 flex items-center gap-2">
              Bomb Defusal Protocol
              <Clock className="w-5 h-5 text-amber-400 animate-spin" />
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground mb-6 leading-relaxed">
              Disarm a ticking C4 explosive payload before the digital timer strikes zero. Beware: every single typo
              immediately penalizes you with a harsh deduction (-3s) from the countdown!
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-2.5 py-1 rounded-lg bg-secondary text-foreground text-[11px] font-semibold border border-border">
                ⏱️ Precision Countdown
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-secondary text-foreground text-[11px] font-semibold border border-border">
                💥 -3s Typo Deduction Penalty
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-secondary text-foreground text-[11px] font-semibold border border-border">
                ✂️ Multi-Phase Wire Cutting
              </span>
            </div>
          </div>

          <button
            disabled
            className="w-full py-3.5 px-4 rounded-xl font-bold bg-secondary/50 text-muted-foreground border border-border flex items-center justify-center gap-2 cursor-not-allowed opacity-60"
          >
            <span>In Construction</span>
          </button>
        </div>

        {/* GAME 3: WORD INVADERS (LABS) */}
        <div className="rounded-2xl border border-border/80 bg-secondary/20 p-5 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center text-sky-400 mb-3">
              <Rocket className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">Word Invaders</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Classic arcade defense. Alien ships and asteroids descend towards your shield; typing target words vaporizes them.
            </p>
          </div>
          <span className="text-[11px] text-muted-foreground/60 font-mono">Status: Planned in Arcade Roadmap</span>
        </div>

        {/* GAME 4: TERMINAL HACKER (LABS) */}
        <div className="rounded-2xl border border-border/80 bg-secondary/20 p-5 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center text-emerald-400 mb-3">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">Terminal Hacker</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Matrix-style terminal infiltration typing real code syntax, keywords, and brackets to evade security trace routes.
            </p>
          </div>
          <span className="text-[11px] text-muted-foreground/60 font-mono">Status: Planned in Arcade Roadmap</span>
        </div>
      </section>

      {/* Arcade Personal Bests (Dexie) */}
      {scores.length > 0 && (
        <section className="flex flex-col gap-3 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              Your Arcade Records
            </h3>
            <span className="text-xs text-muted-foreground">Stored locally in IndexedDB</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {scores.slice(0, 3).map((record) => (
              <div
                key={record.id}
                className="p-3.5 rounded-xl bg-secondary/30 border border-border/80 flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-foreground capitalize block">
                    {record.gameId} ({record.difficulty})
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(record.achievedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-primary font-mono block">
                    {record.wpm} WPM
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold">
                    {record.accuracy}% Acc
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

