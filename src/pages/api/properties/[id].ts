import type { APIRoute } from 'astro';
import { getPropertyById, updateProperty, deleteProperty } from '../../../services/properties';
import { getSessionUserFromRequest } from '../../../lib/auth/session';

export const GET: APIRoute = async ({ request, params }) => {
  const user = await getSessionUserFromRequest(request);
  if (!user || !['admin', 'broker', 'agent'].includes(user.role)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  const data = await getPropertyById(params.id!);
  if (!data) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
};

export const PUT: APIRoute = async ({ request, params }) => {
  const user = await getSessionUserFromRequest(request);
  if (!user || !['admin', 'broker', 'agent'].includes(user.role)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  const body = await request.json();
  await updateProperty(params.id!, body);
  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
};

export const DELETE: APIRoute = async ({ request, params }) => {
  const user = await getSessionUserFromRequest(request);
  if (!user || !['admin', 'broker'].includes(user.role)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  await deleteProperty(params.id!);
  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
};
