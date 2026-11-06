'use client';

import React, { useRef, useEffect } from 'react';
import { useTypingStore } from '@/stores/use-typing-store';
import { RotateCcw, Volume2, VolumeX, Eye, EyeOff, Sparkles } from 'lucide-react';

export const TypingCanvas: React.FC = () => {
  const activeState = useTypingStore((s) => s.activeState);
  const activeStageId = useTypingStore((s) => s.activeStageId);
  const targetFocusKey = useTypingStore((s) => s.targetFocusKey);
  const soundEnabled = useTypingStore((s) => s.soundEnabled);
  const hardcoreMode = useTypingStore((s) => s.hardcoreMode);
  const handleKeyDown = useTypingStore((s) => s.handleKeyDown);
  const handleKeyUp = useTypingStore((s) => s.handleKeyUp);
  const restartLesson = useTypingStore((s) => s.restartLesson);
  const toggleSound = useTypingStore((s) => s.toggleSound);
  const toggleHardcoreMode = useTypingStore((s) => s.toggleHardcoreMode);

  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the input on mount and on canvas click
  useEffect(() => {
    inputRef.current?.focus();
  }, [activeState.targetText]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Intercept Tab + Enter or Tab for restart
    if (e.key === 'Tab') {
      e.preventDefault();
      restartLesson();
      return;
    }

    // Intercept Backspace or Space default page actions
    if (e.key === 'Backspace' || e.key === ' ') {
      e.preventDefault();
    }

    handleKeyDown(e.key, e.code);
  };

  const onKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    handleKeyUp(e.code);
  };

  const { targetText, currentCharIndex, liveMetrics } = activeState;

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="w-full max-w-4xl mx-auto flex flex-col gap-4 select-none cursor-text"
    >
      {/* Hidden input to capture physical keystrokes & trigger mobile soft keyboards */}
      <input
        ref={inputRef}
        type="text"
        className="opacity-0 absolute -left-[9999px] -top-[9999px]"
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
      />

      {/* Control Header & Live Stats */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-2 text-sm">
        {/* Stage & Focus Key */}
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md bg-secondary text-foreground text-xs font-semibold border border-border">
            Stage {activeStageId}
          </span>
          {targetFocusKey && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
              <Sparkles className="w-3 h-3" />
              Focus: <span className="uppercase font-mono">{targetFocusKey}</span>
            </span>
          )}
        </div>

        {/* Live Metrics */}
        <div className="flex items-center gap-4 text-xs sm:text-sm font-mono">
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black text-primary">
              {liveMetrics.wpm}
            </span>
            <span className="text-muted-foreground text-xs">WPM</span>
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black text-emerald-400">
              {liveMetrics.accuracy}%
            </span>
            <span className="text-muted-foreground text-xs">ACC</span>
          </div>
        </div>

        {/* Utility Toggles */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSound();
              inputRef.current?.focus();
            }}
            title={soundEnabled ? 'Disable Sound' : 'Enable Sound'}
            className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition border border-border"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleHardcoreMode();
              inputRef.current?.focus();
            }}
            title={hardcoreMode ? 'Exit Hardcore Mode' : 'Enter Hardcore Mode (Hide Keyboard)'}
            className={`p-2 rounded-lg transition border border-border ${
              hardcoreMode
                ? 'bg-primary/20 text-primary border-primary/40'
                : 'bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground'
            }`}
          >
            {hardcoreMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              restartLesson();
              inputRef.current?.focus();
            }}
            title="Restart Exercise (Tab)"
            className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition border border-border"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Text Display Canvas */}
      <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border/80 shadow-lg min-h-[160px] flex items-center justify-center">
        <div className="font-mono text-2xl sm:text-3xl md:text-4xl tracking-wider leading-relaxed text-left flex flex-wrap">
          {targetText.split('').map((char, index) => {
            const isTyped = index < currentCharIndex;
            const isCurrent = index === currentCharIndex;
            const isUpcoming = index > currentCharIndex;

            let charColor = 'text-muted-foreground/40';
            if (isTyped) {
              charColor = 'text-foreground font-semibold';
            } else if (isCurrent) {
              charColor = 'text-primary bg-primary/20 rounded px-0.5 animate-pulse ring-2 ring-primary/30';
            }

            return (
              <span
                key={index}
                className={`relative inline-block transition-colors duration-75 ${charColor}`}
              >
                {char === ' ' ? '\u00A0' : char}
                {/* Active Caret Line */}
                {isCurrent && (
                  <span className="absolute -left-[1px] top-1 bottom-1 w-0.5 bg-primary animate-pulse" />
                )}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

