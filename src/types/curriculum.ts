/**
 * Adaptive Curriculum & Learning Progression Interfaces
 * Modeled after the Keybr progressive letter unlock algorithm.
 */

export interface KeyStage {
  /** Sequential stage level (e.g. 1, 2, 3...) */
  id: number;
  /** Human-readable label (e.g., "Home Row Anchors", "Left Hand Reaches") */
  name: string;
  /** Keys introduced in this stage */
  keys: string[];
  /** Minimum WPM required on all stage keys to advance */
  targetWpm: number;
  /** Minimum accuracy percentage required to advance (e.g. 95) */
  targetAccuracy: number;
  /** Description or instruction for this stage */
  description?: string;
}

export interface UserKeyProgress {
  /** The character key (e.g. 'e', 't', 'a') */
  key: string;
  /** Whether the user has unlocked this key in the curriculum */
  isUnlocked: boolean;
  /** Confidence score between 0.0 (unlearned) and 1.0 (mastered) */
  confidence: number;
  /** Rolling average WPM when striking this key */
  rollingWpm: number;
  /** Rolling accuracy percentage when striking this key */
  rollingAccuracy: number;
  /** Total lifetime attempts on this key */
  totalAttempts: number;
  /** Total lifetime errors made on this key */
  totalErrors: number;
  /** ISO date string of last practice */
  lastPracticedAt: string;
}

export type LessonMode = 'adaptive' | 'words' | 'custom' | 'code' | 'quote';

export interface LessonConfig {
  /** Current progression stage identifier */
  stageId: number;
  /** Subset of unlocked keys allowed in this lesson */
  activeKeys: string[];
  /** Primary focus key to practice (usually the user's lowest confidence key) */
  targetFocusKey?: string;
  /** Desired length in words (default ~25-40 words) */
  wordCount: number;
  /** Mode of the lesson */
  mode: LessonMode;
  /** Optional custom text provided by the user */
  customText?: string;
}

export interface GeneratedLesson {
  /** Identifier for this generated exercise */
  id: string;
  /** The full text to type */
  text: string;
  /** Words array split for easy display and index tracking */
  words: string[];
  /** Keys that were actively emphasized in this text */
  focusKeys: string[];
  /** Target stage */
  stageId: number;
  /** Mode of generation */
  mode: LessonMode;
}

