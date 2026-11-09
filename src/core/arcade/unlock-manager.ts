import { UserKeyProgress } from '@/types/curriculum';
import { useTypingStore } from '@/stores/use-typing-store';
import { persistSettings, loadSettings } from '@/local-db';
import { useState, useEffect } from 'react';

export const ARCADE_REQUIRED_STAGE = 3;
export const ARCADE_REQUIRED_MASTERED_KEYS = 6;
export const CONFIDENCE_THRESHOLD = 0.7;

export interface ArcadeUnlockStatus {
  isUnlocked: boolean;
  currentStage: number;
  requiredStage: number;
  masteredKeysCount: number;
  requiredKeysCount: number;
  progressPercentage: number;
  unlockReason: 'stage' | 'keys' | 'override' | null;
}

export function checkArcadeUnlock(params: {
  activeStageId: number;
  layoutStages?: Partial<Record<string, number>>;
  keyProgress?: Record<string, UserKeyProgress>;
  arcadeUnlockedOverride?: boolean;
}): ArcadeUnlockStatus {
  const { activeStageId, layoutStages, keyProgress = {}, arcadeUnlockedOverride } = params;

  const maxStageInAnyLayout = Math.max(
    activeStageId,
    ...Object.values(layoutStages ?? {}).filter((v): v is number => typeof v === 'number')
  );

  const masteredKeys = Object.values(keyProgress).filter(
    (prog) => prog && typeof prog.confidence === 'number' && prog.confidence >= CONFIDENCE_THRESHOLD
  ).length;

  if (arcadeUnlockedOverride) {
    return {
      isUnlocked: true,
      currentStage: maxStageInAnyLayout,
      requiredStage: ARCADE_REQUIRED_STAGE,
      masteredKeysCount: masteredKeys,
      requiredKeysCount: ARCADE_REQUIRED_MASTERED_KEYS,
      progressPercentage: 100,
      unlockReason: 'override',
    };
  }

  if (maxStageInAnyLayout >= ARCADE_REQUIRED_STAGE) {
    return {
      isUnlocked: true,
      currentStage: maxStageInAnyLayout,
      requiredStage: ARCADE_REQUIRED_STAGE,
      masteredKeysCount: masteredKeys,
      requiredKeysCount: ARCADE_REQUIRED_MASTERED_KEYS,
      progressPercentage: 100,
      unlockReason: 'stage',
    };
  }

  if (masteredKeys >= ARCADE_REQUIRED_MASTERED_KEYS) {
    return {
      isUnlocked: true,
      currentStage: maxStageInAnyLayout,
      requiredStage: ARCADE_REQUIRED_STAGE,
      masteredKeysCount: masteredKeys,
      requiredKeysCount: ARCADE_REQUIRED_MASTERED_KEYS,
      progressPercentage: 100,
      unlockReason: 'keys',
    };
  }

  const stageProgress = Math.min(1, Math.max(0, (maxStageInAnyLayout - 1) / (ARCADE_REQUIRED_STAGE - 1)));
  const keysProgress = Math.min(1, masteredKeys / ARCADE_REQUIRED_MASTERED_KEYS);
  const overallProgress = Math.round(Math.max(stageProgress, keysProgress) * 100);

  return {
    isUnlocked: false,
    currentStage: maxStageInAnyLayout,
    requiredStage: ARCADE_REQUIRED_STAGE,
    masteredKeysCount: masteredKeys,
    requiredKeysCount: ARCADE_REQUIRED_MASTERED_KEYS,
    progressPercentage: overallProgress,
    unlockReason: null,
  };
}

/**
 * React hook to reactively check arcade unlock status and provide unlock overrides.
 */
export function useArcadeUnlock() {
  const activeStageId = useTypingStore((s) => s.activeStageId);
  const layoutStages = useTypingStore((s) => s.layoutStages);
  const keyProgress = useTypingStore((s) => s.keyProgress);
  const isLoadedFromDb = useTypingStore((s) => s.isLoadedFromDb);
  const loadFromLocalDb = useTypingStore((s) => s.loadFromLocalDb);
  const [overrideUnlocked, setOverrideUnlocked] = useState(false);

  useEffect(() => {
    if (!isLoadedFromDb) {
      loadFromLocalDb().catch(() => { });
    }
  }, [isLoadedFromDb, loadFromLocalDb]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('kh_arcade_override_unlocked');
        if (stored === 'true') {
          setOverrideUnlocked(true);
        }
      } catch { }

      loadSettings()
        .then((settings) => {
          if (settings?.arcadeUnlocked) {
            setOverrideUnlocked(true);
          }
        })
        .catch(() => { });
    }
  }, []);

  const status = checkArcadeUnlock({
    activeStageId,
    layoutStages,
    keyProgress,
    arcadeUnlockedOverride: overrideUnlocked,
  });

  const unlockImmediately = () => {
    setOverrideUnlocked(true);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('kh_arcade_override_unlocked', 'true');
      } catch { }
      persistSettings({ arcadeUnlocked: true }).catch(() => { });
    }
  };

  return {
    ...status,
    unlockImmediately,
  };
}