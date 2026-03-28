/**
 * Seeds the database with the mock data from site.ts + an admin user.
 * Run with: node --experimental-strip-types src/lib/db/seed.ts
 * (or via: pnpm db:seed)
 *
 * Safe to re-run — skips inserts if data already exists.
 */
import { eq } from 'drizzle-orm';
import { db } from './client.ts';
import { users, properties, contacts, deals, siteContent, testimonials, featuredListings, customerFavorites, transactionTimeline, messages } from './schema.ts';
import { hashPassword } from '../auth/password.ts';
import { AGENCY_DISCLOSURE_SHORT } from '../utils/illinois-compliance.ts';

// ── Admin user ────────────────────────────────────────────────────────────────

const ADMIN_EMAIL = 'admin@ryanariaproperties.com';
const ADMIN_PASS = 'admin1234';

const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, ADMIN_EMAIL)).limit(1);

let adminId: string;
if (existing.length === 0) {
  adminId = crypto.randomUUID();
  await db.insert(users).values({
    id: adminId,
    email: ADMIN_EMAIL,
    passwordHash: await hashPassword(ADMIN_PASS),
    fullName: 'Ryan Aria',
    role: 'broker',
    idfprLicense: '471.XXXXXX',
    phone: '+1 (555) 901-2345',
  });
  console.log(`✓ Admin user created: ${ADMIN_EMAIL} / ${ADMIN_PASS}`);
} else {
  adminId = existing[0].id;
  console.log('  Admin user already exists, skipping.');
}

// ── Properties ────────────────────────────────────────────────────────────────

const propCount = await db.select({ id: properties.id }).from(properties).limit(1);
if (propCount.length === 0) {
  const propData = [
    {
      address: '742 Evergreen Terrace',
      city: 'Springfield',
      zip: '62704',
      county: 'Will' as const,
      type: 'single_family' as const,
      status: 'Active' as const,
      listPrice: 1_250_000,
      bedrooms: 4,
      bathrooms: 3.5,
      sqft: 3200,
      yearBuilt: 2019,
      isFeatured: true,
      description:
        "Welcome to 742 Evergreen Terrace — a stunning 4-bedroom, 3.5-bathroom single-family home nestled in one of Springfield's most sought-after neighborhoods. Built in 2019, this modern residence offers 3,200 sq ft of thoughtfully designed living space on a generous 0.45-acre lot.",
    },
    {
      address: '1420 Lakewood Drive',
      city: 'Joliet',
      zip: '60432',
      county: 'Will' as const,
      type: 'single_family' as const,
      status: 'Active' as const,
      listPrice: 895_000,
      bedrooms: 3,
      bathrooms: 2.5,
      sqft: 2800,
      yearBuilt: 2015,
      isFeatured: true,
    },
    {
      address: '55 Park Avenue',
      city: 'Naperville',
      zip: '60540',
      county: 'DuPage' as const,
      type: 'single_family' as const,
      status: 'Active' as const,
      listPrice: 2_100_000,
      bedrooms: 5,
      bathrooms: 4,
      sqft: 4500,
      yearBuilt: 2018,
      isFeatured: true,
    },
    {
      address: '9321 S 51st Court',
      city: 'Oak Lawn',
      zip: '60453',
      county: 'Cook' as const,
      type: 'single_family' as const,
      status: 'Under Contract' as const,
      listPrice: 699_000,
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1900,
      yearBuilt: 2002,
      isFeatured: false,
    },
    {
      address: '210 N Oak Park Avenue',
      city: 'Oak Park',
      zip: '60302',
      county: 'Cook' as const,
      type: 'single_family' as const,
      status: 'Under Contract' as const,
      listPrice: 925_000,
      bedrooms: 4,
      bathrooms: 3,
      sqft: 3100,
      yearBuilt: 1998,
      isFeatured: false,
    },
    {
      address: '2718 W 74th Street',
      city: 'Chicago',
      zip: '60629',
      county: 'Cook' as const,
      type: 'single_family' as const,
      status: 'Active' as const,
      listPrice: 615_000,
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1750,
      yearBuilt: 1988,
      isFeatured: false,
    },
  ];

  for (const p of propData) {
    await db.insert(properties).values({ ...p, id: crypto.randomUUID(), assignedAgentId: adminId, state: 'IL' });
  }
  console.log(`✓ ${propData.length} properties seeded.`);
} else {
  console.log('  Properties already exist, skipping.');
}

// ── Contacts ──────────────────────────────────────────────────────────────────

