'use client';

import React from 'react';
import { useTypingStore } from '@/stores/use-typing-store';
import { FingerType } from '@/types/keyboard';
import { getFingerColorTheme } from '@/core/layouts';

interface FingerConfig {
  id: FingerType;
  label: string;
  hand: 'left' | 'right';
  hexColor: string;
  // SVG geometry: x, y, width, height, rx, rotation angle, transform origin
  rect: { x: number; y: number; w: number; h: number; rx: number };
  rotate: { deg: number; ox: number; oy: number };
  tip: { cx: number; cy: number };
}

const LEFT_FINGERS: FingerConfig[] = [
  {
    id: 'left-pinky',
    label: 'Pinky',
    hand: 'left',
    hexColor: '#f43f5e',
    rect: { x: 26, y: 72, w: 16, h: 62, rx: 8 },
    rotate: { deg: -12, ox: 34, oy: 130 },
    tip: { cx: 27, cy: 76 },
  },
  {
    id: 'left-ring',
    label: 'Ring',
    hand: 'left',
    hexColor: '#f97316',
    rect: { x: 58, y: 44, w: 17, h: 84, rx: 8.5 },
    rotate: { deg: -5, ox: 66, oy: 125 },
    tip: { cx: 62, cy: 48 },
  },
  {
    id: 'left-middle',
    label: 'Middle',
    hand: 'left',
    hexColor: '#f59e0b',
    rect: { x: 91, y: 30, w: 18, h: 95, rx: 9 },
    rotate: { deg: 0, ox: 100, oy: 125 },
    tip: { cx: 100, cy: 34 },
  },
  {
    id: 'left-index',
    label: 'Index',
    hand: 'left',
    hexColor: '#10b981',
    rect: { x: 125, y: 46, w: 18, h: 82, rx: 9 },
    rotate: { deg: 6, ox: 134, oy: 125 },
    tip: { cx: 138, cy: 50 },
  },
  {
    id: 'thumb',
    label: 'Thumb',
    hand: 'left',
    hexColor: '#3b82f6',
    rect: { x: 156, y: 112, w: 19, h: 56, rx: 9.5 },
    rotate: { deg: 34, ox: 165, oy: 165 },
    tip: { cx: 183, cy: 118 },
  },
];

const RIGHT_FINGERS: FingerConfig[] = [
  {
    id: 'thumb',
    label: 'Thumb',
    hand: 'right',
    hexColor: '#3b82f6',
    rect: { x: 25, y: 112, w: 19, h: 56, rx: 9.5 },
    rotate: { deg: -34, ox: 35, oy: 165 },
    tip: { cx: 17, cy: 118 },
  },
  {
    id: 'right-index',
    label: 'Index',
    hand: 'right',
    hexColor: '#10b981',
    rect: { x: 57, y: 46, w: 18, h: 82, rx: 9 },
    rotate: { deg: -6, ox: 66, oy: 125 },
    tip: { cx: 62, cy: 50 },
  },
  {
    id: 'right-middle',
    label: 'Middle',
    hand: 'right',
    hexColor: '#f59e0b',
    rect: { x: 91, y: 30, w: 18, h: 95, rx: 9 },
    rotate: { deg: 0, ox: 100, oy: 125 },
    tip: { cx: 100, cy: 34 },
  },
  {
    id: 'right-ring',
    label: 'Ring',
    hand: 'right',
    hexColor: '#f97316',
    rect: { x: 125, y: 44, w: 17, h: 84, rx: 8.5 },
    rotate: { deg: 5, ox: 134, oy: 125 },
    tip: { cx: 138, cy: 48 },
  },
  {
    id: 'right-pinky',
    label: 'Pinky',
    hand: 'right',
    hexColor: '#f43f5e',
    rect: { x: 158, y: 72, w: 16, h: 62, rx: 8 },
    rotate: { deg: 12, ox: 166, oy: 130 },
    tip: { cx: 173, cy: 76 },
  },
];

