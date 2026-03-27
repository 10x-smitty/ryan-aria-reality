/**
 * Runs Drizzle migrations against the local SQLite database.
 * Call this once at server startup (e.g., from astro.config.mjs or a bootstrap script).
 *
 * Usage:
 *   node --loader ts-node/esm src/lib/db/migrate.ts
 *   -- or --
 *   pnpm drizzle-kit migrate
 */
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { join } from 'node:path';
import { mkdirSync } from 'node:fs';
import { getDb } from './client';

const MIGRATIONS_DIR = join(process.cwd(), 'drizzle');

// Ensure the data directory exists before the DB client tries to open it
mkdirSync(join(process.cwd(), 'data'), { recursive: true });

const db = getDb();
migrate(db, { migrationsFolder: MIGRATIONS_DIR });

console.log('✓ Database migrations complete');
