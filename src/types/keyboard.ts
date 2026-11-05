/**
 * Keyboard Layout, Finger Mappings & Visualizer Interfaces
 */

export type KeyboardLayoutType = 'qwerty' | 'colemak' | 'dvorak' | 'workman';

export type FingerType =
  | 'left-pinky'
  | 'left-ring'
  | 'left-middle'
  | 'left-index'
  | 'thumb'
  | 'right-index'
  | 'right-middle'
  | 'right-ring'
  | 'right-pinky';

export interface KeyDefinition {
  /** Primary character produced by key (e.g. 'a', '1', ';') */
  key: string;
  /** Shifted character (e.g. 'A', '!', ':') */
  shiftedKey?: string;
  /** Visual label displayed on the key cap */
  display: string;
  /** Physical Key code from KeyboardEvent.code (e.g. 'KeyA', 'Digit1', 'Space') */
  code: string;
  /** Finger responsible for striking this key */
  finger: FingerType;
  /** Row index: 0 = Number row, 1 = Top row, 2 = Home row, 3 = Bottom row, 4 = Space row */
  row: number;
  /** Width multiplier relative to standard 1u key (e.g. Backspace = 2.0, Space = 6.25) */
  widthRatio?: number;
  /** Whether this key has a physical tactile bump (e.g. 'f' and 'j' in QWERTY) */
  hasHomingBump?: boolean;
}

export interface KeyboardLayout {
  id: KeyboardLayoutType;
  name: string;
  description: string;
  rows: KeyDefinition[][];
}

export interface KeyHeatmapEntry {
  /** Character key */
  key: string;
  /** Heat value from 0.0 (cold/rare) to 1.0 (hot/frequent errors) */
  heat: number;
  /** Accuracy percentage for this key */
  accuracy: number;
  /** Average response time in milliseconds */
  avgDwellTimeMs: number;
  /** Total keystrokes sampled */
  sampleCount: number;
}

