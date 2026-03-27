import type { APIRoute } from 'astro';
import { getFavoritesByUser, addFavorite, removeFavorite } from '../../../services/favorites';
import { getSessionUserFromRequest } from '../../../lib/auth/session';

export const GET: APIRoute = async ({ request }) => {
  const user = await getSessionUserFromRequest(request);
  if (!user || user.role !== 'customer') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  const data = await getFavoritesByUser(user.id);
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
};

export const POST: APIRoute = async ({ request }) => {
  const user = await getSessionUserFromRequest(request);
  if (!user || user.role !== 'customer') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  const { propertyId } = await request.json();
  if (!propertyId) {
    return new Response(JSON.stringify({ error: 'propertyId required' }), { status: 400 });
  }
  await addFavorite(user.id, propertyId);
  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
};

export const DELETE: APIRoute = async ({ request }) => {
  const user = await getSessionUserFromRequest(request);
  if (!user || user.role !== 'customer') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  const { propertyId } = await request.json();
  if (!propertyId) {
    return new Response(JSON.stringify({ error: 'propertyId required' }), { status: 400 });
  }
  await removeFavorite(user.id, propertyId);
  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
};
