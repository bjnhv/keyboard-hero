'use client';

import React from 'react';
import {
  Trophy,
  RotateCcw,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Target,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { useTypingStore, STAGE_ADVANCEMENT_THRESHOLD } from '@/stores/use-typing-store';
import { CURRICULUM_STAGES } from '@/core/curriculum';

export const SessionSummaryModal: React.FC = () => {
  const completedMetrics = useTypingStore((s) => s.completedMetrics);
  const restartLesson = useTypingStore((s) => s.restartLesson);
  const advanceToNextStage = useTypingStore((s) => s.advanceToNextStage);
  const practiceNextExercise = useTypingStore((s) => s.practiceNextExercise);
  const activeStageId = useTypingStore((s) => s.activeStageId);
  const keyProgress = useTypingStore((s) => s.keyProgress);

  if (!completedMetrics) return null;

  const currentStage = CURRICULUM_STAGES.find((s) => s.id === activeStageId);
  const stageKeys = currentStage?.keys ?? [];

  const keyStatuses = stageKeys.map((k) => {
    const prog = keyProgress[k];
    const conf = prog ? prog.confidence : 0;
    const isMastered = conf >= STAGE_ADVANCEMENT_THRESHOLD;
    return {
      key: k,
      confidence: Math.round(conf * 100),
      isMastered,
    };
  });

  const isStageMastered = keyStatuses.length > 0 && keyStatuses.every((k) => k.isMastered);
  const masteredCount = keyStatuses.filter((k) => k.isMastered).length;
  const nextStage = CURRICULUM_STAGES.find((s) => s.id === activeStageId + 1);

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-card border border-border rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center">
        {/* Header Icon */}
        <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3">
          <Trophy className="w-7 h-7" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-1">
          Exercise Complete!
        </h2>
        <p className="text-xs text-muted-foreground mb-5">
          Stage {activeStageId}: {currentStage?.name ?? 'Practice'}
        </p>

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full mb-5">
          <div className="p-3 bg-secondary/50 rounded-xl border border-border flex flex-col">
            <span className="text-xs text-muted-foreground">Speed</span>
            <span className="text-2xl font-black text-primary">
              {completedMetrics.wpm}
            </span>
            <span className="text-[10px] text-muted-foreground">Net WPM</span>
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
            <span className="text-[10px] text-muted-foreground">Raw WPM</span>
          </div>

          <div className="p-3 bg-secondary/50 rounded-xl border border-border flex flex-col">
            <span className="text-xs text-muted-foreground">Consistency</span>
            <span className="text-2xl font-black text-amber-400">
              {completedMetrics.consistency}%
            </span>
            <span className="text-[10px] text-muted-foreground">Rhythm</span>
          </div>
        </div>

        {/* Stage Progression & Qualification Card */}
        {stageKeys.length > 0 && (
          <div className="w-full mb-5 text-left rounded-xl p-3.5 border bg-secondary/30 border-border/80">
            {isStageMastered && nextStage ? (
              <div className="flex items-start gap-2.5 text-emerald-400">
                <Sparkles className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-sm text-emerald-300 block">
                    🎉 Stage {activeStageId} Mastered!
                  </span>
                  <p className="text-muted-foreground mt-0.5">
                    All keys reached {Math.round(STAGE_ADVANCEMENT_THRESHOLD * 100)}%+ confidence. You qualify to unlock{' '}
                    <span className="text-foreground font-semibold">
                      Stage {nextStage.id}: {nextStage.name}
                    </span>
                    .
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-primary" />
                    Stage {activeStageId} Mastery: {masteredCount} of {stageKeys.length} keys qualified
                  </span>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    Target: {Math.round(STAGE_ADVANCEMENT_THRESHOLD * 100)}%
                  </span>
                </div>

                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                  Each letter in this stage must reach <span className="text-primary font-semibold">{Math.round(STAGE_ADVANCEMENT_THRESHOLD * 100)}% confidence</span> to advance to Stage {activeStageId + 1}. The next lesson will target your lowest confidence keys.
                </p>

                {/* Key Status Badges */}
                <div className="flex flex-wrap gap-2">
                  {keyStatuses.map((k) => (
                    <div
                      key={k.key}
                      className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-2 transition ${
                        k.isMastered
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : 'bg-card border-border text-foreground/80'
                      }`}
                    >
                      <span className="font-bold text-sm uppercase">{k.key}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {k.confidence}%
                      </span>
                      {k.isMastered ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          {/* Continue Practice in Current Stage */}
          <button
            onClick={isStageMastered ? restartLesson : practiceNextExercise}
            className={`w-full sm:flex-1 py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition cursor-pointer border ${
              !isStageMastered
                ? 'bg-primary hover:opacity-90 text-primary-foreground shadow-lg shadow-primary/20 border-primary/30 font-bold'
                : 'bg-secondary hover:bg-secondary/80 text-foreground border-border'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>
              {isStageMastered
                ? `Review Stage ${activeStageId}`
                : `Practice Again (Stage ${activeStageId})`}
            </span>
            <span className="text-[10px] opacity-75 ml-1">Tab</span>
          </button>

          {/* Next Stage Button - DISABLED if certainty is below threshold */}
          <button
            onClick={isStageMastered && nextStage ? advanceToNextStage : undefined}
            disabled={!isStageMastered || !nextStage}
            title={
              !isStageMastered
                ? `Locked: Reach ${Math.round(STAGE_ADVANCEMENT_THRESHOLD * 100)}% confidence on all Stage ${activeStageId} keys to unlock Stage ${nextStage?.id ?? activeStageId + 1}`
                : `Unlock and advance to Stage ${nextStage?.id}`
            }
            className={`w-full sm:flex-1 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition border ${
              isStageMastered && nextStage
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 border-emerald-500/50 cursor-pointer animate-pulse'
                : 'bg-secondary/40 text-muted-foreground/40 border-border/40 cursor-not-allowed opacity-50'
            }`}
          >
            {isStageMastered && nextStage ? (
              <>
                <span>Advance to Stage {nextStage.id}</span>
                <ArrowRight className="w-4 h-4" />
                <span className="text-[10px] opacity-75 ml-1">Enter</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-muted-foreground/50" />
                <span>Next Stage (Locked)</span>
                <span className="text-[10px] text-amber-400/80 font-mono ml-1">&lt;{Math.round(STAGE_ADVANCEMENT_THRESHOLD * 100)}%</span>
              </>
            )}
          </button>
        </div>

        {/* Manual Skip Tip */}
        <p className="text-[11px] text-muted-foreground/60 mt-3">
          Tip: You can manually switch to any stage anytime from the dropdown at the top.
        </p>
      </div>
    </div>
  );
};
