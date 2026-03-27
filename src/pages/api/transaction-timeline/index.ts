import type { APIRoute } from 'astro';
import { getMilestones, addMilestone } from '../../../services/transaction-timeline';
import { getSessionUserFromRequest } from '../../../lib/auth/session';

const CRM_ROLES = ['admin', 'broker', 'agent'];

// GET /api/transaction-timeline?dealId=xxx
export const GET: APIRoute = async ({ request }) => {
  const user = await getSessionUserFromRequest(request);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  const url = new URL(request.url);
  const dealId = url.searchParams.get('dealId');
  if (!dealId) {
    return new Response(JSON.stringify({ error: 'dealId required' }), { status: 400 });
  }
  const visibleOnly = user.role === 'customer';
  const data = await getMilestones(dealId, visibleOnly);
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
};

// POST /api/transaction-timeline — add a milestone
export const POST: APIRoute = async ({ request }) => {
  const user = await getSessionUserFromRequest(request);
  if (!user || !CRM_ROLES.includes(user.role)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  const { dealId, milestone, sortOrder, isVisibleToCustomer } = await request.json();
  if (!dealId || !milestone) {
    return new Response(JSON.stringify({ error: 'dealId and milestone required' }), { status: 400 });
  }
  const id = await addMilestone(dealId, milestone, sortOrder ?? 0, isVisibleToCustomer ?? true);
  return new Response(JSON.stringify({ id }), { status: 201, headers: { 'Content-Type': 'application/json' } });
};
