import { create } from 'zustand';
import {
  HackerTier,
  HACKER_TIERS,
  getHackerScript,
} from '@/core/arcade/hacker-scripts';
import { hackerAudio } from '@/core/audio/hacker-audio';
import { KeyboardLayoutType } from '@/types/keyboard';
import { persistArcadeScore } from '@/local-db';

export type HackerGameStatus = 'ready' | 'running' | 'won' | 'gameover';

export interface TerminalHackerState {
  status: HackerGameStatus;
  difficulty: HackerTier;
  keyboardLayout: KeyboardLayoutType;

  // Code Infiltration Progress
  scriptLines: string[];
  currentLineIndex: number;
  currentCharIndex: number;
  linesCompleted: number;

  // Trace Route Security Meter (0 - 100%)
  tracePercent: number;
  icePicks: number;
  isIceActive: boolean;
  iceTimeRemaining: number;

  // Visual feedback
  screenGlitch: boolean;
  soundEnabled: boolean;

  // Metrics
  score: number;
  totalKeystrokes: number;
  totalErrors: number;
  combo: number;
  maxCombo: number;
  startTime: number;
  elapsedSeconds: number;

  // Actions
  setDifficulty: (tier: HackerTier) => void;
  setLayout: (layout: KeyboardLayoutType) => void;
  toggleSound: () => void;
  startGame: () => void;
  resetGame: () => void;
  triggerIcePick: () => void;
  handleInputKey: (key: string) => void;
  tickGameLoop: (deltaSeconds: number) => void;
}

