import { getDbPool } from '@/db';

export interface NeonServiceStatus {
  postgres: {
    configured: boolean;
    connected: boolean;
    branch?: string;
    error?: string;
  };
  auth: {
    configured: boolean;
    baseUrl?: string;
    jwksUrl?: string;
  };
  functions: {
    configured: boolean;
    helloBaseUrl?: string;
  };
}

export async function checkNeonServices(): Promise<NeonServiceStatus> {
  const dbPool = getDbPool();
  let pgConnected = false;
  let pgError: string | undefined;

  if (dbPool) {
    try {
      const client = await dbPool.connect();
      await client.query('SELECT 1');
      client.release();
      pgConnected = true;
    } catch (err: unknown) {
      pgError = err instanceof Error ? err.message : String(err);
    }
  }

  return {
    postgres: {
      configured: Boolean(process.env.DATABASE_URL),
      connected: pgConnected,
      branch: process.env.NEON_BRANCH,
      error: pgError,
    },
    auth: {
      configured: Boolean(process.env.NEON_AUTH_BASE_URL),
      baseUrl: process.env.NEON_AUTH_BASE_URL,
      jwksUrl: process.env.NEON_AUTH_JWKS_URL,
    },
    functions: {
      configured: Boolean(process.env.NEON_FUNCTION_HELLO_BASE_URL),
      helloBaseUrl: process.env.NEON_FUNCTION_HELLO_BASE_URL,
    },
  };
}

