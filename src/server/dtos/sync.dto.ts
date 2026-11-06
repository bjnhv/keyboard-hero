import { z } from 'zod';

export const KeyAccuracyMetricSchema = z.object({
  key: z.string(),
  hits: z.number().int().min(0),
  misses: z.number().int().min(0),
  avgDwellTimeMs: z.number().min(0),
  errorRate: z.number().min(0).max(100),
});

export const LocalSessionRecordSchema = z.object({
  id: z.string().min(1),
  userId: z.string().uuid().optional(),
  stageId: z.number().int().min(1),
  completedAt: z.string(),
  syncStatus: z.enum(['pending', 'syncing', 'synced', 'failed']),
  syncRetries: z.number().int().default(0),
  createdAt: z.number(),
  metrics: z.object({
    wpm: z.number().min(0),
    rawWpm: z.number().min(0),
    cpm: z.number().min(0),
    accuracy: z.number().min(0).max(100),
    consistency: z.number().min(0).max(100),
    durationMs: z.number().int().min(0),
    correctCount: z.number().int().min(0),
    errorCount: z.number().int().min(0),
    totalKeystrokes: z.number().int().min(0),
    wpmHistory: z.array(
      z.object({
        second: z.number(),
        wpm: z.number(),
        rawWpm: z.number(),
        errors: z.number(),
      })
    ).optional().default([]),
    keyMetrics: z.record(z.string(), KeyAccuracyMetricSchema),
  }),
});

export const SyncBatchPayloadSchema = z.object({
  sessions: z.array(LocalSessionRecordSchema).max(100),
  clientTimestamp: z.number(),
  userId: z.string().uuid().optional(),
});

export type SyncBatchPayloadDto = z.infer<typeof SyncBatchPayloadSchema>;
