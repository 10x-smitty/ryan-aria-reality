import type { APIRoute } from 'astro';
import { hashPassword } from '../../../lib/auth/password';
import { createSession, setSessionCookie } from '../../../lib/auth/session';
import { getDb } from '../../../lib/db/client';
import { users } from '../../../lib/db/schema';
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ request, redirect }) => {
  let email: string;
  let password: string;
  let fullName: string;

  try {
    const form = await request.formData();
    email = String(form.get('email') ?? '').trim().toLowerCase();
    password = String(form.get('password') ?? '');
    fullName = String(form.get('fullName') ?? '').trim();
  } catch {
    return redirect('/auth/portal-signup?error=invalid');
  }

  if (!email || !password || !fullName) {
    return redirect('/auth/portal-signup?error=invalid');
  }

  if (password.length < 8) {
    return redirect('/auth/portal-signup?error=weak');
  }

  const db = getDb();
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    return redirect('/auth/portal-signup?error=exists');
  }

  const passwordHash = await hashPassword(password);
  const id = crypto.randomUUID();
  await db.insert(users).values({ id, email, passwordHash, fullName, role: 'customer' });

  const sessionId = await createSession(id);
  const headers = new Headers({ Location: '/portal/' });
  setSessionCookie(headers, sessionId);

  return new Response(null, { status: 302, headers });
};
