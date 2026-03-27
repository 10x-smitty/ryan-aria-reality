import { eq, or, and, desc } from 'drizzle-orm';
import { getDb } from '../lib/db/client';
import { messages, users } from '../lib/db/schema';

export async function getThreadMessages(userAId: string, userBId: string, dealId?: string) {
  const db = getDb();
  const thread = or(
    and(eq(messages.senderId, userAId), eq(messages.recipientId, userBId)),
    and(eq(messages.senderId, userBId), eq(messages.recipientId, userAId)),
  )!;

  return db
    .select({
      id: messages.id,
      body: messages.body,
      senderId: messages.senderId,
      recipientId: messages.recipientId,
      dealId: messages.dealId,
      readAt: messages.readAt,
      createdAt: messages.createdAt,
      senderName: users.fullName,
    })
    .from(messages)
    .leftJoin(users, eq(messages.senderId, users.id))
    .where(thread)
    .orderBy(desc(messages.createdAt));
}

export async function sendMessage(senderId: string, recipientId: string, body: string, dealId?: string) {
  const db = getDb();
  const id = crypto.randomUUID();
  await db.insert(messages).values({ id, senderId, recipientId, body, dealId: dealId ?? null });
  return id;
}

export async function markRead(messageId: string) {
  const db = getDb();
  await db.update(messages).set({ readAt: new Date().toISOString() }).where(eq(messages.id, messageId));
}

export async function getUnreadCount(recipientId: string) {
  const db = getDb();
  const rows = await db
    .select({ id: messages.id })
    .from(messages)
    .where(and(eq(messages.recipientId, recipientId), eq(messages.readAt, null as any)));
  return rows.length;
}
