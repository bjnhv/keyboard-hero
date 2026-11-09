import { GeneratedLesson, LessonConfig } from '@/types/curriculum';

const LATIN_VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);
const HEBREW_VOWELS = new Set(['א', 'ו', 'י', 'ה', 'ע']);
const PUNCTUATION = new Set(['.', ',', "'", '?', '!', ';', ':', '-', '/']);
const HEBREW_SOFIOT = new Set(['ך', 'ם', 'ן', 'ף', 'ץ']);

// Curated authentic Hebrew words matching progressive curriculum stages
const HEBREW_WORDS: string[] = [
  // Stage 1 & 2 (Home row letters: כ, ח, ג, י, ש, ד, ע, ל, ף, ך)
  'חג', 'גג', 'חגי', 'גיח', 'יחי', 'של', 'דג', 'עד', 'שד', 'ילד', 'דרך', 'עיר', 'כד', 'עף', 'שף',
  'לך', 'כך', 'גיל', 'שיח', 'חלל', 'שלך', 'שלי', 'גלי', 'דיג', 'כל', 'כלי', 'לי', 'לו', 'לה', 'שלו', 'שלה',
  // Stage 3 (+ א, ו, ר, ק, ט, פ, ן, ם)
  'אור', 'יום', 'שיר', 'רוח', 'קול', 'טוב', 'פרח', 'ראש', 'מים', 'שלום', 'חלום', 'שקט', 'ארץ', 'אדם',
  'זמן', 'בוקר', 'ערב', 'בית', 'ספר', 'עץ', 'שמש', 'כוכב', 'עולם', 'חיים', 'אהבה', 'תודה', 'חבר', 'מלך',
  // Stage 4 (+ ב, נ, מ, ה, צ, ת, ז, ס, ץ)
  'צעד', 'מקום', 'שנה', 'חודש', 'שבוע', 'מחר', 'היום', 'אמת', 'צדק', 'שמחה', 'לב', 'דרך', 'זהב', 'כסף',
  'מחשב', 'מסך', 'מקלדת', 'עבודה', 'מבחן', 'הצלחה', 'חופש', 'שבת', 'שלום'
];

/**
 * Generates an adaptive lesson text tailored to the user's unlocked keys and weakest finger.
 * Fully supports Latin layouts (QWERTY, Dvorak, Colemak) and Hebrew RTL text flow.
 */
