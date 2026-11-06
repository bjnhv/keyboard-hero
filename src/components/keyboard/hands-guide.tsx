'use client';

import React from 'react';
import { useTypingStore } from '@/stores/use-typing-store';
import { FingerType } from '@/types/keyboard';
import { getFingerColorTheme } from '@/core/layouts';
import { TransparentHands } from './transparent-hands';

interface FingerItem {
  id: FingerType;
  label: string;
  hand: 'left' | 'right';
}

const FINGERS: FingerItem[] = [
  { id: 'left-pinky', label: 'Pinky', hand: 'left' },
  { id: 'left-ring', label: 'Ring', hand: 'left' },
  { id: 'left-middle', label: 'Middle', hand: 'left' },
  { id: 'left-index', label: 'Index', hand: 'left' },
  { id: 'thumb', label: 'Thumb', hand: 'left' },
  { id: 'right-index', label: 'Index', hand: 'right' },
  { id: 'right-middle', label: 'Middle', hand: 'right' },
  { id: 'right-ring', label: 'Ring', hand: 'right' },
  { id: 'right-pinky', label: 'Pinky', hand: 'right' },
];

export const HandsGuide: React.FC = () => {
  const expectedKeyDef = useTypingStore((s) => s.expectedKeyDef);
  const showHandsGuide = useTypingStore((s) => s.showHandsGuide);
  const activeFinger = expectedKeyDef?.finger ?? null;

  return (
    <div className="flex flex-col items-center gap-2.5 w-full">
      {/* Visual Transparent Hands (toggleable) */}
      {showHandsGuide && <TransparentHands />}

      {/* Fingers Guidance Row */}
      <div className="flex items-center justify-between max-w-2xl xl:max-w-3xl 3xl:max-w-4xl 2k:max-w-5xl w-full mx-auto px-4 py-2 3xl:px-6 3xl:py-3 bg-secondary/30 rounded-xl border border-border/50 text-xs sm:text-sm 3xl:text-base text-muted-foreground select-none">
        {/* Left Hand Indicator */}
        <div className="flex items-center gap-1.5 sm:gap-2 3xl:gap-3">
          <span className="font-semibold text-foreground/70 mr-1 hidden sm:inline">Left:</span>
          {FINGERS.filter((f) => f.hand === 'left').map((finger) => {
            const isActive = activeFinger === finger.id;
            const theme = getFingerColorTheme(finger.id);

            return (
              <div
                key={finger.id}
                className={`px-2 py-1 3xl:px-3 3xl:py-1.5 rounded-md 3xl:rounded-lg transition-all flex items-center gap-1 3xl:gap-1.5 border ${
                  isActive
                    ? `${theme.bg} ${theme.border} ${theme.text} font-bold scale-105 shadow-sm`
                    : 'bg-card/40 border-border/30 opacity-60'
                }`}
              >
                <span className={`w-2 h-2 3xl:w-2.5 3xl:h-2.5 rounded-full ${theme.dot}`} />
                <span className="text-[10px] sm:text-xs 3xl:text-sm">{finger.label}</span>
              </div>
            );
          })}
        </div>

        <div className="h-4 3xl:h-6 w-[1px] bg-border mx-2" />

        {/* Right Hand Indicator */}
        <div className="flex items-center gap-1.5 sm:gap-2 3xl:gap-3">
          <span className="font-semibold text-foreground/70 mr-1 hidden sm:inline">Right:</span>
          {FINGERS.filter((f) => f.hand === 'right').map((finger) => {
            const isActive = activeFinger === finger.id;
            const theme = getFingerColorTheme(finger.id);

            return (
              <div
                key={finger.id}
                className={`px-2 py-1 3xl:px-3 3xl:py-1.5 rounded-md 3xl:rounded-lg transition-all flex items-center gap-1 3xl:gap-1.5 border ${
                  isActive
                    ? `${theme.bg} ${theme.border} ${theme.text} font-bold scale-105 shadow-sm`
                    : 'bg-card/40 border-border/30 opacity-60'
                }`}
              >
                <span className={`w-2 h-2 3xl:w-2.5 3xl:h-2.5 rounded-full ${theme.dot}`} />
                <span className="text-[10px] sm:text-xs 3xl:text-sm">{finger.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