const contactCount = await db.select({ id: contacts.id }).from(contacts).limit(1);
if (contactCount.length === 0) {
  const contactData = [
    { fullName: 'Sarah Mitchell', email: 's.mitchell@email.com', phone: '+1 (555) 234-8901', status: 'Qualified' as const, source: 'Zillow' as const, budgetMin: 800_000, budgetMax: 1_500_000, leadScore: 87, notes: 'Client is very interested in properties with a home office and backyard space. Pre-approved for up to $1.5M through First National Bank.' },
    { fullName: 'James Rodriguez', email: 'j.rodriguez@email.com', phone: '+1 (555) 876-1234', status: 'New Lead' as const, source: 'Referral' as const, budgetMax: 600_000, leadScore: 45 },
    { fullName: 'Lisa Park', email: 'l.park@email.com', phone: '+1 (555) 432-5678', status: 'Qualified' as const, source: 'Website' as const, budgetMin: 400_000, budgetMax: 700_000, leadScore: 72 },
    { fullName: 'David Wilson', email: 'd.wilson@email.com', phone: '+1 (555) 321-9876', status: 'Won' as const, source: 'Other' as const, leadScore: 95 },
    { fullName: 'Emma Johnson', email: 'e.johnson@email.com', phone: '+1 (555) 654-3210', status: 'Lost' as const, source: 'Zillow' as const, leadScore: 20 },
    { fullName: 'Michael Thompson', email: 'm.thompson@email.com', phone: '+1 (555) 789-4561', status: 'Qualified' as const, source: 'Social' as const, budgetMin: 500_000, budgetMax: 900_000, leadScore: 68 },
  ];

  for (const c of contactData) {
    await db.insert(contacts).values({ ...c, id: crypto.randomUUID(), assignedAgentId: adminId });
  }
  console.log(`✓ ${contactData.length} contacts seeded.`);
} else {
  console.log('  Contacts already exist, skipping.');
}

// ── Deals ─────────────────────────────────────────────────────────────────────

const dealCount = await db.select({ id: deals.id }).from(deals).limit(1);
if (dealCount.length === 0) {
  const dealData = [
    { title: 'Megan Patel — 2718 W 74th St', stage: 'New Lead' as const, dealValue: 615_000 },
    { title: 'Carlos Mendez — West Loop Search', stage: 'New Lead' as const, dealValue: 520_000 },
    { title: 'Liam Thornton — 11809 S Millard Ave', stage: 'Qualified' as const, dealValue: 840_000 },
    { title: 'Ava Richardson — Orland Park Search', stage: 'Qualified' as const, dealValue: 520_000 },
    { title: 'Noah Bennett — 14 W Cedar St', stage: 'Showing' as const, dealValue: 1_150_000 },
    { title: 'Emma Fields — Beverly Corridor', stage: 'Showing' as const, dealValue: 780_000 },
    { title: 'Sophia Clark — 9321 S 51st Ct', stage: 'Offer' as const, dealValue: 699_000 },
    { title: 'Ethan Brooks — Palos Hills', stage: 'Offer' as const, dealValue: 460_000 },
    { title: 'Olivia James — 210 N Oak Park Ave', stage: 'Under Contract' as const, dealValue: 925_000, closeDate: '2026-04-28' },
  ];

  for (const d of dealData) {
    await db.insert(deals).values({ ...d, id: crypto.randomUUID(), assignedAgentId: adminId });
  }
  console.log(`✓ ${dealData.length} deals seeded.`);
} else {
  console.log('  Deals already exist, skipping.');
}

// ── Site content (CMS) ────────────────────────────────────────────────────────

