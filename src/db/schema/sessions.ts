import { pgTable, text, timestamp, integer, real, jsonb, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';

export const sessions = pgTable('typing_sessions', {
  id: text('id').primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  stageId: integer('stage_id').notNull(),
  wpm: real('wpm').notNull(),
  rawWpm: real('raw_wpm').notNull(),
  accuracy: real('accuracy').notNull(),
  consistency: real('consistency').notNull(),
  durationMs: integer('duration_ms').notNull(),
  errorCount: integer('error_count').notNull(),
  totalKeystrokes: integer('total_keystrokes').notNull(),
  keyMetrics: jsonb('key_metrics').notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
