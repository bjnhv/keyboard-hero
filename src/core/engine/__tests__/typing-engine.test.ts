import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TypingEngine } from '../typing-engine';
import { calculateConsistency, calculateSessionMetrics } from '../metrics';

describe('TypingEngine', () => {
  let engine: TypingEngine;
  const sampleText = 'fj fj';

  beforeEach(() => {
    engine = new TypingEngine(sampleText, { mode: 'stop-on-error' });
  });

  it('initializes in idle state with 0 metrics', () => {
    const state = engine.getState();
    expect(state.status).toBe('idle');
    expect(state.currentCharIndex).toBe(0);
    expect(state.currentWordIndex).toBe(0);
    expect(state.typedInput).toBe('');
    expect(state.keystrokes).toHaveLength(0);
    expect(state.liveMetrics.wpm).toBe(0);
    expect(state.liveMetrics.accuracy).toBe(100);
  });

  it('starts session on the first valid keystroke', () => {
    const result = engine.processKeystroke('f', 'KeyF', 1000);
    expect(result).not.toBeNull();
    expect(result?.isCorrect).toBe(true);
    expect(result?.currentCharIndex).toBe(1);

    const state = engine.getState();
    expect(state.status).toBe('running');
    expect(state.startTime).toBe(1000);
  });

  it('ignores modifier keys without penalizing metrics', () => {
    expect(engine.processKeystroke('Shift', 'ShiftLeft', 1000)).toBeNull();
    expect(engine.processKeystroke('CapsLock', 'CapsLock', 1050)).toBeNull();
    expect(engine.processKeystroke('Control', 'ControlLeft', 1100)).toBeNull();

    const state = engine.getState();
    expect(state.status).toBe('idle');
    expect(state.keystrokes).toHaveLength(0);
  });

  it('handles mistakes in stop-on-error mode without advancing cursor', () => {
    engine.processKeystroke('f', 'KeyF', 1000); // correct 'f'
    expect(engine.getState().currentCharIndex).toBe(1); // expects 'j'

    // Type incorrect key 'k'
    const mistakeResult = engine.processKeystroke('k', 'KeyK', 1200);
    expect(mistakeResult?.isCorrect).toBe(false);
    expect(mistakeResult?.expectedChar).toBe('j');
    expect(mistakeResult?.key).toBe('k');

    // Cursor MUST remain at index 1 in stop-on-error mode
    expect(engine.getState().currentCharIndex).toBe(1);
    expect(engine.getState().liveMetrics.errorCount).toBe(1);
    expect(engine.getState().liveMetrics.correctCount).toBe(1);

    // Now type correct 'j'
    const correctResult = engine.processKeystroke('j', 'KeyJ', 1400);
    expect(correctResult?.isCorrect).toBe(true);
    expect(engine.getState().currentCharIndex).toBe(2);
  });

  it('tracks per-key dwell times and accuracy', () => {
    engine.processKeystroke('f', 'KeyF', 1000);
    engine.processKeystroke('j', 'KeyJ', 1200); // dwell: 200ms
    engine.processKeystroke(' ', 'Space', 1500); // dwell: 300ms

    const metrics = engine.getMetrics(1600);
    expect(metrics.keyMetrics['j']).toBeDefined();
    expect(metrics.keyMetrics['j'].hits).toBe(1);
    expect(metrics.keyMetrics['j'].misses).toBe(0);
    expect(metrics.keyMetrics['j'].avgDwellTimeMs).toBe(200);
  });

  it('handles backspace correctly', () => {
    engine.processKeystroke('f', 'KeyF', 1000);
    engine.processKeystroke('j', 'KeyJ', 1200);
    expect(engine.getState().currentCharIndex).toBe(2);

    const backspaceResult = engine.processKeystroke('Backspace', 'Backspace', 1300);
    expect(backspaceResult?.key).toBe('Backspace');
    expect(engine.getState().currentCharIndex).toBe(1);
    expect(engine.getState().typedInput).toBe('f');
  });

  it('completes session and invokes onComplete callback on final keystroke', () => {
    const completeSpy = vi.fn();
    engine.onComplete(completeSpy);

    // sampleText: 'fj fj'
    engine.processKeystroke('f', 'KeyF', 1000);
    engine.processKeystroke('j', 'KeyJ', 1200);
    engine.processKeystroke(' ', 'Space', 1400);
    engine.processKeystroke('f', 'KeyF', 1600);
    const lastResult = engine.processKeystroke('j', 'KeyJ', 1800);

    expect(lastResult?.isCompleted).toBe(true);
    expect(engine.getState().status).toBe('completed');
    expect(engine.getState().endTime).toBe(1800);
    expect(completeSpy).toHaveBeenCalledTimes(1);

    const finalMetrics = completeSpy.mock.calls[0][0];
    expect(finalMetrics.accuracy).toBe(100);
    expect(finalMetrics.correctCount).toBe(5);
    expect(finalMetrics.errorCount).toBe(0);
  });

  it('supports free mode where errors advance the cursor', () => {
    const freeEngine = new TypingEngine('abc', { mode: 'free' });
    freeEngine.processKeystroke('a', 'KeyA', 1000); // correct
    freeEngine.processKeystroke('x', 'KeyX', 1200); // incorrect for 'b'

    // In free mode, cursor advances despite error
    expect(freeEngine.getState().currentCharIndex).toBe(2);
    expect(freeEngine.getState().typedInput).toBe('ax');
  });

  it('allows pause and resume', () => {
    engine.processKeystroke('f', 'KeyF', 1000);
    expect(engine.getState().status).toBe('running');

    engine.pause();
    expect(engine.getState().status).toBe('paused');

    engine.resume();
    expect(engine.getState().status).toBe('running');
  });
});

describe('Metrics Calculations', () => {
  it('computes consistency based on dwell time variance', () => {
    // Perfectly uniform dwell times -> high consistency
    const uniformDwells = [200, 200, 200, 200, 200];
    expect(calculateConsistency(uniformDwells)).toBe(100);

    // Highly irregular dwell times -> lower consistency
    const irregularDwells = [50, 800, 100, 1200, 40];
    const consistency = calculateConsistency(irregularDwells);
    expect(consistency).toBeLessThan(80);
    expect(consistency).toBeGreaterThanOrEqual(0);
  });

  it('computes Net WPM and Raw WPM accurately', () => {
    const keystrokes = [
      { key: 'f', code: 'KeyF', timestamp: 1000, expected: 'f', isCorrect: true, dwellTimeMs: 0 },
      { key: 'j', code: 'KeyJ', timestamp: 1200, expected: 'j', isCorrect: true, dwellTimeMs: 200 },
      { key: 'f', code: 'KeyF', timestamp: 1400, expected: 'f', isCorrect: true, dwellTimeMs: 200 },
      { key: 'j', code: 'KeyJ', timestamp: 1600, expected: 'j', isCorrect: true, dwellTimeMs: 200 },
      { key: ' ', code: 'Space', timestamp: 1800, expected: ' ', isCorrect: true, dwellTimeMs: 200 },
    ];
    // 5 keystrokes in 30 seconds (0.5 minute) = 1 word / 0.5 min = 2 WPM
    const metrics = calculateSessionMetrics(keystrokes, 30000, 0);
    expect(metrics.rawWpm).toBe(2);
    expect(metrics.wpm).toBe(2);
    expect(metrics.accuracy).toBe(100);
    expect(metrics.cpm).toBe(10);
  });
});

