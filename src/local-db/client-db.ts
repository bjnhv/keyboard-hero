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
  targetWpm: 40,
  targetAccuracy: 95,
};

export interface LocalSettingsRecord extends UserSettings {
  id: string; // 'current'
  activeStageId: number;
}

export class KeyboardHeroDB extends Dexie {
  sessions!: EntityTable<LocalSessionRecord, 'id'>;
  keyProgress!: EntityTable<UserKeyProgress, 'key'>;
  userSettings!: EntityTable<LocalSettingsRecord, 'id'>;
  syncQueue!: EntityTable<SyncQueueItem, 'id'>;

  constructor() {
    super('KeyboardHeroDB');

    this.version(1).stores({
      sessions: 'id, completedAt, stageId, syncStatus, createdAt',
      keyProgress: 'key, confidence, lastPracticedAt',
      userSettings: 'id',
      syncQueue: 'id, createdAt, entityType',
    });
  }
}

export const db = new KeyboardHeroDB();

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

