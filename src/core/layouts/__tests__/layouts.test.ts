import { describe, it, expect } from 'vitest';
import {
  findKeyDefinition,
  getFingerColorTheme,
  QWERTY_LAYOUT,
  DVORAK_LAYOUT,
  COLEMAK_LAYOUT,
  HEBREW_LAYOUT,
  SUPPORTED_LAYOUTS,
} from '../index';

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

  it('correctly maps Dvorak home keys and homing bumps', () => {
    const uKey = findKeyDefinition('u', DVORAK_LAYOUT);
    expect(uKey).toBeDefined();
    expect(uKey?.code).toBe('KeyF');
    expect(uKey?.finger).toBe('left-index');
    expect(uKey?.hasHomingBump).toBe(true);

    const hKey = findKeyDefinition('h', DVORAK_LAYOUT);
    expect(hKey).toBeDefined();
    expect(hKey?.code).toBe('KeyJ');
    expect(hKey?.finger).toBe('right-index');
    expect(hKey?.hasHomingBump).toBe(true);

    // Vowels clustered on home row
    const aKey = findKeyDefinition('a', DVORAK_LAYOUT);
    const oKey = findKeyDefinition('o', DVORAK_LAYOUT);
    const eKey = findKeyDefinition('e', DVORAK_LAYOUT);
    const iKey = findKeyDefinition('i', DVORAK_LAYOUT);
    expect(aKey?.row).toBe(2);
    expect(oKey?.row).toBe(2);
    expect(eKey?.row).toBe(2);
    expect(iKey?.row).toBe(2);
  });

  it('correctly maps Colemak home keys and homing bumps', () => {
    const tKey = findKeyDefinition('t', COLEMAK_LAYOUT);
    expect(tKey).toBeDefined();
    expect(tKey?.code).toBe('KeyF');
    expect(tKey?.finger).toBe('left-index');
    expect(tKey?.hasHomingBump).toBe(true);

    const nKey = findKeyDefinition('n', COLEMAK_LAYOUT);
    expect(nKey).toBeDefined();
    expect(nKey?.code).toBe('KeyJ');
    expect(nKey?.finger).toBe('right-index');
    expect(nKey?.hasHomingBump).toBe(true);

    const sKey = findKeyDefinition('s', COLEMAK_LAYOUT);
    expect(sKey?.row).toBe(2);
    expect(sKey?.code).toBe('KeyD');
  });

  it('correctly maps Hebrew SI-1452 layout, RTL direction, and final letters', () => {
    expect(HEBREW_LAYOUT.direction).toBe('rtl');
    expect(HEBREW_LAYOUT.nativeName).toBe('עברית');

    // Homing bump anchors
    const kafKey = findKeyDefinition('כ', HEBREW_LAYOUT);
    expect(kafKey).toBeDefined();
    expect(kafKey?.code).toBe('KeyF');
    expect(kafKey?.finger).toBe('left-index');
    expect(kafKey?.hasHomingBump).toBe(true);

    const hetKey = findKeyDefinition('ח', HEBREW_LAYOUT);
    expect(hetKey).toBeDefined();
    expect(hetKey?.code).toBe('KeyJ');
    expect(hetKey?.finger).toBe('right-index');
    expect(hetKey?.hasHomingBump).toBe(true);

    // Final letters (Sofiot)
    const memSofit = findKeyDefinition('ם', HEBREW_LAYOUT);
    expect(memSofit).toBeDefined();
    expect(memSofit?.code).toBe('KeyO');

    const nunSofit = findKeyDefinition('ן', HEBREW_LAYOUT);
    expect(nunSofit).toBeDefined();
    expect(nunSofit?.code).toBe('KeyI');

    const peSofit = findKeyDefinition('ף', HEBREW_LAYOUT);
    expect(peSofit).toBeDefined();
    expect(peSofit?.code).toBe('Semicolon');
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