export const useTerminalHackerStore = create<TerminalHackerState>((set, get) => ({
  status: 'ready',
  difficulty: 'cyber_specialist',
  keyboardLayout: 'qwerty',

  scriptLines: [],
  currentLineIndex: 0,
  currentCharIndex: 0,
  linesCompleted: 0,

  tracePercent: 15,
  icePicks: 1,
  isIceActive: false,
  iceTimeRemaining: 0,

  screenGlitch: false,
  soundEnabled: true,

  score: 0,
  totalKeystrokes: 0,
  totalErrors: 0,
  combo: 0,
  maxCombo: 0,
  startTime: 0,
  elapsedSeconds: 0,

  setDifficulty: (difficulty) => {
    set({ difficulty });
    if (get().status === 'ready') {
      get().resetGame();
    }
  },

  setLayout: (layout) => {
    set({ keyboardLayout: layout });
    if (get().status === 'ready') {
      get().resetGame();
    }
  },

  toggleSound: () => {
    const next = !get().soundEnabled;
    hackerAudio.setEnabled(next);
    set({ soundEnabled: next });
  },

  startGame: () => {
    const { difficulty, keyboardLayout } = get();
    const script = getHackerScript(difficulty, keyboardLayout);
    const now = Date.now();

    hackerAudio.playBreachStart();

    set({
      status: 'running',
      scriptLines: script,
      currentLineIndex: 0,
      currentCharIndex: 0,
      linesCompleted: 0,
      tracePercent: 15,
      icePicks: 1,
      isIceActive: false,
      iceTimeRemaining: 0,
      screenGlitch: false,
      score: 0,
      totalKeystrokes: 0,
      totalErrors: 0,
      combo: 0,
      maxCombo: 0,
      startTime: now,
      elapsedSeconds: 0,
    });
  },

  resetGame: () => {
    hackerAudio.stopTraceAlarm();
    const { difficulty, keyboardLayout } = get();
    const script = getHackerScript(difficulty, keyboardLayout);

    set({
      status: 'ready',
      scriptLines: script,
      currentLineIndex: 0,
      currentCharIndex: 0,
      linesCompleted: 0,
      tracePercent: 15,
      icePicks: 1,
      isIceActive: false,
      iceTimeRemaining: 0,
      screenGlitch: false,
      score: 0,
      totalKeystrokes: 0,
      totalErrors: 0,
      combo: 0,
      maxCombo: 0,
      startTime: 0,
      elapsedSeconds: 0,
    });
  },

  triggerIcePick: () => {
    const { icePicks, isIceActive, difficulty, status } = get();
    if (status !== 'running' || icePicks <= 0 || isIceActive) return;

    const tierConfig = HACKER_TIERS[difficulty];
    hackerAudio.playIceFreeze();

    set({
      icePicks: icePicks - 1,
      isIceActive: true,
      iceTimeRemaining: tierConfig.iceDurationSeconds,
      tracePercent: Math.max(0, get().tracePercent - 15),
    });
  },

  handleInputKey: (key: string) => {
    const {
      status,
      scriptLines,
      currentLineIndex,
      currentCharIndex,
      difficulty,
      tracePercent,
      combo,
      maxCombo,
      icePicks,
      totalKeystrokes,
      totalErrors,
      linesCompleted,
      startTime,
    } = get();

    if (status !== 'running') return;

    const tierConfig = HACKER_TIERS[difficulty];
    const currentLine = scriptLines[currentLineIndex];
    if (!currentLine) return;

    const expectedChar = currentLine[currentCharIndex];

    // Correct keystroke
    if (key === expectedChar) {
      hackerAudio.playKeyClick(key === ' ');

      const nextCharIndex = currentCharIndex + 1;
      const nextKeystrokes = totalKeystrokes + 1;
      const nextCombo = combo + 1;
      const nextMaxCombo = Math.max(maxCombo, nextCombo);

      // Reward: Drop trace route
      let newTrace = Math.max(0, tracePercent - tierConfig.charRewardTrace);
      let newIcePicks = icePicks;

      // Bonus ICE_PICK every 30 combo streak
      if (nextCombo > 0 && nextCombo % 30 === 0 && icePicks < 3) {
        newIcePicks += 1;
        newTrace = Math.max(0, newTrace - tierConfig.comboRewardTrace);
      }

      // Check if line completed
      if (nextCharIndex >= currentLine.length) {
        hackerAudio.playLineComplete();
        const nextLineIndex = currentLineIndex + 1;
        const nextLinesCompleted = linesCompleted + 1;

        // Check if entire script completed -> VICTORY!
        if (nextLineIndex >= scriptLines.length) {
          hackerAudio.playAccessGranted();
          const finalScore =
            nextLinesCompleted * 500 +
            Math.round((100 - newTrace) * 20) +
            nextMaxCombo * 10;

          const now = Date.now();
          const elapsedMin = Math.max(0.1, (now - startTime) / 60000);
          const wpm = Math.round(nextKeystrokes / 5 / elapsedMin);
          const accuracy =
            nextKeystrokes > 0
              ? Math.round(((nextKeystrokes - totalErrors) / nextKeystrokes) * 100)
              : 100;

          persistArcadeScore({
            id: `hacker-${now}`,
            gameId: 'hacker',
            difficulty,
            score: finalScore,
            wpm,
            accuracy,
            achievedAt: new Date().toISOString(),
          }).catch(() => {});

          set({
            status: 'won',
            currentLineIndex: nextLineIndex,
            currentCharIndex: 0,
            linesCompleted: nextLinesCompleted,
            tracePercent: newTrace,
            score: finalScore,
            totalKeystrokes: nextKeystrokes,
            combo: nextCombo,
            maxCombo: nextMaxCombo,
            icePicks: newIcePicks,
          });
          return;
        }

        // Advance to next code line
        set({
          currentLineIndex: nextLineIndex,
          currentCharIndex: 0,
          linesCompleted: nextLinesCompleted,
          tracePercent: newTrace,
          totalKeystrokes: nextKeystrokes,
          combo: nextCombo,
          maxCombo: nextMaxCombo,
          icePicks: newIcePicks,
        });
        return;
      }

      set({
        currentCharIndex: nextCharIndex,
        tracePercent: newTrace,
        totalKeystrokes: nextKeystrokes,
        combo: nextCombo,
        maxCombo: nextMaxCombo,
        icePicks: newIcePicks,
      });
      return;
    }

    // Typo / Error
    hackerAudio.playTypoGlitch();
    const penaltyTrace = Math.min(100, tracePercent + tierConfig.typoPenaltyTrace);

    set({
      totalErrors: totalErrors + 1,
      combo: 0,
      tracePercent: penaltyTrace,
      screenGlitch: true,
    });
    setTimeout(() => set({ screenGlitch: false }), 150);

    // If typo immediately caused trace to hit 100%
    if (penaltyTrace >= 100) {
      hackerAudio.playLockdown();
      set({ status: 'gameover' });
    }
  },

  tickGameLoop: (deltaSeconds: number) => {
    const {
      status,
      difficulty,
      tracePercent,
      isIceActive,
      iceTimeRemaining,
      totalKeystrokes,
      totalErrors,
      startTime,
      score,
    } = get();

    if (status !== 'running') return;

    const tierConfig = HACKER_TIERS[difficulty];
    let newIceActive = isIceActive;
    let newIceRemaining = iceTimeRemaining;
    let newTrace = tracePercent;

    if (isIceActive) {
      newIceRemaining = iceTimeRemaining - deltaSeconds;
      if (newIceRemaining <= 0) {
        newIceActive = false;
        newIceRemaining = 0;
      }
    } else {
      // Trace route increases over time
      newTrace = Math.min(100, tracePercent + deltaSeconds * tierConfig.baseTraceRatePerSec);
    }

    // Trigger warning siren if trace >= 80%
    hackerAudio.updateTraceAlarm(newTrace);

    // Check if security trace reached 100% -> Game Over
    if (newTrace >= 100) {
      hackerAudio.playLockdown();
      const now = Date.now();
      const elapsedMin = Math.max(0.1, (now - startTime) / 60000);
      const wpm = Math.round(totalKeystrokes / 5 / elapsedMin);
      const accuracy =
        totalKeystrokes > 0
          ? Math.round(((totalKeystrokes - totalErrors) / totalKeystrokes) * 100)
          : 100;

      persistArcadeScore({
        id: `hacker-${now}`,
        gameId: 'hacker',
        difficulty,
        score,
        wpm,
        accuracy,
        achievedAt: new Date().toISOString(),
      }).catch(() => {});

      set({
        status: 'gameover',
        tracePercent: 100,
        isIceActive: false,
        iceTimeRemaining: 0,
      });
      return;
    }

    set({
      tracePercent: newTrace,
      isIceActive: newIceActive,
      iceTimeRemaining: newIceRemaining,
      elapsedSeconds: (Date.now() - startTime) / 1000,
    });
  },
}));

