import { FingerType, KeyboardLayout, KeyDefinition } from '@/types/keyboard';
import { QWERTY_LAYOUT } from './qwerty';

export * from './qwerty';

export const SUPPORTED_LAYOUTS: Record<string, KeyboardLayout> = {
  qwerty: QWERTY_LAYOUT,
};

/**
 * Searches a layout for the KeyDefinition corresponding to a given character or key name.
 */
export function findKeyDefinition(
  keyOrChar: string,
  layout: KeyboardLayout = QWERTY_LAYOUT
): KeyDefinition | undefined {
  const target = keyOrChar.toLowerCase();

  for (const row of layout.rows) {
    for (const keyDef of row) {
      if (
        keyDef.key.toLowerCase() === target ||
        keyDef.shiftedKey?.toLowerCase() === target ||
        keyDef.code.toLowerCase() === target
      ) {
        return keyDef;
      }
    }
  }

  // Fallback for space
  if (keyOrChar === ' ') {
    return layout.rows[4]?.find((k) => k.code === 'Space');
  }

  return undefined;
}

/**
 * Maps a finger type to Tailwind color tokens for UI highlights and hand guide.
 */
export function getFingerColorTheme(finger: FingerType): {
  border: string;
  bg: string;
  text: string;
  dot: string;
} {
  switch (finger) {
    case 'left-pinky':
      return {
        border: 'border-rose-500/50',
        bg: 'bg-rose-500/15',
        text: 'text-rose-400',
        dot: 'bg-rose-500',
      };
    case 'left-ring':
      return {
        border: 'border-orange-500/50',
        bg: 'bg-orange-500/15',
        text: 'text-orange-400',
        dot: 'bg-orange-500',
      };
    case 'left-middle':
      return {
        border: 'border-amber-500/50',
        bg: 'bg-amber-500/15',
        text: 'text-amber-400',
        dot: 'bg-amber-500',
      };
    case 'left-index':
      return {
        border: 'border-emerald-500/50',
        bg: 'bg-emerald-500/15',
        text: 'text-emerald-400',
        dot: 'bg-emerald-500',
      };
    case 'thumb':
      return {
        border: 'border-blue-500/50',
        bg: 'bg-blue-500/15',
        text: 'text-blue-400',
        dot: 'bg-blue-500',
      };
    case 'right-index':
      return {
        border: 'border-emerald-500/50',
        bg: 'bg-emerald-500/15',
        text: 'text-emerald-400',
        dot: 'bg-emerald-500',
      };
    case 'right-middle':
      return {
        border: 'border-amber-500/50',
        bg: 'bg-amber-500/15',
        text: 'text-amber-400',
        dot: 'bg-amber-500',
      };
    case 'right-ring':
      return {
        border: 'border-orange-500/50',
        bg: 'bg-orange-500/15',
        text: 'text-orange-400',
        dot: 'bg-orange-500',
      };
    case 'right-pinky':
      return {
        border: 'border-rose-500/50',
        bg: 'bg-rose-500/15',
        text: 'text-rose-400',
        dot: 'bg-rose-500',
      };
  }
}

