import { describe, it, expect, beforeEach } from 'vitest';
import { useRedlineStore, REDLINE_TIERS } from '../use-redline-store';

describe('Redline RPM Store', () => {
  beforeEach(() => {
    useRedlineStore.getState().resetGame();
  });

  it('initializes with default ready state and sport difficulty', () => {
    const state = useRedlineStore.getState();
    expect(state.status).toBe('ready');
    expect(state.difficulty).toBe('sport');
    expect(state.charIndex).toBe(0);
    expect(state.holdSeconds).toBe(0);
    expect(state.isRedlining).toBe(false);
  });

  it('switches difficulty tiers and updates targets', () => {
    const store = useRedlineStore.getState();
    store.setDifficulty('hypercar');

    const updated = useRedlineStore.getState();
    expect(updated.difficulty).toBe('hypercar');
    expect(REDLINE_TIERS.hypercar.targetWpm).toBe(100);
    expect(REDLINE_TIERS.hypercar.requiredHoldSeconds).toBe(25);
  });

  it('advances character index on correct key press', () => {
    const store = useRedlineStore.getState();
    const firstChar = store.textStream[0];

    store.handleInputKey(firstChar);

    const updated = useRedlineStore.getState();
    expect(updated.status).toBe('running');
    expect(updated.charIndex).toBe(1);
    expect(updated.totalKeystrokes).toBe(1);
    expect(updated.totalErrors).toBe(0);
  });

  it('records errors without advancing charIndex on mistyped key', () => {
    const store = useRedlineStore.getState();
    const firstChar = store.textStream[0];
    const incorrectChar = firstChar === 'x' ? 'y' : 'x';

    store.handleInputKey(incorrectChar);

    const updated = useRedlineStore.getState();
    expect(updated.charIndex).toBe(0);
    expect(updated.totalErrors).toBe(1);
  });
});

