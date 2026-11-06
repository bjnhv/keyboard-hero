/**
 * User Profile, Settings & Preferences Interfaces
 */

import { KeyboardLayoutType } from './keyboard';

export type SoundTheme = 'cherry-blue' | 'cherry-brown' | 'cherry-red' | 'typewriter' | 'bubble';
export type UiFontSize = 'standard' | 'large' | 'huge';

export interface UserSettings {
  /** UI Theme */
  theme: 'dark' | 'light' | 'system';
  /** UI Font Sizing Scale (Standard, Large for 2K/1440p, Huge for distant screens) */
  uiFontSize?: UiFontSize;
  /** Sound enabled toggle */
  soundEnabled: boolean;
  /** Volume level between 0.0 and 1.0 */
  soundVolume: number;
  /** Mechanical sound profile */
  soundTheme: SoundTheme;
  /** Active keyboard layout */
  keyboardLayout: KeyboardLayoutType;
  /** Display the interactive virtual keyboard on screen */
  showVirtualKeyboard: boolean;
  /** Display hands and finger placement guide */
  showHandsGuide: boolean;
  /** Hardcore mode: hides visual keyboard & future text to force blind muscle memory */
  hardcoreMode: boolean;
  /** Target WPM goal */
  targetWpm: number;
  /** Target Accuracy goal percentage */
  targetAccuracy: number;
}

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  avatarUrl?: string;
  createdAt: string;
  /** Current active stage in the guided curriculum */
  currentStageId: number;
  /** Unlocked character keys */
  unlockedKeys: string[];
  /** Consecutive daily streak count */
  streakDays: number;
  /** Last practice date (YYYY-MM-DD) for streak calculation */
  lastActiveDate: string;
  /** Total all-time practice time in seconds */
  totalPracticeSeconds: number;
  /** Personal best net WPM */
  bestWpm: number;
  /** Average all-time net WPM */
  avgWpm: number;
}

