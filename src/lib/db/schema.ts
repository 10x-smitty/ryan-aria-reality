import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ── Helpers ───────────────────────────────────────────────────────────────────

const id = () => text('id').primaryKey().$defaultFn(() => crypto.randomUUID());
const now = () => text('created_at').notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`);
const nowUpdated = () => text('updated_at').notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`);

// ── Auth ──────────────────────────────────────────────────────────────────────

export const users = sqliteTable('users', {
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

export const sessions = sqliteTable('sessions', {
  id: id(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: text('expires_at').notNull(),
  createdAt: now(),
});

// ── Properties ────────────────────────────────────────────────────────────────

export const properties = sqliteTable('properties', {
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
  listPrice: real('list_price').notNull(),
  soldPrice: real('sold_price'),
  bedrooms: integer('bedrooms'),
  bathrooms: real('bathrooms'),
  sqft: integer('sqft'),
  lotSize: real('lot_size'),
  yearBuilt: integer('year_built'),
  description: text('description'),
  isFeatured: integer('is_featured', { mode: 'boolean' }).notNull().default(false),
  assignedAgentId: text('assigned_agent_id').references(() => users.id, { onDelete: 'set null' }),
  mlsNumber: text('mls_number'),
  createdAt: now(),
  updatedAt: nowUpdated(),
});

export const propertyImages = sqliteTable('property_images', {
  id: id(),
  propertyId: text('property_id').notNull().references(() => properties.id, { onDelete: 'cascade' }),
  storagePath: text('storage_path').notNull(),
  publicUrl: text('public_url').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  isPrimary: integer('is_primary', { mode: 'boolean' }).notNull().default(false),
  createdAt: now(),
}, (t) => [index('idx_property_images_property_id').on(t.propertyId)]);

// ── Contacts & CRM ────────────────────────────────────────────────────────────

export const contacts = sqliteTable('contacts', {
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
  budgetMin: real('budget_min'),
  budgetMax: real('budget_max'),
  leadScore: integer('lead_score'),
  notes: text('notes'),
  assignedAgentId: text('assigned_agent_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: now(),
  updatedAt: nowUpdated(),
});

export const contactActivities = sqliteTable('contact_activities', {
  id: id(),
  contactId: text('contact_id').notNull().references(() => contacts.id, { onDelete: 'cascade' }),
  type: text('type', { enum: ['call', 'email', 'showing', 'note', 'status_change'] }).notNull(),
  body: text('body').notNull(),
  createdBy: text('created_by').notNull().references(() => users.id),
  createdAt: now(),
}, (t) => [index('idx_contact_activities_contact_id').on(t.contactId)]);

export const deals = sqliteTable('deals', {
  id: id(),
  title: text('title').notNull(),
  stage: text('stage', {
    enum: ['New Lead', 'Qualified', 'Showing', 'Offer', 'Under Contract', 'Closed', 'Lost'],
  }).notNull().default('New Lead'),
  contactId: text('contact_id').references(() => contacts.id, { onDelete: 'set null' }),
  propertyId: text('property_id').references(() => properties.id, { onDelete: 'set null' }),
  dealValue: real('deal_value'),
  commissionRate: real('commission_rate'),
  closeDate: text('close_date'),
  notes: text('notes'),
  assignedAgentId: text('assigned_agent_id').references(() => users.id, { onDelete: 'set null' }),
  /** Links a portal customer account to this deal for portal access */
  customerUserId: text('customer_user_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: now(),
  updatedAt: nowUpdated(),
});

export const dealActivities = sqliteTable('deal_activities', {
  id: id(),
  dealId: text('deal_id').notNull().references(() => deals.id, { onDelete: 'cascade' }),
  type: text('type', { enum: ['note', 'stage_change', 'document', 'message'] }).notNull(),
  body: text('body').notNull(),
  createdBy: text('created_by').notNull().references(() => users.id),
  createdAt: now(),
}, (t) => [index('idx_deal_activities_deal_id').on(t.dealId)]);

// ── CMS ───────────────────────────────────────────────────────────────────────

export const siteContent = sqliteTable('site_content', {
  id: id(),
  slug: text('slug', { enum: ['hero', 'about', 'stats', 'footer', 'cta', 'header'] }).notNull().unique(),
  content: text('content', { mode: 'json' }).notNull(),
  updatedBy: text('updated_by').references(() => users.id, { onDelete: 'set null' }),
  updatedAt: nowUpdated(),
});

export const featuredListings = sqliteTable('featured_listings', {
  id: id(),
  propertyId: text('property_id').references(() => properties.id, { onDelete: 'set null' }),
  manualData: text('manual_data', { mode: 'json' }),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: now(),
});

export const testimonials = sqliteTable('testimonials', {
  id: id(),
  name: text('name').notNull(),
  quote: text('quote').notNull(),
  initials: text('initials').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: now(),
});

// ── Customer Portal ───────────────────────────────────────────────────────────

export const customerFavorites = sqliteTable('customer_favorites', {
  id: id(),
  customerId: text('customer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  propertyId: text('property_id').references(() => properties.id, { onDelete: 'cascade' }),
  mlsListingId: text('mls_listing_id'),
  createdAt: now(),
});

export const documents = sqliteTable('documents', {
  id: id(),
  name: text('name').notNull(),
  storagePath: text('storage_path').notNull(),
  publicUrl: text('public_url'),
  dealId: text('deal_id').references(() => deals.id, { onDelete: 'set null' }),
  contactId: text('contact_id').references(() => contacts.id, { onDelete: 'set null' }),
  uploadedBy: text('uploaded_by').notNull().references(() => users.id),
  isVisibleToCustomer: integer('is_visible_to_customer', { mode: 'boolean' }).notNull().default(false),
  createdAt: now(),
});

export const messages = sqliteTable('messages', {
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

export const transactionTimeline = sqliteTable('transaction_timeline', {
  id: id(),
  dealId: text('deal_id').notNull().references(() => deals.id, { onDelete: 'cascade' }),
  milestone: text('milestone').notNull(),
  completedAt: text('completed_at'),
  isVisibleToCustomer: integer('is_visible_to_customer', { mode: 'boolean' }).notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: now(),
}, (t) => [index('idx_transaction_timeline_deal_id').on(t.dealId)]);
