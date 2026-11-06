'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Flame,
  Trophy,
  Target,
  Zap,
  TrendingUp,
  RotateCcw,
  Sparkles,
  Play,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { KeyboardHeatmap } from '@/components/stats/keyboard-heatmap';
import { db, loadKeyProgressMap } from '@/local-db';
import { LocalSessionRecord } from '@/types/sync';
import { UserKeyProgress } from '@/types/curriculum';
import { CURRICULUM_STAGES } from '@/core/curriculum';

export default function StatsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [sessions, setSessions] = useState<LocalSessionRecord[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, UserKeyProgress>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    async function loadStats() {
      try {
        const loadedSessions = await db.sessions
          .orderBy('completedAt')
          .reverse()
          .limit(20)
          .toArray();
        const loadedProgress = await loadKeyProgressMap();

        setSessions(loadedSessions);
        setProgressMap(loadedProgress);
      } catch (err) {
        console.error('Failed to load stats data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  if (!isMounted || loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="font-mono text-sm text-muted-foreground">
            Loading analytics &amp; keyboard heatmap...
          </span>
        </div>
      </div>
    );
  }

  // Aggregate stats
  const totalSessions = sessions.length;
  const bestWpm = sessions.reduce((max, s) => Math.max(max, s.metrics.wpm), 0);
  const avgWpm =
    totalSessions > 0
      ? Math.round(
          sessions.reduce((acc, s) => acc + s.metrics.wpm, 0) / totalSessions
        )
      : 0;
  const avgAccuracy =
    totalSessions > 0
      ? Math.round(
          sessions.reduce((acc, s) => acc + s.metrics.accuracy, 0) / totalSessions
        )
      : 0;

  const keyList = Object.values(progressMap);
  const totalKeystrokes = keyList.reduce((acc, k) => acc + k.totalAttempts, 0);

  // Strongest and weakest keys
  const sortedKeys = [...keyList].sort((a, b) => b.confidence - a.confidence);
  const strongestKeys = sortedKeys.slice(0, 5);
  const weakestKeys = [...keyList]
    .filter((k) => k.totalAttempts >= 3)
    .sort((a, b) => a.confidence - b.confidence)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col p-4 sm:p-6 3xl:p-10 2k:p-14 max-w-5xl xl:max-w-6xl 3xl:max-w-7xl 2k:max-w-[1700px] mx-auto w-full gap-8 3xl:gap-12">
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
          <span className="text-sm font-semibold text-foreground">Analytics &amp; Heatmap</span>
        </div>

        <Link
          href="/learn"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition shadow-lg shadow-primary/20"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Resume Practice</span>
        </Link>
      </header>

      {/* Aggregate Overview Metric Cards */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-secondary/40 border border-border/80 flex flex-col">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">Best Speed</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-3xl font-black text-foreground">{bestWpm}</span>
          <span className="text-[11px] text-muted-foreground mt-0.5">Peak Net WPM</span>
        </div>

        <div className="p-4 rounded-2xl bg-secondary/40 border border-border/80 flex flex-col">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">Average Speed</span>
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <span className="text-3xl font-black text-foreground">{avgWpm}</span>
          <span className="text-[11px] text-muted-foreground mt-0.5">Rolling Net WPM</span>
        </div>

        <div className="p-4 rounded-2xl bg-secondary/40 border border-border/80 flex flex-col">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">Accuracy</span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-3xl font-black text-emerald-400">{avgAccuracy}%</span>
          <span className="text-[11px] text-muted-foreground mt-0.5">Lifetime Average</span>
        </div>

        <div className="p-4 rounded-2xl bg-secondary/40 border border-border/80 flex flex-col">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">Keystrokes</span>
            <TrendingUp className="w-4 h-4 text-sky-400" />
          </div>
          <span className="text-3xl font-black text-foreground">{totalKeystrokes}</span>
          <span className="text-[11px] text-muted-foreground mt-0.5">
            Across {totalSessions} session{totalSessions === 1 ? '' : 's'}
          </span>
        </div>
      </section>

      {/* Keyboard Heatmap Section */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Keyboard Mastery Heatmap
            </h2>
            <p className="text-xs text-muted-foreground">
              Visualizes confidence, accuracy, and dwell speed across the physical keyboard matrix.
            </p>
          </div>
        </div>

        <KeyboardHeatmap progressMap={progressMap} />
      </section>

      {/* Finger Strengths & Weaknesses Breakdown */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Strongest Keys */}
        <div className="p-4 rounded-2xl bg-secondary/30 border border-border/80 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Strongest Mastered Keys
            </h3>
            <span className="text-[11px] text-emerald-400 font-semibold font-mono">High Confidence</span>
          </div>

          {strongestKeys.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {strongestKeys.map((k) => (
                <div
                  key={k.key}
                  className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2"
                >
                  <span className="font-mono text-base font-black text-emerald-300">
                    {k.key.toUpperCase()}
                  </span>
                  <div className="flex flex-col text-[10px] text-muted-foreground leading-tight">
                    <span className="font-semibold text-emerald-400">
                      {Math.round(k.confidence * 100)}%
                    </span>
                    <span>{Math.round(k.rollingWpm)} WPM</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground italic">
              Complete lessons to establish your strongest keys.
            </span>
          )}
        </div>

        {/* Weakest Keys Needing Work */}
        <div className="p-4 rounded-2xl bg-secondary/30 border border-border/80 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-rose-400" />
              Keys Needing Practice
            </h3>
            <span className="text-[11px] text-rose-400 font-semibold font-mono">Curriculum Target</span>
          </div>

          {weakestKeys.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {weakestKeys.map((k) => (
                <div
                  key={k.key}
                  className="px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2"
                >
                  <span className="font-mono text-base font-black text-rose-300">
                    {k.key.toUpperCase()}
                  </span>
                  <div className="flex flex-col text-[10px] text-muted-foreground leading-tight">
                    <span className="font-semibold text-rose-400">
                      {Math.round(k.confidence * 100)}%
                    </span>
                    <span>{Math.round(k.rollingWpm)} WPM</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground italic">
              All practiced keys currently maintain high confidence!
            </span>
          )}
        </div>
      </section>

      {/* Recent Sessions History */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Clock className="w-5 h-5 text-muted-foreground" />
            Recent Practice Sessions
          </h2>
          <span className="text-xs text-muted-foreground">Stored offline in IndexedDB</span>
        </div>

        {sessions.length > 0 ? (
          <div className="w-full overflow-x-auto rounded-2xl border border-border/80 bg-secondary/20">
            <table className="w-full text-left text-xs">
              <thead className="bg-secondary/50 border-b border-border/60 text-muted-foreground font-semibold">
                <tr>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Net WPM</th>
                  <th className="py-3 px-4">Accuracy</th>
                  <th className="py-3 px-4">Raw WPM</th>
                  <th className="py-3 px-4">Consistency</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Completed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {sessions.map((s) => {
                  const stageObj = CURRICULUM_STAGES.find((st) => st.id === s.stageId);
                  return (
                    <tr key={s.id} className="hover:bg-secondary/40 transition">
                      <td className="py-3 px-4 font-semibold text-foreground">
                        Stage {s.stageId}: {stageObj?.name ?? 'Practice'}
                      </td>
                      <td className="py-3 px-4 font-bold text-primary font-mono text-sm">
                        {s.metrics.wpm}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-emerald-400">
                        {s.metrics.accuracy}%
                      </td>
                      <td className="py-3 px-4 font-mono text-muted-foreground">
                        {s.metrics.rawWpm}
                      </td>
                      <td className="py-3 px-4 font-mono text-amber-400">
                        {s.metrics.consistency}%
                      </td>
                      <td className="py-3 px-4 text-muted-foreground font-mono">
                        {(s.metrics.durationMs / 1000).toFixed(1)}s
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(s.completedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 rounded-2xl border border-dashed border-border/80 text-center flex flex-col items-center gap-3">
            <span className="text-sm text-muted-foreground">No typing sessions recorded yet.</span>
            <Link
              href="/learn"
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition"
            >
              Start First Lesson
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
