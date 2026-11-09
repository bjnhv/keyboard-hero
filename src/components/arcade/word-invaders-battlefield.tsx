'use client';

import React from 'react';
import {
  useWordInvadersStore,
  InvaderEntity,
  UfoEntity,
} from '@/stores/use-word-invaders-store';
import { Shield, Sparkles } from 'lucide-react';

/**
 * Pixel-art retro alien sprite components using SVG
 */
const SquidSprite: React.FC<{ anim: boolean; color?: string }> = ({ anim, color = '#f43f5e' }) => (
  <svg viewBox="0 0 16 16" className="w-8 h-8 filter drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]">
    {anim ? (
      // Frame 1
      <path
        d="M6 1h4v1H6V1z M5 2h6v1H5V2z M4 3h8v1H4V3z M4 4h2v1h4V4h2v1H4V4z M4 5h8v2H4V5z M2 7h12v1H2V7z M1 8h2v2H1V8z M13 8h2v2h-2V8z M3 10h2v3H3v-3z M11 10h2v3h-2v-3z M5 10h6v1H5v-1z M6 11h4v3H6v-3z"
        fill={color}
      />
    ) : (
      // Frame 2 (Tentacles out)
      <path
        d="M6 1h4v1H6V1z M5 2h6v1H5V2z M4 3h8v1H4V3z M4 4h2v1h4V4h2v1H4V4z M4 5h8v2H4V5z M2 7h12v1H2V7z M0 8h2v3H0V8z M14 8h2v3h-2V8z M3 11h2v3H3v-3z M11 11h2v3h-2v-3z M5 9h6v2H5V9z"
        fill={color}
      />
    )}
  </svg>
);

const CrabSprite: React.FC<{ anim: boolean; color?: string }> = ({ anim, color = '#06b6d4' }) => (
  <svg viewBox="0 0 16 16" className="w-8 h-8 filter drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">
    {anim ? (
      // Frame 1
      <path
        d="M2 2h2v2H2V2z M12 2h2v2h-2V2z M3 4h10v1H3V4z M2 5h12v1H2V5z M1 6h14v2H1V6z M1 8h2v3H1V8z M13 8h2v3h-2V8z M4 8h8v2H4V8z M3 11h2v3H3v-3z M11 11h2v3h-2v-3z"
        fill={color}
      />
    ) : (
      // Frame 2
      <path
        d="M2 0h2v2H2V0z M12 0h2v2h-2V0z M3 2h10v2H3V2z M2 4h12v2H2V4z M1 6h14v2H1V6z M0 8h2v3H0V8z M14 8h2v3h-2V8z M3 9h10v2H3V9z M4 11h2v2H4v-2z M10 11h2v2h-2v-2z"
        fill={color}
      />
    )}
  </svg>
);

const OctopusSprite: React.FC<{ anim: boolean; color?: string }> = ({ anim, color = '#a855f7' }) => (
  <svg viewBox="0 0 16 16" className="w-8 h-8 filter drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]">
    {anim ? (
      // Frame 1
      <path
        d="M4 1h8v1H4V1z M2 2h12v1H2V2z M1 3h14v2H1V3z M1 5h3v2H1V5z M6 5h4v2H6V5z M12 5h3v2h-3V5z M1 7h14v2H1V7z M3 9h2v2H3V9z M7 9h2v2H7V9z M11 9h2v2h-2V9z M1 11h2v3H1v-3z M5 11h2v3H5v-3z M9 11h2v3H9v-3z M13 11h2v3h-2v-3z"
        fill={color}
      />
    ) : (
      // Frame 2
      <path
        d="M4 1h8v1H4V1z M2 2h12v1H2V2z M1 3h14v2H1V3z M1 5h3v2H1V5z M6 5h4v2H6V5z M12 5h3v2h-3V5z M1 7h14v2H1V7z M2 9h12v2H2V9z M0 11h2v3H0v-3z M4 11h2v2H4v-2z M10 11h2v2h-2v-2z M14 11h2v3h-2v-3z"
        fill={color}
      />
    )}
  </svg>
);

