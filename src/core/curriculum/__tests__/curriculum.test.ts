import { describe, it, expect } from 'vitest';
import {
  CURRICULUM_STAGES,
  getUnlockedKeysUpToStage,
} from '../stages';
import {
  calculateKeyConfidence,
  updateUserKeyProgress,
  getWeakestKey,
} from '../confidence';
import { generateAdaptiveLesson } from '../generator';

describe('Curriculum Stages', () => {
  it('defines sequential learning stages starting with home row', () => {
    expect(CURRICULUM_STAGES.length).toBeGreaterThanOrEqual(6);
    expect(CURRICULUM_STAGES[0].keys).toEqual(['f', 'j', 'd', 'k']);
  });

  it('aggregates unlocked keys cumulatively up to stage', () => {
    const stage1Keys = getUnlockedKeysUpToStage(1);
    expect(stage1Keys).toEqual(['f', 'j', 'd', 'k']);

    const stage2Keys = getUnlockedKeysUpToStage(2);
    expect(stage2Keys).toContain('f');
    expect(stage2Keys).toContain('s');
    expect(stage2Keys.length).toBe(stage1Keys.length + CURRICULUM_STAGES[1].keys.length);
  });
});

describe('Confidence & Weak Key Calculation', () => {
  it('penalizes low sample size', () => {
    const confidence = calculateKeyConfidence(100, 200, 3);
    expect(confidence).toBeLessThanOrEqual(0.2);
  });

  it('rewards high accuracy, fast speed and high volume', () => {
    const confidence = calculateKeyConfidence(98, 180, 50);
    expect(confidence).toBeGreaterThanOrEqual(0.85);
  });

  it('updates UserKeyProgress record with rolling metrics', () => {
    const updated = updateUserKeyProgress(undefined, {
      key: 'f',
      hits: 20,
      misses: 1,
      avgDwellTimeMs: 220,
      errorRate: 4.8,
    });

    expect(updated.key).toBe('f');
    expect(updated.totalAttempts).toBe(21);
    expect(updated.totalErrors).toBe(1);
    expect(updated.confidence).toBeGreaterThan(0.4);
  });

  it('correctly picks the weakest key among active keys', () => {
    const progress = {
      f: {
        key: 'f',
        confidence: 0.85,
        isUnlocked: true,
        rollingWpm: 45,
        rollingAccuracy: 96,
        totalAttempts: 100,
        totalErrors: 4,
        lastPracticedAt: '',
      },
      j: {
        key: 'j',
        confidence: 0.42, // Weakest
        isUnlocked: true,
        rollingWpm: 28,
        rollingAccuracy: 88,
        totalAttempts: 60,
        totalErrors: 7,
        lastPracticedAt: '',
      },
    };

    const weakest = getWeakestKey(['f', 'j'], progress);
    expect(weakest).toBe('j');
  });
});

describe('Adaptive Lesson Generator', () => {
  it('generates text using strictly unlocked keys', () => {
    const activeKeys = ['f', 'j', 'd', 'k'];
    const lesson = generateAdaptiveLesson({
      stageId: 1,
      activeKeys,
      targetFocusKey: 'j',
      wordCount: 10,
      mode: 'adaptive',
    });

    expect(lesson.words).toHaveLength(10);

    // Verify all characters in all words are in activeKeys
    for (const word of lesson.words) {
      for (const char of word) {
        expect(activeKeys).toContain(char);
      }
    }
  });

  it('generates pronounceable words when vowels are unlocked', () => {
    const activeKeys = ['f', 'j', 'd', 'k', 's', 'l', 'a', ';', 'e', 'i'];
    const lesson = generateAdaptiveLesson({
      stageId: 3,
      activeKeys,
      targetFocusKey: 'e',
      wordCount: 15,
      mode: 'adaptive',
    });

    expect(lesson.words).toHaveLength(15);
    // Focus key 'e' should appear in majority of words
    const wordsWithFocusKey = lesson.words.filter((w) => w.includes('e'));
    expect(wordsWithFocusKey.length).toBeGreaterThanOrEqual(10);
  });
});
