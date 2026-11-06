import { KeyStage } from '@/types/curriculum';

export const CURRICULUM_STAGES: KeyStage[] = [
  {
    id: 1,
    name: 'Home Row Anchors',
    description: 'Master index and middle fingers on the home row.',
    keys: ['f', 'j', 'd', 'k'],
    targetWpm: 25,
    targetAccuracy: 95,
  },
  {
    id: 2,
    name: 'Full Home Row',
    description: 'Incorporate ring and pinky fingers on the home row.',
    keys: ['s', 'l', 'a', ';'],
    targetWpm: 28,
    targetAccuracy: 95,
  },
  {
    id: 3,
    name: 'Top Row Vowels & Index Reaches',
    description: 'Learn reach keys E, I, R, and U.',
    keys: ['e', 'i', 'r', 'u'],
    targetWpm: 32,
    targetAccuracy: 94,
  },
  {
    id: 4,
    name: 'Center Reaches & High Frequency',
    description: 'Learn G, H, T, and Y.',
    keys: ['g', 'h', 't', 'y'],
    targetWpm: 35,
    targetAccuracy: 94,
  },
  {
    id: 5,
    name: 'Top Row Extremes & Bottom Row',
    description: 'Learn O, P, W, Q and bottom row N, M, C, V.',
    keys: ['o', 'p', 'w', 'q', 'n', 'm', 'c', 'v'],
    targetWpm: 38,
    targetAccuracy: 93,
  },
  {
    id: 6,
    name: 'Remaining Letters',
    description: 'Master the rarest letters: B, X, Z.',
    keys: ['b', 'x', 'z'],
    targetWpm: 40,
    targetAccuracy: 93,
  },
  {
    id: 7,
    name: 'Common Punctuation & Capitals',
    description: 'Period, comma, quotes, and Shift key capitalization.',
    keys: ['.', ',', "'", '?'],
    targetWpm: 40,
    targetAccuracy: 93,
  },
  {
    id: 8,
    name: 'Number Row Reaches',
    description: 'Reach upward to the number row (1 through 0) with correct fingers.',
    keys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    targetWpm: 35,
    targetAccuracy: 92,
  },
  {
    id: 9,
    name: 'Shift Symbols & Brackets',
    description: 'Shift-key symbols, parenthesis, square brackets, and curly braces.',
    keys: ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '[', ']', '{', '}'],
    targetWpm: 30,
    targetAccuracy: 90,
  },
  {
    id: 10,
    name: 'Code & Math Operators',
    description: 'Arithmetic, logical operators, slashes, angle brackets, and backticks.',
    keys: ['=', '+', '-', '_', '/', '\\', '|', '<', '>', ':', '~', '`'],
    targetWpm: 32,
    targetAccuracy: 90,
  },
  {
    id: 11,
    name: 'Developer Casing & Identifiers',
    description: 'Practice camelCase, PascalCase, snake_case, and UPPER_CASE transitions.',
    keys: ['_', '-', 'A', 'C', 'S', 'P', 'T', 'D'],
    targetWpm: 38,
    targetAccuracy: 93,
  },
  {
    id: 12,
    name: 'Full Code Syntax & Keywords',
    description: 'TypeScript/JavaScript keywords, arrow functions, and statement syntax.',
    keys: [';', '{', '}', '(', ')', '=', '>', '<', '/', ':'],
    targetWpm: 42,
    targetAccuracy: 94,
  },
];

/**
 * Returns all keys unlocked up to and including the specified stage ID.
 */
export function getUnlockedKeysUpToStage(stageId: number): string[] {
  const keys: string[] = [];
  for (const stage of CURRICULUM_STAGES) {
    if (stage.id <= stageId) {
      keys.push(...stage.keys);
    }
  }
  return keys;
}

