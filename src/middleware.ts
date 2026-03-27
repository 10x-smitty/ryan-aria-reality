import { defineMiddleware } from 'astro:middleware';
import { getSessionUserFromRequest } from './lib/auth/session';

const CRM_ROLES = new Set(['admin', 'broker', 'agent']);

export const onRequest = defineMiddleware(async (context, next) => {
  context.locals.user = await getSessionUserFromRequest(context.request);

  const path = new URL(context.request.url).pathname;

  // Protect all /crm/* routes — redirect to login if not authenticated as staff
  if (path.startsWith('/crm')) {
    const user = context.locals.user;
    if (!user || !CRM_ROLES.has(user.role)) {
      return context.redirect(`/auth/login?redirect=${encodeURIComponent(path)}`);
    }
  }

  // Protect all /portal/* routes — redirect to portal login if not authenticated as customer
  if (path.startsWith('/portal')) {
    const user = context.locals.user;
    if (!user || user.role !== 'customer') {
      return context.redirect(`/auth/portal-login?redirect=${encodeURIComponent(path)}`);
    }
  }

  return next();
});
