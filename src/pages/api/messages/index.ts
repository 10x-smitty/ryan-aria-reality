import type { APIRoute } from 'astro';
import { getThreadMessages, sendMessage, markRead } from '../../../services/messages';
import { getSessionUserFromRequest } from '../../../lib/auth/session';

// GET /api/messages?withUserId=xxx&dealId=xxx  — fetch thread
export const GET: APIRoute = async ({ request }) => {
  const user = await getSessionUserFromRequest(request);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  const url = new URL(request.url);
  const withUserId = url.searchParams.get('withUserId');
  const dealId = url.searchParams.get('dealId') ?? undefined;
  if (!withUserId) {
    return new Response(JSON.stringify({ error: 'withUserId required' }), { status: 400 });
  }
  const data = await getThreadMessages(user.id, withUserId, dealId);
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
};

// POST /api/messages — send a message
export const POST: APIRoute = async ({ request }) => {
  const user = await getSessionUserFromRequest(request);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  const { recipientId, body, dealId } = await request.json();
  if (!recipientId || !body) {
    return new Response(JSON.stringify({ error: 'recipientId and body required' }), { status: 400 });
  }
  const id = await sendMessage(user.id, recipientId, body, dealId);
  return new Response(JSON.stringify({ id }), { status: 201, headers: { 'Content-Type': 'application/json' } });
};

// PATCH /api/messages — mark a message read
export const PATCH: APIRoute = async ({ request }) => {
  const user = await getSessionUserFromRequest(request);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  const { messageId } = await request.json();
  if (!messageId) {
    return new Response(JSON.stringify({ error: 'messageId required' }), { status: 400 });
  }
  await markRead(messageId);
  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
};
