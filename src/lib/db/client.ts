import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { join } from 'node:path';
import * as schema from './schema';

const DB_PATH = process.env.DB_PATH ?? join(process.cwd(), 'data', 'ryan-aria.db');

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

/**
 * Returns the singleton Drizzle DB instance.
 * Creates and migrates the database on first call.
 * The SQLite file lives at DB_PATH (default: ./data/ryan-aria.db).
 */
export function getDb() {
  if (_db) return _db;

  const sqlite = new Database(DB_PATH);

  // Enable WAL mode for better concurrent read performance
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');

  _db = drizzle(sqlite, { schema });
  return _db;
}

export type Db = ReturnType<typeof getDb>;
