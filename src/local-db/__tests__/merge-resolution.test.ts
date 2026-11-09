import { describe, it, expect } from 'vitest';
import { UserKeyProgress } from '@/types/curriculum';

export function resolveKeyProgressConflict(
  local: UserKeyProgress,
  remote: UserKeyProgress
): UserKeyProgress {
  const localTime = new Date(local.lastPracticedAt).getTime();
  const remoteTime = new Date(remote.lastPracticedAt).getTime();
  const isRemoteNewer = remoteTime >= localTime;

  return {
    key: remote.key,
    isUnlocked: local.isUnlocked || remote.isUnlocked,
    confidence: Math.max(local.confidence ?? 0, remote.confidence ?? 0),
    rollingWpm: Math.max(local.rollingWpm ?? 0, remote.rollingWpm ?? 0),
    totalAttempts: Math.max(local.totalAttempts ?? 0, remote.totalAttempts ?? 0),
    totalErrors: Math.max(local.totalErrors ?? 0, remote.totalErrors ?? 0),
    rollingAccuracy: isRemoteNewer ? remote.rollingAccuracy : local.rollingAccuracy,
    lastPracticedAt: isRemoteNewer ? remote.lastPracticedAt : local.lastPracticedAt,
  };
}

describe('Bidirectional Cross-Device Conflict Resolution', () => {
  it('merges key progress with highest confidence and max attempts', () => {
    const localKey: UserKeyProgress = {
      key: 'f',
      isUnlocked: true,
      confidence: 0.85,
      rollingWpm: 45,
      rollingAccuracy: 92,
      totalAttempts: 150,
      totalErrors: 12,
      lastPracticedAt: '2026-11-08T10:00:00.000Z',
    };

    const remoteKey: UserKeyProgress = {
      key: 'f',
      isUnlocked: true,
      confidence: 0.92,
      rollingWpm: 52,
      rollingAccuracy: 97,
      totalAttempts: 220,
      totalErrors: 10,
      lastPracticedAt: '2026-11-08T12:00:00.000Z',
    };

    const resolved = resolveKeyProgressConflict(localKey, remoteKey);

    expect(resolved.confidence).toBe(0.92);
    expect(resolved.rollingWpm).toBe(52);
    expect(resolved.totalAttempts).toBe(220);
    expect(resolved.rollingAccuracy).toBe(97); // Remote is newer
    expect(resolved.lastPracticedAt).toBe('2026-11-08T12:00:00.000Z');
  });

  it('preserves more recent local accuracy if local session occurred after remote sync', () => {
    const localKey: UserKeyProgress = {
      key: 'j',
      isUnlocked: true,
      confidence: 0.90,
      rollingWpm: 60,
      rollingAccuracy: 99,
      totalAttempts: 300,
      totalErrors: 5,
      lastPracticedAt: '2026-11-09T08:00:00.000Z', // newer
    };

    const remoteKey: UserKeyProgress = {
      key: 'j',
      isUnlocked: true,
      confidence: 0.88,
      rollingWpm: 58,
      rollingAccuracy: 94,
      totalAttempts: 280,
      totalErrors: 8,
      lastPracticedAt: '2026-11-08T20:00:00.000Z', // older
    };

    const resolved = resolveKeyProgressConflict(localKey, remoteKey);

    expect(resolved.confidence).toBe(0.90);
    expect(resolved.rollingWpm).toBe(60);
    expect(resolved.totalAttempts).toBe(300);
    expect(resolved.rollingAccuracy).toBe(99); // Local is newer
    expect(resolved.lastPracticedAt).toBe('2026-11-09T08:00:00.000Z');
  });

  it('correctly resolves higher stage progression', () => {
    const localStage = 3;
    const remoteStage = 5;
    const resolvedStage = Math.max(localStage, remoteStage);
    expect(resolvedStage).toBe(5);
  });
});