interface HandSvgProps {
  hand: 'left' | 'right';
  activeFinger: FingerType | null;
  fingers: FingerConfig[];
}

const HandSvg: React.FC<HandSvgProps> = ({ hand, activeFinger, fingers }) => {
  const isLeft = hand === 'left';
  const hasActiveFinger = fingers.some(
    (f) => f.id === activeFinger || (activeFinger === 'thumb' && f.id === 'thumb')
  );

  return (
    <div className="relative flex flex-col items-center">
      <svg
        viewBox="0 0 200 230"
        className="w-32 h-36 sm:w-44 sm:h-48 md:w-52 md:h-56 3xl:w-64 3xl:h-70 2k:w-76 2k:h-84 select-none transition-all duration-200"
      >
        <defs>
          {/* Subtle drop shadow filters for active glowing fingers */}
          <filter id={`glow-${hand}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#ffffff" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Hand Silhouette / Palm Base */}
        <path
          d={
            isLeft
              ? 'M 40 135 C 30 145, 35 185, 55 205 C 75 220, 125 220, 145 205 C 165 190, 165 155, 150 135 C 140 125, 130 125, 100 125 C 70 125, 50 125, 40 135 Z'
              : 'M 160 135 C 170 145, 165 185, 145 205 C 125 220, 75 220, 55 205 C 35 190, 35 155, 50 135 C 60 125, 70 125, 100 125 C 130 125, 150 125, 160 135 Z'
          }
          className={`transition-all duration-300 ${
            hasActiveFinger
              ? 'fill-foreground/[0.07] stroke-foreground/20'
              : 'fill-foreground/[0.03] stroke-foreground/10'
          }`}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Palm Crease Lines */}
        <path
          d={
            isLeft
              ? 'M 55 155 Q 95 165 140 145'
              : 'M 145 155 Q 105 165 60 145'
          }
          className="stroke-foreground/10 fill-none"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d={
            isLeft
              ? 'M 65 175 Q 105 180 135 165'
              : 'M 135 175 Q 95 180 65 165'
          }
          className="stroke-foreground/10 fill-none"
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {/* Individual Fingers */}
        {fingers.map((f) => {
          const isActive =
            f.id === activeFinger || (activeFinger === 'thumb' && f.id === 'thumb');
          const isHomingIndex =
            (isLeft && f.id === 'left-index') || (!isLeft && f.id === 'right-index');

          return (
            <g
              key={f.id + f.label}
              transform={`rotate(${f.rotate.deg} ${f.rotate.ox} ${f.rotate.oy})`}
              className="transition-all duration-200"
            >
              {/* Finger Body Capsule */}
              <rect
                x={f.rect.x}
                y={f.rect.y}
                width={f.rect.w}
                height={f.rect.h}
                rx={f.rect.rx}
                ry={f.rect.rx}
                fill={isActive ? f.hexColor : 'currentColor'}
                fillOpacity={isActive ? 0.85 : 0.05}
                stroke={isActive ? f.hexColor : 'currentColor'}
                strokeOpacity={isActive ? 1.0 : 0.15}
                strokeWidth={isActive ? 2.5 : 1.2}
                className={`transition-all duration-150 ${
                  isActive ? 'drop-shadow-lg scale-[1.02]' : ''
                }`}
              />

              {/* Finger Knuckle Creases */}
              <line
                x1={f.rect.x + 3}
                y1={f.rect.y + f.rect.h * 0.38}
                x2={f.rect.x + f.rect.w - 3}
                y2={f.rect.y + f.rect.h * 0.38}
                stroke={isActive ? '#ffffff' : 'currentColor'}
                strokeOpacity={isActive ? 0.7 : 0.15}
                strokeWidth="1"
                strokeLinecap="round"
              />
              <line
                x1={f.rect.x + 4}
                y1={f.rect.y + f.rect.h * 0.68}
                x2={f.rect.x + f.rect.w - 4}
                y2={f.rect.y + f.rect.h * 0.68}
                stroke={isActive ? '#ffffff' : 'currentColor'}
                strokeOpacity={isActive ? 0.5 : 0.12}
                strokeWidth="1"
                strokeLinecap="round"
              />

              {/* Homing Anchor Bump Mark on Index Fingers (F and J) */}
              {isHomingIndex && !isActive && (
                <circle
                  cx={f.rect.x + f.rect.w / 2}
                  cy={f.rect.y + 14}
                  r="2"
                  className="fill-foreground/40"
                />
              )}

              {/* Active Pulsing Indicator on Active Fingertip */}
              {isActive && (
                <>
                  <circle
                    cx={f.rect.x + f.rect.w / 2}
                    cy={f.rect.y + 10}
                    r="4"
                    fill="#ffffff"
                    className="animate-pulse"
                  />
                  <circle
                    cx={f.rect.x + f.rect.w / 2}
                    cy={f.rect.y + 10}
                    r="7"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    strokeOpacity="0.6"
                    fill="none"
                    className="animate-ping"
                  />
                </>
              )}
            </g>
          );
        })}

        {/* Hand Label */}
        <text
          x="100"
          y="225"
          textAnchor="middle"
          className="text-[10px] sm:text-[11px] font-semibold fill-muted-foreground/60 tracking-wider uppercase select-none"
        >
          {isLeft ? 'Left Hand' : 'Right Hand'}
        </text>
      </svg>
    </div>
  );
};

export const TransparentHands: React.FC = () => {
  const showHandsGuide = useTypingStore((s) => s.showHandsGuide);
  const expectedKeyDef = useTypingStore((s) => s.expectedKeyDef);
  const activeFinger = expectedKeyDef?.finger ?? null;

  if (!showHandsGuide) return null;

  const currentTheme = activeFinger ? getFingerColorTheme(activeFinger) : null;

  return (
    <div className="w-full flex flex-col items-center gap-2 animate-in fade-in duration-300">
      {/* Transparent Hands Graphic Container */}
      <div className="relative flex items-center justify-center gap-4 sm:gap-12 md:gap-16 3xl:gap-20 2k:gap-24 px-4 py-2 3xl:px-8 3xl:py-4 bg-secondary/15 rounded-2xl 3xl:rounded-3xl border border-border/40 backdrop-blur-sm max-w-2xl xl:max-w-3xl 3xl:max-w-4xl 2k:max-w-5xl w-full">
        {/* Left Hand SVG */}
        <HandSvg hand="left" activeFinger={activeFinger} fingers={LEFT_FINGERS} />

        {/* Center Guidance Badge */}
        <div className="hidden sm:flex flex-col items-center justify-center px-3 py-2 3xl:px-5 3xl:py-3.5 rounded-xl 3xl:rounded-2xl bg-card/60 border border-border/50 text-center min-w-[120px] 3xl:min-w-[160px] shadow-sm">
          <span className="text-[10px] 3xl:text-xs text-muted-foreground uppercase font-semibold tracking-wider">
            Active Finger
          </span>
          {expectedKeyDef && currentTheme ? (
            <div className="flex flex-col items-center mt-1 3xl:mt-1.5">
              <span className={`text-xs 3xl:text-sm font-bold ${currentTheme.text} flex items-center gap-1.5`}>
                <span className={`w-2 h-2 3xl:w-2.5 3xl:h-2.5 rounded-full ${currentTheme.dot}`} />
                {expectedKeyDef.finger.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </span>
              <span className="text-[11px] 3xl:text-xs font-mono text-foreground font-semibold mt-0.5">
                Target: &quot;{expectedKeyDef.display || expectedKeyDef.key}&quot;
              </span>
            </div>
          ) : (
            <span className="text-xs 3xl:text-sm text-muted-foreground/60 mt-1">Home Position</span>
          )}
        </div>

        {/* Right Hand SVG */}
        <HandSvg hand="right" activeFinger={activeFinger} fingers={RIGHT_FINGERS} />
      </div>
    </div>
  );
};

