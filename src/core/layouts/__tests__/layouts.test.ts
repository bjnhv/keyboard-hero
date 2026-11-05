import { describe, it, expect } from 'vitest';
import { findKeyDefinition, getFingerColorTheme, QWERTY_LAYOUT } from '../index';

describe('Keyboard Layouts & Finger Mappings', () => {
  it('correctly maps QWERTY home keys to fingers', () => {
    const fKey = findKeyDefinition('f', QWERTY_LAYOUT);
    expect(fKey).toBeDefined();
    expect(fKey?.finger).toBe('left-index');
    expect(fKey?.hasHomingBump).toBe(true);

    const jKey = findKeyDefinition('j', QWERTY_LAYOUT);
    expect(jKey).toBeDefined();
    expect(jKey?.finger).toBe('right-index');
    expect(jKey?.hasHomingBump).toBe(true);

    const aKey = findKeyDefinition('a', QWERTY_LAYOUT);
    expect(aKey?.finger).toBe('left-pinky');

    const spaceKey = findKeyDefinition(' ', QWERTY_LAYOUT);
    expect(spaceKey?.finger).toBe('thumb');
  });

  it('finds shifted characters', () => {
    const question = findKeyDefinition('?', QWERTY_LAYOUT);
    expect(question).toBeDefined();
    expect(question?.code).toBe('Slash');
    expect(question?.finger).toBe('right-pinky');
  });

  it('provides distinct color themes for all fingers', () => {
    const pinkyTheme = getFingerColorTheme('left-pinky');
    const indexTheme = getFingerColorTheme('left-index');
    expect(pinkyTheme.text).toBe('text-rose-400');
    expect(indexTheme.text).toBe('text-emerald-400');
  });
});

