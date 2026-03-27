import { eq, and } from 'drizzle-orm';
import { getDb } from '../lib/db/client';
import { customerFavorites, properties } from '../lib/db/schema';

export async function getFavoritesByUser(customerId: string) {
  const db = getDb();
  return db
    .select({
      id: customerFavorites.id,
      customerId: customerFavorites.customerId,
      propertyId: customerFavorites.propertyId,
      mlsListingId: customerFavorites.mlsListingId,
      createdAt: customerFavorites.createdAt,
      address: properties.address,
      city: properties.city,
      state: properties.state,
      zip: properties.zip,
      listPrice: properties.listPrice,
      status: properties.status,
      bedrooms: properties.bedrooms,
      bathrooms: properties.bathrooms,
      sqft: properties.sqft,
      type: properties.type,
    })
    .from(customerFavorites)
    .leftJoin(properties, eq(customerFavorites.propertyId, properties.id))
    .where(eq(customerFavorites.customerId, customerId));
}

export async function isFavorited(customerId: string, propertyId: string): Promise<boolean> {
  const db = getDb();
  const rows = await db
    .select({ id: customerFavorites.id })
    .from(customerFavorites)
    .where(and(eq(customerFavorites.customerId, customerId), eq(customerFavorites.propertyId, propertyId)))
    .limit(1);
  return rows.length > 0;
}

export async function addFavorite(customerId: string, propertyId: string) {
  const db = getDb();
  const exists = await isFavorited(customerId, propertyId);
  if (exists) return;
  await db.insert(customerFavorites).values({ id: crypto.randomUUID(), customerId, propertyId });
}

export async function removeFavorite(customerId: string, propertyId: string) {
  const db = getDb();
  await db
    .delete(customerFavorites)
    .where(and(eq(customerFavorites.customerId, customerId), eq(customerFavorites.propertyId, propertyId)));
}
