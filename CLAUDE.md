# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Start development server
pnpm build      # Production build
pnpm preview    # Preview the built site
pnpm check      # TypeScript type checking (astro check)
pnpm db:generate  # Generate Drizzle migrations from schema changes
pnpm db:migrate   # Apply pending migrations to the SQLite database
pnpm db:seed      # Seed the database with demo data (safe to re-run)
```

No lint or test scripts are configured.

## Architecture

Full-stack **Astro v6 + Vue 3** real estate platform for Ryan Aria Properties — a managing broker in Illinois (Chicagoland + Central IL, Will/Cook/DuPage/Kankakee Counties).

### Output Mode

`output: 'server'` with `@astrojs/node` adapter. All routes are SSR. (`hybrid` mode was removed in Astro v6.)

### Component Model

Two component types are used intentionally:
- **`.astro` components** — server-rendered, zero JS overhead; layouts, headers, static content
- **`.vue` components** — client-interactive; marked with `client:load`; forms, kanban board, message thread

### Data Layer

**SQLite** via `better-sqlite3` + **Drizzle ORM** (WAL mode, FK enforcement).

- Database file: `data/ryan-aria.db` (gitignored)
- Schema: `src/lib/db/schema.ts` — 15 tables
- Client singleton: `src/lib/db/client.ts`
- Migrations: `drizzle/` directory, managed by `drizzle-kit`
- Services: `src/services/` — one file per domain, all DB queries here

### Authentication

Custom session management (no external auth library):
- Sessions stored in `sessions` SQLite table, 30-day TTL
- HttpOnly cookie: `ra_session`
- Password hashing: bcryptjs (12 rounds)
- Session helpers: `src/lib/auth/session.ts`
- Password helpers: `src/lib/auth/password.ts`

**Two auth tracks:**
- **Admin/Staff**: email+password → `/auth/login` → `/crm/*` (roles: admin, broker, agent)
- **Customer**: email+password → `/auth/portal-login` → `/portal/*` (role: customer)

Route protection enforced in `src/middleware.ts`.

### Illinois IDFPR Compliance

Four required elements rendered on every page via `ComplianceBar.astro` (injected in `BaseLayout.astro`):
1. IDFPR managing broker license number
2. Illinois RELA agency disclosure
3. Equal Housing Opportunity logo + statement
4. IDX attribution (conditional — only on pages showing MLS data via `showIdxAttribution` prop)

All compliance constants live in `src/lib/utils/illinois-compliance.ts`. The `MANAGING_BROKER_LICENSE` constant is currently `'471.XXXXXX'` — **replace with the actual license number before going live**.

### Routing

```
/                         Landing page (public, from CMS)
/search/                  Property search (stub — Phase 4)
/auth/login               Staff CRM login
/auth/portal-login        Customer portal login
/auth/portal-signup       Customer portal registration
/crm/                     CRM dashboard (staff only)
/crm/properties/          Property management
/crm/contacts/            Contact/lead management
/crm/deals/               Deal kanban board
/crm/deals/[id]/          Deal detail: documents + milestones
/crm/reports/             Conversion funnel report
/crm/cms/                 Landing page content editor
/portal/                  Customer portal dashboard
/portal/favorites/        Saved properties
/portal/documents/        Shared documents
/portal/messages/         Agent messaging (10s polling)
/portal/transaction/[id]  Transaction timeline
/api/                     REST endpoints for all entities
```

### Styling System

Global CSS variables in `src/styles/global.css`:
- `--page`, `--page-alt`: warm cream backgrounds
- `--surface`: white card surfaces
- `--ink`: dark gray text
- `--accent`, `--accent-deep`: warm tan/bronze brand colors

Utility classes: `.crm-frame`, `.surface-card`, `.glass-panel`, `.gold-gradient`

### Design File

`design.pen` is a Pencil design file (use the `pencil` MCP tools to read/edit it — it cannot be read with standard file tools).

## Environment Variables

```
DB_PATH=./data/ryan-aria.db   # Default; override for production
MRED_API_KEY=                 # Phase 4+ (MLS/MRED integration)
MRED_API_BASE_URL=            # Phase 4+ (MLS/MRED integration)
```

## Demo Credentials

After running `pnpm db:seed`:
- **Admin**: `admin@ryanariaproperties.com` / `admin1234`
- **Customer**: `customer@example.com` / `customer1234`

## Key Implementation Notes

- Drizzle `select()` with multiple `leftJoin()` returns table-namespaced objects: `{ deals: {...}, contacts: {...}, users: {...} }`
- Astro templates: avoid `<=` comparison operators inside JSX expressions — the Astro compiler misinterprets `<` as a fragment. Pre-compute in frontmatter instead.
- `src/data/site.ts` is legacy mock data — kept for reference but no longer used by any page (all pages query SQLite)
- Customer-to-deal linking: `deals.customerUserId` (FK → users). Update via CRM deal detail or `PUT /api/deals/[id]`
