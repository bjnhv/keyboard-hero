'use client';

import React, { useRef, useEffect } from 'react';
import { useTypingStore } from '@/stores/use-typing-store';
import { SUPPORTED_LAYOUTS } from '@/core/layouts';
import { RotateCcw, Volume2, VolumeX, Eye, EyeOff, Sparkles, Type } from 'lucide-react';

export const TypingCanvas: React.FC = () => {
  const activeState = useTypingStore((s) => s.activeState);
  const activeStageId = useTypingStore((s) => s.activeStageId);
  const keyboardLayout = useTypingStore((s) => s.keyboardLayout);
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

  const isRtl = (SUPPORTED_LAYOUTS[keyboardLayout])?.direction === 'rtl';

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
      ? 'text-3xl sm:text-4xl md:text-5xl 3xl:text-6xl'
      : uiFontSize === 'large'
        ? 'text-2xl sm:text-3xl md:text-4xl 3xl:text-5xl'
        : 'text-xl sm:text-2xl md:text-3xl 3xl:text-4xl';

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="w-full max-w-4xl xl:max-w-5xl 3xl:max-w-6xl 2k:max-w-7xl mx-auto flex flex-col gap-2 sm:gap-2.5 select-none cursor-text shrink-0"
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
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs sm:text-sm">
        {/* Stage & Focus Key */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-secondary text-foreground text-xs font-semibold border border-border">
            Stage {activeStageId}
          </span>
          {targetFocusKey && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
              <Sparkles className="w-3 h-3" />
              Focus: <span className="uppercase font-mono">{targetFocusKey}</span>
            </span>
          )}
        </div>

        {/* Live Metrics */}
        <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm font-mono">
          <div className="flex items-baseline gap-1">
            <span className="text-lg sm:text-xl md:text-2xl font-black text-primary">
              {liveMetrics.wpm}
            </span>
            <span className="text-muted-foreground text-[11px] sm:text-xs">WPM</span>
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-lg sm:text-xl md:text-2xl font-black text-emerald-400">
              {liveMetrics.accuracy}%
            </span>
            <span className="text-muted-foreground text-[11px] sm:text-xs">ACC</span>
          </div>
        </div>

        {/* Utility Toggles */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Text Size Cycle Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              cycleFontSize();
              inputRef.current?.focus();
            }}
            title={`Text Size: ${uiFontSize.toUpperCase()} (Click to toggle standard / large / huge)`}
            className="px-2 py-1.5 sm:px-2.5 sm:py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition border border-border flex items-center gap-1 text-xs cursor-pointer"
          >
            <Type className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
            <span className="uppercase text-[10px] sm:text-xs font-bold font-mono">
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
            className="p-1.5 sm:p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition border border-border cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleHardcoreMode();
              inputRef.current?.focus();
            }}
            title={hardcoreMode ? 'Exit Hardcore Mode' : 'Enter Hardcore Mode (Hide Keyboard)'}
            className={`p-1.5 sm:p-2 rounded-lg transition border border-border cursor-pointer ${hardcoreMode
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground'
              }`}
          >
            {hardcoreMode ? (
              <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" />
            ) : (
              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              restartLesson();
              inputRef.current?.focus();
            }}
            title="Restart Exercise (Tab)"
            className="p-1.5 sm:p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition border border-border cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Main Text Display Canvas */}
          <div
            dir={isRtl ? 'rtl' : 'ltr'}
            className="p-3.5 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-card border border-border/80 shadow-lg min-h-[90px] sm:min-h-[110px] md:min-h-[125px] flex items-center justify-center"
          >
            <div
              dir={isRtl ? 'rtl' : 'ltr'}
              className={`font-mono ${fontClass} tracking-wider leading-relaxed ${isRtl ? 'text-right' : 'text-left'
                } flex flex-wrap`}
            >
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
                  <span
                    className={`absolute ${
                      isRtl ? '-right-[1px]' : '-left-[1px]'
                    } top-1 bottom-1 w-0.5 bg-primary animate-pulse`}
                  />
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
        );
};

