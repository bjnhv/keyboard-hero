/**
 * Offline-First & Server Synchronization Interfaces
 * Connects client-side Dexie.js (IndexedDB) with PostgreSQL via Drizzle ORM.
 */

import { TypingSessionMetrics } from './engine';

export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'failed';

export interface LocalSessionRecord {
  /** Client-generated UUID (v4) used as primary key across local DB and server DB */
  id: string;
  /** Optional user identifier if authenticated */
  userId?: string;
  /** Progression stage ID when the session took place */
  stageId: number;
  /** Full computed metrics for this practice session */
  metrics: TypingSessionMetrics;
  /** ISO timestamp string when practice finished */
  completedAt: string;
  /** Synchronization state with the server */
  syncStatus: SyncStatus;
  /** Error message if synchronization failed */
  syncError?: string;
  /** Number of failed sync attempts */
  syncRetries: number;
  /** Local creation timestamp */
  createdAt: number;
}

export interface SyncQueueItem {
  id: string;
  entityType: 'session' | 'key_progress' | 'settings';
  entityId: string;
  payload: unknown;
  action: 'insert' | 'update' | 'delete';
  createdAt: number;
  retryCount: number;
}

export interface SyncBatchPayload {
  /** Array of completed session records to synchronize */
  sessions: LocalSessionRecord[];
  /** Client wall-clock timestamp at moment of dispatch */
  clientTimestamp: number;
  /** Authenticated user ID (if available) */
  userId?: string;
}

export interface SyncBatchResponse {
  /** Array of session IDs successfully ingested and committed to the database */
  syncedIds: string[];
  /** Server timestamp at time of processing */
  serverTimestamp: number;
  /** Mapping of any conflict resolutions or warnings */
  conflictResolutions?: Record<string, 'accepted' | 'ignored_duplicate' | 'rejected'>;
}

