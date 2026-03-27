import { eq, asc } from 'drizzle-orm';
import { getDb } from '../lib/db/client';
import { transactionTimeline } from '../lib/db/schema';

export async function getMilestones(dealId: string, visibleOnly = false) {
  const db = getDb();
  const rows = await db
    .select()
    .from(transactionTimeline)
    .where(eq(transactionTimeline.dealId, dealId))
    .orderBy(asc(transactionTimeline.sortOrder));
  return visibleOnly ? rows.filter((r) => r.isVisibleToCustomer) : rows;
}

export async function addMilestone(dealId: string, milestone: string, sortOrder: number, isVisibleToCustomer = true) {
  const db = getDb();
  const id = crypto.randomUUID();
  await db.insert(transactionTimeline).values({ id, dealId, milestone, sortOrder, isVisibleToCustomer });
  return id;
}

export async function completeMilestone(id: string, completed: boolean) {
  const db = getDb();
  await db
    .update(transactionTimeline)
    .set({ completedAt: completed ? new Date().toISOString() : null })
    .where(eq(transactionTimeline.id, id));
}

export async function deleteMilestone(id: string) {
  const db = getDb();
  await db.delete(transactionTimeline).where(eq(transactionTimeline.id, id));
}