const UfoSprite: React.FC<{ color?: string }> = ({ color = '#ef4444' }) => (
  <svg viewBox="0 0 24 12" className="w-12 h-6 filter drop-shadow-[0_0_12px_rgba(239,68,68,0.9)]">
    <path
      d="M7 1h10v1H7V1z M5 2h14v1H5V2z M3 3h18v2H3V3z M1 5h22v2H1V5z M3 7h18v1H3V7z M5 8h2v1H5V8z M9 8h2v1H9V8z M13 8h2v1h-2V8z M17 8h2v1h-2V8z"
      fill={color}
    />
  </svg>
);

const CannonSprite: React.FC<{ color?: string }> = ({ color = '#10b981' }) => (
  <svg viewBox="0 0 20 14" className="w-10 h-7 filter drop-shadow-[0_0_12px_rgba(16,185,129,0.8)]">
    <path
      d="M9 0h2v4H9V0z M8 4h4v2H8V4z M6 6h8v2H6V6z M3 8h14v3H3V8z M1 11h18v3H1v-3z"
      fill={color}
    />
  </svg>
);

export const WordInvadersBattlefield: React.FC = () => {
  const {
    invaders,
    ufo,
    targetId,
    activeLasers,
    explosions,
    cannonX,
    shields,
    maxShields,
    score,
    wave,
    combo,
    marchStep,
    screenShake,
    status,
    keyboardLayout,
  } = useWordInvadersStore();

  const isHebrew = keyboardLayout === 'hebrew';
  const animFrame = marchStep % 2 === 0;

  return (
    <div
      className={`relative w-full h-[520px] sm:h-[600px] rounded-3xl border-2 border-emerald-500/30 bg-zinc-950/95 overflow-hidden shadow-2xl backdrop-blur-xl select-none flex flex-col justify-between p-3 sm:p-5 transition-transform ${
        screenShake ? 'animate-shake' : ''
      }`}
    >
      {/* CRT Scanline & Phosphor Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.06),transparent_75%)]" />
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_4px]" />

      {/* Retro Arcade HUD */}
      <div className="relative z-10 flex items-center justify-between text-xs sm:text-sm font-mono border-b border-emerald-500/20 pb-2 px-2">
        {/* Score & Multiplier */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Score</span>
            <span className="text-emerald-400 font-black text-base sm:text-lg tracking-wider">
              {score.toString().padStart(6, '0')}
            </span>
          </div>
          {combo > 1 && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-xs animate-bounce">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>{combo}x STREAK</span>
            </div>
          )}
        </div>

        {/* Wave & Defense Shields */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest block">Sector Wave</span>
            <span className="text-cyan-400 font-black text-sm sm:text-base">WAVE {wave}</span>
          </div>

          <div className="flex items-center gap-1 pl-2 border-l border-emerald-500/20">
            {Array.from({ length: maxShields }).map((_, idx) => (
              <Shield
                key={idx}
                className={`w-4 h-4 sm:w-5 sm:h-5 transition-all ${
                  idx < shields
                    ? 'text-emerald-400 fill-emerald-400/30 filter drop-shadow-[0_0_6px_#34d399]'
                    : 'text-zinc-700/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Starfield & Fleet Arena */}
      <div className="relative flex-1 w-full overflow-hidden my-1">
        {/* Distant Twinkling Stars */}
        <div className="absolute inset-0 opacity-25">
          <div className="absolute top-[10%] left-[20%] w-1 h-1 bg-white rounded-full animate-ping" />
          <div className="absolute top-[45%] left-[75%] w-1 h-1 bg-cyan-300 rounded-full" />
          <div className="absolute top-[70%] left-[35%] w-1 h-1 bg-white rounded-full" />
          <div className="absolute top-[25%] left-[85%] w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse" />
          <div className="absolute top-[80%] left-[60%] w-1 h-1 bg-emerald-300 rounded-full" />
        </div>

        {/* UFO Flying Saucer */}
        {ufo && (
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 z-20 transition-all duration-75"
            style={{ left: `${ufo.x}%`, top: `${ufo.y}%` }}
          >
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase tracking-widest animate-pulse">
              MYSTERY // 300 PTS
            </span>
            <UfoSprite />
            {/* Word Badge */}
            <div
              dir={isHebrew ? 'rtl' : 'ltr'}
              className="px-2 py-0.5 rounded-md bg-zinc-950/90 border border-rose-500/60 shadow-lg font-mono text-xs font-black tracking-wider flex items-center justify-center"
            >
              <span className="text-emerald-400">{ufo.typed}</span>
              <span className="text-white">{ufo.word.slice(ufo.typed.length)}</span>
            </div>
          </div>
        )}

        {/* Fleet of Invaders */}
        {invaders.map((inv) => {
          if (!inv.isAlive) return null;
          const isTarget = targetId === inv.id;

          return (
            <div
              key={inv.id}
              className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 z-10 transition-all duration-150 ${
                isTarget ? 'scale-110 z-20' : ''
              }`}
              style={{ left: `${inv.x}%`, top: `${inv.y}%` }}
            >
              {/* Invader Sprite */}
              {inv.type === 'squid' && <SquidSprite anim={animFrame} />}
              {inv.type === 'crab' && <CrabSprite anim={animFrame} />}
              {inv.type === 'octopus' && <OctopusSprite anim={animFrame} />}

              {/* Target Word Badge */}
              <div
                dir={isHebrew ? 'rtl' : 'ltr'}
                className={`px-2 py-0.5 rounded-md font-mono text-xs sm:text-sm font-black tracking-wider transition-all shadow-md ${
                  isTarget
                    ? 'bg-zinc-950 border-2 border-emerald-400 text-foreground shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                    : 'bg-zinc-900/90 border border-zinc-700/60 text-zinc-300'
                }`}
              >
                {/* Typed matched characters */}
                <span className="text-emerald-400 underline decoration-2 decoration-emerald-400">
                  {inv.typed}
                </span>
                {/* Remaining characters */}
                <span className={isTarget ? 'text-white' : 'text-zinc-300'}>
                  {inv.word.slice(inv.typed.length)}
                </span>
              </div>
            </div>
          );
        })}

        {/* Active Laser Beams */}
        {activeLasers.map((laser) => (
          <svg key={laser.id} className="absolute inset-0 w-full h-full pointer-events-none z-30">
            <line
              x1={`${laser.fromX}%`}
              y1={`${laser.fromY}%`}
              x2={`${laser.toX}%`}
              y2={`${laser.toY}%`}
              stroke="#10b981"
              strokeWidth="3.5"
              strokeLinecap="round"
              className="filter drop-shadow-[0_0_8px_#34d399] animate-pulse"
            />
          </svg>
        ))}

        {/* Explosions */}
        {explosions.map((exp) => (
          <div
            key={exp.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20 flex items-center justify-center animate-ping"
            style={{ left: `${exp.x}%`, top: `${exp.y}%` }}
          >
            <div
              className="w-12 h-12 rounded-full border-2 opacity-80"
              style={{ borderColor: exp.color, backgroundColor: `${exp.color}33` }}
            />
          </div>
        ))}
      </div>

      {/* Defense Bunkers & Cannon Base Line */}
      <div className="relative z-10 w-full flex flex-col gap-2 pt-2 border-t border-emerald-500/20">
        {/* 3 Pixel Defense Bunkers */}
        <div className="w-full flex items-center justify-around px-8 sm:px-16 pointer-events-none">
          {[0, 1, 2].map((bunkerIdx) => (
            <div
              key={bunkerIdx}
              className={`w-12 sm:w-16 h-6 rounded-t-xl border-2 transition-all ${
                bunkerIdx < shields
                  ? 'bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                  : 'bg-zinc-900/20 border-zinc-800 border-dashed opacity-30'
              }`}
            />
          ))}
        </div>

        {/* Player Laser Cannon (Aims/Tracks horizontally) */}
        <div className="relative w-full h-8 flex items-center">
          <div
            className="absolute -translate-x-1/2 transition-all duration-100 ease-out flex flex-col items-center"
            style={{ left: `${cannonX}%` }}
          >
            <CannonSprite />
          </div>
        </div>
      </div>
    </div>
  );
};

