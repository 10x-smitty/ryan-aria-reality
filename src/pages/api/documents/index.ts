import type { APIRoute } from 'astro';
import { getDocumentsByDeal, createDocument, toggleDocumentVisibility, deleteDocument } from '../../../services/documents';
import { getSessionUserFromRequest } from '../../../lib/auth/session';

const CRM_ROLES = ['admin', 'broker', 'agent'];

// GET /api/documents?dealId=xxx&visibleOnly=true
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
  // Customers can only see visible documents
  const visibleOnly = user.role === 'customer' ? true : url.searchParams.get('visibleOnly') === 'true';
  const data = await getDocumentsByDeal(dealId, visibleOnly);
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
};

// POST /api/documents — create a document record (after file upload)
export const POST: APIRoute = async ({ request }) => {
  const user = await getSessionUserFromRequest(request);
  if (!user || !CRM_ROLES.includes(user.role)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  const body = await request.json();
  const { name, storagePath, publicUrl, dealId, isVisibleToCustomer } = body;
  if (!name || !storagePath) {
    return new Response(JSON.stringify({ error: 'name and storagePath required' }), { status: 400 });
  }
  const id = await createDocument({
    name,
    storagePath,
    publicUrl: publicUrl ?? null,
    dealId: dealId ?? null,
    contactId: null,
    uploadedBy: user.id,
    isVisibleToCustomer: isVisibleToCustomer ?? false,
  });
  return new Response(JSON.stringify({ id }), { status: 201, headers: { 'Content-Type': 'application/json' } });
};

// PATCH /api/documents — toggle visibility
export const PATCH: APIRoute = async ({ request }) => {
  const user = await getSessionUserFromRequest(request);
  if (!user || !CRM_ROLES.includes(user.role)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  const { id, visible } = await request.json();
  if (!id || visible === undefined) {
    return new Response(JSON.stringify({ error: 'id and visible required' }), { status: 400 });
  }
  await toggleDocumentVisibility(id, visible);
  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
};

// DELETE /api/documents?id=xxx
export const DELETE: APIRoute = async ({ request }) => {
  const user = await getSessionUserFromRequest(request);
  if (!user || !CRM_ROLES.includes(user.role)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) {
    return new Response(JSON.stringify({ error: 'id required' }), { status: 400 });
  }
  await deleteDocument(id);
  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
};
