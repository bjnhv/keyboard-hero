import { GeneratedLesson, LessonConfig } from '@/types/curriculum';

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);
const PUNCTUATION = new Set(['.', ',', "'", '?', '!', ';', ':']);

/**
 * Generates an adaptive lesson text tailored to the user's unlocked keys and weakest finger.
 */
export function generateAdaptiveLesson(config: LessonConfig): GeneratedLesson {
  const { stageId, activeKeys, targetFocusKey, wordCount, mode } = config;
  const words: string[] = [];
  const focusKeys: string[] = targetFocusKey ? [targetFocusKey] : [];
  const activeKeySet = new Set(activeKeys);

  const availableVowels = activeKeys.filter(
    (k) => VOWELS.has(k.toLowerCase()) && /^[a-z]$/i.test(k)
  );
  const availableConsonants = activeKeys.filter(
    (k) => !VOWELS.has(k.toLowerCase()) && /^[a-z]$/i.test(k)
  );

  const hasVowels = availableVowels.length > 0;
  const hasConsonants = availableConsonants.length > 0;

  for (let i = 0; i < wordCount; i++) {
    // 75% of words should feature the target focus key if provided
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
      // Early stages (e.g. Stage 1: f, j, d, k) without vowels: generate rhythmic patterns
      word = generatePatternWord(
        activeKeys,
        shouldIncludeFocus ? targetFocusKey : undefined
      );
    }

    // Guarantee that every single character in the word strictly belongs to activeKeys
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
 * Builds a pronounceable pseudo-word using alternating consonants and vowels (CVC, CV, VC, CVCV),
 * with natural handling for punctuation, numbers, brackets, and symbols.
 */
function generatePronounceableWord(
  vowels: string[],
  consonants: string[],
  focusKey?: string,
  activeKeySet?: Set<string>
): string {
  // Target length: 3 to 6 characters
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

  // Ensure focus key is present if requested
  if (focusKey && !chars.includes(focusKey)) {
    if (PUNCTUATION.has(focusKey)) {
      // Natural trailing punctuation for sentences/drills
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
      // Numbers can attach as identifier or suffix (e.g. word1)
      chars.push(focusKey);
    } else {
      const isVowel = VOWELS.has(focusKey.toLowerCase());
      const candidates = chars
        .map((ch, idx) => ({ ch, idx }))
        .filter(({ ch }) =>
          isVowel ? VOWELS.has(ch.toLowerCase()) : !VOWELS.has(ch.toLowerCase())
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

