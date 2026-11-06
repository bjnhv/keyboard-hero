import { getDb } from '@/db';
import { sessions } from '@/db/schema/sessions';
import { SyncBatchPayloadDto } from '../dtos/sync.dto';
import { SyncBatchResponse } from '@/types/sync';

export class SyncService {
  /**
   * Processes a batch of offline practice sessions idempotently.
   */
  public async syncSessions(payload: SyncBatchPayloadDto): Promise<SyncBatchResponse> {
    const db = getDb();
    const serverTimestamp = Date.now();
    const syncedIds: string[] = [];

    if (!db) {
      // In offline/in-memory mode without configured PostgreSQL DATABASE_URL,
      // acknowledge client sessions gracefully
      return {
        syncedIds: payload.sessions.map((s) => s.id),
        serverTimestamp,
      };
    }

    await db.transaction(async (tx) => {
      for (const item of payload.sessions) {
        try {
          await tx
            .insert(sessions)
            .values({
              id: item.id,
              userId: item.userId ?? null,
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
        } catch (err) {
          console.error(`Failed to insert session ${item.id}:`, err);
        }
      }
    });

    return {
      syncedIds,
      serverTimestamp,
    };
  }
}

export const syncService = new SyncService();
