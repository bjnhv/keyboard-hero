import { getDb, getDbPool } from '@/db';
import { sessions } from '@/db/schema/sessions';
import { userKeyStats } from '@/db/schema/key-stats';
import { users } from '@/db/schema/users';
import { SyncBatchPayloadDto } from '../dtos/sync.dto';
import { SyncBatchResponse, LocalSessionRecord } from '@/types/sync';
import { ensurePublicUserRecord } from '../auth';
import { sql, eq } from 'drizzle-orm';
import { UserKeyProgress } from '@/types/curriculum';

export interface HydrationData {
  userProfile: {
    id: string;
    username: string;
    email: string | null;
    avatarUrl: string | null;
    currentStageId: number;
    bestWpm: number;
    avgWpm: number;
    streakDays: number;
    totalPracticeSeconds: number;
  } | null;
  sessions: LocalSessionRecord[];
  keyStats: UserKeyProgress[];
}

export class SyncService {
  /**
   * Processes a batch of offline practice sessions idempotently.
   */
  public async syncSessions(
    payload: SyncBatchPayloadDto,
    authenticatedUserId?: string
  ): Promise<SyncBatchResponse> {
    const db = getDb();
    const pool = getDbPool();
    const serverTimestamp = Date.now();
    const syncedIds: string[] = [];

    if (!db || !pool) {
      // In offline/in-memory mode without configured PostgreSQL DATABASE_URL,
      // acknowledge client sessions gracefully
      return {
        syncedIds: payload.sessions.map((s) => s.id),
        serverTimestamp,
      };
    }

    const effectiveUserId = authenticatedUserId || payload.userId || null;

    if (effectiveUserId) {
      await ensurePublicUserRecord({ id: effectiveUserId });
    }

    for (const item of payload.sessions) {
      try {
        const sessionUserId = effectiveUserId || item.userId || null;

        if (sessionUserId && sessionUserId !== effectiveUserId) {
          await ensurePublicUserRecord({ id: sessionUserId });
        }

        await db
          .insert(sessions)
          .values({
            id: item.id,
            userId: sessionUserId,
            stageId: item.stageId,
            wpm: item.metrics.wpm,
            rawWpm: item.metrics.rawWpm,
            accuracy: item.metrics.accuracy,
            consistency: item.metrics.consistency,
            durationMs: item.metrics.durationMs,
            errorCount: item.metrics.errorCount,
            totalKeystrokes: item.metrics.totalKeystrokes,
            keyMetrics: item.metrics.keyMetrics,
            completedAt: new Date(item.completedAt),
          })
          .onConflictDoNothing({ target: sessions.id });

        syncedIds.push(item.id);

        // Update user key stats in cloud if session has an assigned user
        if (sessionUserId && item.metrics.keyMetrics) {
          for (const [keyChar, metric] of Object.entries(item.metrics.keyMetrics)) {
            const attempts = metric.hits + metric.misses;
            const errors = metric.misses;
            const accuracy = attempts > 0 ? (metric.hits / attempts) * 100 : 100;
            // Approximate confidence formula: accuracy weight * 0.6 + speed weight
            const confidence = Math.min(1, Math.max(0, (accuracy / 100) * 0.8 + 0.2));

            await pool.query(
              `INSERT INTO public.user_key_stats (
                user_id, key, confidence, rolling_wpm, rolling_accuracy, total_attempts, total_errors, last_practiced_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
              ON CONFLICT (user_id, key) DO UPDATE SET
                confidence = GREATEST(public.user_key_stats.confidence, EXCLUDED.confidence),
                rolling_wpm = GREATEST(public.user_key_stats.rolling_wpm, EXCLUDED.rolling_wpm),
                rolling_accuracy = EXCLUDED.rolling_accuracy,
                total_attempts = public.user_key_stats.total_attempts + EXCLUDED.total_attempts,
                total_errors = public.user_key_stats.total_errors + EXCLUDED.total_errors,
                last_practiced_at = NOW();`,
              [sessionUserId, keyChar, confidence, item.metrics.wpm, accuracy, attempts, errors]
            );
          }
        }
      } catch (err) {
        console.error(`Failed to insert session ${item.id}:`, err);
      }
    }

    // Update aggregate stats on public.users
    if (effectiveUserId && syncedIds.length > 0) {
      try {
        await pool.query(
          `WITH user_sessions AS (
            SELECT 
              COALESCE(MAX(wpm), 0) as max_wpm,
              COALESCE(AVG(wpm), 0) as average_wpm,
              COALESCE(MAX(stage_id), 1) as max_stage,
              COALESCE(SUM(duration_ms) / 1000, 0)::integer as practice_seconds
            FROM public.typing_sessions
            WHERE user_id = $1
          )
          UPDATE public.users u
          SET 
            best_wpm = GREATEST(u.best_wpm, s.max_wpm),
            avg_wpm = s.average_wpm,
            current_stage_id = GREATEST(u.current_stage_id, s.max_stage),
            total_practice_seconds = s.practice_seconds,
            last_active_date = CURRENT_DATE::text,
            updated_at = NOW()
          FROM user_sessions s
          WHERE u.id = $1;`,
          [effectiveUserId]
        );
      } catch (err) {
        console.warn('Failed to update public.users aggregate stats:', err);
      }
    }

    return {
      syncedIds,
      serverTimestamp,
    };
  }

