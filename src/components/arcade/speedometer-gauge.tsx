'use client';

import React from 'react';
import { Flame, Zap, Trophy, AlertTriangle, ArrowLeft, ArrowRight } from 'lucide-react';
import { useRedlineStore, REDLINE_TIERS } from '@/stores/use-redline-store';

/**
 * Converts polar coordinates to SVG Cartesian coordinates.
 */
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

/**
 * Creates SVG arc path string between two angles.
 */
function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return [
    'M', start.x, start.y,
    'A', r, r, 0, largeArcFlag, 0, end.x, end.y,
  ].join(' ');
}

export const SpeedometerGauge: React.FC = () => {
  const currentWpm = useRedlineStore((s) => s.currentRollingWpm);
  const peakWpm = useRedlineStore((s) => s.peakWpm);
  const holdSeconds = useRedlineStore((s) => s.holdSeconds);
  const isRedlining = useRedlineStore((s) => s.isRedlining);
  const difficulty = useRedlineStore((s) => s.difficulty);
  const status = useRedlineStore((s) => s.status);

  const config = REDLINE_TIERS[difficulty];
  const maxWpm = 160;

  // Automotive gauge geometry:
  // Center (180, 180), sweeps 270 degrees from 135° (bottom-left, 7:30) to 405° (bottom-right, 4:30)
  const cx = 180;
  const cy = 180;
  const dialRadius = 142;

  const clampedWpm = Math.max(0, Math.min(maxWpm, currentWpm));
  const getAngleForSpeed = (speed: number) => 135 + (speed / maxWpm) * 270;

  // Active needle angle
  const needleAngle = getAngleForSpeed(clampedWpm);

  // Redline start angle
  const redlineStartAngle = getAngleForSpeed(config.targetWpm);
  const maxAngle = 405;

  // Hold progress percentage
  const holdProgressPct = Math.min(
    100,
    Math.round((holdSeconds / config.requiredHoldSeconds) * 100)
  );

  // Ticks list (every 5 WPM up to 160)
  const ticks = Array.from({ length: 33 }, (_, i) => i * 5);

  return (
    <div className="relative flex flex-col items-center justify-center p-2 sm:p-4 select-none">
      {/* Outer Chrome / Titanium Housing Bezel */}
      <div
        className={`relative w-72 h-72 sm:w-88 sm:h-88 3xl:w-104 3xl:h-104 rounded-full p-2.5 border-[6px] transition-all duration-300 flex items-center justify-center shadow-2xl ${
          isRedlining
            ? 'border-rose-500/80 shadow-[0_0_50px_rgba(244,63,94,0.35)] bg-gradient-to-b from-rose-950/40 via-[#0a0f1d] to-[#030712]'
            : 'border-slate-700/80 shadow-black/80 bg-gradient-to-b from-slate-900/60 via-[#0a0f1d] to-[#030712]'
        }`}
      >
        {/* Inner Brushed Aluminum Ring */}
        <div className="w-full h-full rounded-full border border-slate-600/30 p-1 relative flex items-center justify-center">
          <svg viewBox="0 0 360 360" className="w-full h-full overflow-visible select-none">
            <defs>
              {/* Dial face background gradient */}
              <radialGradient id="dialFace" cx="50%" cy="50%" r="50%">
                <stop offset="65%" stopColor="#0b1329" />
                <stop offset="92%" stopColor="#050814" />
                <stop offset="100%" stopColor="#02040a" />
              </radialGradient>

              {/* Glowing active speed arc gradient */}
              <linearGradient id="speedArcGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="60%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>

              {/* Needle illumination gradient */}
              <linearGradient id="needleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#64748b" />
                <stop offset="30%" stopColor="#dc2626" />
                <stop offset="90%" stopColor="#ff2a4b" />
                <stop offset="100%" stopColor="#ffe4e6" />
              </linearGradient>

              {/* Soft glow filter */}
              <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>

              {/* Needle drop shadow */}
              <filter id="needleShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.7" />
              </filter>
            </defs>

            {/* Dial Face Background Plate */}
            <circle cx={cx} cy={cy} r={dialRadius + 14} fill="url(#dialFace)" stroke="#1e293b" strokeWidth="2" />
            <circle cx={cx} cy={cy} r={dialRadius + 8} fill="none" stroke="#334155" strokeWidth="1" strokeOpacity="0.4" />

            {/* Background Full Track Arc (135° to 405°) */}
            <path
              d={describeArc(cx, cy, dialRadius, 135, maxAngle)}
              fill="none"
              stroke="#1e293b"
              strokeWidth="6"
              strokeLinecap="round"
            />

            {/* Redline Zone Track Arc (from targetWpm to 160) */}
            <path
              d={describeArc(cx, cy, dialRadius, redlineStartAngle, maxAngle)}
              fill="none"
              stroke="#ef4444"
              strokeWidth="9"
              strokeLinecap="round"
              className={`transition-all duration-300 ${
                isRedlining ? 'opacity-100 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse' : 'opacity-40'
              }`}
            />

            {/* Active Speed Progress Arc */}
            {clampedWpm > 0 && (
              <path
                d={describeArc(cx, cy, dialRadius - 6, 135, Math.max(136, needleAngle))}
                fill="none"
                stroke="url(#speedArcGrad)"
                strokeWidth="5"
                strokeLinecap="round"
                className="transition-all duration-100 ease-out"
                filter="url(#gaugeGlow)"
              />
            )}

            {/* All Speed Ticks & Labels */}
            {ticks.map((speed) => {
              const angle = getAngleForSpeed(speed);
              const isMajor = speed % 20 === 0;
              const isMedium = speed % 10 === 0 && !isMajor;
              const isRedZone = speed >= config.targetWpm;

              const tickLength = isMajor ? 14 : isMedium ? 9 : 5;
              const tickWidth = isMajor ? 2.5 : isMedium ? 1.8 : 1.0;

              const innerR = dialRadius - tickLength;
              const outerR = dialRadius;

              const p1 = polarToCartesian(cx, cy, innerR, angle);
              const p2 = polarToCartesian(cx, cy, outerR, angle);

              // Position for major text labels (0, 20, 40, ... 160)
              const textR = dialRadius - 26;
              const textPos = polarToCartesian(cx, cy, textR, angle);

              return (
                <g key={speed}>
                  <line
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke={isRedZone ? '#ef4444' : isMajor ? '#f8fafc' : '#94a3b8'}
                    strokeWidth={tickWidth}
                    strokeLinecap="round"
                    className={`transition-colors duration-150 ${
                      isRedZone && isRedlining ? 'stroke-rose-400 drop-shadow-[0_0_4px_rgba(244,63,94,0.8)]' : ''
                    }`}
                  />

                  {isMajor && (
                    <text
                      x={textPos.x}
                      y={textPos.y + 3.5}
                      textAnchor="middle"
                      className={`text-[11px] sm:text-[12px] font-mono font-bold select-none ${
                        isRedZone
                          ? 'fill-rose-400 font-black'
                          : 'fill-slate-200'
                      }`}
                    >
                      {speed}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Decorative Dash Indicators */}
            {/* Turn signals / warning indicators */}
            <path
              d="M 100 230 L 112 222 L 112 238 Z"
              fill="none"
              stroke="#10b981"
              strokeWidth="1.5"
              strokeOpacity="0.4"
            />
            <path
              d="M 260 230 L 248 222 L 248 238 Z"
              fill="none"
              stroke="#10b981"
              strokeWidth="1.5"
              strokeOpacity="0.4"
            />

            {/* Automotive Cluster Text "WPM" and Brand */}
            <text
              x={cx}
              y={cy - 48}
              textAnchor="middle"
              className="text-[10px] font-mono font-bold tracking-[0.25em] fill-muted-foreground/60 uppercase"
            >
              KEYBOARD HERO
            </text>

            {/* Realistic 3D Tapered Sport Needle */}
            <g
              transform={`rotate(${needleAngle} ${cx} ${cy})`}
              filter="url(#needleShadow)"
              className="transition-transform duration-100 ease-out"
            >
              {/* Needle Counterweight (behind center) */}
              <polygon
                points={`${cx - 26},${cy - 4} ${cx - 26},${cy + 4} ${cx},${cy + 5.5} ${cx},${cy - 5.5}`}
                fill="#334155"
              />

              {/* Tapered Illuminated Needle Blade */}
              <polygon
                points={`${cx},${cy - 5} ${cx + 128},${cy - 1} ${cx + 128},${cy + 1} ${cx},${cy + 5}`}
                fill="url(#needleGrad)"
                filter={isRedlining ? 'url(#gaugeGlow)' : undefined}
              />

              {/* Razor-sharp Center Illumination Filament */}
              <line
                x1={cx}
                y1={cy}
                x2={cx + 126}
                y2={cy}
                stroke="#ffffff"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeOpacity="0.9"
              />
            </g>

            {/* Center Cap Hub (3D Metallic Sports Cap) */}
            <circle cx={cx} cy={cy} r={22} fill="#0f172a" stroke="#475569" strokeWidth="3" />
            <circle cx={cx} cy={cy} r={15} fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
            <circle
              cx={cx}
              cy={cy}
              r={6}
              fill={isRedlining ? '#ef4444' : '#38bdf8'}
              className={isRedlining ? 'animate-ping' : ''}
            />
          </svg>

          {/* Integrated Multi-Information Display (MID) Cluster */}
          <div className="absolute bottom-5 sm:bottom-7 flex flex-col items-center text-center z-10 pointer-events-none">
            {/* Real-time Large Digital Speed Readout */}
            <div className="flex items-baseline justify-center gap-1">
              <span
                className={`text-4xl sm:text-5xl font-black font-mono tracking-tight transition-all duration-100 ${
                  isRedlining
                    ? 'text-rose-400 drop-shadow-[0_0_15px_rgba(244,63,94,0.7)]'
                    : 'text-foreground'
                }`}
              >
                {currentWpm}
              </span>
              <span className="text-[11px] font-mono font-bold text-muted-foreground uppercase">
                WPM
              </span>
            </div>

            {/* Mode & Target Badge */}
            <div
              className={`mt-1 px-2.5 py-0.5 rounded-full border text-[10px] sm:text-[11px] font-mono font-bold flex items-center gap-1 transition ${
                isRedlining
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/60 shadow-[0_0_10px_rgba(244,63,94,0.4)] animate-pulse'
                  : 'bg-secondary/80 text-muted-foreground border-border/80'
              }`}
            >
              <Flame className={`w-3 h-3 ${isRedlining ? 'text-rose-400' : 'text-muted-foreground'}`} />
              <span>REDLINE: {config.targetWpm} WPM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Turbo Boost & Hold Reservoir Computer */}
      <div className="w-full max-w-md sm:max-w-lg mt-5 p-4 rounded-2xl bg-secondary/30 border border-border/80 backdrop-blur-sm flex flex-col gap-2.5 shadow-xl">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-foreground">
            {isRedlining ? (
              <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
            ) : (
              <Zap className="w-4 h-4 text-muted-foreground" />
            )}
            <span className={isRedlining ? 'text-rose-300 font-bold' : ''}>
              {isRedlining ? 'TURBO BOOST ACTIVE - SUSTAIN SPEED!' : 'Floor It: Cross Redline Threshold'}
            </span>
          </span>

          <span className="font-mono text-xs">
            <span className={isRedlining ? 'text-rose-400 font-bold text-sm' : 'text-foreground font-semibold'}>
              {holdSeconds.toFixed(1)}s
            </span>{' '}
            / {config.requiredHoldSeconds}.0s
          </span>
        </div>

        {/* Segmented LED Boost Bar */}
        <div className="w-full h-4 bg-black/60 rounded-full overflow-hidden border border-border/80 p-0.5 relative">
          <div
            style={{ width: `${holdProgressPct}%` }}
            className={`h-full rounded-full transition-all duration-100 ${
              isRedlining
                ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-pulse'
                : 'bg-muted-foreground/30'
            }`}
          />
        </div>

        {/* Dashboard Readout Meta */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
          <span>
            Class: <strong className="text-foreground">{config.vehicleName}</strong>
          </span>
          <span>
            Top Speed: <strong className="text-primary font-mono">{peakWpm} WPM</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
