import { KeyStage } from '@/types/curriculum';
import { KeyboardLayoutType } from '@/types/keyboard';

export const QWERTY_STAGES: KeyStage[] = [
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

export const DVORAK_STAGES: KeyStage[] = [
  {
    id: 1,
    name: 'Dvorak Home Anchors',
    description: 'Master tactile homing bumps U and H, plus E and T.',
    keys: ['u', 'h', 'e', 't'],
    targetWpm: 25,
    targetAccuracy: 95,
  },
  {
    id: 2,
    name: 'Dvorak Full Home Row',
    description: 'Master left-hand vowels A, O, I and right-hand consonants D, N, S.',
    keys: ['a', 'o', 'i', 'd', 'n', 's', '-'],
    targetWpm: 28,
    targetAccuracy: 95,
  },
  {
    id: 3,
    name: 'Top Row High-Frequency',
    description: 'Learn C, R, L, P, and Y on the upper deck.',
    keys: ['c', 'r', 'l', 'p', 'y'],
    targetWpm: 32,
    targetAccuracy: 94,
  },
  {
    id: 4,
    name: 'Top Row Extremes & Punctuation',
    description: "Learn F, G, comma, period, and apostrophe.",
    keys: ['f', 'g', "'", ',', '.', '/'],
    targetWpm: 35,
    targetAccuracy: 94,
  },
  {
    id: 5,
    name: 'Bottom Row Consonants',
    description: 'Master M, W, V, K, and B.',
    keys: ['m', 'w', 'v', 'k', 'b'],
    targetWpm: 38,
    targetAccuracy: 93,
  },
  {
    id: 6,
    name: 'Remaining Letters & Symbols',
    description: 'Master rare letters: J, Q, X, Z, and brackets.',
    keys: ['j', 'q', 'x', 'z', ';', '[', ']', '='],
    targetWpm: 40,
    targetAccuracy: 93,
  },
];

export const COLEMAK_STAGES: KeyStage[] = [
  {
    id: 1,
    name: 'Colemak Home Anchors',
    description: 'Master tactile homing bumps T and N, plus S and E.',
    keys: ['t', 'n', 's', 'e'],
    targetWpm: 25,
    targetAccuracy: 95,
  },
  {
    id: 2,
    name: 'Colemak Full Home Row',
    description: 'Complete home row rolls with A, R, D, H, I, O.',
    keys: ['a', 'r', 'd', 'h', 'i', 'o', "'"],
    targetWpm: 28,
    targetAccuracy: 95,
  },
  {
    id: 3,
    name: 'Top Row Frequent',
    description: 'Learn W, F, U, P, and L on the upper deck.',
    keys: ['w', 'f', 'u', 'p', 'l'],
    targetWpm: 32,
    targetAccuracy: 94,
  },
  {
    id: 4,
    name: 'Bottom Row Consonants',
    description: 'Learn C, V, M, K, and B.',
    keys: ['c', 'v', 'm', 'k', 'b'],
    targetWpm: 35,
    targetAccuracy: 94,
  },
  {
    id: 5,
    name: 'Remaining Letters & Reaches',
    description: 'Master G, J, Y, Q, X, Z, and semicolon.',
    keys: ['g', 'j', 'y', 'q', 'x', 'z', ';'],
    targetWpm: 38,
    targetAccuracy: 93,
  },
];

export const HEBREW_STAGES: KeyStage[] = [
  {
    id: 1,
    name: 'עוגני שורת הבית',
    description: 'שליטה במקשי העוגן: כ (יד שמאל) ו-ח (יד ימין), יחד עם ג ו-י.',
    keys: ['כ', 'ח', 'ג', 'י'],
    targetWpm: 22,
    targetAccuracy: 95,
  },
  {
    id: 2,
    name: 'שורת הבית המלאה',
    description: 'שליטה מלאה בשורת הבית: ש, ד, ע, ל, ף, ך, ופסיק.',
    keys: ['ש', 'ד', 'ע', 'ל', 'ף', 'ך', ','],
    targetWpm: 26,
    targetAccuracy: 95,
  },
  {
    id: 3,
    name: 'שורה עליונה - תנועות והגעה',
    description: 'אותיות תדירות בשורה העליונה: א, ו, ר, ק, ט, פ, ן, ם.',
    keys: ['א', 'ו', 'ר', 'ק', 'ט', 'פ', 'ן', 'ם'],
    targetWpm: 30,
    targetAccuracy: 94,
  },
  {
    id: 4,
    name: 'שורה תחתונה',
    description: 'מקשי השורה התחתונה: ב, נ, מ, ה, צ, ת, ז, ס, ץ, ונקודה.',
    keys: ['ב', 'נ', 'מ', 'ה', 'צ', 'ת', 'ז', 'ס', 'ץ', '.'],
    targetWpm: 34,
    targetAccuracy: 93,
  },
  {
    id: 5,
    name: 'סימני פיסוק ומקשים מיוחדים',
    description: "גרש ('), גרשיים (\"), לוכסן (/), נקודה-פסיק (;), ומקף (-).",
    keys: ["'", '/', ';', '-', '?'],
    targetWpm: 36,
    targetAccuracy: 92,
  },
  {
    id: 6,
    name: 'ספרות וסימנים עליונים',
    description: 'שורת המספרים (1 עד 0) וסימנים מיוחדים.',
    keys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    targetWpm: 30,
    targetAccuracy: 90,
  },
];

export const CURRICULUM_STAGES: KeyStage[] = QWERTY_STAGES;

export const LAYOUT_STAGES: Record<KeyboardLayoutType, KeyStage[]> = {
  qwerty: QWERTY_STAGES,
  dvorak: DVORAK_STAGES,
  colemak: COLEMAK_STAGES,
  hebrew: HEBREW_STAGES,
  workman: QWERTY_STAGES,
};

/**
 * Returns curriculum stages for the selected keyboard layout.
 */
  export function getCurriculumStages(layout: KeyboardLayoutType = 'qwerty'): KeyStage[] {
    return LAYOUT_STAGES[layout] ?? QWERTY_STAGES;
  }

  /**
   * Returns all keys unlocked up to and including the specified stage ID for a layout.
   */
  export function getUnlockedKeysUpToStage(
    stageId: number,
    layout: KeyboardLayoutType = 'qwerty'
  ): string[] {
    const stages = getCurriculumStages(layout);
    const keys: string[] = [];
      for (const stage of stages) {
        if (stage.id <= stageId) {
          keys.push(...stage.keys);
        }
      }
      return keys;
    }
