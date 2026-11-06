'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { TypingCanvas } from '@/components/typing/typing-canvas';
import { VirtualKeyboard } from '@/components/keyboard/virtual-keyboard';
import { HandsGuide } from '@/components/keyboard/hands-guide';
import { SessionSummaryModal } from '@/components/typing/session-summary-modal';
import { useTypingStore } from '@/stores/use-typing-store';
import { CURRICULUM_STAGES } from '@/core/curriculum';

export default function LearnPage() {
  const [isMounted, setIsMounted] = React.useState(false);
  const [showResetConfirm, setShowResetConfirm] = React.useState(false);
  const initPractice = useTypingStore((s) => s.initPractice);
  const activeStageId = useTypingStore((s) => s.activeStageId);
  const setStage = useTypingStore((s) => s.setStage);
  const resetProgress = useTypingStore((s) => s.resetProgress);
  const hardcoreMode = useTypingStore((s) => s.hardcoreMode);
  const completedMetrics = useTypingStore((s) => s.completedMetrics);
  const nextLesson = useTypingStore((s) => s.nextLesson);
  const restartLesson = useTypingStore((s) => s.restartLesson);
  const loadFromLocalDb = useTypingStore((s) => s.loadFromLocalDb);

  useEffect(() => {
    setIsMounted(true);
    loadFromLocalDb();
  }, [loadFromLocalDb]);

  // Handle global shortcuts on modal (Enter -> next lesson, Tab+Enter -> retry)
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if (completedMetrics) {
        if (e.key === 'Enter') {
          e.preventDefault();
          nextLesson();
        } else if (e.key === 'Tab') {
          e.preventDefault();
          restartLesson();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, [completedMetrics, nextLesson, restartLesson]);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="font-mono text-sm text-muted-foreground">Initializing practice session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between p-4 sm:p-6 max-w-5xl mx-auto w-full">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between w-full border-b border-border/50 pb-4 mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </Link>

        {/* Stage Selector & Reset Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <label htmlFor="stage-select" className="text-xs text-muted-foreground hidden sm:inline">
              Curriculum:
            </label>
            <select
              id="stage-select"
              value={activeStageId}
              onChange={(e) => setStage(Number(e.target.value))}
              className="bg-secondary text-foreground text-xs font-semibold py-1.5 px-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
            >
              {CURRICULUM_STAGES.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  Stage {stage.id}: {stage.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowResetConfirm(true)}
            title="Reset All Curriculum Progress"
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-secondary hover:bg-rose-500/20 text-muted-foreground hover:text-rose-400 border border-border hover:border-rose-500/40 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Progress</span>
          </button>
        </div>
      </header>

      {/* Main Practice Flow */}
      <main className="flex-1 flex flex-col justify-center gap-6 my-auto">
        <TypingCanvas />

        {!hardcoreMode ? (
          <div className="flex flex-col gap-3">
            <HandsGuide />
            <VirtualKeyboard />
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 text-center max-w-md mx-auto text-xs text-muted-foreground">
            ⚡ <span className="text-primary font-semibold">Hardcore Mode</span> is active. Keyboard is hidden to enforce pure blind touch-typing muscle memory.
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="w-full text-center text-xs text-muted-foreground/60 pt-4 border-t border-border/30">
        Tip: Keep your index fingers on <span className="font-mono text-primary font-bold">F</span> and <span className="font-mono text-primary font-bold">J</span> tactile bumps. Press <span className="font-mono text-foreground font-semibold">Tab</span> anytime to restart.
      </footer>

      {/* Scorecard Modal */}
      <SessionSummaryModal />

      {/* Reset Progress Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-100">
          <div className="bg-card border border-border rounded-xl max-w-sm w-full p-5 shadow-2xl flex flex-col gap-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-bold text-foreground text-lg mb-1">Reset All Progress?</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This will reset your curriculum back to Stage 1 (Home Row anchors) and clear your letter confidence history.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2 px-3 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground text-xs font-medium transition border border-border cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetProgress();
                  setShowResetConfirm(false);
                }}
                className="flex-1 py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-md shadow-rose-900/30 cursor-pointer"
              >
                Yes, Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