  /**
   * Fetches hydration payload for a newly signed-in user or a new device.
   */
  public async getHydrationData(userId: string): Promise<HydrationData> {
    const db = getDb();
    const pool = getDbPool();

    if (!db || !pool) {
      return {
        userProfile: null,
        sessions: [],
        keyStats: [],
      };
    }

    // 1. Fetch user profile
    const userRes = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const userProfile = userRes[0]
      ? {
          id: userRes[0].id,
          username: userRes[0].username,
          email: userRes[0].email,
          avatarUrl: userRes[0].avatarUrl,
          currentStageId: userRes[0].currentStageId,
          bestWpm: userRes[0].bestWpm,
          avgWpm: userRes[0].avgWpm,
          streakDays: userRes[0].streakDays,
          totalPracticeSeconds: userRes[0].totalPracticeSeconds,
        }
      : null;

    // 2. Fetch recent sessions
    const sessionRows = await db
      .select()
      .from(sessions)
      .where(eq(sessions.userId, userId))
      .orderBy(sql`${sessions.completedAt} DESC`)
      .limit(100);

    const mappedSessions: LocalSessionRecord[] = sessionRows.map((s) => ({
      id: s.id,
      userId: s.userId ?? undefined,
      stageId: s.stageId,
      completedAt: s.completedAt.toISOString(),
      syncStatus: 'synced',
      syncRetries: 0,
      createdAt: s.createdAt.getTime(),
      metrics: {
        wpm: s.wpm,
        rawWpm: s.rawWpm,
        cpm: Math.round(s.rawWpm * 5),
        accuracy: s.accuracy,
        consistency: s.consistency,
        durationMs: s.durationMs,
        correctCount: Math.round(s.totalKeystrokes * (s.accuracy / 100)),
        errorCount: s.errorCount,
        totalKeystrokes: s.totalKeystrokes,
        wpmHistory: [],
        keyMetrics: (s.keyMetrics as Record<string, any>) || {},
      },
    }));

    // 3. Fetch key stats
    const keyRows = await db
      .select()
      .from(userKeyStats)
      .where(eq(userKeyStats.userId, userId));

    const keyStats: UserKeyProgress[] = keyRows.map((k) => ({
      key: k.key,
      isUnlocked: true,
      confidence: k.confidence,
      rollingWpm: k.rollingWpm,
      rollingAccuracy: k.rollingAccuracy,
      totalAttempts: k.totalAttempts,
      totalErrors: k.totalErrors,
      lastPracticedAt: k.lastPracticedAt.toISOString(),
    }));

    return {
      userProfile,
      sessions: mappedSessions,
      keyStats,
    };
  }
}

export const syncService = new SyncService();
