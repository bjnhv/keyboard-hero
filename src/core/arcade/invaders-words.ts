/**
 * Word Invaders Vocabulary & Word Generators
 * Supports English (QWERTY, Dvorak, Colemak) and Hebrew RTL layouts across difficulty tiers.
 */

import { KeyboardLayoutType } from '@/types/keyboard';

export type InvaderDifficulty = 'cadet' | 'commander' | 'ace' | 'supernova';

export interface InvaderTierConfig {
  name: string;
  tagline: string;
  minWordLength: number;
  maxWordLength: number;
  baseStepIntervalMs: number;
  minStepIntervalMs: number;
  initialShields: number;
  pointsMultiplier: number;
  ufoIntervalSeconds: number;
}

export const INVADER_TIERS: Record<InvaderDifficulty, InvaderTierConfig> = {
  cadet: {
    name: 'Cadet',
    tagline: 'Standard orbital patrol. Shorter words and relaxed invader march.',
    minWordLength: 3,
    maxWordLength: 4,
    baseStepIntervalMs: 950,
    minStepIntervalMs: 380,
    initialShields: 4,
    pointsMultiplier: 1.0,
    ufoIntervalSeconds: 22,
  },
  commander: {
    name: 'Commander',
    tagline: 'Deep space combat. Medium length words, tactical UFO flybys, accelerated march.',
    minWordLength: 4,
    maxWordLength: 6,
    baseStepIntervalMs: 800,
    minStepIntervalMs: 260,
    initialShields: 3,
    pointsMultiplier: 1.5,
    ufoIntervalSeconds: 16,
  },
  ace: {
    name: 'Galactic Ace',
    tagline: 'High-speed interceptor. Complex vocabulary, fast-dropping alien armada.',
    minWordLength: 5,
    maxWordLength: 8,
    baseStepIntervalMs: 650,
    minStepIntervalMs: 180,
    initialShields: 2,
    pointsMultiplier: 2.2,
    ufoIntervalSeconds: 12,
  },
  supernova: {
    name: 'Supernova',
    tagline: 'Maximum velocity bullet-hell. Long technical terms, relentless cadence.',
    minWordLength: 7,
    maxWordLength: 10,
    baseStepIntervalMs: 500,
    minStepIntervalMs: 140,
    initialShields: 1,
    pointsMultiplier: 3.5,
    ufoIntervalSeconds: 10,
  },
};

const ENGLISH_WORDS_BY_TIER: Record<InvaderDifficulty, string[]> = {
  cadet: [
    'star', 'ship', 'beam', 'moon', 'mars', 'void', 'core', 'warp',
    'byte', 'nova', 'puls', 'glow', 'fire', 'base', 'flux', 'code',
    'gate', 'grid', 'scan', 'dock', 'fuel', 'helm', 'luna', 'zone',
    'lock', 'unit', 'mass', 'zero', 'atom', 'wave', 'pack', 'dash',
  ],
  commander: [
    'plasma', 'laser', 'rocket', 'galaxy', 'shield', 'sector', 'thrust',
    'vector', 'cosmic', 'sensor', 'beacon', 'nebula', 'pulsar', 'astral',
    'comet', 'module', 'propel', 'signal', 'engine', 'target', 'energy',
    'system', 'matrix', 'flight', 'escape', 'sentry', 'booster', 'cruiser',
  ],
  ace: [
    'invader', 'command', 'quantum', 'gravity', 'horizon', 'asteroid',
    'teleport', 'velocity', 'starlight', 'defenders', 'supernova',
    'blackhole', 'destroyer', 'starfleet', 'planetary', 'satellite',
    'hyperdrive', 'forcefield', 'radiation', 'spacestation',
  ],
  supernova: [
    'interstellar', 'constellation', 'counterstrike', 'singularity',
    'electromagnet', 'extraterrestrial', 'teleportation', 'astronavigation',
    'thermonuclear', 'photosynthesis', 'gravitational', 'superconductive',
  ],
};

const HEBREW_WORDS_BY_TIER: Record<InvaderDifficulty, string[]> = {
  cadet: [
    'אור', 'כוכב', 'שמש', 'שיר', 'דרך', 'קול', 'טוב', 'רוח',
    'דג', 'גג', 'שלום', 'חלום', 'ארץ', 'זמן', 'בית', 'לב',
    'עץ', 'ים', 'אש', 'גל', 'חג', 'שד', 'עד', 'ילד',
  ],
  commander: [
    'חללית', 'מחשב', 'מקלדת', 'עבודה', 'מקום', 'עולם', 'חיים',
    'שמחה', 'בוקר', 'שבוע', 'חודש', 'שנה', 'ספר', 'כסף',
    'זהב', 'הצלחה', 'חופש', 'שבת', 'תודה', 'אהבה', 'חבר',
  ],
  ace: [
    'גלקסיה', 'טלפורט', 'אסטרואיד', 'כבידה', 'מהירות', 'אופק',
    'פיקוד', 'מערכת', 'טכנולוגיה', 'תקשורת', 'ביטחון', 'חלליות',
  ],
  supernova: [
    'בין-כוכבי', 'קרינה-קוסמית', 'חור-שחור', 'סופרנובה',
    'אסטרונומיה', 'כבידה-עולמית', 'אינטליגנציה', 'מערכת-שמש',
  ],
};

/**
 * Returns a random pool of words for spawning invaders based on difficulty and layout.
 */
export function getInvaderWords(
  difficulty: InvaderDifficulty,
  layout: KeyboardLayoutType = 'qwerty',
  count: number = 12
): string[] {
  const isHebrew = layout === 'hebrew';
  const pool = isHebrew
    ? HEBREW_WORDS_BY_TIER[difficulty]
    : ENGLISH_WORDS_BY_TIER[difficulty];

  // Shuffle and pick unique words
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const result: string[] = [];

  for (let i = 0; i < count; i++) {
    result.push(shuffled[i % shuffled.length]);
  }

  return result;
}

/**
 * Returns a surprise bonus UFO word.
 */
export function getUfoWord(
  difficulty: InvaderDifficulty,
  layout: KeyboardLayoutType = 'qwerty'
): string {
  const isHebrew = layout === 'hebrew';
  const bonusWords = isHebrew
    ? ['מסתורין', 'עב״מ', 'חללית-אם', 'בונוס']
    : ['MYSTERY', 'BONUS', 'SAUCER', 'INFILTRATE', 'MOTHERSHIP'];

  return bonusWords[Math.floor(Math.random() * bonusWords.length)];
}

