import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTerminalHackerStore } from '../use-terminal-hacker-store';
import { getHackerScript, HACKER_TIERS } from '@/core/arcade/hacker-scripts';

// Mock audio
vi.mock('@/core/audio/hacker-audio', () => ({
  hackerAudio: {
    playKeyClick: vi.fn(),
    playBreachStart: vi.fn(),
    playTypoGlitch: vi.fn(),
    playLineComplete: vi.fn(),
    playIceFreeze: vi.fn(),
    updateTraceAlarm: vi.fn(),
    stopTraceAlarm: vi.fn(),
    playAccessGranted: vi.fn(),
    playLockdown: vi.fn(),
    setEnabled: vi.fn(),
  },
}));

// Mock Dexie persistence
vi.mock('@/local-db', () => ({
  persistArcadeScore: vi.fn().mockResolvedValue(undefined),
  loadArcadeScores: vi.fn().mockResolvedValue([]),
}));

describe('Terminal Hacker Store (useTerminalHackerStore)', () => {
  beforeEach(() => {
    useTerminalHackerStore.getState().resetGame();
  });

  it('initializes with default ready state and cyber specialist tier', () => {
    const state = useTerminalHackerStore.getState();
    expect(state.status).toBe('ready');
    expect(state.difficulty).toBe('cyber_specialist');
    expect(state.tracePercent).toBe(15);
    expect(state.icePicks).toBe(1);
    expect(state.currentLineIndex).toBe(0);
    expect(state.currentCharIndex).toBe(0);
  });

  it('updates difficulty tier and resets configuration', () => {
    const store = useTerminalHackerStore.getState();
    store.setDifficulty('kernel_hacker');

    expect(useTerminalHackerStore.getState().difficulty).toBe('kernel_hacker');

    store.setDifficulty('ghost_operator');
    expect(useTerminalHackerStore.getState().difficulty).toBe('ghost_operator');
  });

  it('starts game with active running state and non-empty script', () => {
    const store = useTerminalHackerStore.getState();
    store.startGame();

    const state = useTerminalHackerStore.getState();
    expect(state.status).toBe('running');
    expect(state.scriptLines.length).toBeGreaterThan(0);
    expect(state.totalKeystrokes).toBe(0);
  });

  it('advances character index and lowers trace on correct keystroke', () => {
    const store = useTerminalHackerStore.getState();
    store.startGame();

    const state = useTerminalHackerStore.getState();
    const firstChar = state.scriptLines[0][0];
    const initialTrace = state.tracePercent;

    store.handleInputKey(firstChar);

    const updated = useTerminalHackerStore.getState();
    expect(updated.currentCharIndex).toBe(1);
    expect(updated.totalKeystrokes).toBe(1);
    expect(updated.combo).toBe(1);
    expect(updated.tracePercent).toBeLessThan(initialTrace);
  });

  it('penalizes trace and resets combo on typo', () => {
    const store = useTerminalHackerStore.getState();
    store.startGame();

    const state = useTerminalHackerStore.getState();
    const initialTrace = state.tracePercent;

    // Send an intentional typo
    store.handleInputKey('§');

    const updated = useTerminalHackerStore.getState();
    expect(updated.totalErrors).toBe(1);
    expect(updated.combo).toBe(0);
    expect(updated.tracePercent).toBeGreaterThan(initialTrace);
  });

  it('activates ICE_PICK to freeze security trace', () => {
    const store = useTerminalHackerStore.getState();
    store.startGame();

    expect(useTerminalHackerStore.getState().icePicks).toBe(1);

    store.triggerIcePick();

    const updated = useTerminalHackerStore.getState();
    expect(updated.icePicks).toBe(0);
    expect(updated.isIceActive).toBe(true);
    expect(updated.iceTimeRemaining).toBeGreaterThan(0);
  });

  it('advances to next line when current line is fully typed', () => {
    const store = useTerminalHackerStore.getState();
    store.startGame();

    const state = useTerminalHackerStore.getState();
    const firstLine = state.scriptLines[0];

    // Type the entire first line
    for (const ch of firstLine) {
      store.handleInputKey(ch);
    }

    const updated = useTerminalHackerStore.getState();
    expect(updated.currentLineIndex).toBe(1);
    expect(updated.currentCharIndex).toBe(0);
    expect(updated.linesCompleted).toBe(1);
  });

  it('wins game when all lines of code script are typed', () => {
    const store = useTerminalHackerStore.getState();
    store.startGame();

    const state = useTerminalHackerStore.getState();

    // Type through all lines in the script
    for (const line of state.scriptLines) {
      for (const ch of line) {
        store.handleInputKey(ch);
      }
    }

    const updated = useTerminalHackerStore.getState();
    expect(updated.status).toBe('won');
    expect(updated.score).toBeGreaterThan(0);
  });

  it('causes game over when trace route hits 100%', () => {
    const store = useTerminalHackerStore.getState();
    store.startGame();

    // Simulate 60 seconds elapsed without typing
    store.tickGameLoop(60.0);

    const updated = useTerminalHackerStore.getState();
    expect(updated.status).toBe('gameover');
    expect(updated.tracePercent).toBe(100);
  });

  it('returns appropriate code scripts for Hebrew layout', () => {
    const hebrewScript = getHackerScript('script_kiddie', 'hebrew');
    expect(hebrewScript.length).toBeGreaterThan(0);
    expect(hebrewScript.some((line) => /[\u0590-\u05FF]/.test(line))).toBe(true);
  });
});

