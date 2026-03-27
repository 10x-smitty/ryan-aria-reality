/**
 * Session management for Ryan Aria Properties.
 * Uses a `sessions` table in SQLite — no external auth provider needed.
 *
 * Flow:
 *   1. POST /api/auth/signin → validatePassword → createSession → set cookie
 *   2. Every SSR request → getSessionFromRequest → user or null
 *   3. POST /api/auth/signout → deleteSession → clear cookie
 */
import { eq, and, gt } from 'drizzle-orm';
import { getDb } from '../db/client';
import { sessions, users } from '../db/schema';

const SESSION_COOKIE = 'ra_session';
const SESSION_TTL_DAYS = 30;

export type SessionUser = {
  id: string;
  email: string;
  fullName: string | null;
  role: 'admin' | 'broker' | 'agent' | 'customer';
};

// ── Create ────────────────────────────────────────────────────────────────────

export async function createSession(userId: string): Promise<string> {
  const db = getDb();
  const id = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 86_400_000).toISOString();

  await db.insert(sessions).values({ id, userId, expiresAt });
  return id;
}

// ── Read ──────────────────────────────────────────────────────────────────────

export async function getSessionUser(sessionId: string): Promise<SessionUser | null> {
  const db = getDb();
  const now = new Date().toISOString();

  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      fullName: users.fullName,
      role: users.role,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.id, sessionId), gt(sessions.expiresAt, now)))
    .limit(1);

  return rows[0] ?? null;
}

export function getSessionFromRequest(request: Request): string | null {
  const cookie = request.headers.get('cookie') ?? '';
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export async function getSessionUserFromRequest(request: Request): Promise<SessionUser | null> {
  const sessionId = getSessionFromRequest(request);
  if (!sessionId) return null;
  return getSessionUser(sessionId);
}

// ── Delete ────────────────────────────────────────────────────────────────────

export async function deleteSession(sessionId: string): Promise<void> {
  const db = getDb();
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

// ── Cookie helpers ────────────────────────────────────────────────────────────

export function setSessionCookie(headers: Headers, sessionId: string): void {
  const expires = new Date(Date.now() + SESSION_TTL_DAYS * 86_400_000).toUTCString();
  headers.append(
    'Set-Cookie',
    `${SESSION_COOKIE}=${encodeURIComponent(sessionId)}; Path=/; HttpOnly; SameSite=Lax; Expires=${expires}`,
  );
}

export function clearSessionCookie(headers: Headers): void {
  headers.append(
    'Set-Cookie',
    `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
  );
}

export { SESSION_COOKIE };
