import type { APIRoute } from 'astro';
import { getAllProperties, createProperty } from '../../../services/properties';
import { getSessionUserFromRequest } from '../../../lib/auth/session';

export const GET: APIRoute = async ({ request }) => {
  const user = await getSessionUserFromRequest(request);
  if (!user || !['admin', 'broker', 'agent'].includes(user.role)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  const data = await getAllProperties();
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
};

export const POST: APIRoute = async ({ request }) => {
  const user = await getSessionUserFromRequest(request);
  if (!user || !['admin', 'broker', 'agent'].includes(user.role)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  const body = await request.json();
  const id = await createProperty({ ...body, assignedAgentId: body.assignedAgentId ?? user.id });
  return new Response(JSON.stringify({ id }), { status: 201, headers: { 'Content-Type': 'application/json' } });
};
