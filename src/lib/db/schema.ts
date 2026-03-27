import { pgTable, text, integer, doublePrecision, boolean, jsonb, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ── Helpers ───────────────────────────────────────────────────────────────────

const id = () => text('id').primaryKey().$defaultFn(() => crypto.randomUUID());
const now = () => text('created_at').notNull().default(sql`to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`);
const nowUpdated = () => text('updated_at').notNull().default(sql`to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`);

// ── Auth ──────────────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: id(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  fullName: text('full_name'),
  role: text('role', { enum: ['admin', 'broker', 'agent', 'customer'] }).notNull().default('customer'),
  idfprLicense: text('idfpr_license'),
  phone: text('phone'),
  avatarUrl: text('avatar_url'),
  createdAt: now(),
  updatedAt: nowUpdated(),
});

export const sessions = pgTable('sessions', {
  id: id(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: text('expires_at').notNull(),
  createdAt: now(),
});

// ── Properties ────────────────────────────────────────────────────────────────

export const properties = pgTable('properties', {
  id: id(),
  address: text('address').notNull(),
  city: text('city').notNull(),
  state: text('state').notNull().default('IL'),
  zip: text('zip').notNull(),
  county: text('county', { enum: ['Will', 'Cook', 'DuPage', 'Kankakee'] }),
  type: text('type', {
    enum: ['single_family', 'condo', 'townhouse', 'multi_family', 'land', 'commercial'],
  }).notNull().default('single_family'),
  status: text('status', {
    enum: ['Active', 'Under Contract', 'Closed', 'Expired', 'Withdrawn', 'Coming Soon'],
  }).notNull().default('Active'),
  listPrice: doublePrecision('list_price').notNull(),
  soldPrice: doublePrecision('sold_price'),
  bedrooms: integer('bedrooms'),
  bathrooms: doublePrecision('bathrooms'),
  sqft: integer('sqft'),
  lotSize: doublePrecision('lot_size'),
  yearBuilt: integer('year_built'),
  description: text('description'),
  isFeatured: boolean('is_featured').notNull().default(false),
  assignedAgentId: text('assigned_agent_id').references(() => users.id, { onDelete: 'set null' }),
  mlsNumber: text('mls_number'),
  createdAt: now(),
  updatedAt: nowUpdated(),
});

export const propertyImages = pgTable('property_images', {
  id: id(),
  propertyId: text('property_id').notNull().references(() => properties.id, { onDelete: 'cascade' }),
  storagePath: text('storage_path').notNull(),
  publicUrl: text('public_url').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  isPrimary: boolean('is_primary').notNull().default(false),
  createdAt: now(),
}, (t) => [index('idx_property_images_property_id').on(t.propertyId)]);

// ── Contacts & CRM ────────────────────────────────────────────────────────────

export const contacts = pgTable('contacts', {
  id: id(),
  fullName: text('full_name').notNull(),
  email: text('email'),
  phone: text('phone'),
  status: text('status', {
    enum: ['New Lead', 'Contacted', 'Qualified', 'Active Client', 'Under Contract', 'Won', 'Lost'],
  }).notNull().default('New Lead'),
  source: text('source', {
    enum: ['Website', 'Referral', 'Zillow', 'Realtor.com', 'Social', 'Cold Call', 'Other'],
  }),
  budgetMin: doublePrecision('budget_min'),
  budgetMax: doublePrecision('budget_max'),
  leadScore: integer('lead_score'),
  notes: text('notes'),
  assignedAgentId: text('assigned_agent_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: now(),
  updatedAt: nowUpdated(),
});

export const contactActivities = pgTable('contact_activities', {
  id: id(),
  contactId: text('contact_id').notNull().references(() => contacts.id, { onDelete: 'cascade' }),
  type: text('type', { enum: ['call', 'email', 'showing', 'note', 'status_change'] }).notNull(),
  body: text('body').notNull(),
  createdBy: text('created_by').notNull().references(() => users.id),
  createdAt: now(),
}, (t) => [index('idx_contact_activities_contact_id').on(t.contactId)]);

export const deals = pgTable('deals', {
  id: id(),
  title: text('title').notNull(),
  stage: text('stage', {
    enum: ['New Lead', 'Qualified', 'Showing', 'Offer', 'Under Contract', 'Closed', 'Lost'],
  }).notNull().default('New Lead'),
  contactId: text('contact_id').references(() => contacts.id, { onDelete: 'set null' }),
  propertyId: text('property_id').references(() => properties.id, { onDelete: 'set null' }),
  dealValue: doublePrecision('deal_value'),
  commissionRate: doublePrecision('commission_rate'),
  closeDate: text('close_date'),
  notes: text('notes'),
  assignedAgentId: text('assigned_agent_id').references(() => users.id, { onDelete: 'set null' }),
  /** Links a portal customer account to this deal for portal access */
  customerUserId: text('customer_user_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: now(),
  updatedAt: nowUpdated(),
});

export const dealActivities = pgTable('deal_activities', {
  id: id(),
  dealId: text('deal_id').notNull().references(() => deals.id, { onDelete: 'cascade' }),
  type: text('type', { enum: ['note', 'stage_change', 'document', 'message'] }).notNull(),
  body: text('body').notNull(),
  createdBy: text('created_by').notNull().references(() => users.id),
  createdAt: now(),
}, (t) => [index('idx_deal_activities_deal_id').on(t.dealId)]);

// ── CMS ───────────────────────────────────────────────────────────────────────

export const siteContent = pgTable('site_content', {
  id: id(),
  slug: text('slug', { enum: ['hero', 'about', 'stats', 'footer', 'cta', 'header'] }).notNull().unique(),
  content: jsonb('content').notNull(),
  updatedBy: text('updated_by').references(() => users.id, { onDelete: 'set null' }),
  updatedAt: nowUpdated(),
});

export const featuredListings = pgTable('featured_listings', {
  id: id(),
  propertyId: text('property_id').references(() => properties.id, { onDelete: 'set null' }),
  manualData: jsonb('manual_data'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: now(),
});

export const testimonials = pgTable('testimonials', {
  id: id(),
  name: text('name').notNull(),
  quote: text('quote').notNull(),
  initials: text('initials').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: now(),
});

// ── Customer Portal ───────────────────────────────────────────────────────────

export const customerFavorites = pgTable('customer_favorites', {
  id: id(),
  customerId: text('customer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  propertyId: text('property_id').references(() => properties.id, { onDelete: 'cascade' }),
  mlsListingId: text('mls_listing_id'),
  createdAt: now(),
});

export const documents = pgTable('documents', {
  id: id(),
  name: text('name').notNull(),
  storagePath: text('storage_path').notNull(),
  publicUrl: text('public_url'),
  dealId: text('deal_id').references(() => deals.id, { onDelete: 'set null' }),
  contactId: text('contact_id').references(() => contacts.id, { onDelete: 'set null' }),
  uploadedBy: text('uploaded_by').notNull().references(() => users.id),
  isVisibleToCustomer: boolean('is_visible_to_customer').notNull().default(false),
  createdAt: now(),
});

export const messages = pgTable('messages', {
  id: id(),
  senderId: text('sender_id').notNull().references(() => users.id),
  recipientId: text('recipient_id').notNull().references(() => users.id),
  dealId: text('deal_id').references(() => deals.id, { onDelete: 'set null' }),
  body: text('body').notNull(),
  readAt: text('read_at'),
  createdAt: now(),
}, (t) => [
  index('idx_messages_sender').on(t.senderId),
  index('idx_messages_recipient').on(t.recipientId),
]);

export const transactionTimeline = pgTable('transaction_timeline', {
  id: id(),
  dealId: text('deal_id').notNull().references(() => deals.id, { onDelete: 'cascade' }),
  milestone: text('milestone').notNull(),
  completedAt: text('completed_at'),
  isVisibleToCustomer: boolean('is_visible_to_customer').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: now(),
}, (t) => [index('idx_transaction_timeline_deal_id').on(t.dealId)]);
