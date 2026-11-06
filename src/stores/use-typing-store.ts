import { create } from 'zustand';
import { ActiveTypingState, TypingSessionMetrics } from '@/types/engine';
import { UserKeyProgress } from '@/types/curriculum';
import { KeyDefinition } from '@/types/keyboard';
import { TypingEngine } from '@/core/engine';
import {
  CURRICULUM_STAGES,
  getUnlockedKeysUpToStage,
  getWeakestKey,
  updateUserKeyProgress,
  generateAdaptiveLesson,
} from '@/core/curriculum';
import { findKeyDefinition, QWERTY_LAYOUT } from '@/core/layouts';
import { audioSynth } from '@/core/audio/mechanical-synth';
import { LocalSessionRecord } from '@/types/sync';
import {
  persistSession,
  persistKeyProgress,
  persistSettings,
  loadSettings,
  loadKeyProgressMap,
  clearLocalProgress,
} from '@/local-db';

/**
 * ---------------------------------------------------------------------------
 * Practice & Progression Calibration Settings
 * ---------------------------------------------------------------------------
 * Easily toggle these constants between rapid testing and production values.
 */
export const LESSON_WORD_COUNT = 5; // Production standard: 18
export const STAGE_ADVANCEMENT_THRESHOLD = 0.7; // Production standard: 0.70

export interface StageNotification {
  title: string;
  message: string;
  type: 'advance' | 'practice';
}

interface TypingStoreState {
  engine: TypingEngine;
  activeState: ActiveTypingState;
  activeStageId: number;
  activeKeys: string[];
  targetFocusKey: string | null;
  physicallyPressedCode: string | null;
  completedMetrics: TypingSessionMetrics | null;
  keyProgress: Record<string, UserKeyProgress>;
  soundEnabled: boolean;
  hardcoreMode: boolean;
  showHandsGuide: boolean;
  expectedKeyDef: KeyDefinition | null;
  isLoadedFromDb: boolean;
  stageNotification: StageNotification | null;

  // Actions
  loadFromLocalDb: () => Promise<void>;
  initPractice: (stageId?: number) => void;
  handleKeyDown: (key: string, code: string) => void;
  handleKeyUp: (code: string) => void;
  restartLesson: () => void;
  nextLesson: () => void;
  advanceToNextStage: () => void;
  practiceNextExercise: () => void;
  dismissStageNotification: () => void;
  toggleSound: () => void;
  toggleHardcoreMode: () => void;
  toggleHandsGuide: () => void;
  setStage: (stageId: number) => void;
  resetProgress: () => void;
}

