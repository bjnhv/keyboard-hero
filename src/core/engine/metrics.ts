import {
  KeystrokeEvent,
  KeyAccuracyMetric,
  TypingSessionMetrics,
  WpmHistoryPoint,
} from '@/types/engine';

/**
 * Creates empty initial typing metrics
 */
export function createInitialMetrics(): TypingSessionMetrics {
  return {
    wpm: 0,
    rawWpm: 0,
    cpm: 0,
    accuracy: 100,
    consistency: 100,
    durationMs: 0,
    correctCount: 0,
    errorCount: 0,
    totalKeystrokes: 0,
    wpmHistory: [],
    keyMetrics: {},
  };
}

/**
 * Computes consistency percentage based on standard deviation of keystroke intervals.
 * Standard deviation of dwell times relative to the mean (coefficient of variation).
 */
export function calculateConsistency(dwellTimes: number[]): number {
  if (dwellTimes.length < 2) return 100;

  // Filter out extreme pauses (> 2000ms) to avoid skewing intra-typing cadence
  const validDwells = dwellTimes.filter((d) => d > 0 && d < 2000);
  if (validDwells.length < 2) return 100;

  const mean = validDwells.reduce((sum, d) => sum + d, 0) / validDwells.length;
  if (mean === 0) return 100;

  const variance =
    validDwells.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) /
    validDwells.length;
  const stdDev = Math.sqrt(variance);

  // Coefficient of Variation = (stdDev / mean)
  // Consistency % = 100 * (1 - CoV), clamped between 0 and 100
  const cov = stdDev / mean;
  const consistency = Math.max(0, Math.min(100, (1 - cov) * 100));

  return Math.round(consistency * 10) / 10;
}

/**
 * Calculates complete typing session metrics given the history of keystrokes and duration.
 */
export function calculateSessionMetrics(
  keystrokes: KeystrokeEvent[],
  durationMs: number,
  uncorrectedErrors: number = 0,
  existingHistory: WpmHistoryPoint[] = []
): TypingSessionMetrics {
  const totalKeystrokes = keystrokes.length;
  if (totalKeystrokes === 0 || durationMs <= 0) {
    return createInitialMetrics();
  }

  const durationMinutes = durationMs / 60000;

  let correctCount = 0;
  let errorCount = 0;
  const dwellTimes: number[] = [];
  const keyAccumulator: Record<
    string,
    { hits: number; misses: number; dwellSum: number; dwellCount: number }
  > = {};

  for (const k of keystrokes) {
    const keyId = k.expected.toLowerCase();

    if (!keyAccumulator[keyId]) {
      keyAccumulator[keyId] = {
        hits: 0,
        misses: 0,
        dwellSum: 0,
        dwellCount: 0,
      };
    }

    if (k.isCorrect) {
      correctCount++;
      keyAccumulator[keyId].hits++;
    } else {
      errorCount++;
      keyAccumulator[keyId].misses++;
    }

    if (k.dwellTimeMs > 0) {
      dwellTimes.push(k.dwellTimeMs);
      keyAccumulator[keyId].dwellSum += k.dwellTimeMs;
      keyAccumulator[keyId].dwellCount++;
    }
  }

  // Raw WPM: standard 5 characters per word
  const rawWpm = durationMinutes > 0 ? (totalKeystrokes / 5) / durationMinutes : 0;

  // Net WPM: deduct uncorrected errors
  const netWpm =
    durationMinutes > 0
      ? Math.max(0, (correctCount / 5 - uncorrectedErrors) / durationMinutes)
      : 0;

  // Characters per minute
  const cpm = durationMinutes > 0 ? (totalKeystrokes / durationMinutes) : 0;

  // Accuracy: correct keystrokes / total keystrokes
  const accuracy =
    totalKeystrokes > 0 ? (correctCount / totalKeystrokes) * 100 : 100;

  // Consistency
  const consistency = calculateConsistency(dwellTimes);

  // Compile detailed key-by-key metrics
  const keyMetrics: Record<string, KeyAccuracyMetric> = {};
  for (const [key, data] of Object.entries(keyAccumulator)) {
    const totalKeyAttempts = data.hits + data.misses;
    const errorRate =
      totalKeyAttempts > 0 ? (data.misses / totalKeyAttempts) * 100 : 0;
    const avgDwellTimeMs =
      data.dwellCount > 0 ? data.dwellSum / data.dwellCount : 0;

    keyMetrics[key] = {
      key,
      hits: data.hits,
      misses: data.misses,
      avgDwellTimeMs: Math.round(avgDwellTimeMs * 10) / 10,
      errorRate: Math.round(errorRate * 10) / 10,
    };
  }

  return {
    wpm: Math.round(netWpm * 10) / 10,
    rawWpm: Math.round(rawWpm * 10) / 10,
    cpm: Math.round(cpm),
    accuracy: Math.round(accuracy * 10) / 10,
    consistency,
    durationMs: Math.round(durationMs),
    correctCount,
    errorCount,
    totalKeystrokes,
    wpmHistory: existingHistory,
    keyMetrics,
  };
}

