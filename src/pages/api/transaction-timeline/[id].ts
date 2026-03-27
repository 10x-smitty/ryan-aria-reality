import type { APIRoute } from 'astro';
import { completeMilestone, deleteMilestone } from '../../../services/transaction-timeline';
import { getSessionUserFromRequest } from '../../../lib/auth/session';

const CRM_ROLES = ['admin', 'broker', 'agent'];

// PATCH /api/transaction-timeline/[id] — mark complete/incomplete
export const PATCH: APIRoute = async ({ request, params }) => {
  const user = await getSessionUserFromRequest(request);
  if (!user || !CRM_ROLES.includes(user.role)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  const { completed } = await request.json();
  await completeMilestone(params.id!, completed ?? true);
  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
};

// DELETE /api/transaction-timeline/[id]
export const DELETE: APIRoute = async ({ request, params }) => {
  const user = await getSessionUserFromRequest(request);
  if (!user || !CRM_ROLES.includes(user.role)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  await deleteMilestone(params.id!);
  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
};
