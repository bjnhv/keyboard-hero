import { NextRequest } from 'next/server';
import { getDbPool } from '@/db';
import { AuthUser } from '@/stores/use-auth-store';

export interface ServerAuthUser extends AuthUser {
  image?: string | null;
}

/**
 * Extracts session token from HTTP Authorization header or Neon Auth session cookies.
 */
export function extractSessionToken(req: NextRequest): string | null {
  // 1. Authorization: Bearer <token>
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    const token = authHeader.slice(7).trim();
    if (token) return token;
  }

  // 2. Neon Auth cookies (plain HTTP or __Secure- on HTTPS)
  const cookies = req.cookies;
  const cookieNames = [
    'neon-auth.session_token',
    '__Secure-neon-auth.session_token',
    'neon-auth.session-token',
    '__Secure-neon-auth.session-token',
  ];

  for (const name of cookieNames) {
    const val = cookies.get(name)?.value;
    if (val) return val;
  }

  return null;
}

/**
 * Validates the current request against Neon Auth and returns the authenticated user if valid.
 */
export async function getAuthenticatedUser(req: NextRequest): Promise<ServerAuthUser | null> {
  const token = extractSessionToken(req);
  if (!token) {
    return null;
  }

  const pool = getDbPool();
  if (!pool) {
    return null;
  }

  try {
    const result = await pool.query<{
      id: string;
      name: string | null;
      email: string;
      image: string | null;
      createdAt: Date;
    }>(
      `SELECT u.id, u.name, u.email, u.image, u."createdAt"
       FROM neon_auth.session s
       JOIN neon_auth.user u ON s."userId" = u.id
       WHERE s.token = $1 AND s."expiresAt" > NOW()
       LIMIT 1`,
      [token]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    const authUser: ServerAuthUser = {
      id: row.id,
      email: row.email,
      name: row.name || row.email.split('@')[0],
      image: row.image,
      createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : undefined,
    };

    // Ensure the user exists in public.users to satisfy foreign key constraints
    await ensurePublicUserRecord(authUser);

    return authUser;
  } catch (err) {
    console.warn('Session verification query encountered error:', err);
    return null;
  }
}

/**
 * Upserts a user row into public.users to satisfy foreign key references from typing_sessions and user_key_stats.
 */
export async function ensurePublicUserRecord(user: {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}): Promise<void> {
  const pool = getDbPool();
  if (!pool) return;

  const username = (user.name && user.name.trim()) 
    ? `${user.name.trim().replace(/\s+/g, '_')}_${user.id.slice(0, 6)}`
    : `user_${user.id.slice(0, 8)}`;

  const email = user.email || `${user.id}@anonymous.local`;
  const avatarUrl = user.image || null;

  try {
    await pool.query(
      `INSERT INTO public.users (id, username, email, avatar_url, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (id) DO UPDATE SET
         avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url),
         updated_at = NOW()`,
      [user.id, username, email, avatarUrl]
    );
  } catch (err) {
    // If conflict on username or email, attempt safe update by id
    console.warn('Error in ensurePublicUserRecord, retrying with ID match:', err);
    try {
      await pool.query(
        `UPDATE public.users SET updated_at = NOW() WHERE id = $1`,
        [user.id]
      );
    } catch {}
  }
}

