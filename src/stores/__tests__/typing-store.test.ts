import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTypingStore } from '../use-typing-store';

// Mock DB and Audio
vi.mock('@/local-db', () => ({
  persistSession: vi.fn().mockResolvedValue(undefined),
  persistKeyProgress: vi.fn().mockResolvedValue(undefined),
  persistSettings: vi.fn().mockResolvedValue(undefined),
  loadSettings: vi.fn().mockResolvedValue({
    id: 'current',
    activeStageId: 1,
    keyboardLayout: 'qwerty',
    soundEnabled: true,
  }),
  loadKeyProgressMap: vi.fn().mockResolvedValue({}),
  clearLocalProgress: vi.fn().mockResolvedValue(undefined),
  syncManager: { triggerSync: vi.fn() },
}));

vi.mock('@/core/audio/mechanical-synth', () => ({
  audioSynth: {
    playKeyClick: vi.fn(),
    playErrorThud: vi.fn(),
    setEnabled: vi.fn(),
  },
}));

describe('Typing Store Layout Management', () => {
  beforeEach(() => {
    useTypingStore.getState().setLayout('qwerty');
  });

  it('initializes with QWERTY layout by default', () => {
    const state = useTypingStore.getState();
    expect(state.keyboardLayout).toBe('qwerty');
    expect(state.activeKeys).toEqual(['f', 'j', 'd', 'k']);
  });

  it('switches layout to Hebrew and initializes Hebrew stage 1 keys', () => {
    const store = useTypingStore.getState();
    store.setLayout('hebrew');

    const updated = useTypingStore.getState();
    expect(updated.keyboardLayout).toBe('hebrew');
    expect(updated.activeKeys).toEqual(['כ', 'ח', 'ג', 'י']);
    expect(updated.activeState.targetText.length).toBeGreaterThan(0);
    // Expected key should be mapped to Hebrew layout
    expect(updated.expectedKeyDef?.finger).toBeDefined();
  });

  it('switches layout to Dvorak and updates home row anchors', () => {
    const store = useTypingStore.getState();
    store.setLayout('dvorak');

    const updated = useTypingStore.getState();
    expect(updated.keyboardLayout).toBe('dvorak');
    expect(updated.activeKeys).toEqual(['u', 'h', 'e', 't']);
  });

  it('switches layout to Colemak and updates home row anchors', () => {
    const store = useTypingStore.getState();
    store.setLayout('colemak');

    const updated = useTypingStore.getState();
    expect(updated.keyboardLayout).toBe('colemak');
    expect(updated.activeKeys).toEqual(['t', 'n', 's', 'e']);
  });

  it('maintains independent stage progress across layouts', () => {
    const store = useTypingStore.getState();

    // Advance QWERTY to stage 2
    store.setStage(2);
    expect(useTypingStore.getState().activeStageId).toBe(2);

    // Switch to Hebrew (should start at stage 1)
    store.setLayout('hebrew');
    expect(useTypingStore.getState().activeStageId).toBe(1);

    // Advance Hebrew to stage 3
    store.setStage(3);
    expect(useTypingStore.getState().activeStageId).toBe(3);

    // Switch back to QWERTY (should remember stage 2!)
    store.setLayout('qwerty');
    expect(useTypingStore.getState().activeStageId).toBe(2);
  });
});

