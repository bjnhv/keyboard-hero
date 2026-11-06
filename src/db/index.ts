import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

let pool: Pool | null = null;

export function getDbPool(): Pool | null {
  if (typeof window !== 'undefined') return null;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return null;
  }

  if (!pool) {
    pool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
    });
  }

  return pool;
}

export function getDb() {
  const activePool = getDbPool();
  if (!activePool) {
    return null;
  }
  return drizzle(activePool, { schema });
}
