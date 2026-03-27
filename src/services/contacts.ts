import { eq, desc, count, sql } from 'drizzle-orm';
import { getDb } from '../lib/db/client';
import { contacts, contactActivities, users } from '../lib/db/schema';
import type { NewContact, NewContactActivity } from '../types/database';

export async function getAllContacts() {
  const db = getDb();
  return db
    .select({
      id: contacts.id,
      fullName: contacts.fullName,
      email: contacts.email,
      phone: contacts.phone,
      status: contacts.status,
      source: contacts.source,
      leadScore: contacts.leadScore,
      budgetMin: contacts.budgetMin,
      budgetMax: contacts.budgetMax,
      createdAt: contacts.createdAt,
      updatedAt: contacts.updatedAt,
      agentName: users.fullName,
    })
    .from(contacts)
    .leftJoin(users, eq(contacts.assignedAgentId, users.id))
    .orderBy(desc(contacts.updatedAt));
}

export async function getContactById(id: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(contacts)
    .leftJoin(users, eq(contacts.assignedAgentId, users.id))
    .where(eq(contacts.id, id))
    .limit(1);

  if (!rows[0]) return null;

  const activities = await db
    .select()
    .from(contactActivities)
    .where(eq(contactActivities.contactId, id))
    .orderBy(desc(contactActivities.createdAt));

  return { ...rows[0], activities };
}

export async function getContactMetrics() {
  const db = getDb();
  const [totals] = await db
    .select({
      total: count(),
      newLeads: sql<number>`sum(case when ${contacts.status} = 'New Lead' then 1 else 0 end)`,
      qualified: sql<number>`sum(case when ${contacts.status} = 'Qualified' then 1 else 0 end)`,
      won: sql<number>`sum(case when ${contacts.status} = 'Won' then 1 else 0 end)`,
    })
    .from(contacts);

  return {
    total: totals.total ?? 0,
    newLeads: totals.newLeads ?? 0,
    qualified: totals.qualified ?? 0,
    won: totals.won ?? 0,
  };
}

export async function createContact(data: Omit<NewContact, 'id' | 'createdAt' | 'updatedAt'>) {
  const db = getDb();
  const id = crypto.randomUUID();
  await db.insert(contacts).values({ ...data, id });
  return id;
}

export async function updateContact(
  id: string,
  data: Partial<Omit<NewContact, 'id' | 'createdAt' | 'updatedAt'>>,
) {
  const db = getDb();
  await db
    .update(contacts)
    .set({ ...data, updatedAt: new Date().toISOString() })
    .where(eq(contacts.id, id));
}

export async function deleteContact(id: string) {
  const db = getDb();
  await db.delete(contacts).where(eq(contacts.id, id));
}

export async function addContactActivity(data: Omit<NewContactActivity, 'id' | 'createdAt'>) {
  const db = getDb();
  await db.insert(contactActivities).values({ ...data, id: crypto.randomUUID() });
}
