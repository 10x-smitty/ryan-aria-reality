import { eq, desc, count, sum, sql } from 'drizzle-orm';
import { getDb } from '../lib/db/client';
import { properties, propertyImages, users } from '../lib/db/schema';
import type { NewProperty } from '../types/database';

export async function getAllProperties() {
  const db = getDb();
  return db
    .select({
      id: properties.id,
      address: properties.address,
      city: properties.city,
      state: properties.state,
      county: properties.county,
      type: properties.type,
      status: properties.status,
      listPrice: properties.listPrice,
      bedrooms: properties.bedrooms,
      bathrooms: properties.bathrooms,
      sqft: properties.sqft,
      isFeatured: properties.isFeatured,
      mlsNumber: properties.mlsNumber,
      createdAt: properties.createdAt,
      agentName: users.fullName,
    })
    .from(properties)
    .leftJoin(users, eq(properties.assignedAgentId, users.id))
    .orderBy(desc(properties.createdAt));
}

export async function getPropertyById(id: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(properties)
    .leftJoin(users, eq(properties.assignedAgentId, users.id))
    .where(eq(properties.id, id))
    .limit(1);

  if (!rows[0]) return null;

  const images = await db
    .select()
    .from(propertyImages)
    .where(eq(propertyImages.propertyId, id))
    .orderBy(propertyImages.sortOrder);

  return { ...rows[0], images };
}

export async function getPropertyMetrics() {
  const db = getDb();
  const [totals] = await db
    .select({
      total: count(),
      active: sql<number>`sum(case when ${properties.status} = 'Active' then 1 else 0 end)`,
      totalValue: sql<number>`sum(case when ${properties.status} = 'Active' then ${properties.listPrice} else 0 end)`,
    })
    .from(properties);

  return {
    total: totals.total ?? 0,
    active: totals.active ?? 0,
    totalValue: totals.totalValue ?? 0,
  };
}

export async function createProperty(data: Omit<NewProperty, 'id' | 'createdAt' | 'updatedAt'>) {
  const db = getDb();
  const id = crypto.randomUUID();
  await db.insert(properties).values({ ...data, id });
  return id;
}

export async function updateProperty(
  id: string,
  data: Partial<Omit<NewProperty, 'id' | 'createdAt' | 'updatedAt'>>,
) {
  const db = getDb();
  await db
    .update(properties)
    .set({ ...data, updatedAt: new Date().toISOString() })
    .where(eq(properties.id, id));
}

export async function deleteProperty(id: string) {
  const db = getDb();
  await db.delete(properties).where(eq(properties.id, id));
}
