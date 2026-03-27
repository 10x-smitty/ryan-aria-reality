import { eq, desc, count, sum, sql } from 'drizzle-orm';
import { getDb } from '../lib/db/client';
import { deals, dealActivities, contacts, properties, users } from '../lib/db/schema';
import type { NewDeal } from '../types/database';

export const DEAL_STAGES = [
  'New Lead',
  'Qualified',
  'Showing',
  'Offer',
  'Under Contract',
  'Closed',
  'Lost',
] as const;

export type DealStage = (typeof DEAL_STAGES)[number];

export async function getAllDeals() {
  const db = getDb();
  return db
    .select({
      id: deals.id,
      title: deals.title,
      stage: deals.stage,
      dealValue: deals.dealValue,
      commissionRate: deals.commissionRate,
      closeDate: deals.closeDate,
      createdAt: deals.createdAt,
      contactName: contacts.fullName,
      contactId: deals.contactId,
      propertyAddress: properties.address,
      propertyId: deals.propertyId,
      agentName: users.fullName,
    })
    .from(deals)
    .leftJoin(contacts, eq(deals.contactId, contacts.id))
    .leftJoin(properties, eq(deals.propertyId, properties.id))
    .leftJoin(users, eq(deals.assignedAgentId, users.id))
    .orderBy(desc(deals.createdAt));
}

export async function getDealsGroupedByStage() {
  const allDeals = await getAllDeals();
  const grouped: Record<DealStage, typeof allDeals> = {
    'New Lead': [],
    Qualified: [],
    Showing: [],
    Offer: [],
    'Under Contract': [],
    Closed: [],
    Lost: [],
  };
  for (const deal of allDeals) {
    const stage = deal.stage as DealStage;
    if (grouped[stage]) grouped[stage].push(deal);
  }
  return grouped;
}

export async function getDealById(id: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(deals)
    .leftJoin(contacts, eq(deals.contactId, contacts.id))
    .leftJoin(properties, eq(deals.propertyId, properties.id))
    .leftJoin(users, eq(deals.assignedAgentId, users.id))
    .where(eq(deals.id, id))
    .limit(1);

  if (!rows[0]) return null;

  const activities = await db
    .select()
    .from(dealActivities)
    .where(eq(dealActivities.dealId, id))
    .orderBy(desc(dealActivities.createdAt));

  return { ...rows[0], activities };
}

export async function getDealMetrics() {
  const db = getDb();
  const stageCounts = await db
    .select({ stage: deals.stage, count: count() })
    .from(deals)
    .groupBy(deals.stage);

  const [totals] = await db
    .select({
      totalValue: sum(deals.dealValue),
      closedValue: sql<number>`sum(case when ${deals.stage} = 'Closed' then ${deals.dealValue} else 0 end)`,
    })
    .from(deals);

  const byStage = Object.fromEntries(stageCounts.map((r) => [r.stage, r.count]));
  const total = stageCounts.reduce((s, r) => s + r.count, 0);
  const closed = byStage['Closed'] ?? 0;

  return {
    byStage,
    total,
    closed,
    conversionRate: total > 0 ? Math.round((closed / total) * 100) : 0,
    totalValue: totals.totalValue ?? 0,
    closedValue: totals.closedValue ?? 0,
  };
}

export async function createDeal(data: Omit<NewDeal, 'id' | 'createdAt' | 'updatedAt'>) {
  const db = getDb();
  const id = crypto.randomUUID();
  await db.insert(deals).values({ ...data, id });
  return id;
}

export async function updateDeal(
  id: string,
  data: Partial<Omit<NewDeal, 'id' | 'createdAt' | 'updatedAt'>>,
) {
  const db = getDb();
  await db
    .update(deals)
    .set({ ...data, updatedAt: new Date().toISOString() })
    .where(eq(deals.id, id));
}

export async function deleteDeal(id: string) {
  const db = getDb();
  await db.delete(deals).where(eq(deals.id, id));
}
