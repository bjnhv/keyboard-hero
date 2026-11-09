import { db, loadSettings, persistSettings } from './client-db';
import { SyncBatchPayload, SyncBatchResponse, LocalSessionRecord } from '@/types/sync';
import { ApiResponse } from '@/types/api';
import { UserKeyProgress } from '@/types/curriculum';

export class ClientSyncManager {
  private isSyncing: boolean = false;
  private isHydrating: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;
  private onSyncListeners: Array<() => void> = [];

  public addListener(listener: () => void): () => void {
    this.onSyncListeners.push(listener);
    return () => {
      this.onSyncListeners = this.onSyncListeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(): void {
    for (const listener of this.onSyncListeners) {
      try {
        listener();
      } catch (err) {
        console.error('Sync listener error:', err);
      }
    }
  }

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
   * Returns count of local sessions not linked to an authenticated account.
   */
  public async getGuestSessionCount(): Promise<number> {
    if (typeof window === 'undefined') return 0;
    return await db.sessions.filter((s) => !s.userId || s.userId === 'guest').count();
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

      // Get stored auth token & user if available
      const token = localStorage.getItem('keyboard_hero_auth_token');
      let userId: string | undefined;
      try {
        const storedUser = localStorage.getItem('keyboard_hero_auth_user');
        if (storedUser) {
          userId = JSON.parse(storedUser)?.id;
        }
      } catch {}

      const payload: SyncBatchPayload = {
        sessions: pendingSessions,
        clientTimestamp: Date.now(),
        userId,
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/sync/sessions', {
        method: 'POST',
        headers,
        credentials: 'include',
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

      this.notifyListeners();
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

  /**
   * Pulls lifetime sessions, stage progression, and key progress from cloud down to Dexie.
   */
  public async hydrateFromCloud(userId?: string): Promise<{ sessionsMerged: number; keysMerged: number }> {
    if (typeof window === 'undefined' || this.isHydrating) {
      return { sessionsMerged: 0, keysMerged: 0 };
    }
    if (!navigator.onLine) {
      return { sessionsMerged: 0, keysMerged: 0 };
    }

    this.isHydrating = true;
    try {
      const headers: Record<string, string> = {};
      const token = localStorage.getItem('keyboard_hero_auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/sync/hydrate', {
        headers,
        credentials: 'include',
      });

      if (!res.ok) {
        return { sessionsMerged: 0, keysMerged: 0 };
      }

      const json = await res.json();
      if (!json.success || !json.data) {
        return { sessionsMerged: 0, keysMerged: 0 };
      }

      const { userProfile, sessions: remoteSessions, keyStats: remoteKeyStats } = json.data;

      let sessionsMerged = 0;
      let keysMerged = 0;

      // 1. Merge sessions into local Dexie
      if (Array.isArray(remoteSessions) && remoteSessions.length > 0) {
        await db.transaction('rw', db.sessions, async () => {
          for (const rSession of remoteSessions) {
            const existing = await db.sessions.get(rSession.id);
            if (!existing) {
              await db.sessions.put({
                ...rSession,
                syncStatus: 'synced',
              });
              sessionsMerged++;
            }
          }
        });
      }

      // 2. Merge key confidence and stats into local Dexie
      if (Array.isArray(remoteKeyStats) && remoteKeyStats.length > 0) {
        await db.transaction('rw', db.keyProgress, async () => {
          for (const remoteKey of remoteKeyStats) {
            const local = await db.keyProgress.get(remoteKey.key);
            if (!local) {
              await db.keyProgress.put(remoteKey);
              keysMerged++;
            } else {
              // Bidirectional conflict resolution: max confidence, max attempts, max rolling WPM, latest accuracy
              const mergedRecord: UserKeyProgress = {
                key: remoteKey.key,
                isUnlocked: local.isUnlocked || remoteKey.isUnlocked,
                confidence: Math.max(local.confidence ?? 0, remoteKey.confidence ?? 0),
                rollingWpm: Math.max(local.rollingWpm ?? 0, remoteKey.rollingWpm ?? 0),
                totalAttempts: Math.max(local.totalAttempts ?? 0, remoteKey.totalAttempts ?? 0),
                totalErrors: Math.max(local.totalErrors ?? 0, remoteKey.totalErrors ?? 0),
                rollingAccuracy:
                  new Date(remoteKey.lastPracticedAt).getTime() >=
                  new Date(local.lastPracticedAt).getTime()
                    ? remoteKey.rollingAccuracy
                    : local.rollingAccuracy,
                lastPracticedAt:
                  new Date(remoteKey.lastPracticedAt).getTime() >=
                  new Date(local.lastPracticedAt).getTime()
                    ? remoteKey.lastPracticedAt
                    : local.lastPracticedAt,
              };
              await db.keyProgress.put(mergedRecord);
              keysMerged++;
            }
          }
        });
      }

      // 3. Update curriculum stage if remote is higher
      if (userProfile && typeof userProfile.currentStageId === 'number') {
        const currentSettings = await loadSettings();
        if (userProfile.currentStageId > currentSettings.activeStageId) {
          await persistSettings({ activeStageId: userProfile.currentStageId });
        }
      }

      this.notifyListeners();
      return { sessionsMerged, keysMerged };
    } catch (err) {
      console.warn('Hydration from cloud encountered error:', err);
      return { sessionsMerged: 0, keysMerged: 0 };
    } finally {
      this.isHydrating = false;
    }
  }

  /**
   * Migrates all guest sessions stored in IndexedDB to an authenticated user ID,
   * enqueues them in the sync queue, pushes to the server, and pulls down remote history.
   */
  public async mergeGuestSessions(userId: string): Promise<number> {
    if (typeof window === 'undefined') return 0;

    let count = 0;
    await db.transaction('rw', db.sessions, db.syncQueue, async () => {
      const guestSessions = await db.sessions
        .filter((s) => !s.userId || s.userId === 'guest')
        .toArray();

      count = guestSessions.length;
      if (count === 0) return;

      for (const s of guestSessions) {
        const updated: LocalSessionRecord = {
          ...s,
          userId,
          syncStatus: 'pending',
        };
        await db.sessions.put(updated);
        await db.syncQueue.put({
          id: `sync-session-${s.id}`,
          entityType: 'session',
          entityId: s.id,
          payload: updated,
          action: 'insert',
          createdAt: Date.now(),
          retryCount: 0,
        });
      }
    });

    if (count > 0) {
      await this.triggerSync();
      await this.hydrateFromCloud(userId);
    }

    return count;
  }
}

export const syncManager = new ClientSyncManager();
