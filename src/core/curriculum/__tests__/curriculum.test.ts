import { describe, it, expect } from 'vitest';
import {
  CURRICULUM_STAGES,
  DVORAK_STAGES,
  COLEMAK_STAGES,
  HEBREW_STAGES,
  getCurriculumStages,
  getUnlockedKeysUpToStage,
} from '../stages';
import {
  calculateKeyConfidence,
  updateUserKeyProgress,
  getWeakestKey,
  MIN_ATTEMPTS_FOR_CONFIDENCE,
} from '../confidence';
import { generateAdaptiveLesson } from '../generator';

describe('Curriculum Stages', () => {
  it('defines sequential learning stages starting with home row', () => {
    expect(CURRICULUM_STAGES.length).toBeGreaterThanOrEqual(12);
    expect(CURRICULUM_STAGES[0].keys).toEqual(['f', 'j', 'd', 'k']);
    expect(CURRICULUM_STAGES[7].id).toBe(8);
    expect(CURRICULUM_STAGES[7].keys).toContain('1');
    expect(CURRICULUM_STAGES[8].id).toBe(9);
    expect(CURRICULUM_STAGES[8].keys).toContain('!');
  });

  it('provides distinct curriculum stages for Dvorak, Colemak, and Hebrew', () => {
    const dvorakStages = getCurriculumStages('dvorak');
    expect(dvorakStages[0].keys).toEqual(['u', 'h', 'e', 't']);

    const colemakStages = getCurriculumStages('colemak');
    expect(colemakStages[0].keys).toEqual(['t', 'n', 's', 'e']);

    const hebrewStages = getCurriculumStages('hebrew');
    expect(hebrewStages[0].keys).toEqual(['כ', 'ח', 'ג', 'י']);
  });

  it('aggregates unlocked keys cumulatively up to stage', () => {
    const stage1Keys = getUnlockedKeysUpToStage(1);
    expect(stage1Keys).toEqual(['f', 'j', 'd', 'k']);

    const stage2Keys = getUnlockedKeysUpToStage(2);
    expect(stage2Keys).toContain('f');
    expect(stage2Keys).toContain('s');
    expect(stage2Keys.length).toBe(stage1Keys.length + CURRICULUM_STAGES[1].keys.length);

    const hebrewStage1Keys = getUnlockedKeysUpToStage(1, 'hebrew');
    expect(hebrewStage1Keys).toEqual(['כ', 'ח', 'ג', 'י']);
  });
});

describe('Confidence & Weak Key Calculation', () => {
  it('penalizes low sample size', () => {
    const confidence = calculateKeyConfidence(100, 200, Math.max(1, MIN_ATTEMPTS_FOR_CONFIDENCE - 1));
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

  it('generates authentic Hebrew words and lessons with unlocked Hebrew keys', () => {
    const hebrewKeys = getUnlockedKeysUpToStage(2, 'hebrew');
    const lesson = generateAdaptiveLesson({
      stageId: 2,
      activeKeys: hebrewKeys,
      targetFocusKey: 'כ',
      wordCount: 10,
      mode: 'adaptive',
    });

    expect(lesson.words).toHaveLength(10);
    // Every character must be an unlocked Hebrew key
    for (const word of lesson.words) {
      for (const char of word) {
        expect(hebrewKeys).toContain(char);
      }
    }
    // Target focus key should appear
    expect(lesson.words.some((w) => w.includes('כ'))).toBe(true);
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

  it('generates exercises with number reaches in Stage 8', () => {
    const stage8Keys = getUnlockedKeysUpToStage(8);
    const lesson = generateAdaptiveLesson({
      stageId: 8,
      activeKeys: stage8Keys,
      targetFocusKey: '5',
      wordCount: 10,
      mode: 'adaptive',
    });

    expect(lesson.words).toHaveLength(10);
    // At least some words should feature the target number key
    const hasNumber = lesson.words.some((w) => w.includes('5'));
    expect(hasNumber).toBe(true);

    // Every char must be unlocked
    for (const word of lesson.words) {
      for (const char of word) {
        expect(stage8Keys).toContain(char);
      }
    }
  });

  it('generates exercises with brackets in Stage 9', () => {
    const stage9Keys = getUnlockedKeysUpToStage(9);
    const lesson = generateAdaptiveLesson({
      stageId: 9,
      activeKeys: stage9Keys,
      targetFocusKey: '(',
      wordCount: 10,
      mode: 'adaptive',
    });

    expect(lesson.words).toHaveLength(10);
    const hasBracket = lesson.words.some((w) => w.includes('('));
    expect(hasBracket).toBe(true);

    for (const word of lesson.words) {
      for (const char of word) {
        expect(stage9Keys).toContain(char);
      }
    }
  });
});

