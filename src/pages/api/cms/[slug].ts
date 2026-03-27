import type { APIRoute } from 'astro';
import { getSessionUserFromRequest } from '../../../lib/auth/session';
import { upsertSiteContent } from '../../../services/site-content';
import type { CmsSlug } from '../../../types/cms';

const VALID_SLUGS: CmsSlug[] = ['hero', 'about', 'stats', 'cta', 'footer', 'header'];

export const PUT: APIRoute = async ({ request, params }) => {
  const user = await getSessionUserFromRequest(request);
  if (!user || !['admin', 'broker'].includes(user.role)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const slug = params.slug as CmsSlug;
  if (!VALID_SLUGS.includes(slug)) {
    return new Response(JSON.stringify({ error: 'Invalid slug' }), { status: 400 });
  }

  let content = await request.json();

  // Transform list-field intermediates into typed arrays before storing
  if (slug === 'header' && Array.isArray(content.navLinksRaw)) {
    content = {
      ...content,
      navLinks: content.navLinksRaw
        .map((s: string) => {
          const [label, href] = s.split('|').map((p: string) => p.trim());
          return [label ?? '', href ?? ''];
        })
        .filter(([l]: [string]) => l),
    };
    delete content.navLinksRaw;
  }

  if (slug === 'stats' && Array.isArray(content.itemsRaw)) {
    content = {
      items: content.itemsRaw
        .map((s: string) => {
          const [value, label] = s.split('|').map((p: string) => p.trim());
          return [value ?? '', label ?? ''];
        })
        .filter(([v]: [string]) => v),
    };
  }

  await upsertSiteContent(slug, content, user.id);

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
