'use client';

import React from 'react';
import { Flame, Zap, Trophy, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useRedlineStore, REDLINE_TIERS } from '@/stores/use-redline-store';

export const SpeedometerGauge: React.FC = () => {
  const currentWpm = useRedlineStore((s) => s.currentRollingWpm);
  const peakWpm = useRedlineStore((s) => s.peakWpm);
  const holdSeconds = useRedlineStore((s) => s.holdSeconds);
  const isRedlining = useRedlineStore((s) => s.isRedlining);
  const difficulty = useRedlineStore((s) => s.difficulty);
  const status = useRedlineStore((s) => s.status);

  const config = REDLINE_TIERS[difficulty];
  const maxWpm = 140;

  // Calculate needle angle from -120deg (0 WPM) to +120deg (140 WPM) -> 240deg total sweep
  const clampedWpm = Math.max(0, Math.min(maxWpm, currentWpm));
  const needleAngle = -120 + (clampedWpm / maxWpm) * 240;

  // Redline start angle
  const redlineAngle = -120 + (config.targetWpm / maxWpm) * 240;

  // Progress percentage of hold time
  const holdProgressPct = Math.min(100, Math.round((holdSeconds / config.requiredHoldSeconds) * 100));

  return (
    <div className="relative flex flex-col items-center justify-center p-4 select-none">
      {/* Outer Speedometer Instrument Dial */}
      <div
        className={`relative w-64 h-64 sm:w-80 sm:h-80 3xl:w-96 3xl:h-96 rounded-full p-3 border-4 transition-all duration-300 flex items-center justify-center shadow-2xl ${
          isRedlining
            ? 'border-rose-500/80 shadow-rose-500/30 bg-gradient-to-b from-rose-950/40 via-card to-card'
            : 'border-border/80 shadow-black/60 bg-gradient-to-b from-secondary/40 via-card to-card'
        }`}
      >
        {/* SVG Dial Face with Ticks and Arc */}
        <svg viewBox="0 0 300 300" className="w-full h-full absolute inset-0 overflow-visible">
          <defs>
            <linearGradient id="safeArc" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="80%" stopColor="#f59e0b" />
            </linearGradient>

            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Track Arc */}
          <circle
            cx="150"
            cy="150"
            r="120"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-border/40"
            strokeDasharray="502"
            strokeDashoffset="125"
            strokeLinecap="round"
            transform="rotate(150 150 150)"
          />

          {/* Active Speed Arc */}
          <circle
            cx="150"
            cy="150"
            r="120"
            fill="none"
            stroke="url(#safeArc)"
            strokeWidth="10"
            strokeDasharray="502"
            strokeDashoffset={502 - (clampedWpm / maxWpm) * 335}
            strokeLinecap="round"
            transform="rotate(150 150 150)"
            className="transition-all duration-150"
          />

          {/* Redline Indicator Arc Zone */}
          <circle
            cx="150"
            cy="150"
            r="120"
            fill="none"
            stroke="#ef4444"
            strokeWidth="12"
            strokeDasharray="502"
            strokeDashoffset={502 - ((maxWpm - config.targetWpm) / maxWpm) * 335}
            strokeLinecap="round"
            transform={`rotate(${150 + (config.targetWpm / maxWpm) * 240} 150 150)`}
            filter={isRedlining ? 'url(#neonGlow)' : undefined}
            className={`transition-all duration-200 ${isRedlining ? 'opacity-100 animate-pulse' : 'opacity-40'}`}
          />

          {/* Major Tick Marks */}
          {[0, 20, 40, 60, 80, 100, 120, 140].map((speed) => {
            const angle = -120 + (speed / maxWpm) * 240;
            const rad = (angle * Math.PI) / 180;
            const x1 = 150 + 102 * Math.cos(rad);
            const y1 = 150 + 102 * Math.sin(rad);
            const x2 = 150 + 116 * Math.cos(rad);
            const y2 = 150 + 116 * Math.sin(rad);
            const isRedZone = speed >= config.targetWpm;

            const textRad = (angle * Math.PI) / 180;
            const tx = 150 + 88 * Math.cos(textRad);
            const ty = 150 + 88 * Math.sin(textRad) + 3;

            return (
              <g key={speed}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isRedZone ? '#ef4444' : 'currentColor'}
                  strokeWidth={speed % 40 === 0 ? '3' : '1.5'}
                  className={isRedZone ? 'text-rose-500' : 'text-muted-foreground/60'}
                />
                <text
                  x={tx}
                  y={ty}
                  textAnchor="middle"
                  className={`text-[10px] font-mono font-bold select-none ${
                    isRedZone ? 'fill-rose-400' : 'fill-muted-foreground/50'
                  }`}
                >
                  {speed}
                </text>
              </g>
            );
          })}

          {/* Physical Needle Indicator */}
          <g
            transform={`rotate(${needleAngle} 150 150)`}
            className="transition-transform duration-100 ease-out"
          >
            {/* Needle Body */}
            <line
              x1="150"
              y1="150"
              x2="150"
              y2="42"
              stroke={isRedlining ? '#f43f5e' : '#f59e0b'}
              strokeWidth="4"
              strokeLinecap="round"
              filter="url(#neonGlow)"
            />
            {/* Counterweight */}
            <line
              x1="150"
              y1="150"
              x2="150"
              y2="175"
              stroke="#64748b"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </g>

          {/* Center Hub */}
          <circle cx="150" cy="150" r="16" fill="#1e293b" stroke="#475569" strokeWidth="3" />
          <circle
            cx="150"
            cy="150"
            r="7"
            fill={isRedlining ? '#ef4444' : '#38bdf8'}
            className={isRedlining ? 'animate-ping' : ''}
          />
        </svg>

        {/* Center Digital Readout HUD */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center mt-12 sm:mt-16">
          <span
            className={`text-4xl sm:text-5xl 3xl:text-6xl font-black font-mono tracking-tight transition-colors duration-150 ${
              isRedlining ? 'text-rose-400 drop-shadow-[0_0_12px_rgba(244,63,94,0.6)]' : 'text-foreground'
            }`}
          >
            {currentWpm}
          </span>
          <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-widest -mt-1">
            WPM SPEED
          </span>

          {/* Redline Threshold Target Badge */}
          <div
            className={`mt-2 px-2.5 py-0.5 rounded-full border text-[11px] font-mono font-bold flex items-center gap-1 transition ${
              isRedlining
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-bounce'
                : 'bg-secondary text-muted-foreground border-border'
            }`}
          >
            <Flame className={`w-3 h-3 ${isRedlining ? 'text-rose-400' : 'text-muted-foreground'}`} />
            <span>REDLINE: {config.targetWpm} WPM</span>
          </div>
        </div>
      </div>

      {/* Nitro Boost Hold Bar */}
      <div className="w-full max-w-md sm:max-w-lg mt-5 p-3.5 rounded-2xl bg-secondary/30 border border-border/80 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-foreground">
            {isRedlining ? (
              <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
            ) : (
              <Zap className="w-4 h-4 text-muted-foreground" />
            )}
            <span>
              {isRedlining ? 'TURBO BOOST ENGAGED!' : 'Accelerate above Redline'}
            </span>
          </span>
          <span className="font-mono text-xs">
            <span className={isRedlining ? 'text-rose-400 font-bold' : 'text-foreground'}>
              {holdSeconds.toFixed(1)}s
            </span>{' '}
            / {config.requiredHoldSeconds}s
          </span>
        </div>

        {/* Progress bar container */}
        <div className="w-full h-3.5 bg-card rounded-full overflow-hidden border border-border/80 p-0.5 relative">
          <div
            style={{ width: `${holdProgressPct}%` }}
            className={`h-full rounded-full transition-all duration-100 ${
              isRedlining
                ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 shadow-[0_0_12px_rgba(239,68,68,0.7)] animate-pulse'
                : 'bg-muted-foreground/30'
            }`}
          />
        </div>

        {/* Instructions / status hint */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-0.5">
          <span>
            Vehicle: <strong className="text-foreground">{config.vehicleName}</strong>
          </span>
          <span>Peak: <strong className="text-primary font-mono">{peakWpm} WPM</strong></span>
        </div>
      </div>
    </div>
  );
};
