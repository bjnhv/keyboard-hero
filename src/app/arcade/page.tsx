'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
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
  Lock,
  Unlock,
} from 'lucide-react';
import { AppBar } from '@/components/navigation';
import { loadArcadeScores, ArcadeScoreRecord } from '@/local-db';
import { useArcadeUnlock } from '@/core/arcade/unlock-manager';
import { ArcadeLockedGate } from '@/components/arcade/arcade-locked-gate';

export default function ArcadeHubPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [scores, setScores] = useState<ArcadeScoreRecord[]>([]);
  const { isUnlocked } = useArcadeUnlock();

  useEffect(() => {
    setIsMounted(true);
    loadArcadeScores().then(setScores).catch(() => { });
  }, []);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between px-4 sm:px-6 3xl:px-10 2k:px-14 pt-2 sm:pt-3 pb-8 max-w-5xl xl:max-w-6xl 3xl:max-w-7xl 2k:max-w-[1700px] mx-auto w-full gap-6">
      {/* Top Header */}
      <AppBar>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold">
          <Gamepad2 className="w-3.5 h-3.5 text-rose-400" />
          <span>Arcade Zone</span>
        </span>
      </AppBar>

      {/* Hero / Locked Clearance Gate Banner */}
      {!isUnlocked ? (
        <section className="flex flex-col items-center gap-4 py-2">
          <ArcadeLockedGate />
        </section>
      ) : (
        <section className="text-center flex flex-col items-center gap-3 py-4 animate-in fade-in duration-300">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Clearance Granted // All Games Unlocked</span>
          </div>
          <h1 className="text-4xl sm:text-5xl 3xl:text-6xl font-black tracking-tight">
            Keyboard Hero <span className="text-primary">Arcade</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl">
            Step outside the guided curriculum. Test your burst speed, rhythm under pressure, and
            composure in gamified arcade challenges.
          </p>
        </section>
      )}

      {/* Game Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* GAME 1: REDLINE RPM */}
        <div
          className={`relative rounded-3xl border ${isUnlocked
            ? 'border-primary/40 bg-gradient-to-br from-card via-card to-primary/10 shadow-2xl hover:border-primary/60'
            : 'border-zinc-800 bg-card/60 opacity-85'
            } p-6 sm:p-8 flex flex-col justify-between transition group overflow-hidden`}
        >
          <div className="absolute top-0 right-0 p-4">
            {isUnlocked ? (
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                Playable Now
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 font-mono">
                <Lock className="w-3 h-3 text-amber-400" />
                Locked // Stage 3
              </span>
            )}
          </div>

          <div>
            <div
              className={`w-14 h-14 rounded-2xl ${isUnlocked
                ? 'bg-primary/20 border-primary/40 text-primary group-hover:scale-105'
                : 'bg-zinc-800/60 border-zinc-700/50 text-zinc-400'
                } border flex items-center justify-center mb-4 shadow-lg transition-transform`}
            >
              <Gauge className="w-7 h-7" />
            </div>

            <h2 className="text-2xl font-black text-foreground mb-2 flex items-center gap-2">
              Redline RPM
              <Flame className={`w-5 h-5 ${isUnlocked ? 'text-rose-500' : 'text-zinc-500'}`} />
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

          {isUnlocked ? (
            <Link
              href="/arcade/redline"
              className="w-full py-3.5 px-4 rounded-xl font-bold bg-primary hover:opacity-90 text-primary-foreground flex items-center justify-center gap-2 transition shadow-lg shadow-primary/20 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Redline Sprint</span>
            </Link>
          ) : (
            <Link
              href="/learn"
              className="w-full py-3.5 px-4 rounded-xl font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Unlock in Practice Lab</span>
            </Link>
          )}
        </div>

        {/* GAME 2: BOMB DEFUSAL PROTOCOL */}
        <div
          className={`relative rounded-3xl border ${isUnlocked
            ? 'border-rose-500/40 bg-gradient-to-br from-card via-card to-rose-950/20 shadow-2xl hover:border-rose-500/60'
            : 'border-zinc-800 bg-card/60 opacity-85'
            } p-6 sm:p-8 flex flex-col justify-between transition group overflow-hidden`}
        >
          <div className="absolute top-0 right-0 p-4">
            {isUnlocked ? (
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                Playable Now
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 font-mono">
                <Lock className="w-3 h-3 text-amber-400" />
                Locked // Stage 3
              </span>
            )}
          </div>

          <div>
            <div
              className={`w-14 h-14 rounded-2xl ${isUnlocked
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 group-hover:scale-105'
                : 'bg-zinc-800/60 border-zinc-700/50 text-zinc-400'
                } border flex items-center justify-center mb-4 shadow-lg transition-transform`}
            >
              <Bomb className="w-7 h-7" />
            </div>

            <h2 className="text-2xl font-black text-foreground mb-2 flex items-center gap-2">
              Bomb Defusal Protocol
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 uppercase tracking-widest border border-rose-500/30">
                CS Theme
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground mb-6 leading-relaxed">
              Disarm a ticking Counter-Strike C4 explosive payload before the digital timer strikes zero. Beware: every single typo
              immediately penalizes you with a harsh time deduction from the countdown clock!
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-2.5 py-1 rounded-lg bg-secondary text-foreground text-[11px] font-semibold border border-border">
                ⏱️ Precision Countdown
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-secondary text-foreground text-[11px] font-semibold border border-border">
                💥 Typo Time Penalties
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-secondary text-foreground text-[11px] font-semibold border border-border">
                🔊 CS Radio Voice & C4 Beeps
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-secondary text-foreground text-[11px] font-semibold border border-border">
                ✂️ Multi-Phase Wire Cutting
              </span>
            </div>
          </div>

          {isUnlocked ? (
            <Link
              href="/arcade/defuse"
              className="w-full py-3.5 px-4 rounded-xl font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center gap-2 transition shadow-lg shadow-rose-900/30 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Defusal Mission</span>
            </Link>
          ) : (
            <Link
              href="/learn"
              className="w-full py-3.5 px-4 rounded-xl font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Unlock in Practice Lab</span>
            </Link>
          )}
        </div>

        {/* GAME 3: WORD INVADERS (ACTIVE) */}
        <div
          className={`relative rounded-3xl border ${isUnlocked
            ? 'border-emerald-500/40 bg-gradient-to-br from-card via-card to-emerald-950/20 shadow-2xl hover:border-emerald-500/60'
            : 'border-zinc-800 bg-card/60 opacity-85'
            } p-6 sm:p-8 flex flex-col justify-between transition group overflow-hidden`}
        >
          <div className="absolute top-0 right-0 p-4">
            {isUnlocked ? (
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                Playable Now
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 font-mono">
                <Lock className="w-3 h-3 text-amber-400" />
                Locked // Stage 3
              </span>
            )}
          </div>

          <div>
            <div
              className={`w-14 h-14 rounded-2xl ${isUnlocked
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 group-hover:scale-105'
                : 'bg-zinc-800/60 border-zinc-700/50 text-zinc-400'
                } border flex items-center justify-center mb-4 shadow-lg transition-transform`}
            >
              <Rocket className="w-7 h-7" />
            </div>

            <h2 className="text-2xl font-black text-foreground mb-2 flex items-center gap-2">
              Word Invaders
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 uppercase tracking-widest border border-emerald-500/30">
                1978 Arcade
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground mb-6 leading-relaxed">
              Defend Earth against descending alien armadas. Type target words overhead to fire your laser cannon,
              snipe the mystery flying saucer, and experience original 1978 Space Invaders arcade sounds!
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-2.5 py-1 rounded-lg bg-secondary text-foreground text-[11px] font-semibold border border-border">
                👾 4 Tiers (Cadet to Supernova)
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-secondary text-foreground text-[11px] font-semibold border border-border">
                🛸 Mystery Flying Saucers
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-secondary text-foreground text-[11px] font-semibold border border-border">
                🔊 Original 1978 Nostalgic SFX
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-secondary text-foreground text-[11px] font-semibold border border-border">
                🛡️ Destructible Defense Bunkers
              </span>
            </div>
          </div>

          {isUnlocked ? (
            <Link
              href="/arcade/invaders"
              className="w-full py-3.5 px-4 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-950/40 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Space Defense</span>
            </Link>
          ) : (
            <Link
              href="/learn"
              className="w-full py-3.5 px-4 rounded-xl font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Unlock in Practice Lab</span>
            </Link>
          )}
        </div>

          {/* GAME 4: TERMINAL HACKER (ACTIVE) */}
          <div
            className={`relative rounded-3xl border ${isUnlocked
                ? 'border-emerald-500/40 bg-gradient-to-br from-card via-card to-emerald-950/20 shadow-2xl hover:border-emerald-500/60'
                : 'border-zinc-800 bg-card/60 opacity-85'
              } p-6 sm:p-8 flex flex-col justify-between transition group overflow-hidden`}
          >
            <div className="absolute top-0 right-0 p-4">
              {isUnlocked ? (
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                  Playable Now
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 font-mono">
                  <Lock className="w-3 h-3 text-amber-400" />
                  Locked // Stage 3
                </span>
              )}
            </div>

            <div>
                <div
                  className={`w-14 h-14 rounded-2xl ${isUnlocked
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 group-hover:scale-105'
                      : 'bg-zinc-800/60 border-zinc-700/50 text-zinc-400'
                    } border flex items-center justify-center mb-4 shadow-lg transition-transform`}
                >
                  <Code2 className="w-7 h-7" />
                </div>

                  <h2 className="text-2xl font-black text-foreground mb-2 flex items-center gap-2">
                    Terminal Hacker
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 uppercase tracking-widest border border-emerald-500/30">
                      Matrix Cypher
                    </span>
                  </h2>

                  <p className="text-xs sm:text-sm text-muted-foreground mb-6 leading-relaxed">
                    Infiltrate secure mainframes by typing real code syntax, brackets, and crypto tokens.
                    Outpace the accelerating security trace route and deploy ICE_PICK exploits to freeze detection!
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="px-2.5 py-1 rounded-lg bg-secondary text-foreground text-[11px] font-semibold border border-border">
                      💻 4 Infiltration Tiers (Script Kiddie to Ghost)
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-secondary text-foreground text-[11px] font-semibold border border-border">
                      ⚡ Real-Time Security Trace Meter
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-secondary text-foreground text-[11px] font-semibold border border-border">
                      ❄️ ICE_PICK Trace Freeze Exploits
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-secondary text-foreground text-[11px] font-semibold border border-border">
                      🔊 Cyber Terminal Keystroke SFX
                    </span>
                  </div>
              </div>

              {isUnlocked ? (
                <Link
                  href="/arcade/hacker"
                  className="w-full py-3.5 px-4 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-900/30 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Initialize Terminal Infiltration</span>
                </Link>
              ) : (
                <Link
                  href="/learn"
                  className="w-full py-3.5 px-4 rounded-xl font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Unlock in Practice Lab</span>
                </Link>
              )}
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
