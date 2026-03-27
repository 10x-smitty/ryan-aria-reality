import { eq, and, or } from 'drizzle-orm';
import { getDb } from '../lib/db/client';
import { documents, users } from '../lib/db/schema';
import type { NewDocument } from '../types/database';

export async function getDocumentsByDeal(dealId: string, visibleOnly = false) {
  const db = getDb();
  const condition = visibleOnly
    ? and(eq(documents.dealId, dealId), eq(documents.isVisibleToCustomer, true))
    : eq(documents.dealId, dealId);

  return db
    .select({
      id: documents.id,
      name: documents.name,
      storagePath: documents.storagePath,
      publicUrl: documents.publicUrl,
      isVisibleToCustomer: documents.isVisibleToCustomer,
      createdAt: documents.createdAt,
      uploaderName: users.fullName,
    })
    .from(documents)
    .leftJoin(users, eq(documents.uploadedBy, users.id))
    .where(condition!);
}

export async function createDocument(data: Omit<NewDocument, 'id' | 'createdAt'>) {
  const db = getDb();
  const id = crypto.randomUUID();
  await db.insert(documents).values({ ...data, id });
  return id;
}

export async function toggleDocumentVisibility(id: string, visible: boolean) {
  const db = getDb();
  await db.update(documents).set({ isVisibleToCustomer: visible }).where(eq(documents.id, id));
}

export async function deleteDocument(id: string) {
  const db = getDb();
  await db.delete(documents).where(eq(documents.id, id));
}
