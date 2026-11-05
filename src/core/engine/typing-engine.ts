import {
  ActiveTypingState,
  KeystrokeEvent,
  TypingSessionMetrics,
  TypingSessionStatus,
  WpmHistoryPoint,
} from '@/types/engine';
import { calculateSessionMetrics, createInitialMetrics } from './metrics';

export type EngineMode = 'stop-on-error' | 'free';

export interface TypingEngineOptions {
  /** Mode: 'stop-on-error' (Keybr style) or 'free' (Monkeytype style) */
  mode?: EngineMode;
  /** Whether to sample WPM every second for progress charts */
  sampleIntervalMs?: number;
}

export interface KeystrokeResult {
  isCorrect: boolean;
  isCompleted: boolean;
  currentCharIndex: number;
  expectedChar: string;
  key: string;
  dwellTimeMs: number;
}

export class TypingEngine {
  private targetText: string = '';
  private words: string[] = [];
  private status: TypingSessionStatus = 'idle';
  private currentCharIndex: number = 0;
  private currentWordIndex: number = 0;
  private typedInput: string = '';
  private keystrokes: KeystrokeEvent[] = [];
  private startTime: number | null = null;
  private endTime: number | null = null;
  private pausedTimeAccumulator: number = 0;
  private lastPauseTimestamp: number | null = null;
  private lastKeystrokeTimestamp: number | null = null;
  private wpmHistory: WpmHistoryPoint[] = [];
  private lastSampleSecond: number = 0;
  private mode: EngineMode;

  private onStateChangeListeners: Array<(state: ActiveTypingState) => void> = [];
  private onCompleteListeners: Array<(metrics: TypingSessionMetrics) => void> = [];

  constructor(targetText: string = '', options: TypingEngineOptions = {}) {
    this.mode = options.mode ?? 'stop-on-error';
    if (targetText) {
      this.loadText(targetText);
    }
  }

  /**
   * Initializes the engine with a new exercise text.
   */
  public loadText(text: string): void {
    this.targetText = text;
    this.words = text.trim().length > 0 ? text.split(/\s+/) : [];
    this.reset();
  }

  /**
   * Resets the typing session to idle.
   */
  public reset(): void {
    this.status = 'idle';
    this.currentCharIndex = 0;
    this.currentWordIndex = 0;
    this.typedInput = '';
    this.keystrokes = [];
    this.startTime = null;
    this.endTime = null;
    this.pausedTimeAccumulator = 0;
    this.lastPauseTimestamp = null;
    this.lastKeystrokeTimestamp = null;
    this.wpmHistory = [];
    this.lastSampleSecond = 0;

    this.notifyStateChange();
  }

  /**
   * Primary input handler: processes physical or synthetic keystrokes.
   */
  public processKeystroke(
    key: string,
    code: string = '',
    customTimestamp?: number
  ): KeystrokeResult | null {
    // Ignore non-typing control keys
    if (this.isIgnoredModifierKey(key)) {
      return null;
    }

    if (this.status === 'completed') {
      return null;
    }

    const now = customTimestamp ?? performance.now();

    // Start session on first valid keystroke
    if (this.status === 'idle') {
      this.status = 'running';
      this.startTime = now;
      this.lastKeystrokeTimestamp = now;
    }

    // Handle Backspace
    if (key === 'Backspace') {
      return this.handleBackspace(now);
    }

    // Must be a single printable character (letter, digit, punctuation, space)
    if (key.length !== 1) {
      return null;
    }

    const expectedChar = this.targetText[this.currentCharIndex] ?? '';
    const isCorrect = key === expectedChar;

    const dwellTimeMs = this.lastKeystrokeTimestamp
      ? Math.max(0, now - this.lastKeystrokeTimestamp)
      : 0;
    this.lastKeystrokeTimestamp = now;

    // Record the keystroke event
    const event: KeystrokeEvent = {
      key,
      code,
      timestamp: now,
      expected: expectedChar,
      isCorrect,
      dwellTimeMs,
    };
    this.keystrokes.push(event);

    // Update cursor and typed input
    if (this.mode === 'stop-on-error') {
      if (isCorrect) {
        this.typedInput += key;
        this.currentCharIndex++;
        this.updateWordIndex();
      }
      // If incorrect in 'stop-on-error' mode, cursor does not advance;
      // the user must strike the correct key to proceed.
    } else {
      // 'free' mode: advance regardless of mistake
      this.typedInput += key;
      this.currentCharIndex++;
      this.updateWordIndex();
    }

    // Sample timeline point if a full second has elapsed
    this.sampleHistoryPoint(now);

    // Check completion condition
    const isCompleted = this.currentCharIndex >= this.targetText.length;
    if (isCompleted) {
      this.completeSession(now);
    } else {
      this.notifyStateChange();
    }

    return {
      isCorrect,
      isCompleted,
      currentCharIndex: this.currentCharIndex,
      expectedChar,
      key,
      dwellTimeMs,
    };
  }

