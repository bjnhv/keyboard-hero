'use client';

import React, { useState } from 'react';
import { UserKeyProgress } from '@/types/curriculum';
import { SUPPORTED_LAYOUTS, QWERTY_LAYOUT } from '@/core/layouts';
import { KeyDefinition } from '@/types/keyboard';
import { useTypingStore } from '@/stores/use-typing-store';

export type HeatmapMetric = 'confidence' | 'accuracy' | 'speed';

interface KeyboardHeatmapProps {
  progressMap: Record<string, UserKeyProgress>;
}

export const KeyboardHeatmap: React.FC<KeyboardHeatmapProps> = ({ progressMap }) => {
  const keyboardLayout = useTypingStore((s) => s.keyboardLayout);
  const currentLayout = SUPPORTED_LAYOUTS[keyboardLayout] ?? QWERTY_LAYOUT;

  const [metric, setMetric] = useState<HeatmapMetric>('confidence');
  const [selectedKey, setSelectedKey] = useState<{
    def: KeyDefinition;
    prog?: UserKeyProgress;
  } | null>(null);

  /**
   * Calculates color token for a key based on active metric.
   */
  const getKeyColor = (keyChar: string) => {
    const prog = progressMap[keyChar.toLowerCase()] ?? progressMap[keyChar];
    if (!prog || prog.totalAttempts === 0) {
      return {
        bg: 'bg-card/40 hover:bg-card/70',
        border: 'border-border/30',
        text: 'text-muted-foreground/60',
        scoreDisplay: '-',
      };
    }

    if (metric === 'confidence') {
      const conf = Math.round(prog.confidence * 100);
      if (conf >= 85) {
        return {
          bg: 'bg-emerald-500/25 hover:bg-emerald-500/40',
          border: 'border-emerald-500/60',
          text: 'text-emerald-300 font-bold',
          scoreDisplay: `${conf}%`,
        };
      } else if (conf >= 65) {
        return {
          bg: 'bg-amber-500/25 hover:bg-amber-500/40',
          border: 'border-amber-500/60',
          text: 'text-amber-300 font-bold',
          scoreDisplay: `${conf}%`,
        };
      } else {
        return {
          bg: 'bg-rose-500/25 hover:bg-rose-500/40',
          border: 'border-rose-500/60',
          text: 'text-rose-300 font-bold',
          scoreDisplay: `${conf}%`,
        };
      }
    } else if (metric === 'accuracy') {
      const acc = Math.round(prog.rollingAccuracy);
      if (acc >= 95) {
        return {
          bg: 'bg-emerald-500/25 hover:bg-emerald-500/40',
          border: 'border-emerald-500/60',
          text: 'text-emerald-300 font-bold',
          scoreDisplay: `${acc}%`,
        };
      } else if (acc >= 85) {
        return {
          bg: 'bg-amber-500/25 hover:bg-amber-500/40',
          border: 'border-amber-500/60',
          text: 'text-amber-300 font-bold',
          scoreDisplay: `${acc}%`,
        };
      } else {
        return {
          bg: 'bg-rose-500/25 hover:bg-rose-500/40',
          border: 'border-rose-500/60',
          text: 'text-rose-300 font-bold',
          scoreDisplay: `${acc}%`,
        };
      }
    } else {
      // Speed / Rolling WPM (higher is faster/better)
      const wpm = Math.round(prog.rollingWpm);
      if (wpm >= 40) {
        return {
          bg: 'bg-emerald-500/25 hover:bg-emerald-500/40',
          border: 'border-emerald-500/60',
          text: 'text-emerald-300 font-bold',
          scoreDisplay: `${wpm}wpm`,
        };
      } else if (wpm >= 25) {
        return {
          bg: 'bg-amber-500/25 hover:bg-amber-500/40',
          border: 'border-amber-500/60',
          text: 'text-amber-300 font-bold',
          scoreDisplay: `${wpm}wpm`,
        };
      } else {
        return {
          bg: 'bg-rose-500/25 hover:bg-rose-500/40',
          border: 'border-rose-500/60',
          text: 'text-rose-300 font-bold',
          scoreDisplay: `${wpm}wpm`,
        };
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Metric Mode Selectors & Legend */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full max-w-4xl xl:max-w-5xl 3xl:max-w-6xl 2k:max-w-7xl px-2">
        {/* Toggle Pills */}
        <div className="inline-flex p-1 bg-secondary/60 rounded-xl border border-border/60 text-xs 3xl:text-sm">
          <button
            onClick={() => setMetric('confidence')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${metric === 'confidence'
                ? 'bg-primary text-primary-foreground shadow-xs font-bold'
                : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            Confidence Score
          </button>
          <button
            onClick={() => setMetric('accuracy')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${metric === 'accuracy'
                ? 'bg-primary text-primary-foreground shadow-xs font-bold'
                : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            Accuracy %
          </button>
          <button
            onClick={() => setMetric('speed')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${metric === 'speed'
                ? 'bg-primary text-primary-foreground shadow-xs font-bold'
                : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            Speed (Dwell ms)
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs 3xl:text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 3xl:w-3.5 3xl:h-3.5 rounded bg-emerald-500/40 border border-emerald-500/60" />
            <span>Mastered (&ge;85%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 3xl:w-3.5 3xl:h-3.5 rounded bg-amber-500/40 border border-amber-500/60" />
            <span>Developing (65–84%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 3xl:w-3.5 3xl:h-3.5 rounded bg-rose-500/40 border border-rose-500/60" />
            <span>Weak (&lt;65%)</span>
          </div>
        </div>
      </div>

      {/* Heatmap Keyboard Grid */}
      <div className="w-full max-w-4xl xl:max-w-5xl 3xl:max-w-6xl 2k:max-w-7xl p-3 sm:p-5 3xl:p-6 2k:p-8 bg-card/60 backdrop-blur-sm rounded-2xl border border-border/80 shadow-xl overflow-x-auto">
        <div className="flex flex-col gap-1.5 3xl:gap-2 min-w-[620px]">
            {
              currentLayout.rows.map((row, rowIndex) => (
                <div key={rowIndex} className="flex gap-1.5 3xl:gap-2 justify-center">
                  {row.map((keyDef) => {
                    const isSpecial =
                      keyDef.widthRatio && keyDef.widthRatio > 1.2 && keyDef.key !== ' ';
                    const color = getKeyColor(keyDef.key);
                    const isSelected = selectedKey?.def.code === keyDef.code;

                    // Standard letter keys width vs modifiers
                    const flexBasis = keyDef.widthRatio
                      ? `${keyDef.widthRatio * 2.8}rem`
                      : '2.8rem';

                    return (
                      <button
                        key={keyDef.code}
                        onClick={() =>
                          setSelectedKey({
                            def: keyDef,
                            prog: progressMap[keyDef.key.toLowerCase()] ?? progressMap[keyDef.key],
                          })
                        }
                        style={{ minWidth: flexBasis }}
                        className={`h-11 sm:h-12 md:h-13 3xl:h-15 2k:h-18 rounded-lg border transition-all duration-150 flex flex-col items-center justify-between p-1 3xl:p-1.5 select-none cursor-pointer ${color.bg
                          } ${color.border} ${isSelected ? 'ring-2 ring-primary scale-105 z-10 shadow-lg' : ''
                          }`}
                      >
                        <div className="flex items-center justify-between w-full px-0.5">
                          <span className="text-[11px] sm:text-xs 3xl:text-sm font-semibold leading-none">
                            {keyDef.display || keyDef.key}
                          </span>
                          {keyDef.shiftedKey && (
                            <span className="text-[9px] 3xl:text-[10px] text-muted-foreground/50 leading-none">
                              {keyDef.shiftedKey}
                            </span>
                          )}
                        </div>

                        {!isSpecial && (
                          <span className={`text-[9px] 3xl:text-[11px] 2k:text-xs font-mono leading-none ${color.text}`}>
                            {color.scoreDisplay}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))
            }
        </div>
      </div>

      {/* Selected Key Drilldown Card */}
      {selectedKey && (
        <div className="w-full max-w-4xl xl:max-w-5xl 3xl:max-w-6xl 2k:max-w-7xl p-4 3xl:p-6 rounded-xl 3xl:rounded-2xl bg-secondary/30 border border-border/80 animate-in fade-in slide-in-from-bottom-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-black text-2xl font-mono">
              {selectedKey.def.display || selectedKey.def.key}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-foreground">
                  Key &quot;{selectedKey.def.display || selectedKey.def.key}&quot;
                </span>
                <span className="text-xs text-muted-foreground capitalize">
                  ({selectedKey.def.finger.replace('-', ' ')})
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {selectedKey.prog
                  ? `Last practiced: ${new Date(
                    selectedKey.prog.lastPracticedAt
                  ).toLocaleDateString()}`
                  : 'No practice data logged for this key yet.'}
              </p>
            </div>
          </div>

          {selectedKey.prog ? (
            <div className="flex items-center gap-4 sm:gap-6 text-center">
              <div>
                <span className="text-[10px] text-muted-foreground block uppercase font-medium">
                  Confidence
                </span>
                <span className="text-lg font-black text-emerald-400">
                  {Math.round(selectedKey.prog.confidence * 100)}%
                </span>
              </div>
              <div className="h-6 w-[1px] bg-border" />
              <div>
                <span className="text-[10px] text-muted-foreground block uppercase font-medium">
                  Accuracy
                </span>
                <span className="text-lg font-black text-foreground">
                  {Math.round(selectedKey.prog.rollingAccuracy)}%
                </span>
              </div>
              <div className="h-6 w-[1px] bg-border" />
              <div>
                <span className="text-[10px] text-muted-foreground block uppercase font-medium">
                  Speed
                </span>
                <span className="text-lg font-black text-amber-400">
                  {Math.round(selectedKey.prog.rollingWpm)} WPM
                </span>
              </div>
              <div className="h-6 w-[1px] bg-border" />
              <div>
                <span className="text-[10px] text-muted-foreground block uppercase font-medium">
                  Errors
                </span>
                <span className="text-lg font-black text-rose-400">
                  {selectedKey.prog.totalErrors} / {selectedKey.prog.totalAttempts}
                </span>
              </div>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground italic">
              Practice lessons involving this key to start tracking metrics.
            </span>
          )}
        </div>
      )}
    </div>
  );
};
