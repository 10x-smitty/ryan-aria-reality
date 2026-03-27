/**
 * Illinois IDFPR compliance constants for Ryan Aria Properties.
 * This is the single source of truth for all regulatory information.
 * Update license numbers and disclosures here — they render on every page via ComplianceBar.
 */

// ── License Information ───────────────────────────────────────────────────────

/** Ryan Aria's Illinois managing broker license number (IDFPR) */
export const MANAGING_BROKER_LICENSE = '471.XXXXXX'; // TODO: Replace with actual license number

/** Brokerage name as registered with IDFPR */
export const BROKERAGE_NAME = 'Ryan Aria Properties';

/** Illinois IDFPR — Real Estate division */
export const IDFPR_DIVISION = 'Illinois Department of Financial & Professional Regulation';

// ── Service Area ──────────────────────────────────────────────────────────────

export const SERVICE_COUNTIES = ['Will County', 'Cook County', 'DuPage County', 'Kankakee County'] as const;

export const SERVICE_REGION = 'Chicagoland & Central Illinois';

// ── Agency Disclosure ─────────────────────────────────────────────────────────

/**
 * Required disclosure per the Illinois Residential Real Estate License Act of 2000 (RELA),
 * 225 ILCS 454. Must be displayed on all marketing materials and websites.
 */
export const AGENCY_DISCLOSURE =
  'Illinois licensed real estate brokerage. Ryan Aria, Managing Broker. ' +
  'IL Lic. ' +
  MANAGING_BROKER_LICENSE +
  '. Information deemed reliable but not guaranteed. ' +
  'This is not intended to solicit property already listed.';

/** Short-form agency disclosure for footer/compliance bar */
export const AGENCY_DISCLOSURE_SHORT =
  BROKERAGE_NAME + ' · IL Managing Broker Lic. ' + MANAGING_BROKER_LICENSE;

// ── Equal Housing Opportunity ─────────────────────────────────────────────────

export const EQUAL_HOUSING_STATEMENT =
  'We are pledged to the letter and spirit of U.S. policy for the achievement of equal housing ' +
  'opportunity throughout the nation. We encourage and support an affirmative advertising and ' +
  'marketing program in which there are no barriers to obtaining housing because of race, color, ' +
  'religion, sex, handicap, familial status, or national origin.';

export const EQUAL_HOUSING_SHORT = 'Equal Housing Opportunity';

// ── IDX / MLS Attribution ─────────────────────────────────────────────────────

/**
 * Required IDX attribution for pages displaying MRED/MLS listing data.
 * Shown conditionally — only on search results and listing detail pages.
 */
export const IDX_ATTRIBUTION =
  'Listings courtesy of Midwest Real Estate Data (MRED) as distributed by MLS GRID. ' +
  'Based on information submitted to the MLS GRID. All data is obtained from various sources ' +
  'and may not have been verified by broker or MLS GRID. Supplied Open House Information is ' +
  'subject to change without notice. All information should be independently reviewed and ' +
  'verified for accuracy. Properties may or may not be listed by the office/agent presenting ' +
  'the information. © ' +
  new Date().getFullYear() +
  ' Midwest Real Estate Data LLC. All rights reserved.';

export const IDX_ATTRIBUTION_SHORT = 'Listing data © MRED. All rights reserved.';
