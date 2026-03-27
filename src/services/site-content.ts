import { eq, asc } from 'drizzle-orm';
import { getDb } from '../lib/db/client';
import { siteContent, testimonials, featuredListings, properties } from '../lib/db/schema';
import type { CmsSlug, CmsContentMap, FeaturedListingData } from '../types/cms';

// ── Site content blocks ───────────────────────────────────────────────────────

export async function getSiteContent<S extends CmsSlug>(slug: S): Promise<CmsContentMap[S] | null> {
  const db = getDb();
  const rows = await db.select().from(siteContent).where(eq(siteContent.slug, slug)).limit(1);
  if (!rows[0]) return null;
  return rows[0].content as CmsContentMap[S];
}

export async function getAllSiteContent(): Promise<Partial<CmsContentMap>> {
  const db = getDb();
  const rows = await db.select().from(siteContent);
  return Object.fromEntries(rows.map((r) => [r.slug, r.content])) as Partial<CmsContentMap>;
}

export async function upsertSiteContent(
  slug: CmsSlug,
  content: CmsContentMap[typeof slug],
  updatedBy?: string,
) {
  const db = getDb();
  const existing = await db.select({ id: siteContent.id }).from(siteContent).where(eq(siteContent.slug, slug)).limit(1);

  if (existing.length > 0) {
    await db
      .update(siteContent)
      .set({ content, updatedBy: updatedBy ?? null, updatedAt: new Date().toISOString() })
      .where(eq(siteContent.slug, slug));
  } else {
    await db.insert(siteContent).values({
      id: crypto.randomUUID(),
      slug,
      content,
      updatedBy: updatedBy ?? null,
    });
  }
}

// ── Testimonials ──────────────────────────────────────────────────────────────

export async function getActiveTestimonials() {
  const db = getDb();
  return db
    .select()
    .from(testimonials)
    .where(eq(testimonials.isActive, true))
    .orderBy(asc(testimonials.sortOrder));
}

export async function getAllTestimonials() {
  const db = getDb();
  return db.select().from(testimonials).orderBy(asc(testimonials.sortOrder));
}

export async function upsertTestimonial(data: {
  id?: string;
  name: string;
  quote: string;
  initials: string;
  sortOrder: number;
  isActive: boolean;
}) {
  const db = getDb();
  if (data.id) {
    await db
      .update(testimonials)
      .set({ name: data.name, quote: data.quote, initials: data.initials, sortOrder: data.sortOrder, isActive: data.isActive })
      .where(eq(testimonials.id, data.id));
    return data.id;
  } else {
    const id = crypto.randomUUID();
    await db.insert(testimonials).values({ ...data, id });
    return id;
  }
}

export async function deleteTestimonial(id: string) {
  const db = getDb();
  await db.delete(testimonials).where(eq(testimonials.id, id));
}

// ── Featured listings ─────────────────────────────────────────────────────────

export async function getFeaturedListings(): Promise<FeaturedListingData[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(featuredListings)
    .leftJoin(properties, eq(featuredListings.propertyId, properties.id))
    .orderBy(asc(featuredListings.sortOrder));

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  return rows.map((row) => {
    // If linked to a real property, derive listing data from it
    if (row.properties) {
      const p = row.properties;
      const specs: string[] = [];
      if (p.bedrooms) specs.push(`${p.bedrooms} Beds`);
      if (p.bathrooms) specs.push(`${p.bathrooms} Baths`);
      if (p.sqft) specs.push(`${p.sqft.toLocaleString()} sqft`);
      return {
        title: p.address,
        address: `${p.city}, ${p.state} ${p.zip}`,
        price: fmt(p.listPrice),
        specs,
        image: (row.featured_listings.manualData as any)?.image ?? '',
        href: `/crm/properties/${p.id}/`,
      };
    }
    // Fall back to manual data
    const manual = row.featured_listings.manualData as FeaturedListingData | null;
    return manual ?? { title: '', address: '', price: '', specs: [], image: '', href: '#' };
  });
}

export async function setFeaturedListings(items: Array<{ propertyId?: string; manualData?: FeaturedListingData; sortOrder: number }>) {
  const db = getDb();
  // Replace all existing featured listings
  await db.delete(featuredListings);
  for (const item of items) {
    await db.insert(featuredListings).values({
      id: crypto.randomUUID(),
      propertyId: item.propertyId ?? null,
      manualData: item.manualData ?? null,
      sortOrder: item.sortOrder,
    });
  }
}
