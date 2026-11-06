import { pgTable, text, timestamp, integer, real, uuid, primaryKey } from 'drizzle-orm/pg-core';
import { users } from './users';

export const userKeyStats = pgTable(
  'user_key_stats',
  {
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    key: text('key').notNull(),
    confidence: real('confidence').default(0).notNull(),
    rollingWpm: real('rolling_wpm').default(0).notNull(),
    rollingAccuracy: real('rolling_accuracy').default(100).notNull(),
    totalAttempts: integer('total_attempts').default(0).notNull(),
    totalErrors: integer('total_errors').default(0).notNull(),
    lastPracticedAt: timestamp('last_practiced_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.key] }),
  ]
);
