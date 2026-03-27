import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { getDb } from '../db/client';
import { users } from '../db/schema';

const SALT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/** Returns the user row if email + password match, otherwise null. */
export async function validateCredentials(
  email: string,
  password: string,
) {
  const db = getDb();
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase().trim()))
    .limit(1);

  const user = rows[0];
  if (!user) return null;

  const valid = await verifyPassword(password, user.passwordHash);
  return valid ? user : null;
}
