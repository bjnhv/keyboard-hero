'use client';

import React from 'react';
import { useBombDefusalStore, DEFUSAL_TIERS } from '@/stores/use-bomb-defusal-store';
import { ShieldAlert, Zap, Scissors, Skull, CheckCircle2, RotateCcw, Play, AlertTriangle } from 'lucide-react';

export const C4BombProp: React.FC = () => {
  const {
    status,
    difficulty,
    phases,
    currentPhaseIndex,
    charIndex,
    remainingSeconds,
    totalErrors,
    penaltyFlash,
    screenShake,
    score,
    wpm,
    accuracy,
    startGame,
    resetGame,
  } = useBombDefusalStore();

  const tier = DEFUSAL_TIERS[difficulty];
  const currentPhase = phases[currentPhaseIndex];

  // Format seconds to mm:ss.ms
  const formatTime = (secs: number) => {
    const clamped = Math.max(0, secs);
    const m = Math.floor(clamped / 60);
    const s = Math.floor(clamped % 60);
    const ms = Math.floor((clamped % 1) * 100);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
  };

  const getWireColorClass = (color: string) => {
    switch (color) {
      case 'yellow':
        return { border: 'border-amber-400', bg: 'bg-amber-400', shadow: 'shadow-amber-400/50', text: 'text-amber-400' };
      case 'cyan':
        return { border: 'border-cyan-400', bg: 'bg-cyan-400', shadow: 'shadow-cyan-400/50', text: 'text-cyan-400' };
      case 'green':
        return { border: 'border-emerald-400', bg: 'bg-emerald-400', shadow: 'shadow-emerald-400/50', text: 'text-emerald-400' };
      case 'purple':
        return { border: 'border-purple-400', bg: 'bg-purple-400', shadow: 'shadow-purple-400/50', text: 'text-purple-400' };
      case 'orange':
        return { border: 'border-orange-500', bg: 'bg-orange-500', shadow: 'shadow-orange-500/50', text: 'text-orange-400' };
      case 'red':
      default:
        return { border: 'border-rose-500', bg: 'bg-rose-500', shadow: 'shadow-rose-500/50', text: 'text-rose-400' };
    }
  };

  return (
    <div
      className={`relative w-full max-w-4xl mx-auto rounded-3xl border-4 border-zinc-800 bg-zinc-950 p-6 sm:p-8 shadow-2xl overflow-hidden select-none transition-transform duration-75 ${
        screenShake ? 'translate-x-1 translate-y-1 scale-[1.01] ring-4 ring-rose-500/80' : ''
      }`}
    >
      {/* Carbon fiber texture & hazard caution stripes */}
      <div className="absolute top-0 left-0 right-0 h-3 bg-[repeating-linear-gradient(45deg,#f59e0b,#f59e0b_15px,#000_15px,#000_30px)] opacity-80" />
      <div className="absolute bottom-0 left-0 right-0 h-3 bg-[repeating-linear-gradient(45deg,#f59e0b,#f59e0b_15px,#000_15px,#000_30px)] opacity-80" />

      {/* Main C4 Military Housing */}
      <div className="relative pt-4 pb-2 flex flex-col gap-6">
        {/* Header HUD: Mode Label + Stencil Warning */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
            <span className="text-xs font-mono font-black tracking-widest text-rose-500 uppercase">
              C-4 MIL-SPEC PAYLOAD // ARMED
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-zinc-900 border border-zinc-700 text-zinc-300">
              TYPO PENALTY: <span className="text-rose-400 font-black">-{tier.typoPenaltySeconds.toFixed(1)}s</span>
            </span>
            <span className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-black uppercase ${tier.color} bg-zinc-900 border border-zinc-800`}>
              TIER: {tier.name}
            </span>
          </div>
        </div>

        {/* Digital LED Timer + Physical C4 Prop Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* LEFT: 7-Segment Digital Clock */}
          <div className="md:col-span-7 flex flex-col items-center justify-center p-6 rounded-2xl bg-black border-2 border-zinc-800 shadow-inner relative overflow-hidden">
            {/* Ambient Red Glow */}
            <div className="absolute inset-0 bg-rose-600/10 pointer-events-none" />

            {/* Floating Typo Penalty Flash */}
            {penaltyFlash !== null && (
              <div className="absolute top-2 right-4 text-rose-500 font-mono font-black text-xl animate-bounce">
                -{penaltyFlash.toFixed(1)}s 💥
              </div>
            )}

            <div className="text-[10px] font-mono tracking-widest uppercase text-zinc-500 mb-1">
              DETONATION COUNTDOWN
            </div>

            {/* Glowing 7-Segment Display */}
            <div
              className={`font-mono font-black text-5xl sm:text-6xl md:text-7xl tracking-wider transition-colors ${
                remainingSeconds < 5.0
                  ? 'text-rose-500 animate-pulse drop-shadow-[0_0_25px_rgba(244,63,94,0.9)]'
                  : remainingSeconds < 10.0
                  ? 'text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.7)]'
                  : 'text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.7)]'
              }`}
            >
              {formatTime(remainingSeconds)}
            </div>

            {/* Synchronized blinking C4 LED */}
            <div className="flex items-center gap-2 mt-3 text-xs font-mono text-zinc-400">
              <span
                className={`w-3.5 h-3.5 rounded-full transition-all ${
                  status === 'running'
                    ? 'bg-rose-500 shadow-[0_0_12px_#f43f5e]'
                    : 'bg-zinc-800'
                }`}
              />
              <span>PULSE FREQ: {remainingSeconds < 5 ? 'CRITICAL (8Hz)' : remainingSeconds < 10 ? 'HIGH (4Hz)' : 'ARMED (1Hz)'}</span>
            </div>
          </div>

          {/* RIGHT: C4 Explosive Brick Prop with Bundled Wires */}
          <div className="md:col-span-5 p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400 border-b border-zinc-800 pb-2">
              <span>WIRING HARNESS</span>
              <span>PHASE {Math.min(currentPhaseIndex + 1, phases.length)}/{phases.length}</span>
            </div>

            {/* Render Cut Wires */}
            <div className="space-y-2.5">
              {phases.map((phase, idx) => {
                const colors = getWireColorClass(phase.wireColor);
                const isCurrent = idx === currentPhaseIndex && status === 'running';

                return (
                  <div
                    key={phase.id}
                    className={`flex items-center justify-between p-2 rounded-xl border text-xs font-mono transition-all ${
                      phase.isCut
                        ? 'bg-zinc-950/60 border-zinc-800/60 text-zinc-600 line-through'
                        : isCurrent
                        ? `bg-zinc-950 ${colors.border} ${colors.text} shadow-md`
                        : 'bg-zinc-950/80 border-zinc-850 text-zinc-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {/* Wire Indicator */}
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${colors.bg} ${
                          phase.isCut ? 'opacity-20' : isCurrent ? 'animate-ping' : ''
                        }`}
                      />
                      <span className="truncate max-w-[170px]">{phase.wireName}</span>
                    </div>

                    {phase.isCut ? (
                      <span className="flex items-center gap-1 text-[10px] text-zinc-500 uppercase font-black">
                        <Scissors className="w-3 h-3 text-emerald-500" />
                        SNIPPED
                      </span>
                    ) : isCurrent ? (
                      <span className="text-[10px] uppercase font-black tracking-wider text-rose-400 animate-pulse">
                        LIVE TARGET
                      </span>
                    ) : (
                      <span className="text-[10px] text-zinc-600 uppercase font-bold">ARMED</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CRT TERMINAL: Active Typing Challenge */}
        {status === 'running' && currentPhase && (
          <div className="p-6 rounded-2xl bg-black border-2 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)] flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs font-mono text-emerald-500/70 border-b border-emerald-950 pb-2">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                TERMINAL OVERRIDE // TYPE EXACT PHRASE TO SNIP WIRE
              </span>
              <span>ERRORS: {totalErrors}</span>
            </div>

            {/* Glowing Monospace Target Text */}
            <div className="font-mono text-xl sm:text-2xl md:text-3xl tracking-wide py-2 leading-relaxed break-all">
              {currentPhase.text.split('').map((char, index) => {
                const isTyped = index < charIndex;
                const isCurrent = index === charIndex;

                return (
                  <span
                    key={index}
                    className={`transition-colors ${
                      isTyped
                        ? 'text-emerald-400 font-bold bg-emerald-500/20 rounded px-0.5'
                        : isCurrent
                        ? 'text-foreground bg-primary/40 underline font-black underline-offset-4 animate-pulse'
                        : 'text-zinc-600'
                    }`}
                  >
                    {char}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* READY / IDLE OVERLAY */}
        {status === 'ready' && (
          <div className="text-center py-8 flex flex-col items-center gap-4 bg-zinc-900/60 rounded-2xl border border-zinc-800 p-6">
            <div className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 shadow-lg shadow-rose-950/40">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-foreground">Defusal Protocol Ready</h3>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-md mt-1 leading-relaxed">
                Type the defusal sequences accurately to cut each circuit wire. Every mistake penalizes you with{' '}
                <span className="text-rose-400 font-bold">-{tier.typoPenaltySeconds}s</span> from the countdown.
              </p>
            </div>

            <button
              type="button"
              onClick={startGame}
              className="py-3 px-8 rounded-xl font-black text-sm tracking-wide bg-rose-600 hover:bg-rose-500 text-white shadow-xl shadow-rose-900/40 transition flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>DEFUSE C-4 BOMB</span>
            </button>
          </div>
        )}

        {/* DEFUSED VICTORY OVERLAY */}
        {status === 'defused' && (
          <div className="text-center py-8 flex flex-col items-center gap-4 bg-emerald-950/30 rounded-2xl border border-emerald-500/40 p-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-950/50">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">
                MISSION ACCOMPLISHED // DISARMED
              </span>
              <h3 className="text-3xl font-black text-foreground mt-1">Bomb Has Been Defused!</h3>
              <p className="text-xs text-zinc-400 mt-1">Counter-Terrorists Win. All circuits neutralized.</p>
            </div>

            {/* Scorecard */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-lg mt-2">
              <div className="p-3 rounded-xl bg-black/60 border border-zinc-800">
                <div className="text-[10px] text-zinc-500 uppercase font-mono">Time Left</div>
                <div className="text-lg font-black text-emerald-400 font-mono">{remainingSeconds.toFixed(1)}s</div>
              </div>
              <div className="p-3 rounded-xl bg-black/60 border border-zinc-800">
                <div className="text-[10px] text-zinc-500 uppercase font-mono">Net Speed</div>
                <div className="text-lg font-black text-foreground font-mono">{wpm} WPM</div>
              </div>
              <div className="p-3 rounded-xl bg-black/60 border border-zinc-800">
                <div className="text-[10px] text-zinc-500 uppercase font-mono">Accuracy</div>
                <div className="text-lg font-black text-foreground font-mono">{accuracy}%</div>
              </div>
              <div className="p-3 rounded-xl bg-black/60 border border-zinc-800">
                <div className="text-[10px] text-zinc-500 uppercase font-mono">Score</div>
                <div className="text-lg font-black text-cyan-400 font-mono">{score}</div>
              </div>
            </div>

            <button
              type="button"
              onClick={startGame}
              className="py-3 px-8 mt-2 rounded-xl font-black text-sm tracking-wide bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-xl shadow-emerald-950/40 transition flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Again</span>
            </button>
          </div>
        )}

        {/* DETONATED DEFEAT OVERLAY */}
        {status === 'detonated' && (
          <div className="text-center py-8 flex flex-col items-center gap-4 bg-rose-950/40 rounded-2xl border-2 border-rose-600/60 p-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-rose-600/20 border-2 border-rose-600/50 flex items-center justify-center text-rose-500 shadow-xl shadow-rose-950/60">
              <Skull className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-rose-500">
                PAYLOAD DETONATED
              </span>
              <h3 className="text-3xl font-black text-foreground mt-1">C-4 Detonated!</h3>
              <p className="text-xs text-zinc-400 mt-1">Terrorists Win. You ran out of time.</p>
            </div>

            <div className="flex gap-4 text-xs font-mono text-zinc-400">
              <span>Mistakes Made: <strong className="text-rose-400">{totalErrors}</strong></span>
              <span>Wires Snipped: <strong className="text-zinc-200">{currentPhaseIndex}/{phases.length}</strong></span>
            </div>

            <button
              type="button"
              onClick={startGame}
              className="py-3 px-8 mt-2 rounded-xl font-black text-sm tracking-wide bg-rose-600 hover:bg-rose-500 text-white shadow-xl shadow-rose-950/40 transition flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Defusal</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
