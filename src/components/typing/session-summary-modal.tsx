'use client';

import React from 'react';
import { Trophy, RotateCcw, ArrowRight, CheckCircle2, Zap } from 'lucide-react';
import { useTypingStore } from '@/stores/use-typing-store';

export const SessionSummaryModal: React.FC = () => {
  const completedMetrics = useTypingStore((s) => s.completedMetrics);
  const nextLesson = useTypingStore((s) => s.nextLesson);
  const restartLesson = useTypingStore((s) => s.restartLesson);
  const activeStageId = useTypingStore((s) => s.activeStageId);

  if (!completedMetrics) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4">
          <Trophy className="w-7 h-7" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-1">
          Exercise Complete!
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Stage {activeStageId} Practice Session
        </p>

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full mb-6">
          <div className="p-3 bg-secondary/50 rounded-xl border border-border flex flex-col">
            <span className="text-xs text-muted-foreground">Speed</span>
            <span className="text-2xl font-black text-primary">
              {completedMetrics.wpm}
            </span>
            <span className="text-[10px] text-muted-foreground">WPM</span>
          </div>

          <div className="p-3 bg-secondary/50 rounded-xl border border-border flex flex-col">
            <span className="text-xs text-muted-foreground">Accuracy</span>
            <span className="text-2xl font-black text-emerald-400">
              {completedMetrics.accuracy}%
            </span>
            <span className="text-[10px] text-muted-foreground">
              {completedMetrics.errorCount} mistakes
            </span>
          </div>

          <div className="p-3 bg-secondary/50 rounded-xl border border-border flex flex-col">
            <span className="text-xs text-muted-foreground">Raw Speed</span>
            <span className="text-2xl font-black text-foreground">
              {completedMetrics.rawWpm}
            </span>
            <span className="text-[10px] text-muted-foreground">WPM</span>
          </div>

          <div className="p-3 bg-secondary/50 rounded-xl border border-border flex flex-col">
            <span className="text-xs text-muted-foreground">Consistency</span>
            <span className="text-2xl font-black text-amber-400">
              {completedMetrics.consistency}%
            </span>
            <span className="text-[10px] text-muted-foreground">Rhythm</span>
          </div>
        </div>

        {/* Key Accuracy Highlights */}
        {Object.keys(completedMetrics.keyMetrics).length > 0 && (
          <div className="w-full bg-secondary/30 rounded-xl p-3 border border-border/50 mb-6 text-left">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              Key Accuracy Breakdown
            </span>
            <div className="flex flex-wrap gap-2">
              {Object.entries(completedMetrics.keyMetrics).map(([key, metric]) => {
                const isClean = metric.misses === 0;
                return (
                  <div
                    key={key}
                    className={`px-2 py-1 rounded-md text-xs font-mono flex items-center gap-1.5 border ${
                      isClean
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    <span className="font-bold">{key === ' ' ? '␣' : key}</span>
                    <span className="text-[10px] opacity-75">
                      {metric.hits}/{metric.hits + metric.misses}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation Action Buttons */}
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={restartLesson}
            className="flex-1 py-3 px-4 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-semibold flex items-center justify-center gap-2 transition border border-border"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retry</span>
            <span className="text-[10px] text-muted-foreground ml-1">Tab+Enter</span>
          </button>

          <button
            onClick={nextLesson}
            className="flex-1 py-3 px-4 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-primary/20"
          >
            <span>Next Exercise</span>
            <ArrowRight className="w-4 h-4" />
            <span className="text-[10px] opacity-75 ml-1">Enter</span>
          </button>
        </div>
      </div>
    </div>
  );
};

