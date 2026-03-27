import type { APIRoute } from 'astro';
import { validateCredentials } from '../../../lib/auth/password';
import { createSession, setSessionCookie } from '../../../lib/auth/session';

export const POST: APIRoute = async ({ request, redirect }) => {
  let email: string;
  let password: string;

  try {
    const form = await request.formData();
    email = String(form.get('email') ?? '').trim();
    password = String(form.get('password') ?? '');
  } catch {
    return redirect('/auth/portal-login?error=invalid');
  }

  if (!email || !password) {
    return redirect('/auth/portal-login?error=invalid');
  }

  const user = await validateCredentials(email, password);
  if (!user || user.role !== 'customer') {
    return redirect('/auth/portal-login?error=invalid');
  }

  const sessionId = await createSession(user.id);
  const headers = new Headers({ Location: '/portal/' });
  setSessionCookie(headers, sessionId);

  return new Response(null, { status: 302, headers });
};
