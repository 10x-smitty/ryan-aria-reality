/**
 * Database types derived from the Drizzle schema.
 * Import the Drizzle schema directly for query building;
 * import these types for function signatures and component props.
 */
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import type * as schema from '../lib/db/schema';

export type User = InferSelectModel<typeof schema.users>;
export type NewUser = InferInsertModel<typeof schema.users>;

export type Session = InferSelectModel<typeof schema.sessions>;

export type Property = InferSelectModel<typeof schema.properties>;
export type NewProperty = InferInsertModel<typeof schema.properties>;

export type PropertyImage = InferSelectModel<typeof schema.propertyImages>;
export type NewPropertyImage = InferInsertModel<typeof schema.propertyImages>;

export type Contact = InferSelectModel<typeof schema.contacts>;
export type NewContact = InferInsertModel<typeof schema.contacts>;

export type ContactActivity = InferSelectModel<typeof schema.contactActivities>;
export type NewContactActivity = InferInsertModel<typeof schema.contactActivities>;

export type Deal = InferSelectModel<typeof schema.deals>;
export type NewDeal = InferInsertModel<typeof schema.deals>;

export type DealActivity = InferSelectModel<typeof schema.dealActivities>;
export type NewDealActivity = InferInsertModel<typeof schema.dealActivities>;

export type SiteContent = InferSelectModel<typeof schema.siteContent>;
export type NewSiteContent = InferInsertModel<typeof schema.siteContent>;

export type FeaturedListing = InferSelectModel<typeof schema.featuredListings>;
export type NewFeaturedListing = InferInsertModel<typeof schema.featuredListings>;

export type Testimonial = InferSelectModel<typeof schema.testimonials>;
export type NewTestimonial = InferInsertModel<typeof schema.testimonials>;

export type CustomerFavorite = InferSelectModel<typeof schema.customerFavorites>;
export type NewCustomerFavorite = InferInsertModel<typeof schema.customerFavorites>;

export type Document = InferSelectModel<typeof schema.documents>;
export type NewDocument = InferInsertModel<typeof schema.documents>;

export type Message = InferSelectModel<typeof schema.messages>;
export type NewMessage = InferInsertModel<typeof schema.messages>;

export type TransactionTimeline = InferSelectModel<typeof schema.transactionTimeline>;
export type NewTransactionTimeline = InferInsertModel<typeof schema.transactionTimeline>;
