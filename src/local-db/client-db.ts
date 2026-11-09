import Dexie, { type EntityTable } from 'dexie';
import { LocalSessionRecord, SyncQueueItem } from '@/types/sync';
import { UserKeyProgress } from '@/types/curriculum';
import { UserSettings } from '@/types/user';

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark',
  uiFontSize: 'standard',
  soundEnabled: true,
  soundVolume: 0.25,
  soundTheme: 'cherry-blue',
  keyboardLayout: 'qwerty',
  showVirtualKeyboard: true,
  showHandsGuide: true,
  hardcoreMode: false,
  arcadeUnlocked: false,
  targetWpm: 40,
  targetAccuracy: 95,
};

export interface LocalSettingsRecord extends UserSettings {
  id: string; // 'current'
  activeStageId: number;
  layoutStages?: Partial<Record<UserSettings['keyboardLayout'], number>>;
}

export interface ArcadeScoreRecord {
  id: string;
  gameId: 'redline' | 'defuse' | 'invaders';
  difficulty: string;
  score: number;
  wpm: number;
  accuracy: number;
  achievedAt: string;
}

export class KeyboardHeroDB extends Dexie {
  sessions!: EntityTable<LocalSessionRecord, 'id'>;
  keyProgress!: EntityTable<UserKeyProgress, 'key'>;
  userSettings!: EntityTable<LocalSettingsRecord, 'id'>;
  syncQueue!: EntityTable<SyncQueueItem, 'id'>;
  arcadeScores!: EntityTable<ArcadeScoreRecord, 'id'>;

  constructor() {
    super('KeyboardHeroDB');

    this.version(1).stores({
      sessions: 'id, completedAt, stageId, syncStatus, createdAt',
      keyProgress: 'key, confidence, lastPracticedAt',
      userSettings: 'id',
      syncQueue: 'id, createdAt, entityType',
    });

    this.version(2).stores({
      sessions: 'id, completedAt, stageId, syncStatus, createdAt',
      keyProgress: 'key, confidence, lastPracticedAt',
      userSettings: 'id',
      syncQueue: 'id, createdAt, entityType',
      arcadeScores: 'id, gameId, difficulty, achievedAt',
    });
  }
}

export const db = new KeyboardHeroDB();

/**
 * Persists an arcade game high score to IndexedDB.
 */
export async function persistArcadeScore(score: ArcadeScoreRecord): Promise<void> {
  await db.arcadeScores.put(score);
}

/**
 * Loads recent arcade high scores.
 */
  export async function loadArcadeScores(gameId?: 'redline' | 'defuse' | 'invaders'): Promise<ArcadeScoreRecord[]> {
    if (gameId) {
      return await db.arcadeScores.where('gameId').equals(gameId).reverse().sortBy('score');
    }
    return await db.arcadeScores.orderBy('achievedAt').reverse().limit(20).toArray();
  }

  /**
   * Persists a completed typing session to IndexedDB and enqueues it for server sync.
   */
  export async function persistSession(session: LocalSessionRecord): Promise<void> {
    await db.transaction('rw', db.sessions, db.syncQueue, async () => {
      await db.sessions.put(session);
      await db.syncQueue.put({
        id: `sync-session-${session.id}`,
        entityType: 'session',
        entityId: session.id,
        payload: session,
        action: 'insert',
        createdAt: Date.now(),
        retryCount: 0,
      });
    });
  }

  /**
   * Bulk updates key confidence and progress records in IndexedDB.
   */
  export async function persistKeyProgress(progressList: UserKeyProgress[]): Promise<void> {
    if (progressList.length === 0) return;
    await db.keyProgress.bulkPut(progressList);
  }

  /**
   * Loads all key progress records as a dictionary.
   */
  export async function loadKeyProgressMap(): Promise<Record<string, UserKeyProgress>> {
    const records = await db.keyProgress.toArray();
    const map: Record<string, UserKeyProgress> = {};
    for (const r of records) {
      map[r.key] = r;
    }
    return map;
  }

  /**
   * Saves current user curriculum stage and preferences.
   */
  export async function persistSettings(
    settings: Partial<LocalSettingsRecord>
  ): Promise<void> {
    const current = (await db.userSettings.get('current')) ?? {
      id: 'current',
      activeStageId: 1,
      ...DEFAULT_SETTINGS,
    };
    await db.userSettings.put({ ...current, ...settings });
  }

  /**
   * Loads user settings and last active stage ID.
   */
  export async function loadSettings(): Promise<LocalSettingsRecord> {
    const settings = await db.userSettings.get('current');
    if (!settings) {
      const initial: LocalSettingsRecord = {
        id: 'current',
        activeStageId: 1,
        ...DEFAULT_SETTINGS,
      };
      await db.userSettings.put(initial);
      return initial;
    }
    return settings;
  }

  /**
   * Clears all local progress (sessions, key confidence, and resets stage to 1).
   */
  export async function clearLocalProgress(): Promise<void> {
    await db.transaction('rw', db.sessions, db.keyProgress, db.syncQueue, db.userSettings, async () => {
      await db.sessions.clear();
      await db.keyProgress.clear();
      await db.syncQueue.clear();
      await db.userSettings.put({
        id: 'current',
        activeStageId: 1,
        ...DEFAULT_SETTINGS,
      });
    });
  }

