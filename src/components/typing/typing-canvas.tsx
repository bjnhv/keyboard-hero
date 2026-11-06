'use client';

import React, { useRef, useEffect } from 'react';
import { useTypingStore } from '@/stores/use-typing-store';
import { RotateCcw, Volume2, VolumeX, Eye, EyeOff, Sparkles, Type } from 'lucide-react';

export const TypingCanvas: React.FC = () => {
  const activeState = useTypingStore((s) => s.activeState);
  const activeStageId = useTypingStore((s) => s.activeStageId);
  const targetFocusKey = useTypingStore((s) => s.targetFocusKey);
  const soundEnabled = useTypingStore((s) => s.soundEnabled);
  const hardcoreMode = useTypingStore((s) => s.hardcoreMode);
  const uiFontSize = useTypingStore((s) => s.uiFontSize ?? 'standard');
  const cycleFontSize = useTypingStore((s) => s.cycleFontSize);
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

  const fontClass =
    uiFontSize === 'huge'
      ? 'text-4xl sm:text-5xl md:text-6xl 3xl:text-7xl 2k:text-8xl'
      : uiFontSize === 'large'
      ? 'text-3xl sm:text-4xl md:text-5xl 3xl:text-6xl 2k:text-7xl'
      : 'text-2xl sm:text-3xl md:text-4xl 3xl:text-5xl 2k:text-6xl';

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="w-full max-w-4xl xl:max-w-5xl 3xl:max-w-6xl 2k:max-w-7xl mx-auto flex flex-col gap-4 3xl:gap-6 select-none cursor-text"
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
      <div className="flex flex-wrap items-center justify-between gap-3 px-2 text-sm 3xl:text-base 2k:text-lg">
        {/* Stage & Focus Key */}
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 3xl:px-3 3xl:py-1.5 rounded-md bg-secondary text-foreground text-xs 3xl:text-sm font-semibold border border-border">
            Stage {activeStageId}
          </span>
          {targetFocusKey && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 3xl:px-3 3xl:py-1.5 rounded-md bg-primary/10 text-primary text-xs 3xl:text-sm font-semibold border border-primary/20">
              <Sparkles className="w-3 h-3 3xl:w-4 3xl:h-4" />
              Focus: <span className="uppercase font-mono">{targetFocusKey}</span>
            </span>
          )}
        </div>

        {/* Live Metrics */}
        <div className="flex items-center gap-4 3xl:gap-6 text-xs sm:text-sm 3xl:text-base font-mono">
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl 3xl:text-3xl 2k:text-4xl font-black text-primary">
              {liveMetrics.wpm}
            </span>
            <span className="text-muted-foreground text-xs 3xl:text-sm">WPM</span>
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl 3xl:text-3xl 2k:text-4xl font-black text-emerald-400">
              {liveMetrics.accuracy}%
            </span>
            <span className="text-muted-foreground text-xs 3xl:text-sm">ACC</span>
          </div>
        </div>

        {/* Utility Toggles */}
        <div className="flex items-center gap-1.5 3xl:gap-2">
          {/* Text Size Cycle Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              cycleFontSize();
              inputRef.current?.focus();
            }}
            title={`Text Size: ${uiFontSize.toUpperCase()} (Click to toggle standard / large / huge)`}
            className="px-2.5 py-2 3xl:px-3 3xl:py-2.5 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition border border-border flex items-center gap-1 text-xs 3xl:text-sm cursor-pointer"
          >
            <Type className="w-4 h-4 text-primary" />
            <span className="uppercase text-[10px] 3xl:text-xs font-bold font-mono">
              {uiFontSize === 'standard' ? '1x' : uiFontSize === 'large' ? '1.25x' : '1.5x'}
            </span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSound();
              inputRef.current?.focus();
            }}
            title={soundEnabled ? 'Disable Sound' : 'Enable Sound'}
            className="p-2 3xl:p-2.5 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition border border-border cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 3xl:w-5 3xl:h-5 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 3xl:w-5 3xl:h-5" />
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleHardcoreMode();
              inputRef.current?.focus();
            }}
            title={hardcoreMode ? 'Exit Hardcore Mode' : 'Enter Hardcore Mode (Hide Keyboard)'}
            className={`p-2 3xl:p-2.5 rounded-lg transition border border-border cursor-pointer ${
              hardcoreMode
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground'
            }`}
          >
            {hardcoreMode ? (
              <EyeOff className="w-4 h-4 3xl:w-5 3xl:h-5 text-rose-400" />
            ) : (
              <Eye className="w-4 h-4 3xl:w-5 3xl:h-5" />
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              restartLesson();
              inputRef.current?.focus();
            }}
            title="Restart Exercise (Tab)"
            className="p-2 3xl:p-2.5 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition border border-border cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 3xl:w-5 3xl:h-5" />
          </button>
        </div>
      </div>

      {/* Main Text Display Canvas */}
      <div className="p-6 sm:p-8 3xl:p-10 2k:p-14 rounded-2xl 3xl:rounded-3xl bg-card border border-border/80 shadow-lg min-h-[160px] sm:min-h-[200px] 3xl:min-h-[250px] 2k:min-h-[300px] flex items-center justify-center">
        <div className={`font-mono ${fontClass} tracking-wider leading-relaxed text-left flex flex-wrap`}>
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