  /**
   * Handles backspace navigation.
   */
  private handleBackspace(now: number): KeystrokeResult | null {
    if (this.currentCharIndex === 0) {
      return null;
    }

    this.currentCharIndex--;
    this.typedInput = this.typedInput.slice(0, -1);
    this.updateWordIndex();

    const expectedChar = this.targetText[this.currentCharIndex] ?? '';
    const dwellTimeMs = this.lastKeystrokeTimestamp
      ? Math.max(0, now - this.lastKeystrokeTimestamp)
      : 0;
    this.lastKeystrokeTimestamp = now;

    this.notifyStateChange();

    return {
      isCorrect: true,
      isCompleted: false,
      currentCharIndex: this.currentCharIndex,
      expectedChar,
      key: 'Backspace',
      dwellTimeMs,
    };
  }

  /**
   * Computes the current active word index.
   */
  private updateWordIndex(): void {
    if (this.currentCharIndex === 0) {
      this.currentWordIndex = 0;
      return;
    }
    const textUpToCursor = this.targetText.slice(0, this.currentCharIndex);
    this.currentWordIndex = textUpToCursor.split(/\s+/).length - 1;
  }

  /**
   * Finishes the typing session.
   */
  private completeSession(now: number): void {
    this.status = 'completed';
    this.endTime = now;

    // Final sample point
    this.sampleHistoryPoint(now, true);

    const finalMetrics = this.getMetrics();
    this.notifyStateChange();
    this.notifyComplete(finalMetrics);
  }

  /**
   * Samples a WPM data point along the timeline for charts.
   */
  private sampleHistoryPoint(now: number, force: boolean = false): void {
    if (!this.startTime) return;

    const elapsedSeconds = Math.floor(
      (now - this.startTime - this.pausedTimeAccumulator) / 1000
    );

    if (force || elapsedSeconds > this.lastSampleSecond) {
      this.lastSampleSecond = elapsedSeconds;
      const metrics = this.getMetrics(now);
      this.wpmHistory.push({
        second: elapsedSeconds,
        wpm: metrics.wpm,
        rawWpm: metrics.rawWpm,
        errors: metrics.errorCount,
      });
    }
  }

  /**
   * Calculates total elapsed active duration in milliseconds (excluding pauses).
   */
  public getElapsedTimeMs(currentTimestamp?: number): number {
    if (!this.startTime) return 0;
    const end =
      this.endTime ??
      currentTimestamp ??
      (this.lastKeystrokeTimestamp
        ? Math.max(performance.now(), this.lastKeystrokeTimestamp)
        : performance.now());
    const pauseDiff =
      this.status === 'paused' && this.lastPauseTimestamp
        ? end - this.lastPauseTimestamp
        : 0;
    return Math.max(0, end - this.startTime - this.pausedTimeAccumulator - pauseDiff);
  }

  /**
   * Retrieves current snapshot of typing session metrics.
   */
  public getMetrics(currentTimestamp?: number): TypingSessionMetrics {
    const elapsed = this.getElapsedTimeMs(currentTimestamp);
    const uncorrectedErrors = Math.max(
      0,
      this.targetText.slice(0, this.currentCharIndex).length - this.typedInput.length
    );

    return calculateSessionMetrics(
      this.keystrokes,
      elapsed,
      uncorrectedErrors,
      this.wpmHistory
    );
  }

  /**
   * Retrieves the full active state object.
   */
  public getState(currentTimestamp?: number): ActiveTypingState {
    return {
      status: this.status,
      targetText: this.targetText,
      words: this.words,
      currentWordIndex: this.currentWordIndex,
      currentCharIndex: this.currentCharIndex,
      typedInput: this.typedInput,
      keystrokes: [...this.keystrokes],
      startTime: this.startTime,
      endTime: this.endTime,
      liveMetrics: this.getMetrics(currentTimestamp),
    };
  }

  public pause(): void {
    if (this.status === 'running') {
      this.status = 'paused';
      this.lastPauseTimestamp = performance.now();
      this.notifyStateChange();
    }
  }

  public resume(): void {
    if (this.status === 'paused' && this.lastPauseTimestamp) {
      this.pausedTimeAccumulator += performance.now() - this.lastPauseTimestamp;
      this.lastPauseTimestamp = null;
      this.status = 'running';
      this.notifyStateChange();
    }
  }

  public onStateChange(listener: (state: ActiveTypingState) => void): () => void {
    this.onStateChangeListeners.push(listener);
    return () => {
      this.onStateChangeListeners = this.onStateChangeListeners.filter(
        (l) => l !== listener
      );
    };
  }

  public onComplete(listener: (metrics: TypingSessionMetrics) => void): () => void {
    this.onCompleteListeners.push(listener);
    return () => {
      this.onCompleteListeners = this.onCompleteListeners.filter(
        (l) => l !== listener
      );
    };
  }

  private notifyStateChange(): void {
    const state = this.getState();
    for (const listener of this.onStateChangeListeners) {
      listener(state);
    }
  }

  private notifyComplete(metrics: TypingSessionMetrics): void {
    for (const listener of this.onCompleteListeners) {
      listener(metrics);
    }
  }

  private isIgnoredModifierKey(key: string): boolean {
    return [
      'Shift',
      'Control',
      'Alt',
      'Meta',
      'CapsLock',
      'Tab',
      'Escape',
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'Enter',
      'Home',
      'End',
      'PageUp',
      'PageDown',
      'Insert',
      'F1',
      'F2',
      'F3',
      'F4',
      'F5',
      'F6',
      'F7',
      'F8',
      'F9',
      'F10',
      'F11',
      'F12',
    ].includes(key);
  }
}
