import { describe, it, expect } from 'vitest';
import {
  checkArcadeUnlock,
  ARCADE_REQUIRED_STAGE,
  ARCADE_REQUIRED_MASTERED_KEYS,
  CONFIDENCE_THRESHOLD,
} from '../unlock-manager';
import { UserKeyProgress } from '@/types/curriculum';

describe('Arcade Unlock Manager (checkArcadeUnlock)', () => {
  it('returns locked when user is at Stage 1 and has no mastered keys', () => {
    const status = checkArcadeUnlock({
      activeStageId: 1,
      layoutStages: { qwerty: 1 },
      keyProgress: {},
    });

    expect(status.isUnlocked).toBe(false);
    expect(status.currentStage).toBe(1);
    expect(status.requiredStage).toBe(ARCADE_REQUIRED_STAGE);
    expect(status.masteredKeysCount).toBe(0);
    expect(status.requiredKeysCount).toBe(ARCADE_REQUIRED_MASTERED_KEYS);
    expect(status.progressPercentage).toBe(0);
    expect(status.unlockReason).toBeNull();
  });

  it('calculates progress percentage based on stage progress when stage is 2', () => {
    const status = checkArcadeUnlock({
      activeStageId: 2,
      layoutStages: { qwerty: 2 },
      keyProgress: {},
    });

    // (Stage 2 - 1) / (Stage 3 - 1) = 1/2 = 50%
    expect(status.isUnlocked).toBe(false);
    expect(status.progressPercentage).toBe(50);
  });

  it('unlocks when activeStageId reaches Stage 3', () => {
    const status = checkArcadeUnlock({
      activeStageId: 3,
      layoutStages: { qwerty: 3 },
      keyProgress: {},
    });

    expect(status.isUnlocked).toBe(true);
    expect(status.unlockReason).toBe('stage');
    expect(status.progressPercentage).toBe(100);
  });

  it('unlocks if ANY layout has reached Stage 3 even if activeStageId is 1', () => {
    const status = checkArcadeUnlock({
      activeStageId: 1,
      layoutStages: { qwerty: 1, dvorak: 4, hebrew: 1 },
      keyProgress: {},
    });

    expect(status.isUnlocked).toBe(true);
    expect(status.currentStage).toBe(4);
    expect(status.unlockReason).toBe('stage');
  });

  it('unlocks if 6 or more keys are mastered with confidence >= 0.7 even at Stage 1', () => {
    const mockKeyProgress: Record<string, UserKeyProgress> = {
      f: { key: 'f', attempts: 50, hits: 45, misses: 5, accuracy: 0.9, avgLatencyMs: 120, confidence: 0.85, lastPracticedAt: '' },
      j: { key: 'j', attempts: 50, hits: 46, misses: 4, accuracy: 0.92, avgLatencyMs: 110, confidence: 0.88, lastPracticedAt: '' },
      d: { key: 'd', attempts: 40, hits: 36, misses: 4, accuracy: 0.9, avgLatencyMs: 130, confidence: 0.8, lastPracticedAt: '' },
      k: { key: 'k', attempts: 40, hits: 35, misses: 5, accuracy: 0.88, avgLatencyMs: 140, confidence: 0.75, lastPracticedAt: '' },
      s: { key: 's', attempts: 30, hits: 27, misses: 3, accuracy: 0.9, avgLatencyMs: 125, confidence: 0.78, lastPracticedAt: '' },
      l: { key: 'l', attempts: 30, hits: 26, misses: 4, accuracy: 0.87, avgLatencyMs: 135, confidence: 0.72, lastPracticedAt: '' },
    };

    const status = checkArcadeUnlock({
      activeStageId: 1,
      keyProgress: mockKeyProgress,
    });

    expect(status.isUnlocked).toBe(true);
    expect(status.masteredKeysCount).toBe(6);
    expect(status.unlockReason).toBe('keys');
  });

  it('does not count keys with confidence below threshold towards unlock', () => {
    const mockKeyProgress: Record<string, UserKeyProgress> = {
      f: { key: 'f', attempts: 50, hits: 45, misses: 5, accuracy: 0.9, avgLatencyMs: 120, confidence: 0.85, lastPracticedAt: '' },
      j: { key: 'j', attempts: 50, hits: 46, misses: 4, accuracy: 0.92, avgLatencyMs: 110, confidence: 0.88, lastPracticedAt: '' },
      d: { key: 'd', attempts: 40, hits: 36, misses: 4, accuracy: 0.9, avgLatencyMs: 130, confidence: 0.65, lastPracticedAt: '' }, // < 0.7
      k: { key: 'k', attempts: 40, hits: 35, misses: 5, accuracy: 0.88, avgLatencyMs: 140, confidence: 0.69, lastPracticedAt: '' }, // < 0.7
    };

    const status = checkArcadeUnlock({
      activeStageId: 1,
      keyProgress: mockKeyProgress,
    });

    expect(status.isUnlocked).toBe(false);
    expect(status.masteredKeysCount).toBe(2);
  });

  it('unlocks immediately when manual override is provided', () => {
    const status = checkArcadeUnlock({
      activeStageId: 1,
      keyProgress: {},
      arcadeUnlockedOverride: true,
    });

    expect(status.isUnlocked).toBe(true);
    expect(status.unlockReason).toBe('override');
    expect(status.progressPercentage).toBe(100);
  });
});