const contentCount = await db.select({ id: siteContent.id }).from(siteContent).limit(1);
if (contentCount.length === 0) {
  const blocks = [
    {
      slug: 'hero' as const,
      content: {
        title: 'Find Your Dream Home',
        eyebrow: 'Luxury Real Estate Expertise',
        subtitle: 'Luxury real estate expertise in Chicagoland & Central Illinois. Let us guide you to the perfect property.',
        backgroundImage: 'https://images.unsplash.com/photo-1648114633271-d9363cd6c508?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600',
        trust: ['15+ Years Experience', '2,400+ Properties Sold', '$1.2B+ in Sales'],
      },
    },
    {
      slug: 'about' as const,
      content: {
        image: '/images/ryan-realtor.jpg',
        label: 'ABOUT YOUR AGENT',
        title: 'Ryan Aria',
        role: 'Real Estate Managing Broker | Southwest Chicagoland',
        paragraphs: [
          'With over 15 years of experience in luxury real estate, I bring an unmatched commitment to finding the perfect home for every client. My deep knowledge of the Chicagoland market, combined with a personalized approach, ensures that every transaction is seamless and rewarding.',
          "Whether you're buying your first home or selling a luxury estate, I'm here to guide you through every step of the process with integrity, expertise, and genuine care.",
        ],
        certifications: ['Licensed Managing Broker', 'Top 1% Nationwide', 'NAR Member'],
      },
    },
    {
      slug: 'stats' as const,
      content: {
        items: [
          ['2,400+', 'Properties Sold'],
          ['$1.2B', 'Total Sales Volume'],
          ['98%', 'Client Satisfaction'],
          ['15+', 'Years of Experience'],
        ] as [string, string][],
      },
    },
    {
      slug: 'cta' as const,
      content: {
        title: 'Ready to Find Your Perfect Home?',
        subtitle: "Schedule a free consultation and let's start your real estate journey together.",
        phone: '+15559012345',
        email: 'hello@ryanariaproperties.com',
        trust: ['No obligation', 'Free consultation', 'Response within 24 hours'],
      },
    },
    {
      slug: 'footer' as const,
      content: {
        description: 'Your trusted partner in luxury real estate in Chicagoland & Central Illinois since 2010.',
        phone: '+1 (555) 901-2345',
        email: 'hello@ryanariaproperties.com',
        address: 'Serving Will, Cook, DuPage & Kankakee Counties, IL',
        socials: ['instagram', 'linkedin', 'facebook'],
        legal: ['Privacy Policy', 'Terms of Service', 'Fair Housing'],
        licenseLine: AGENCY_DISCLOSURE_SHORT,
      },
    },
  ];

  // Add header block
  blocks.push({
    slug: 'header' as const,
    content: {
      logoUrl: '',
      brandText: 'Ryan Aria Properties',
      navLinks: [
        ['Featured Homes', '#featured'],
        ['About', '#about'],
        ['Testimonials', '#testimonials'],
        ['Contact', '#contact'],
      ],
    },
  });

  for (const block of blocks) {
    await db.insert(siteContent).values({ id: crypto.randomUUID(), ...block });
  }
  console.log(`✓ ${blocks.length} CMS content blocks seeded.`);
} else {
  console.log('  Site content already exists, skipping.');
}

// ── Testimonials ──────────────────────────────────────────────────────────────

const testimonialCount = await db.select({ id: testimonials.id }).from(testimonials).limit(1);
if (testimonialCount.length === 0) {
  const testimonialData = [
    { name: 'James & Maria Rodriguez', initials: 'JR', sortOrder: 0, isActive: true, quote: '"Ryan made the entire process effortless. He found us our dream home in Will County within two weeks. His market knowledge is unparalleled and his attention to detail saved us from potential issues we never would have caught."' },
    { name: 'Lisa & David Park', initials: 'LP', sortOrder: 1, isActive: true, quote: '"We sold our home for 12% above asking price thanks to Ryan\'s exceptional marketing strategy and staging advice. He truly understands the luxury market and knows how to position properties for maximum value."' },
    { name: 'Emma Johnson', initials: 'EJ', sortOrder: 2, isActive: true, quote: '"As first-time buyers, we were nervous about the process. Ryan walked us through every step with patience and clarity. He negotiated brilliantly on our behalf and made sure we understood every detail before closing."' },
  ];
  for (const t of testimonialData) {
    await db.insert(testimonials).values({ id: crypto.randomUUID(), ...t });
  }
  console.log(`✓ ${testimonialData.length} testimonials seeded.`);
} else {
  console.log('  Testimonials already exist, skipping.');
}

// ── Featured listings ─────────────────────────────────────────────────────────

const featuredCount = await db.select({ id: featuredListings.id }).from(featuredListings).limit(1);
if (featuredCount.length === 0) {
  // Use the first 3 seeded properties as featured listings (they have isFeatured=true)
  const featuredProps = await db
    .select({ id: properties.id })
    .from(properties)
    .where(eq(properties.isFeatured, true))
    .limit(3);

  const images = [
    'https://images.unsplash.com/photo-1578058997959-66ffdee9f807?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
    'https://images.unsplash.com/photo-1759238136859-b6fe007fe126?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
    'https://images.unsplash.com/photo-1767894862472-99a8667aaad0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
  ];

  for (let i = 0; i < featuredProps.length; i++) {
    await db.insert(featuredListings).values({
      id: crypto.randomUUID(),
      propertyId: featuredProps[i].id,
      manualData: { image: images[i] },
      sortOrder: i,
    });
  }
  console.log(`✓ ${featuredProps.length} featured listings seeded.`);
} else {
  console.log('  Featured listings already exist, skipping.');
}

