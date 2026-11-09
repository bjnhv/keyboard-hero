import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useBombDefusalStore, DEFUSAL_TIERS } from '../use-bomb-defusal-store';

// Mock CS Audio engine to prevent web audio/speech calls in node
vi.mock('@/core/audio/cs-audio', () => ({
  csAudio: {
    playBombPlanted: vi.fn(),
    playC4Beep: vi.fn(),
    playWireCut: vi.fn(),
    playTypoPenaltyZap: vi.fn(),
    playExplosion: vi.fn(),
    playDefusedVictory: vi.fn(),
    setEnabled: vi.fn(),
    preload: vi.fn(),
  },
}));

// Mock persistArcadeScore
vi.mock('@/local-db', () => ({
  persistArcadeScore: vi.fn().mockResolvedValue(undefined),
  loadArcadeScores: vi.fn().mockResolvedValue([]),
}));

describe('Bomb Defusal Protocol Store', () => {
  beforeEach(() => {
    useBombDefusalStore.getState().resetGame();
  });

  it('initializes with ready status and default tier settings', () => {
    const state = useBombDefusalStore.getState();
    expect(state.status).toBe('ready');
    expect(state.difficulty).toBe('agent');
    expect(state.remainingSeconds).toBe(DEFUSAL_TIERS.agent.startingSeconds);
    expect(state.phases.length).toBe(DEFUSAL_TIERS.agent.wireCount);
    expect(state.currentPhaseIndex).toBe(0);
    expect(state.charIndex).toBe(0);
    expect(state.totalErrors).toBe(0);
  });

  it('switches difficulty tiers and reconfigures phases and countdown', () => {
    const store = useBombDefusalStore.getState();
    store.setDifficulty('impossible');

    const updated = useBombDefusalStore.getState();
    expect(updated.difficulty).toBe('impossible');
    expect(updated.remainingSeconds).toBe(DEFUSAL_TIERS.impossible.startingSeconds);
    expect(updated.phases.length).toBe(DEFUSAL_TIERS.impossible.wireCount);
    expect(DEFUSAL_TIERS.impossible.typoPenaltySeconds).toBe(5.0);
  });

  it('starts the game and initializes running state', () => {
    const store = useBombDefusalStore.getState();
    store.startGame();

    const state = useBombDefusalStore.getState();
    expect(state.status).toBe('running');
    expect(state.currentPhaseIndex).toBe(0);
    expect(state.charIndex).toBe(0);
  });

  it('advances character index on correct key press', () => {
    const store = useBombDefusalStore.getState();
    store.startGame();

    const state = useBombDefusalStore.getState();
    const currentPhase = state.phases[state.currentPhaseIndex];
    const targetChar = currentPhase.text[0];

    store.handleInputKey(targetChar);

    const updated = useBombDefusalStore.getState();
    expect(updated.charIndex).toBe(1);
    expect(updated.totalKeystrokes).toBe(1);
    expect(updated.totalErrors).toBe(0);
  });

  it('applies severe time deduction penalty on typo mistake', () => {
    const store = useBombDefusalStore.getState();
    store.setDifficulty('agent');
    store.startGame();

    const initialTime = useBombDefusalStore.getState().remainingSeconds;
    const penalty = DEFUSAL_TIERS.agent.typoPenaltySeconds;

    const state = useBombDefusalStore.getState();
    const currentPhase = state.phases[state.currentPhaseIndex];
    const targetChar = currentPhase.text[0];
    const wrongChar = targetChar === 'z' ? 'a' : 'z';

    store.handleInputKey(wrongChar);

    const updated = useBombDefusalStore.getState();
    expect(updated.charIndex).toBe(0);
    expect(updated.totalErrors).toBe(1);
    expect(updated.remainingSeconds).toBeCloseTo(initialTime - penalty, 1);
    expect(updated.penaltyFlash).toBe(penalty);
    expect(updated.screenShake).toBe(true);
  });

  it('cuts wire and moves to next phase when full phrase is completed', () => {
    const store = useBombDefusalStore.getState();
    store.setDifficulty('recruit');
    store.startGame();

    let state = useBombDefusalStore.getState();
    const phase0Text = state.phases[0].text;

    // Type the entire first phase correctly
    for (const char of phase0Text) {
      store.handleInputKey(char);
    }

    state = useBombDefusalStore.getState();
    expect(state.phases[0].isCut).toBe(true);
    expect(state.currentPhaseIndex).toBe(1);
    expect(state.charIndex).toBe(0);
  });

  it('triggers bomb defused victory when all phases are completed', () => {
    const store = useBombDefusalStore.getState();
    store.setDifficulty('recruit'); // 3 wires
    store.startGame();

    let state = useBombDefusalStore.getState();
    const totalPhases = state.phases.length;

    for (let p = 0; p < totalPhases; p++) {
      state = useBombDefusalStore.getState();
      const text = state.phases[state.currentPhaseIndex].text;
      for (const char of text) {
        store.handleInputKey(char);
      }
    }

    state = useBombDefusalStore.getState();
    expect(state.status).toBe('defused');
    expect(state.phases.every((phase) => phase.isCut)).toBe(true);
    expect(state.score).toBeGreaterThan(0);
  });

  it('detonates the bomb when countdown reaches zero', () => {
    const store = useBombDefusalStore.getState();
    store.startGame();

    // Advance tick beyond remaining seconds
    store.tick(100.0);

    const state = useBombDefusalStore.getState();
    expect(state.status).toBe('detonated');
    expect(state.remainingSeconds).toBe(0);
  });
});
