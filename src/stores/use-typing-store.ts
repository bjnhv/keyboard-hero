import { create } from 'zustand';
import { ActiveTypingState, TypingSessionMetrics } from '@/types/engine';
import { UserKeyProgress } from '@/types/curriculum';
import { KeyDefinition } from '@/types/keyboard';
import { TypingEngine } from '@/core/engine';
import {
  CURRICULUM_STAGES,
  getCurriculumStages,
  getUnlockedKeysUpToStage,
  getWeakestKey,
  updateUserKeyProgress,
  generateAdaptiveLesson,
} from '@/core/curriculum';
import {
  findKeyDefinition,
  SUPPORTED_LAYOUTS,
  QWERTY_LAYOUT,
} from '@/core/layouts';
import { KeyboardLayoutType } from '@/types/keyboard';
import { audioSynth } from '@/core/audio/mechanical-synth';
import { LocalSessionRecord } from '@/types/sync';
import { UiFontSize } from '@/types/user';
import { useAuthStore } from './use-auth-store';
import {
  persistSession,
  persistKeyProgress,
  persistSettings,
  loadSettings,
  loadKeyProgressMap,
  clearLocalProgress,
  syncManager,
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
  keyboardLayout: KeyboardLayoutType;
  layoutStages: Partial<Record<KeyboardLayoutType, number>>;
  activeKeys: string[];
  targetFocusKey: string | null;
  physicallyPressedCode: string | null;
  completedMetrics: TypingSessionMetrics | null;
  keyProgress: Record<string, UserKeyProgress>;
  soundEnabled: boolean;
  hardcoreMode: boolean;
  showHandsGuide: boolean;
  uiFontSize: UiFontSize;
  expectedKeyDef: KeyDefinition | null;
  isLoadedFromDb: boolean;
  stageNotification: StageNotification | null;

  // Actions
  loadFromLocalDb: (force?: boolean) => Promise<void>;
  setLayout: (layout: KeyboardLayoutType) => void;
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
  cycleFontSize: () => void;
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
    keyboardLayout: 'qwerty' as KeyboardLayoutType,
    layoutStages: { qwerty: initialStage },
    activeKeys: initialKeys,
    targetFocusKey: initialFocus,
    physicallyPressedCode: null,
    completedMetrics: null,
    keyProgress: {},
    soundEnabled: true,
    hardcoreMode: false,
    showHandsGuide: true,
    uiFontSize: 'standard',
    expectedKeyDef,
    isLoadedFromDb: false,
    stageNotification: null,

    dismissStageNotification: () => {
      set({ stageNotification: null });
    },

    setLayout: (layout: KeyboardLayoutType) => {
      const currentLayoutStages = get().layoutStages;
      const targetStage = currentLayoutStages[layout] ?? 1;
      const stages = getCurriculumStages(layout);
      const safeStage = Math.min(targetStage, stages.length);
      const keys = getUnlockedKeysUpToStage(safeStage, layout);
      const focus = getWeakestKey(keys, get().keyProgress) ?? keys[0] ?? (layout === 'hebrew' ? 'כ' : 'f');

      const lesson = generateAdaptiveLesson({
        stageId: safeStage,
        activeKeys: keys,
        targetFocusKey: focus,
        wordCount: LESSON_WORD_COUNT,
        mode: 'adaptive',
      });

      const { engine } = get();
      engine.loadText(lesson.text);
      const state = engine.getState();
      const expectedChar = state.targetText[0] ?? ' ';
      const layoutDef = SUPPORTED_LAYOUTS[layout] ?? QWERTY_LAYOUT;

      const updatedStages = { ...currentLayoutStages, [layout]: safeStage };

      if (typeof window !== 'undefined') {
        persistSettings({
          keyboardLayout: layout,
          activeStageId: safeStage,
          layoutStages: updatedStages,
        }).catch(() => { });
      }

      set({
        keyboardLayout: layout,
        activeStageId: safeStage,
        layoutStages: updatedStages,
        activeKeys: keys,
        targetFocusKey: focus,
        completedMetrics: null,
        activeState: state,
        expectedKeyDef: findKeyDefinition(expectedChar, layoutDef) ?? null,
      });
    },

    loadFromLocalDb: async (force = false) => {
      if (typeof window === 'undefined' || (get().isLoadedFromDb && !force)) return;
      try {
        const settings = await loadSettings();
        const progressMap = await loadKeyProgressMap();

        const layout = settings.keyboardLayout ?? 'qwerty';
        const layoutStages = settings.layoutStages ?? { [layout]: settings.activeStageId || 1 };
        const stage = layoutStages[layout] ?? settings.activeStageId ?? 1;
        const keys = getUnlockedKeysUpToStage(stage, layout);
        const focus = getWeakestKey(keys, progressMap) ?? keys[0] ?? (layout === 'hebrew' ? 'כ' : 'f');

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
        const layoutDef = SUPPORTED_LAYOUTS[layout] ?? QWERTY_LAYOUT;

        set({
          isLoadedFromDb: true,
          keyboardLayout: layout,
          layoutStages,
          activeStageId: stage,
          activeKeys: keys,
          targetFocusKey: focus,
          keyProgress: progressMap,
          soundEnabled: settings.soundEnabled,
          hardcoreMode: settings.hardcoreMode,
          showHandsGuide: settings.showHandsGuide ?? true,
          uiFontSize: settings.uiFontSize ?? 'standard',
          activeState: state,
          expectedKeyDef: findKeyDefinition(expectedChar, layoutDef) ?? null,
        });
      } catch (err) {
        console.error('Failed to load local DB state:', err);
        set({ isLoadedFromDb: true });
      }
    },

    initPractice: (stageId?: number) => {
      const layout = get().keyboardLayout;
      const stage = stageId ?? get().activeStageId;
      const keys = getUnlockedKeysUpToStage(stage, layout);
      const focus = getWeakestKey(keys, get().keyProgress) ?? keys[0] ?? (layout === 'hebrew' ? 'כ' : 'f');

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
      const layoutDef = SUPPORTED_LAYOUTS[layout] ?? QWERTY_LAYOUT;

      set({
        activeStageId: stage,
        activeKeys: keys,
        targetFocusKey: focus,
        completedMetrics: null,
        activeState: state,
        expectedKeyDef: findKeyDefinition(expectedChar, layoutDef) ?? null,
      });
    },

    handleKeyDown: (key: string, code: string) => {
      const { engine, soundEnabled, completedMetrics, keyboardLayout } = get();
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

      const layoutDef = SUPPORTED_LAYOUTS[keyboardLayout] ?? QWERTY_LAYOUT;
      const newState = engine.getState();
      const nextChar = newState.targetText[newState.currentCharIndex] ?? '';
      const nextKeyDef = findKeyDefinition(nextChar, layoutDef) ?? null;

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
          const authUser = useAuthStore.getState().user;
          const sessionRecord: LocalSessionRecord = {
            id: `session-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            userId: authUser?.id,
            stageId: get().activeStageId,
            metrics,
            completedAt: new Date().toISOString(),
            syncStatus: 'pending',
            syncRetries: 0,
            createdAt: Date.now(),
          };
          persistSession(sessionRecord)
            .then(() => syncManager.triggerSync())
            .catch((err) =>
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
      const { engine, keyboardLayout } = get();
      engine.reset();
      const state = engine.getState();
      const expectedChar = state.targetText[0] ?? ' ';
      const layoutDef = SUPPORTED_LAYOUTS[keyboardLayout] ?? QWERTY_LAYOUT;

      set({
        activeState: state,
        completedMetrics: null,
        expectedKeyDef: findKeyDefinition(expectedChar, layoutDef) ?? null,
      });
    },

    nextLesson: () => {
      const { activeStageId, keyProgress, keyboardLayout, layoutStages } = get();
      const stages = getCurriculumStages(keyboardLayout);
      const currentStage = stages.find((s) => s.id === activeStageId);

      let nextStageId = activeStageId;
      let notification: StageNotification | null = null;

      if (currentStage) {
        const unmastered = currentStage.keys.filter((k) => {
          const prog = keyProgress[k];
          return !prog || prog.confidence < STAGE_ADVANCEMENT_THRESHOLD;
        });

          if (unmastered.length === 0 && activeStageId < stages.length) {
            nextStageId = activeStageId + 1;
            const nextStageObj = stages.find((s) => s.id === nextStageId);
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

        const updatedStages = { ...layoutStages, [keyboardLayout]: nextStageId };

        if (typeof window !== 'undefined' && nextStageId !== activeStageId) {
          persistSettings({
            keyboardLayout,
            activeStageId: nextStageId,
            layoutStages: updatedStages,
          }).catch(() => { });
        }

        set({ layoutStages: updatedStages });
        get().initPractice(nextStageId);
        set({ stageNotification: notification });
      },

      advanceToNextStage: () => {
        const { activeStageId, keyProgress, keyboardLayout, layoutStages } = get();
        const stages = getCurriculumStages(keyboardLayout);
        const currentStage = stages.find((s) => s.id === activeStageId);

        if (!currentStage || activeStageId >= stages.length) return;

        const isMastered = currentStage.keys.every((k) => {
          const prog = keyProgress[k];
          return prog && prog.confidence >= STAGE_ADVANCEMENT_THRESHOLD;
        });

        if (!isMastered) return;

        const nextStageId = activeStageId + 1;
        const nextStageObj = stages.find((s) => s.id === nextStageId);
        const updatedStages = { ...layoutStages, [keyboardLayout]: nextStageId };

        if (typeof window !== 'undefined') {
          persistSettings({
            keyboardLayout,
            activeStageId: nextStageId,
            layoutStages: updatedStages,
          }).catch(() => { });
        }

        set({ layoutStages: updatedStages });
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
            const { keyboardLayout, layoutStages } = get();
            const updatedStages = { ...layoutStages, [keyboardLayout]: stageId };

            if (typeof window !== 'undefined') {
              persistSettings({
                keyboardLayout,
                activeStageId: stageId,
                layoutStages: updatedStages,
              }).catch(() => { });
            }

            set({ layoutStages: updatedStages });
            get().initPractice(stageId);
          },

            toggleSound: () => {
              const next = !get().soundEnabled;
              audioSynth.setEnabled(next);
              if (typeof window !== 'undefined') {
                persistSettings({ soundEnabled: next }).catch(() => { });
              }
              set({ soundEnabled: next });
            },

              toggleHardcoreMode: () => {
                const next = !get().hardcoreMode;
                if (typeof window !== 'undefined') {
                  persistSettings({ hardcoreMode: next }).catch(() => { });
                }
                set((s) => ({ hardcoreMode: !s.hardcoreMode }));
              },

                toggleHandsGuide: () => {
                  const next = !get().showHandsGuide;
                  if (typeof window !== 'undefined') {
                    persistSettings({ showHandsGuide: next }).catch(() => { });
                  }
                  set({ showHandsGuide: next });
                },

                  cycleFontSize: () => {
                    const current = get().uiFontSize;
                    const next: UiFontSize =
                      current === 'standard' ? 'large' : current === 'large' ? 'huge' : 'standard';
                    if (typeof window !== 'undefined') {
                      persistSettings({ uiFontSize: next }).catch(() => { });
                    }
                    set({ uiFontSize: next });
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

if (typeof window !== 'undefined') {
  syncManager.addListener(() => {
    // Only reload if the engine is currently idle or completed to avoid disrupting an active practice run
    const state = useTypingStore.getState().activeState;
    if (state.status === 'idle' || state.status === 'completed') {
      useTypingStore.getState().loadFromLocalDb(true);
    }
  });
}


