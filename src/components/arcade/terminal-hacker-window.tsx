'use client';

import React, { useEffect, useRef } from 'react';
import {
  useTerminalHackerStore,
} from '@/stores/use-terminal-hacker-store';
import { HACKER_TIERS } from '@/core/arcade/hacker-scripts';
import { ShieldAlert, Snowflake, Terminal, Sparkles, Cpu } from 'lucide-react';

export const TerminalHackerWindow: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const {
    scriptLines,
    currentLineIndex,
    currentCharIndex,
    tracePercent,
    icePicks,
    isIceActive,
    iceTimeRemaining,
    screenGlitch,
    difficulty,
    combo,
    status,
    triggerIcePick,
    keyboardLayout,
  } = useTerminalHackerStore();

  const isHebrew = keyboardLayout === 'hebrew';
  const tierConfig = HACKER_TIERS[difficulty];

  // Matrix Rain Background Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth ?? 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight ?? 500);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    const chars = '01ABCDEF{}[]=>;:/*+-%#$!~<>010101';
    const fontSize = 14;
    const columns = Math.floor(width / fontSize);
    const drops: number[] = Array.from({ length: columns }, () => Math.random() * -50);

    const draw = () => {
      ctx.fillStyle = 'rgba(5, 10, 15, 0.12)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = isIceActive ? '#38bdf8' : '#10b981';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillText(text, x, y);

        if (y > height && Math.random() > 0.985) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isIceActive]);

  // Trace danger level
  const isAlarm = tracePercent >= 80;
  const traceColor =
    tracePercent >= 80
      ? 'from-rose-600 to-rose-500'
      : tracePercent >= 50
      ? 'from-amber-500 to-yellow-400'
      : 'from-emerald-500 to-emerald-400';

  return (
    <div
      className={`relative w-full rounded-3xl border-2 border-emerald-500/30 bg-zinc-950/95 overflow-hidden shadow-2xl backdrop-blur-xl select-none flex flex-col justify-between font-mono transition-transform ${
        screenGlitch ? 'animate-shake' : ''
      }`}
    >
      {/* Matrix Falling Rain Background Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
      />

      {/* CRT Scanline & Phosphor Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.06),transparent_75%)]" />
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_4px]" />

      {/* Terminal Window Header Chrome */}
      <div className="relative z-10 flex items-center justify-between px-4 py-2.5 bg-zinc-900/90 border-b border-emerald-500/20 text-xs">
        {/* Linux / Mac Traffic Light Dots */}
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block shadow-[0_0_6px_#f43f5e]" />
          <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block shadow-[0_0_6px_#f59e0b]" />
          <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block shadow-[0_0_6px_#10b981]" />
          <span className="text-zinc-500 text-[11px] ml-2 font-bold flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">root@terminal:</span>
            <span className="text-emerald-400">./breach.sh --target={tierConfig.targetName}</span>
          </span>
        </div>

        {/* Combo Multiplier & ICE Exploit Controls */}
        <div className="flex items-center gap-3">
          {combo > 1 && (
            <span className="text-[11px] font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>{combo}x STREAK</span>
            </span>
          )}

          {/* ICE_PICK Exploit Trigger */}
          <button
            type="button"
            onClick={triggerIcePick}
            disabled={status !== 'running' || icePicks <= 0 || isIceActive}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              isIceActive
                ? 'bg-sky-500/20 border border-sky-400 text-sky-300 shadow-[0_0_12px_#38bdf8] animate-pulse'
                : icePicks > 0
                ? 'bg-sky-950/60 border border-sky-500/40 text-sky-400 hover:bg-sky-900/50'
                : 'bg-zinc-800/40 border border-zinc-700/40 text-zinc-600 cursor-not-allowed'
            }`}
            title="Press TAB to freeze the trace route!"
          >
            <Snowflake className="w-3.5 h-3.5" />
            <span>
              {isIceActive
                ? `FROZEN (${iceTimeRemaining.toFixed(1)}s)`
                : `ICE_PICK [x${icePicks}] (TAB)`}
            </span>
          </button>
        </div>
      </div>

      {/* Security Trace Route Meter Bar */}
      <div className="relative z-10 px-4 sm:px-6 pt-3 pb-2 border-b border-emerald-500/15 bg-zinc-950/60">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isAlarm ? 'bg-rose-500 animate-ping shadow-[0_0_8px_#f43f5e]' : 'bg-emerald-400'
              }`}
            />
            <span
              className={`font-black tracking-wider ${
                isAlarm ? 'text-rose-400 animate-pulse font-extrabold' : 'text-zinc-300'
              }`}
            >
              {isAlarm
                ? 'SECURITY TRACE CRITICAL // LOCKDOWN IMMINENT'
                : 'SECURITY TRACE ROUTE'}
            </span>
          </div>

          <span
            className={`font-black text-sm tracking-wider ${
              isAlarm ? 'text-rose-400' : tracePercent >= 50 ? 'text-amber-400' : 'text-emerald-400'
            }`}
          >
            {tracePercent.toFixed(1)}%
          </span>
        </div>

        {/* Gauge Progress Track */}
        <div className="w-full h-2.5 rounded-full bg-zinc-900 overflow-hidden border border-zinc-800">
          <div
            className={`h-full bg-gradient-to-r ${traceColor} transition-all duration-150 rounded-full ${
              isAlarm ? 'shadow-[0_0_12px_#f43f5e]' : ''
            }`}
            style={{ width: `${Math.min(100, Math.max(2, tracePercent))}%` }}
          />
        </div>
      </div>

      {/* Interactive Code Editor Arena */}
      <div
        dir={isHebrew ? 'rtl' : 'ltr'}
        className="relative z-10 p-4 sm:p-6 min-h-[300px] sm:min-h-[360px] text-xs sm:text-sm font-mono overflow-y-auto leading-relaxed flex flex-col justify-center"
      >
        {scriptLines.map((line, lineIdx) => {
          const isDone = lineIdx < currentLineIndex;
          const isCurrent = lineIdx === currentLineIndex;

          if (isDone) {
            // Already typed line
            return (
              <div key={lineIdx} className="flex items-center gap-3 text-zinc-500 opacity-60">
                <span className="w-6 text-right select-none text-[11px] text-zinc-600 font-bold">
                  {(lineIdx + 1).toString().padStart(2, '0')}
                </span>
                <span className="text-emerald-500 line-through decoration-emerald-500/40">
                  {line}
                </span>
                <span className="text-[10px] text-emerald-400 ml-2">✓ COMPILED</span>
              </div>
            );
          }

          if (isCurrent) {
            // Actively typing line
            const typedPart = line.slice(0, currentCharIndex);
            const currentChar = line[currentCharIndex] ?? '';
            const remainingPart = line.slice(currentCharIndex + 1);

            return (
              <div
                key={lineIdx}
                className="flex items-center gap-3 my-1.5 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/40 shadow-lg shadow-emerald-950/50"
              >
                <span className="w-6 text-right select-none text-[11px] text-emerald-400 font-black">
                  {(lineIdx + 1).toString().padStart(2, '0')}
                </span>
                <div className="flex-1 tracking-wide font-black text-foreground">
                  {/* Typed characters */}
                  <span className="text-emerald-400 bg-emerald-500/20 px-0.5 rounded">
                    {typedPart}
                  </span>
                  {/* Active Blinking Cursor Block */}
                  {currentChar && (
                    <span className="inline-block bg-emerald-400 text-zinc-950 px-1 rounded animate-pulse font-black shadow-[0_0_8px_#34d399]">
                      {currentChar === ' ' ? '␣' : currentChar}
                    </span>
                  )}
                  {/* Remaining Untyped text */}
                  <span className="text-zinc-400">{remainingPart}</span>
                </div>
              </div>
            );
          }

          // Upcoming line
          return (
            <div key={lineIdx} className="flex items-center gap-3 text-zinc-600 opacity-50">
              <span className="w-6 text-right select-none text-[11px] text-zinc-700">
                {(lineIdx + 1).toString().padStart(2, '0')}
              </span>
              <span>{line}</span>
            </div>
          );
        })}
      </div>

      {/* Terminal Footer Console Status */}
      <div className="relative z-10 px-4 py-2 bg-zinc-900/90 border-t border-emerald-500/20 text-[11px] flex items-center justify-between text-zinc-400">
        <span className="flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          <span>STATUS: INFILTRATING BUFFER [OFFSET 0x7FFE]</span>
        </span>
        <span className="text-zinc-500 font-bold hidden sm:inline">
          Tip: Strike keys continuously to keep trace route below 100%
        </span>
      </div>
    </div>
  );
};

