import type { APIRoute } from 'astro';
import { getSessionUserFromRequest } from '../../../lib/auth/session';
import { upsertTestimonial, deleteTestimonial } from '../../../services/site-content';

export const POST: APIRoute = async ({ request }) => {
  const user = await getSessionUserFromRequest(request);
  if (!user || !['admin', 'broker'].includes(user.role)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  const body = await request.json();
  const id = await upsertTestimonial(body);
  return new Response(JSON.stringify({ id }), { status: 201, headers: { 'Content-Type': 'application/json' } });
};

export const PUT: APIRoute = async ({ request }) => {
  const user = await getSessionUserFromRequest(request);
  if (!user || !['admin', 'broker'].includes(user.role)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  const body = await request.json();
  const id = await upsertTestimonial(body);
  return new Response(JSON.stringify({ id }), { headers: { 'Content-Type': 'application/json' } });
};

export const DELETE: APIRoute = async ({ request }) => {
  const user = await getSessionUserFromRequest(request);
  if (!user || !['admin', 'broker'].includes(user.role)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  const { id } = await request.json();
  await deleteTestimonial(id);
  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
};