export const useTypingStore = create<TypingStoreState>((set, get) => {
  const initialStage = 1;
  const initialKeys = getUnlockedKeysUpToStage(initialStage);
  const initialFocus = initialKeys[0] ?? 'f';

  const initialLesson = generateAdaptiveLesson({
    stageId: initialStage,
    activeKeys: initialKeys,
    targetFocusKey: initialFocus,
    wordCount: LESSON_WORD_COUNT,
    mode: 'adaptive',
  });

  const engine = new TypingEngine(initialLesson.text, { mode: 'stop-on-error' });
  const activeState = engine.getState();
  const initialExpectedChar = activeState.targetText[0] ?? ' ';
  const expectedKeyDef = findKeyDefinition(initialExpectedChar, QWERTY_LAYOUT) ?? null;

  return {
    engine,
    activeState,
    activeStageId: initialStage,
    activeKeys: initialKeys,
    targetFocusKey: initialFocus,
    physicallyPressedCode: null,
    completedMetrics: null,
    keyProgress: {},
    soundEnabled: true,
    hardcoreMode: false,
    showHandsGuide: true,
    expectedKeyDef,
    isLoadedFromDb: false,
    stageNotification: null,

    dismissStageNotification: () => {
      set({ stageNotification: null });
    },

    loadFromLocalDb: async () => {
      if (typeof window === 'undefined' || get().isLoadedFromDb) return;
      try {
        const settings = await loadSettings();
        const progressMap = await loadKeyProgressMap();

        const stage = settings.activeStageId || 1;
        const keys = getUnlockedKeysUpToStage(stage);
        const focus = getWeakestKey(keys, progressMap) ?? keys[0] ?? 'f';

        const lesson = generateAdaptiveLesson({
          stageId: stage,
          activeKeys: keys,
          targetFocusKey: focus,
          wordCount: LESSON_WORD_COUNT,
          mode: 'adaptive',
        });

        const { engine } = get();
        engine.loadText(lesson.text);
        const state = engine.getState();
        const expectedChar = state.targetText[0] ?? ' ';

        set({
          isLoadedFromDb: true,
          activeStageId: stage,
          activeKeys: keys,
          targetFocusKey: focus,
          keyProgress: progressMap,
          soundEnabled: settings.soundEnabled,
          hardcoreMode: settings.hardcoreMode,
          showHandsGuide: settings.showHandsGuide ?? true,
          activeState: state,
          expectedKeyDef: findKeyDefinition(expectedChar, QWERTY_LAYOUT) ?? null,
        });
      } catch (err) {
        console.error('Failed to load local DB state:', err);
        set({ isLoadedFromDb: true });
      }
    },

    initPractice: (stageId?: number) => {
      const stage = stageId ?? get().activeStageId;
      const keys = getUnlockedKeysUpToStage(stage);
      const focus = getWeakestKey(keys, get().keyProgress) ?? keys[0] ?? 'f';

      const lesson = generateAdaptiveLesson({
        stageId: stage,
        activeKeys: keys,
        targetFocusKey: focus,
        wordCount: LESSON_WORD_COUNT,
        mode: 'adaptive',
      });

      const { engine } = get();
      engine.loadText(lesson.text);
      const state = engine.getState();
      const expectedChar = state.targetText[0] ?? ' ';

      set({
        activeStageId: stage,
        activeKeys: keys,
        targetFocusKey: focus,
        completedMetrics: null,
        activeState: state,
        expectedKeyDef: findKeyDefinition(expectedChar, QWERTY_LAYOUT) ?? null,
      });
    },

    handleKeyDown: (key: string, code: string) => {
      const { engine, soundEnabled, completedMetrics } = get();
      if (completedMetrics) return;

      set({ physicallyPressedCode: code });

      const result = engine.processKeystroke(key, code);
      if (!result) return;

      if (soundEnabled) {
        if (result.isCorrect) {
          audioSynth.playKeyClick(key === ' ');
        } else {
          audioSynth.playErrorThud();
        }
      }

      const newState = engine.getState();
      const nextChar = newState.targetText[newState.currentCharIndex] ?? '';
      const nextKeyDef = findKeyDefinition(nextChar, QWERTY_LAYOUT) ?? null;

      if (result.isCompleted) {
        // Exercise finished!
        const metrics = engine.getMetrics();
        const updatedProgress = { ...get().keyProgress };

        // Update confidence for all exercised keys
        for (const [keyChar, keyMetric] of Object.entries(metrics.keyMetrics)) {
          updatedProgress[keyChar] = updateUserKeyProgress(
            updatedProgress[keyChar],
            keyMetric
          );
        }

        // Persist session and key progress in background to IndexedDB
        if (typeof window !== 'undefined') {
          const sessionRecord: LocalSessionRecord = {
            id: `session-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            stageId: get().activeStageId,
            metrics,
            completedAt: new Date().toISOString(),
            syncStatus: 'pending',
            syncRetries: 0,
            createdAt: Date.now(),
          };
          persistSession(sessionRecord).catch((err) =>
            console.error('Failed to persist session to IndexedDB:', err)
          );
          persistKeyProgress(Object.values(updatedProgress)).catch((err) =>
            console.error('Failed to persist key progress to IndexedDB:', err)
          );
        }

        set({
          activeState: newState,
          completedMetrics: metrics,
          keyProgress: updatedProgress,
          expectedKeyDef: null,
        });
      } else {
        set({
          activeState: newState,
          expectedKeyDef: nextKeyDef,
        });
      }
    },

    handleKeyUp: (code: string) => {
      if (get().physicallyPressedCode === code) {
        set({ physicallyPressedCode: null });
      }
    },

    restartLesson: () => {
      const { engine } = get();
      engine.reset();
      const state = engine.getState();
      const expectedChar = state.targetText[0] ?? ' ';

      set({
        activeState: state,
        completedMetrics: null,
        expectedKeyDef: findKeyDefinition(expectedChar, QWERTY_LAYOUT) ?? null,
      });
    },

    nextLesson: () => {
      const { activeStageId, keyProgress } = get();
      const currentStage = CURRICULUM_STAGES.find((s) => s.id === activeStageId);

      let nextStageId = activeStageId;
      let notification: StageNotification | null = null;

      if (currentStage) {
        const unmastered = currentStage.keys.filter((k) => {
          const prog = keyProgress[k];
          return !prog || prog.confidence < STAGE_ADVANCEMENT_THRESHOLD;
        });

        if (unmastered.length === 0 && activeStageId < CURRICULUM_STAGES.length) {
          nextStageId = activeStageId + 1;
          const nextStageObj = CURRICULUM_STAGES.find((s) => s.id === nextStageId);
          notification = {
            title: `🎉 Stage ${nextStageId} Unlocked!`,
            message: `Congratulations! You mastered all keys in Stage ${activeStageId}. Now practicing: ${nextStageObj?.name ?? ''}.`,
            type: 'advance',
          };
        } else {
          const keysNeedingWork = unmastered.map((k) => {
            const conf = Math.round((keyProgress[k]?.confidence ?? 0) * 100);
            return `${k.toUpperCase()} (${conf}%)`;
          });
          notification = {
            title: `Stage ${activeStageId} in Progress`,
            message: `Need ${Math.round(STAGE_ADVANCEMENT_THRESHOLD * 100)}% confidence across all stage keys to unlock Stage ${activeStageId + 1}. Still working on: ${keysNeedingWork.join(', ')}.`,
            type: 'practice',
          };
        }
      }

      if (typeof window !== 'undefined' && nextStageId !== activeStageId) {
        persistSettings({ activeStageId: nextStageId }).catch(() => {});
      }

      get().initPractice(nextStageId);
      set({ stageNotification: notification });
    },

    advanceToNextStage: () => {
      const { activeStageId, keyProgress } = get();
      const currentStage = CURRICULUM_STAGES.find((s) => s.id === activeStageId);

      if (!currentStage || activeStageId >= CURRICULUM_STAGES.length) return;

      const isMastered = currentStage.keys.every((k) => {
        const prog = keyProgress[k];
        return prog && prog.confidence >= STAGE_ADVANCEMENT_THRESHOLD;
      });

      if (!isMastered) return;

      const nextStageId = activeStageId + 1;
      const nextStageObj = CURRICULUM_STAGES.find((s) => s.id === nextStageId);

      if (typeof window !== 'undefined') {
        persistSettings({ activeStageId: nextStageId }).catch(() => {});
      }

      get().initPractice(nextStageId);
      set({
        stageNotification: {
          title: `🎉 Stage ${nextStageId} Unlocked!`,
          message: `Congratulations! You mastered all keys in Stage ${activeStageId}. Now practicing: ${nextStageObj?.name ?? ''}.`,
          type: 'advance',
        },
      });
    },

    practiceNextExercise: () => {
      get().initPractice(get().activeStageId);
    },

    setStage: (stageId: number) => {
      if (typeof window !== 'undefined') {
        persistSettings({ activeStageId: stageId }).catch(() => {});
      }
      get().initPractice(stageId);
    },

    toggleSound: () => {
      const next = !get().soundEnabled;
      audioSynth.setEnabled(next);
      if (typeof window !== 'undefined') {
        persistSettings({ soundEnabled: next }).catch(() => {});
      }
      set({ soundEnabled: next });
    },

    toggleHardcoreMode: () => {
      const next = !get().hardcoreMode;
      if (typeof window !== 'undefined') {
        persistSettings({ hardcoreMode: next }).catch(() => {});
      }
      set((s) => ({ hardcoreMode: !s.hardcoreMode }));
    },

    toggleHandsGuide: () => {
      const next = !get().showHandsGuide;
      if (typeof window !== 'undefined') {
        persistSettings({ showHandsGuide: next }).catch(() => {});
      }
      set({ showHandsGuide: next });
    },

    resetProgress: () => {
      if (typeof window !== 'undefined') {
        clearLocalProgress().catch((err) =>
          console.error('Failed to clear local DB:', err)
        );
      }

      const stage = 1;
      const keys = getUnlockedKeysUpToStage(stage);
      const focus = keys[0] ?? 'f';

      const lesson = generateAdaptiveLesson({
        stageId: stage,
        activeKeys: keys,
        targetFocusKey: focus,
        wordCount: LESSON_WORD_COUNT,
        mode: 'adaptive',
      });

      const { engine } = get();
      engine.loadText(lesson.text);
      const state = engine.getState();
      const expectedChar = state.targetText[0] ?? ' ';

      set({
        activeStageId: stage,
        activeKeys: keys,
        targetFocusKey: focus,
        completedMetrics: null,
        keyProgress: {},
        activeState: state,
        expectedKeyDef: findKeyDefinition(expectedChar, QWERTY_LAYOUT) ?? null,
      });
    },
  };
});

