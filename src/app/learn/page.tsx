'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Target,
  X,
  Hand,
  Volume2,
  VolumeX,
  Flame,
  Gamepad2,
} from 'lucide-react';
import { TypingCanvas } from '@/components/typing/typing-canvas';
import { VirtualKeyboard } from '@/components/keyboard/virtual-keyboard';
import { HandsGuide } from '@/components/keyboard/hands-guide';
import { SessionSummaryModal } from '@/components/typing/session-summary-modal';
import { useTypingStore } from '@/stores/use-typing-store';
import { CURRICULUM_STAGES } from '@/core/curriculum';
import { syncManager } from '@/local-db';

export default function LearnPage() {
  const [isMounted, setIsMounted] = React.useState(false);
  const [showResetConfirm, setShowResetConfirm] = React.useState(false);
  const initPractice = useTypingStore((s) => s.initPractice);
  const activeStageId = useTypingStore((s) => s.activeStageId);
  const setStage = useTypingStore((s) => s.setStage);
  const resetProgress = useTypingStore((s) => s.resetProgress);
  const hardcoreMode = useTypingStore((s) => s.hardcoreMode);
  const toggleHardcoreMode = useTypingStore((s) => s.toggleHardcoreMode);
  const soundEnabled = useTypingStore((s) => s.soundEnabled);
  const toggleSound = useTypingStore((s) => s.toggleSound);
  const showHandsGuide = useTypingStore((s) => s.showHandsGuide);
  const toggleHandsGuide = useTypingStore((s) => s.toggleHandsGuide);
  const completedMetrics = useTypingStore((s) => s.completedMetrics);
  const nextLesson = useTypingStore((s) => s.nextLesson);
  const restartLesson = useTypingStore((s) => s.restartLesson);
  const loadFromLocalDb = useTypingStore((s) => s.loadFromLocalDb);
  const stageNotification = useTypingStore((s) => s.stageNotification);
  const dismissStageNotification = useTypingStore((s) => s.dismissStageNotification);

  useEffect(() => {
    setIsMounted(true);
    loadFromLocalDb();
    syncManager.startPeriodicSync();
    return () => syncManager.stopPeriodicSync();
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
    <div className="min-h-screen lg:h-screen lg:max-h-screen lg:overflow-hidden bg-background text-foreground flex flex-col justify-between px-4 sm:px-6 3xl:px-10 2k:px-14 py-2 sm:py-3 max-w-5xl xl:max-w-6xl 3xl:max-w-7xl 2k:max-w-[1700px] mx-auto w-full">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between w-full border-b border-border/50 pb-2 mb-1.5 sm:pb-2.5 sm:mb-2 shrink-0">
        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Home</span>
          </Link>
          <span className="text-border">/</span>
          <Link
            href="/stats"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition font-medium"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline">Heatmap</span>
          </Link>
          <span className="text-border">/</span>
          <Link
            href="/arcade"
            className="inline-flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition font-bold"
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Arcade</span>
          </Link>
        </div>

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Hands Guide Toggle Button */}
          <button
            onClick={toggleHandsGuide}
            title={showHandsGuide ? 'Hands Visualizer: ON (Click to hide)' : 'Hands Visualizer: OFF (Click to show)'}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition cursor-pointer ${
              showHandsGuide
                ? 'bg-primary/15 text-primary border-primary/40 font-semibold shadow-xs'
                : 'bg-secondary text-muted-foreground/60 border-border hover:text-foreground'
            }`}
          >
            <Hand className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Hands</span>
          </button>

          {/* Sound Toggle Button */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Mechanical Sound: ON' : 'Mechanical Sound: MUTED'}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition cursor-pointer ${
              soundEnabled
                ? 'bg-secondary text-foreground border-border hover:bg-secondary/80'
                : 'bg-secondary/40 text-muted-foreground/50 border-border/40'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">Sound</span>
          </button>

          {/* Hardcore Mode Toggle Button */}
          <button
            onClick={toggleHardcoreMode}
            title={hardcoreMode ? 'Hardcore Mode: ACTIVE' : 'Hardcore Mode: OFF'}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition cursor-pointer ${
              hardcoreMode
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold'
                : 'bg-secondary text-muted-foreground/60 border-border hover:text-foreground'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${hardcoreMode ? 'text-rose-400' : ''}`} />
            <span className="hidden md:inline">Hardcore</span>
          </button>

          <div className="h-4 w-[1px] bg-border/60 mx-0.5 hidden sm:block" />

          {/* Stage Selector */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <label htmlFor="stage-select" className="text-xs text-muted-foreground hidden lg:inline">
              Stage:
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

          {/* Reset Progress Button */}
          <button
            onClick={() => setShowResetConfirm(true)}
            title="Reset All Curriculum Progress"
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-secondary hover:bg-rose-500/20 text-muted-foreground hover:text-rose-400 border border-border hover:border-rose-500/40 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </header>

      {/* Stage Progression Notification Banner */}
      {stageNotification && (
        <div
          className={`w-full mb-1 p-2 sm:p-2.5 rounded-lg sm:rounded-xl border flex items-center justify-between text-xs transition animate-in fade-in slide-in-from-top-2 shrink-0 ${
            stageNotification.type === 'advance'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-primary/10 border-primary/25 text-foreground'
          }`}
        >
          <div className="flex items-center gap-2">
            {stageNotification.type === 'advance' ? (
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Target className="w-4 h-4 text-primary shrink-0" />
            )}
            <div>
              <span className="font-bold mr-1.5">{stageNotification.title}:</span>
              <span className="text-muted-foreground">{stageNotification.message}</span>
            </div>
          </div>
          <button
            onClick={dismissStageNotification}
            className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition ml-2 cursor-pointer"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Practice Flow */}
      <main className="flex-1 flex flex-col justify-center gap-2 sm:gap-3 lg:gap-3.5 my-auto min-h-0">
        <TypingCanvas />

        {!hardcoreMode ? (
          <div className="flex flex-col gap-1.5 sm:gap-2 shrink-0">
            <HandsGuide />
            <VirtualKeyboard />
          </div>
        ) : (
          <div className="p-3 sm:p-4 rounded-xl bg-secondary/30 border border-border/50 text-center max-w-md mx-auto text-xs text-muted-foreground shrink-0">
            ⚡ <span className="text-primary font-semibold">Hardcore Mode</span> is active. Keyboard is hidden to enforce pure blind touch-typing muscle memory.
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="w-full text-center text-[11px] sm:text-xs text-muted-foreground/60 pt-1.5 sm:pt-2 border-t border-border/30 shrink-0">
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

