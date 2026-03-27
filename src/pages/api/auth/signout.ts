import type { APIRoute } from 'astro';
import { getSessionFromRequest, deleteSession, clearSessionCookie } from '../../../lib/auth/session';

export const POST: APIRoute = async ({ request, redirect }) => {
  const sessionId = getSessionFromRequest(request);
  if (sessionId) {
    await deleteSession(sessionId);
  }

  const headers = new Headers({ Location: '/auth/login' });
  clearSessionCookie(headers);

  return new Response(null, { status: 302, headers });
};
