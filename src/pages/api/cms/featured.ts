import type { APIRoute } from 'astro';
import { getSessionUserFromRequest } from '../../../lib/auth/session';
import { setFeaturedListings } from '../../../services/site-content';

export const PUT: APIRoute = async ({ request }) => {
  const user = await getSessionUserFromRequest(request);
  if (!user || !['admin', 'broker'].includes(user.role)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  const items = await request.json();
  await setFeaturedListings(items);
  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
};