export function generateAdaptiveLesson(config: LessonConfig): GeneratedLesson {
  const { stageId, activeKeys, targetFocusKey, wordCount, mode } = config;
  const words: string[] = [];
  const focusKeys: string[] = targetFocusKey ? [targetFocusKey] : [];
  const activeKeySet = new Set(activeKeys);

  const isHebrew = activeKeys.some((k) => /[\u0590-\u05FF]/.test(k));

  if (isHebrew) {
    return generateHebrewLesson(config, activeKeySet);
  }

  const availableVowels = activeKeys.filter(
      (k) => LATIN_VOWELS.has(k.toLowerCase()) && /^[a-z]$/i.test(k)
  );
  const availableConsonants = activeKeys.filter(
      (k) => !LATIN_VOWELS.has(k.toLowerCase()) && /^[a-z]$/i.test(k)
  );

  const hasVowels = availableVowels.length > 0;
  const hasConsonants = availableConsonants.length > 0;

  for (let i = 0; i < wordCount; i++) {
    const shouldIncludeFocus =
      targetFocusKey && (i % 4 !== 0 || activeKeys.length <= 4);

    let word: string;
    if (hasVowels && hasConsonants) {
      word = generatePronounceableWord(
        availableVowels,
        availableConsonants,
        shouldIncludeFocus ? targetFocusKey : undefined,
        activeKeySet
      );
    } else {
      word = generatePatternWord(
        activeKeys,
        shouldIncludeFocus ? targetFocusKey : undefined
      );
    }

    const sanitizedWord = Array.from(word)
      .filter((ch) => activeKeySet.has(ch))
      .join('');

    words.push(sanitizedWord.length > 0 ? sanitizedWord : activeKeys[0] || 'f');
  }

  const text = words.join(' ');
  const id = `lesson-${stageId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  return {
    id,
    text,
    words,
    focusKeys,
    stageId,
    mode,
  };
}

/**
 * Generates an authentic Hebrew lesson, respecting Hebrew syllabic structures,
 * final letter (*sofiot*) positioning, and unlocked letters.
 */
function generateHebrewLesson(
  config: LessonConfig,
  activeKeySet: Set<string>
): GeneratedLesson {
  const { stageId, activeKeys, targetFocusKey, wordCount, mode } = config;
  const words: string[] = [];
  const focusKeys: string[] = targetFocusKey ? [targetFocusKey] : [];

  // Filter dictionary words that can be spelled using strictly unlocked keys
  const validDictWords = HEBREW_WORDS.filter((word) =>
    Array.from(word).every((char) => activeKeySet.has(char))
  );

  const lettersOnly = activeKeys.filter((k) => /[\u0590-\u05FF]/.test(k));
  const availableVowels = lettersOnly.filter((k) => HEBREW_VOWELS.has(k));
  const availableConsonants = lettersOnly.filter(
    (k) => !HEBREW_VOWELS.has(k) && !HEBREW_SOFIOT.has(k)
  );
  const availableSofiot = lettersOnly.filter((k) => HEBREW_SOFIOT.has(k));

  for (let i = 0; i < wordCount; i++) {
    const shouldIncludeFocus =
      targetFocusKey && (i % 4 !== 0 || activeKeys.length <= 4);

    // Try finding a matching dictionary word with focusKey first
    const focusDictWords = shouldIncludeFocus
      ? validDictWords.filter((w) => w.includes(targetFocusKey!))
      : validDictWords;

    if (focusDictWords.length > 0 && Math.random() < 0.7) {
      const picked = focusDictWords[Math.floor(Math.random() * focusDictWords.length)];
      words.push(picked);
      continue;
    }

    // Synthesize natural Hebrew syllable
    let synthesized = '';
    const length = Math.floor(Math.random() * 2) + 2; // 2 or 3 letters

    for (let pos = 0; pos < length; pos++) {
      const isEnd = pos === length - 1;

      if (isEnd && availableSofiot.length > 0 && Math.random() < 0.35) {
        synthesized += availableSofiot[Math.floor(Math.random() * availableSofiot.length)];
      } else if (availableVowels.length > 0 && (pos === 1 || Math.random() < 0.4)) {
        synthesized += availableVowels[Math.floor(Math.random() * availableVowels.length)];
      } else if (availableConsonants.length > 0) {
        synthesized += availableConsonants[Math.floor(Math.random() * availableConsonants.length)];
      } else {
        synthesized += lettersOnly[Math.floor(Math.random() * lettersOnly.length)] || 'כ';
      }
    }

    // Ensure focus key inclusion if needed
    if (shouldIncludeFocus && !synthesized.includes(targetFocusKey!)) {
      if (HEBREW_SOFIOT.has(targetFocusKey!)) {
        synthesized = synthesized.slice(0, -1) + targetFocusKey;
      } else if (PUNCTUATION.has(targetFocusKey!)) {
        synthesized = synthesized + targetFocusKey;
      } else {
        synthesized = targetFocusKey + synthesized.slice(1);
      }
    }

    const sanitized = Array.from(synthesized)
      .filter((ch) => activeKeySet.has(ch))
      .join('');

    words.push(sanitized.length > 0 ? sanitized : lettersOnly[0] || 'כ');
  }

  const text = words.join(' ');
  const id = `hebrew-lesson-${stageId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  return {
    id,
    text,
    words,
    focusKeys,
    stageId,
    mode,
  };
}

/**
 * Builds a pronounceable pseudo-word using alternating consonants and vowels (CVC, CV, VC, CVCV).
 */
function generatePronounceableWord(
  vowels: string[],
  consonants: string[],
  focusKey?: string,
  activeKeySet?: Set<string>
): string {
  const patterns = ['CVC', 'VC', 'CV', 'CVCV', 'VCV', 'CVCC'];
  const pattern = patterns[Math.floor(Math.random() * patterns.length)];

  let chars: string[] = [];

  for (const slot of pattern) {
    if (slot === 'C') {
      chars.push(consonants[Math.floor(Math.random() * consonants.length)]);
    } else {
      chars.push(vowels[Math.floor(Math.random() * vowels.length)]);
    }
  }

  if (focusKey && !chars.includes(focusKey)) {
    if (PUNCTUATION.has(focusKey)) {
      chars.push(focusKey);
    } else if (focusKey === '(' && activeKeySet?.has(')')) {
      chars.unshift('(');
      chars.push(')');
    } else if (focusKey === '[' && activeKeySet?.has(']')) {
      chars.unshift('[');
      chars.push(']');
    } else if (focusKey === '{' && activeKeySet?.has('}')) {
      chars.unshift('{');
      chars.push('}');
    } else if (/^[0-9]$/.test(focusKey)) {
      chars.push(focusKey);
    } else {
      const isVowel = LATIN_VOWELS.has(focusKey.toLowerCase());
      const candidates = chars
        .map((ch, idx) => ({ ch, idx }))
        .filter(({ ch }) =>
          isVowel ? LATIN_VOWELS.has(ch.toLowerCase()) : !LATIN_VOWELS.has(ch.toLowerCase())
        );

      if (candidates.length > 0) {
        const targetSlot =
          candidates[Math.floor(Math.random() * candidates.length)].idx;
        chars[targetSlot] = focusKey;
      } else {
        chars.push(focusKey);
      }
    }
  }

  return chars.join('');
}

/**
 * Builds rhythmic pattern words for vowel-less early stages (e.g. "fjf", "kdk", "fjdk").
 */
function generatePatternWord(activeKeys: string[], focusKey?: string): string {
  const len = Math.floor(Math.random() * 3) + 3; // 3 to 5 chars
  const chars: string[] = [];

  for (let i = 0; i < len; i++) {
    chars.push(activeKeys[Math.floor(Math.random() * activeKeys.length)]);
  }

  if (focusKey && !chars.includes(focusKey)) {
    const replaceIdx = Math.floor(Math.random() * chars.length);
    chars[replaceIdx] = focusKey;
  }

  return chars.join('');
}
