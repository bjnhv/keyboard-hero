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
  expectedKeyDef: KeyDefinition | null;

  // Actions
  initPractice: (stageId?: number) => void;
  handleKeyDown: (key: string, code: string) => void;
  handleKeyUp: (code: string) => void;
  restartLesson: () => void;
  nextLesson: () => void;
  toggleSound: () => void;
  toggleHardcoreMode: () => void;
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
    wordCount: 16,
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
    expectedKeyDef,

    initPractice: (stageId?: number) => {
      const stage = stageId ?? get().activeStageId;
      const keys = getUnlockedKeysUpToStage(stage);
      const focus = getWeakestKey(keys, get().keyProgress) ?? keys[0] ?? 'f';

      const lesson = generateAdaptiveLesson({
        stageId: stage,
        activeKeys: keys,
        targetFocusKey: focus,
        wordCount: 18,
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

      // Check if user qualifies to unlock the next stage:
      // All keys in the current stage must have confidence >= 0.75
      let nextStageId = activeStageId;
      if (currentStage) {
        const allKeysMastered = currentStage.keys.every((k) => {
          const prog = keyProgress[k];
          return prog && prog.confidence >= 0.75;
        });

        if (allKeysMastered && activeStageId < CURRICULUM_STAGES.length) {
          nextStageId = activeStageId + 1;
        }
      }

      get().initPractice(nextStageId);
    },

    setStage: (stageId: number) => {
      get().initPractice(stageId);
    },

    toggleSound: () => {
      const next = !get().soundEnabled;
      audioSynth.setEnabled(next);
      set({ soundEnabled: next });
    },

    toggleHardcoreMode: () => {
      set((s) => ({ hardcoreMode: !s.hardcoreMode }));
    },

    resetProgress: () => {
      const stage = 1;
      const keys = getUnlockedKeysUpToStage(stage);
      const focus = keys[0] ?? 'f';

      const lesson = generateAdaptiveLesson({
        stageId: stage,
        activeKeys: keys,
        targetFocusKey: focus,
        wordCount: 16,
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

