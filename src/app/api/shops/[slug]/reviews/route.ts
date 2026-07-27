import { NextResponse } from "next/server";
import { getShop, getShopReviews } from "@/lib/catalog";
import { AuthenticationError, verifyPrivyAccessToken } from "@/lib/auth";
import { getOrCreateUser } from "@/lib/users";
import { db } from "@/lib/db";
import { reviews } from "@/lib/schema";
import { randomUUID } from "node:crypto";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) { const shop = await getShop((await params).slug); if (!shop) return NextResponse.json({ error: "Not found." }, { status: 404 }); return NextResponse.json({ reviews: await getShopReviews(shop.id) }); }

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  try {
    const payload = await request.json() as { rating?: unknown; body?: unknown };
    const rating = typeof payload.rating === "number" ? payload.rating : NaN;
    const body = typeof payload.body === "string" ? payload.body.trim() : "";
    if (!Number.isInteger(rating) || rating < 1 || rating > 5 || body.length < 10 || body.length > 2000) return NextResponse.json({ error: "Provide a rating from 1–5 and a review between 10 and 2,000 characters." }, { status: 400 });
    const shop = await getShop((await params).slug); if (!shop) return NextResponse.json({ error: "Not found." }, { status: 404 });
    const { privyUserId } = await verifyPrivyAccessToken(token);
    const user = await getOrCreateUser(privyUserId);
    if (user.verificationStatus !== "verified") return NextResponse.json({ error: "Verification is required before writing a review." }, { status: 403 });
    const [review] = await db().insert(reviews).values({ id: randomUUID(), shopId: shop.id, userId: user.id, rating, body }).returning();
    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthenticationError) return NextResponse.json({ error: "Invalid or expired session." }, { status: 401 });
    return NextResponse.json({ error: "Unable to submit review." }, { status: 500 });
  }
}
