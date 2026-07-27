import { asc, desc, eq } from "drizzle-orm";
import { db } from "./db";
import { reviews, shops, users } from "./schema";

export async function listShops() { return db().select().from(shops).orderBy(asc(shops.name)); }
export async function getShop(slug: string) { const [shop] = await db().select().from(shops).where(eq(shops.slug, slug)); return shop; }
export async function getShopReviews(shopId: string) {
  return db().select({ id: reviews.id, rating: reviews.rating, body: reviews.body, createdAt: reviews.createdAt, displayName: users.displayName })
    .from(reviews).innerJoin(users, eq(reviews.userId, users.id)).where(eq(reviews.shopId, shopId)).orderBy(desc(reviews.createdAt));
}
