import { pgTable, uuid, text, timestamp, integer, real } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: text('username').notNull().unique(),
  email: text('email').unique(),
  avatarUrl: text('avatar_url'),
  currentStageId: integer('current_stage_id').default(1).notNull(),
  bestWpm: real('best_wpm').default(0).notNull(),
  avgWpm: real('avg_wpm').default(0).notNull(),
  streakDays: integer('streak_days').default(0).notNull(),
  lastActiveDate: text('last_active_date'),
  totalPracticeSeconds: integer('total_practice_seconds').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
