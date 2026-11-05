# Backend Development Guidelines & Coding Standards

This document establishes the architecture rules, naming conventions, database patterns, and coding standards for all server-side and API code in this project.

---

## 1. Architecture & Layering

All server-side code lives under `src/server/` and `src/app/api/` (or `apps/api/`). Adhere strictly to a 3-layer architecture:

```
[ HTTP Route Handlers (src/app/api/*) ]
                  │
                  ▼
[ Domain Services (src/server/services/*) ]
                  │
                  ▼
[ Data Access Layer (src/db/* - Drizzle ORM) ]
```

### Layer Responsibilities
1. **Route Handlers (`src/app/api/**/route.ts`)**:
   - Parse and validate incoming requests using **Zod**.
   - Authenticate the session / user.
   - Call the corresponding Service function.
   - Return standardized HTTP responses (`ApiResponse<T>`).
   - **No direct database queries** inside route handlers.

2. **Domain Services (`src/server/services/*.service.ts`)**:
   - Contain pure business logic (e.g., metric calculations, stage unlocking logic, sync resolution).
   - Coordinate transactions across multiple database operations.
   - Throw typed domain errors (e.g., `NotFoundError`, `ConflictError`, `ValidationError`).

3. **Data Access Layer (`src/db/**`)**:
   - Drizzle schema definitions and migrations.
   - Direct database operations (queries, inserts, upserts).
   - All SQL column names must be `snake_case` in the database, mapped to `camelCase` in TypeScript.

---

## 2. Database Guidelines (Drizzle ORM & PostgreSQL)

### Schema Conventions
- Table names must be plural and `snake_case` (e.g., `typing_sessions`, `user_key_stats`).
- Primary keys must be UUID v4 or v7 (strings), generated client-side or server-side for offline sync compatibility.
- Always include `created_at` and `updated_at` timestamps on all persistent tables.
- Use foreign key constraints with appropriate `onDelete` cascades.

```typescript
// Example: src/db/schema/sessions.ts
import { pgTable, text, timestamp, integer, real, uuid, jsonb } from 'drizzle-orm/pg-core';
import { users } from './users';

export const sessions = pgTable('typing_sessions', {
  id: uuid('id').primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  stageId: integer('stage_id').notNull(),
  wpm: real('wpm').notNull(),
  rawWpm: real('raw_wpm').notNull(),
  accuracy: real('accuracy').notNull(),
  durationMs: integer('duration_ms').notNull(),
  errorCount: integer('error_count').notNull(),
  keystrokeCount: integer('keystroke_count').notNull(),
  keyMetrics: jsonb('key_metrics').notNull(), // Per-key speed and accuracy snapshot
  completedAt: timestamp('completed_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
```

### Offline Sync Rules (Idempotency)
- All session records use client-generated `id` (UUID).
- Sync operations MUST be **idempotent**: use `ON CONFLICT (id) DO UPDATE` or `DO NOTHING` to allow clients to retry sync requests safely without creating duplicate sessions.
- Process sync batches inside a single database transaction (`db.transaction(async (tx) => { ... })`).

---

## 3. Request Validation & DTOs

- Every API endpoint that receives a body or query parameters must validate using a **Zod** schema.
- Infer TypeScript types directly from Zod schemas:

```typescript
// src/server/dtos/sync.dto.ts
import { z } from 'zod';

export const SyncSessionItemSchema = z.object({
  id: z.string().uuid(),
  stageId: z.number().int().min(1),
  wpm: z.number().min(0).max(400),
  rawWpm: z.number().min(0).max(400),
  accuracy: z.number().min(0).max(100),
  durationMs: z.number().int().positive(),
  errorCount: z.number().int().min(0),
  keystrokeCount: z.number().int().positive(),
  completedAt: z.string().datetime(),
  keyMetrics: z.record(z.string(), z.object({
    hits: z.number().int().min(0),
    misses: z.number().int().min(0),
    avgDwellTimeMs: z.number().min(0),
  })),
});

export const SyncBatchRequestSchema = z.object({
  sessions: z.array(SyncSessionItemSchema).max(100),
  clientTimestamp: z.number(),
});

export type SyncBatchRequest = z.infer<typeof SyncBatchRequestSchema>;
```

---

## 4. API Response Standards & Error Handling

All API endpoints must return a consistent JSON envelope matching `ApiResponse<T>`:

### Success Response Format (HTTP 200/201)
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": 1730847600000
  }
}
```

### Error Response Format (HTTP 4xx/5xx)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid sync payload format",
    "details": [ ... ]
  }
}
```

### HTTP Status Code Conventions
- `200 OK`: Successful read or update.
- `201 Created`: Resource successfully created.
- `400 Bad Request`: Validation failure (malformed JSON or Zod schema error).
- `401 Unauthorized`: Missing or invalid authentication token.
- `403 Forbidden`: Authenticated user does not have permission.
- `404 Not Found`: Target resource does not exist.
- `409 Conflict`: Concurrency conflict or duplicate record.
- `500 Internal Server Error`: Unhandled exception (log stack trace, mask details from client).

---

## 5. Security & Performance Rules

1. **Authentication**: All user-specific endpoints must authenticate using verified tokens (JWT/session).
2. **Rate Limiting**: Rate limit sync and auth endpoints (e.g., maximum 30 sync requests per minute per IP/user).
3. **Payload Limits**: Cap batch sync sizes (e.g., maximum 100 sessions per sync payload, max 2MB).
4. **No Secrets in Code**: Database URLs, JWT secrets, and API keys must be loaded exclusively via environment variables (`process.env.DATABASE_URL`) and validated at startup using an `env.ts` schema.

