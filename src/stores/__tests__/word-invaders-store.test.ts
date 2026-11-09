import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useWordInvadersStore } from '../use-word-invaders-store';
import { getInvaderWords, getUfoWord, INVADER_TIERS } from '@/core/arcade/invaders-words';

// Mock audio to avoid AudioContext errors in jsdom/node
vi.mock('@/core/audio/invaders-audio', () => ({
  invadersAudio: {
    preload: vi.fn().mockResolvedValue(undefined),
    playMarch: vi.fn(),
    playShoot: vi.fn(),
    playInvaderKilled: vi.fn(),
    startUfo: vi.fn(),
    stopUfo: vi.fn(),
    playUfoHit: vi.fn(),
    playExplosion: vi.fn(),
    playTypoZap: vi.fn(),
    playVictory: vi.fn(),
    setEnabled: vi.fn(),
  },
}));

// Mock Dexie persistence
vi.mock('@/local-db', () => ({
  persistArcadeScore: vi.fn().mockResolvedValue(undefined),
  loadArcadeScores: vi.fn().mockResolvedValue([]),
}));

describe('Word Invaders Store (useWordInvadersStore)', () => {
  beforeEach(() => {
    useWordInvadersStore.getState().resetGame();
  });

  it('initializes with default ready state and commander tier', () => {
    const state = useWordInvadersStore.getState();
    expect(state.status).toBe('ready');
    expect(state.difficulty).toBe('commander');
    expect(state.shields).toBe(INVADER_TIERS.commander.initialShields);
    expect(state.score).toBe(0);
    expect(state.wave).toBe(1);
    expect(state.invaders.length).toBe(12);
  });

  it('updates tier configuration and shield count when difficulty changes', () => {
    const store = useWordInvadersStore.getState();
    store.setDifficulty('cadet');

    expect(useWordInvadersStore.getState().difficulty).toBe('cadet');
    expect(useWordInvadersStore.getState().shields).toBe(INVADER_TIERS.cadet.initialShields);

    store.setDifficulty('supernova');
    expect(useWordInvadersStore.getState().difficulty).toBe('supernova');
    expect(useWordInvadersStore.getState().shields).toBe(INVADER_TIERS.supernova.initialShields);
  });

  it('starts game and generates a wave of 12 active invaders', () => {
    const store = useWordInvadersStore.getState();
    store.startGame();

    const state = useWordInvadersStore.getState();
    expect(state.status).toBe('running');
    expect(state.invaders.length).toBe(12);
    expect(state.invaders.every((inv) => inv.isAlive)).toBe(true);
    expect(state.score).toBe(0);
  });

  it('locks onto an invader starting with the typed letter', () => {
    const store = useWordInvadersStore.getState();
    store.startGame();

    const state = useWordInvadersStore.getState();
    const firstInvader = state.invaders[0];
    const firstChar = firstInvader.word[0];

    store.handleInputKey(firstChar);

    const updated = useWordInvadersStore.getState();
    expect(updated.targetId).toBeDefined();
    expect(updated.totalKeystrokes).toBe(1);
    expect(updated.combo).toBe(1);
    expect(updated.activeLasers.length).toBeGreaterThan(0);
  });

  it('resets combo and increments error count on typo', () => {
    const store = useWordInvadersStore.getState();
    store.startGame();

    // Type an invalid character that matches no word on screen
    store.handleInputKey('§');

    const updated = useWordInvadersStore.getState();
    expect(updated.totalErrors).toBe(1);
    expect(updated.combo).toBe(0);
    expect(updated.targetId).toBeNull();
  });

  it('destroys an invader when all characters in its word are typed', () => {
    const store = useWordInvadersStore.getState();
    store.startGame();

    const state = useWordInvadersStore.getState();
    const target = state.invaders[0];

    // Type the entire target word letter by letter
    for (const ch of target.word) {
      store.handleInputKey(ch);
    }

    const updated = useWordInvadersStore.getState();
    const destroyedInvader = updated.invaders.find((inv) => inv.id === target.id);
    expect(destroyedInvader?.isAlive).toBe(false);
    expect(updated.wordsDestroyed).toBe(1);
    expect(updated.score).toBeGreaterThan(0);
    expect(updated.targetId).toBeNull();
    expect(updated.explosions.length).toBeGreaterThan(0);
  });

  it('supports Hebrew layout words with correct character matching', () => {
    const store = useWordInvadersStore.getState();
    store.setLayout('hebrew');
    store.startGame();

    const state = useWordInvadersStore.getState();
    expect(state.keyboardLayout).toBe('hebrew');

    const target = state.invaders[0];
    const firstHebrewChar = target.word[0];

    store.handleInputKey(firstHebrewChar);
    const updated = useWordInvadersStore.getState();
    const matching = state.invaders.filter((inv) => inv.word[0] === firstHebrewChar);
    expect(matching.some((inv) => inv.id === updated.targetId)).toBe(true);
  });

  it('generates vocabulary pools for all difficulty tiers', () => {
    const cadetWords = getInvaderWords('cadet', 'qwerty', 10);
    expect(cadetWords.length).toBe(10);
    expect(cadetWords.every((w) => w.length >= 3 && w.length <= 4)).toBe(true);

    const aceWords = getInvaderWords('ace', 'qwerty', 10);
    expect(aceWords.length).toBe(10);
    expect(aceWords.every((w) => w.length >= 5)).toBe(true);

    const hebrewWords = getInvaderWords('commander', 'hebrew', 8);
    expect(hebrewWords.length).toBe(8);
    expect(hebrewWords.some((w) => /[\u0590-\u05FF]/.test(w))).toBe(true);
  });
});
