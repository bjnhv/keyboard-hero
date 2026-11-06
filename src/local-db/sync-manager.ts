import { db } from './client-db';
import { SyncBatchPayload, SyncBatchResponse } from '@/types/sync';
import { ApiResponse } from '@/types/api';

export class ClientSyncManager {
  private isSyncing: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;

  public startPeriodicSync(intervalMs: number = 60000): void {
    if (typeof window === 'undefined') return;

    // Trigger on online reconnect event
    window.addEventListener('online', () => {
      this.triggerSync().catch(() => {});
    });

    if (!this.intervalId) {
      this.intervalId = setInterval(() => {
        this.triggerSync().catch(() => {});
      }, intervalMs);
    }

    // Trigger initial sync attempt on startup
    this.triggerSync().catch(() => {});
  }

  public stopPeriodicSync(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Dispatches pending local sessions to the server sync API endpoint.
   */
  public async triggerSync(): Promise<number> {
    if (typeof window === 'undefined') return 0;
    if (this.isSyncing) return 0;
    if (!navigator.onLine) return 0;

    this.isSyncing = true;

    try {
      // Find all pending sessions
      const pendingSessions = await db.sessions
        .where('syncStatus')
        .equals('pending')
        .limit(50)
        .toArray();

      if (pendingSessions.length === 0) {
        return 0;
      }

      // Mark as syncing locally
      await db.sessions
        .where('id')
        .anyOf(pendingSessions.map((s) => s.id))
        .modify({ syncStatus: 'syncing' });

      const payload: SyncBatchPayload = {
        sessions: pendingSessions,
        clientTimestamp: Date.now(),
      };

      const res = await fetch('/api/sync/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Sync request failed with status ${res.status}`);
      }

      const json: ApiResponse<SyncBatchResponse> = await res.json();
      if (!json.success) {
        throw new Error(json.error.message || 'Sync response reported failure');
      }

      const syncedIds = json.data.syncedIds;

      // Mark successfully synced sessions in Dexie
      if (syncedIds.length > 0) {
        await db.sessions
          .where('id')
          .anyOf(syncedIds)
          .modify({ syncStatus: 'synced' });

        // Remove from syncQueue
        await db.syncQueue
          .where('entityId')
          .anyOf(syncedIds)
          .delete();
      }

      return syncedIds.length;
    } catch (err) {
      console.warn('Background sync encountered temporary issue:', err);

      // Revert syncing sessions to pending
      await db.sessions
        .where('syncStatus')
        .equals('syncing')
        .modify((s) => {
          s.syncStatus = 'pending';
          s.syncRetries = (s.syncRetries ?? 0) + 1;
        });

      return 0;
    } finally {
      this.isSyncing = false;
    }
  }
}

export const syncManager = new ClientSyncManager();
