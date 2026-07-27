import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { db } from "./db";
import { users } from "./schema";

export async function getOrCreateUser(privyUserId: string) {
  const database = db();
  const [user] = await database.insert(users).values({ id: randomUUID(), privyUserId })
    .onConflictDoUpdate({ target: users.privyUserId, set: { updatedAt: new Date() } })
    .returning();
  return user;
}
