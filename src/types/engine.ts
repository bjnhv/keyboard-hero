/**
 * Core Typing Engine Interfaces
 * Defines keystroke tracking, live session metrics, calculations, and engine states.
 */

export type TypingSessionStatus = 'idle' | 'running' | 'paused' | 'completed';

export interface KeystrokeEvent {
  /** The key string produced by the event (e.g. 'a', 'F', 'Backspace', ' ') */
  key: string;
  /** Physical keyboard code (e.g. 'KeyA', 'Space') */
  code: string;
  /** High precision timestamp using performance.now() */
  timestamp: number;
  /** Target character that was expected at this position */
  expected: string;
  /** Whether the keystroke matched the expected character */
  isCorrect: boolean;
  /** Time in milliseconds since the immediately preceding keystroke */
  dwellTimeMs: number;
}

export interface KeyAccuracyMetric {
  /** Specific character/key identifier (e.g. 'f', 'j', ';') */
  key: string;
  /** Total number of times this key was pressed correctly */
  hits: number;
  /** Total number of mistakes made when this key was expected */
  misses: number;
  /** Average dwell time in milliseconds before pressing this key */
  avgDwellTimeMs: number;
  /** Error rate percentage (0 - 100) */
  errorRate: number;
}

export interface WpmHistoryPoint {
  /** Timestamp in seconds from session start */
  second: number;
  /** Net Words Per Minute at this sample point */
  wpm: number;
  /** Raw Words Per Minute (including errors) */
  rawWpm: number;
  /** Error count accumulated up to this point */
  errors: number;
}

export interface TypingSessionMetrics {
  /** Standard net Words Per Minute: ((correctChars / 5) - uncorrectedErrors) / minutes */
  wpm: number;
  /** Gross Words Per Minute: (totalKeystrokes / 5) / minutes */
  rawWpm: number;
  /** Characters Per Minute */
  cpm: number;
  /** Accuracy percentage (0.0 - 100.0) */
  accuracy: number;
  /** Consistency percentage based on variance of keystroke intervals */
  consistency: number;
  /** Total elapsed time in milliseconds */
  durationMs: number;
  /** Total valid keystrokes */
  correctCount: number;
  /** Total error keystrokes */
  errorCount: number;
  /** Total keystrokes typed (correct + errors) */
  totalKeystrokes: number;
  /** Timeline of speed samples across the session */
  wpmHistory: WpmHistoryPoint[];
  /** Detailed breakdown per individual key */
  keyMetrics: Record<string, KeyAccuracyMetric>;
}

export interface ActiveTypingState {
  status: TypingSessionStatus;
  /** The full text to type */
  targetText: string;
  /** Words array split from targetText */
  words: string[];
  /** Current word index user is typing */
  currentWordIndex: number;
  /** Current character index within targetText */
  currentCharIndex: number;
  /** Characters typed so far by the user */
  typedInput: string;
  /** Detailed log of each keystroke */
  keystrokes: KeystrokeEvent[];
  /** Start timestamp using performance.now() */
  startTime: number | null;
  /** End timestamp using performance.now() */
  endTime: number | null;
  /** Live computed metrics */
  liveMetrics: TypingSessionMetrics;
}