// ── Customer portal demo user ─────────────────────────────────────────────────

const CUSTOMER_EMAIL = 'customer@example.com';
const CUSTOMER_PASS = 'customer1234';

let customerId: string;
const existingCustomer = await db.select({ id: users.id }).from(users).where(eq(users.email, CUSTOMER_EMAIL)).limit(1);

if (existingCustomer.length === 0) {
  customerId = crypto.randomUUID();
  await db.insert(users).values({
    id: customerId,
    email: CUSTOMER_EMAIL,
    passwordHash: await hashPassword(CUSTOMER_PASS),
    fullName: 'Olivia James',
    role: 'customer',
  });
  console.log(`✓ Customer user created: ${CUSTOMER_EMAIL} / ${CUSTOMER_PASS}`);
} else {
  customerId = existingCustomer[0].id;
  console.log('  Customer user already exists, skipping.');
}

// Link the "Under Contract" deal to the customer
const underContractDeal = await db
  .select({ id: deals.id })
  .from(deals)
  .where(eq(deals.stage, 'Under Contract'))
  .limit(1);

if (underContractDeal.length > 0) {
  await db
    .update(deals)
    .set({ customerUserId: customerId })
    .where(eq(deals.id, underContractDeal[0].id));
  console.log('✓ Linked customer to Under Contract deal.');

  const linkedDealId = underContractDeal[0].id;

  // Add transaction milestones
  const milestoneCount = await db.select({ id: transactionTimeline.id }).from(transactionTimeline).limit(1);
  if (milestoneCount.length === 0) {
    const milestoneData = [
      { milestone: 'Offer accepted', sortOrder: 0, completedAt: '2026-03-10T12:00:00.000Z' },
      { milestone: 'Home inspection scheduled', sortOrder: 1, completedAt: '2026-03-14T09:00:00.000Z' },
      { milestone: 'Home inspection completed', sortOrder: 2, completedAt: '2026-03-17T11:30:00.000Z' },
      { milestone: 'Appraisal ordered', sortOrder: 3, completedAt: null },
      { milestone: 'Clear to close received', sortOrder: 4, completedAt: null },
      { milestone: 'Final walk-through', sortOrder: 5, completedAt: null },
      { milestone: 'Closing day', sortOrder: 6, completedAt: null },
    ];
    for (const m of milestoneData) {
      await db.insert(transactionTimeline).values({
        id: crypto.randomUUID(),
        dealId: linkedDealId,
        milestone: m.milestone,
        sortOrder: m.sortOrder,
        completedAt: m.completedAt,
        isVisibleToCustomer: true,
      });
    }
    console.log(`✓ ${milestoneData.length} transaction milestones seeded.`);
  } else {
    console.log('  Milestones already exist, skipping.');
  }

  // Add sample messages between customer and admin
  const messageCount = await db.select({ id: messages.id }).from(messages).limit(1);
  if (messageCount.length === 0) {
    const messageData = [
      { senderId: adminId, recipientId: customerId, body: 'Hi Olivia! Just wanted to let you know the inspection report came back looking great. A few minor items but nothing to worry about.', dealId: linkedDealId },
      { senderId: customerId, recipientId: adminId, body: 'That\'s great news! When will we hear back about the appraisal?', dealId: linkedDealId },
      { senderId: adminId, recipientId: customerId, body: 'The appraisal is scheduled for next Tuesday. I\'ll update you as soon as I hear back from the lender.', dealId: linkedDealId },
    ];
    for (const msg of messageData) {
      await db.insert(messages).values({ id: crypto.randomUUID(), ...msg });
    }
    console.log(`✓ ${messageData.length} messages seeded.`);
  } else {
    console.log('  Messages already exist, skipping.');
  }
}

// Add a favorite property for the customer
const firstProp = await db.select({ id: properties.id }).from(properties).limit(1).then((r) => r[0] ?? null);
if (firstProp) {
  const favCount = await db.select({ id: customerFavorites.id }).from(customerFavorites).limit(1);
  if (favCount.length === 0) {
    await db.insert(customerFavorites).values({ id: crypto.randomUUID(), customerId, propertyId: firstProp.id });
    console.log('✓ Sample favorite property seeded.');
  } else {
    console.log('  Favorites already exist, skipping.');
  }
}

console.log('\n✅ Seed complete.');
console.log(`   Admin login: ${ADMIN_EMAIL} / ${ADMIN_PASS}`);
console.log(`   Customer login: ${CUSTOMER_EMAIL} / ${CUSTOMER_PASS}`);
