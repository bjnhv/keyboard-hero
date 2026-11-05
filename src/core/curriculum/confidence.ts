import { KeyAccuracyMetric } from '@/types/engine';
import { UserKeyProgress } from '@/types/curriculum';

/**
 * Computes key confidence score between 0.0 and 1.0.
 *
 * Factors:
 * 1. Accuracy Component (50% weight): Target >= 95% accuracy.
 * 2. Speed / Dwell Component (30% weight): Target dwell <= 250ms (~40 WPM equivalent per char).
 * 3. Volume / Sample Size Component (20% weight): Minimum 30 keystrokes for high confidence.
 */
export function calculateKeyConfidence(
  accuracyPct: number,
  avgDwellTimeMs: number,
  totalAttempts: number
): number {
  if (totalAttempts < 5) {
    // Insufficient sample size
    return Math.min(0.2, (totalAttempts / 5) * 0.2);
  }

  // 1. Accuracy score (0.0 to 1.0)
  // 95% accuracy = 1.0; 80% accuracy = 0.5; < 60% = 0.0
  const accScore = Math.max(0, Math.min(1.0, (accuracyPct - 60) / 35));

  // 2. Speed score (0.0 to 1.0)
  // <= 200ms = 1.0; 500ms = 0.4; >= 800ms = 0.0
  const speedScore =
    avgDwellTimeMs > 0
      ? Math.max(0, Math.min(1.0, (800 - avgDwellTimeMs) / 600))
      : 0.5;

  // 3. Volume score (0.0 to 1.0)
  // Fully confident sample at 40+ attempts
  const volumeScore = Math.min(1.0, totalAttempts / 40);

  const rawConfidence = accScore * 0.5 + speedScore * 0.3 + volumeScore * 0.2;
  return Math.round(Math.max(0, Math.min(1.0, rawConfidence)) * 100) / 100;
}

/**
 * Updates an existing UserKeyProgress record with results from a completed session.
 */
export function updateUserKeyProgress(
  current: UserKeyProgress | undefined,
  metric: KeyAccuracyMetric,
  nowIso: string = new Date().toISOString()
): UserKeyProgress {
  const existingAttempts = current?.totalAttempts ?? 0;
  const existingErrors = current?.totalErrors ?? 0;
  const newAttempts = metric.hits + metric.misses;

  const totalAttempts = existingAttempts + newAttempts;
  const totalErrors = existingErrors + metric.misses;
  const overallAccuracy =
    totalAttempts > 0 ? ((totalAttempts - totalErrors) / totalAttempts) * 100 : 100;

  // Exponential moving average for rolling WPM & dwell
  const sessionWpm =
    metric.avgDwellTimeMs > 0 ? (60000 / metric.avgDwellTimeMs) / 5 : 0;
  const rollingWpm = current
    ? current.rollingWpm * 0.7 + sessionWpm * 0.3
    : sessionWpm;
  const rollingAccuracy = current
    ? current.rollingAccuracy * 0.7 + (100 - metric.errorRate) * 0.3
    : 100 - metric.errorRate;

  const confidence = calculateKeyConfidence(
    overallAccuracy,
    metric.avgDwellTimeMs,
    totalAttempts
  );

  return {
    key: metric.key,
    isUnlocked: current?.isUnlocked ?? true,
    confidence,
    rollingWpm: Math.round(rollingWpm * 10) / 10,
    rollingAccuracy: Math.round(rollingAccuracy * 10) / 10,
    totalAttempts,
    totalErrors,
    lastPracticedAt: nowIso,
  };
}

/**
 * Identifies the weakest key among the active/unlocked set based on lowest confidence.
 */
export function getWeakestKey(
  activeKeys: string[],
  keyProgress: Record<string, UserKeyProgress>
): string | null {
  if (activeKeys.length === 0) return null;

  let weakestKey = activeKeys[0];
  let lowestConfidence = Infinity;

  for (const key of activeKeys) {
    const progress = keyProgress[key];
    const confidence = progress ? progress.confidence : 0;
    if (confidence < lowestConfidence) {
      lowestConfidence = confidence;
      weakestKey = key;
    }
  }

  return weakestKey;
}
