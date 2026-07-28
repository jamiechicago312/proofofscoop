import { NextResponse } from "next/server";
import { getShop, getShopReviews } from "@/lib/catalog";
import { AuthenticationError, verifyPrivyAccessToken } from "@/lib/auth";
import { getOrCreateUser } from "@/lib/users";
import { db } from "@/lib/db";
import { reviews } from "@/lib/schema";
import { randomUUID } from "node:crypto";
import { canCreateReview, getBearerToken, validateReviewInput } from "@/lib/validation";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) { const shop = await getShop((await params).slug); if (!shop) return NextResponse.json({ error: "Not found." }, { status: 404 }); return NextResponse.json({ reviews: await getShopReviews(shop.id) }); }

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const token = getBearerToken(request.headers.get("authorization"));
  if (!token) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  try {
    let payload: unknown;
    try { payload = await request.json(); } catch { return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 }); }
    const review = validateReviewInput(payload);
    if (!review) return NextResponse.json({ error: "Provide a rating from 1–5 and a review between 10 and 2,000 characters." }, { status: 400 });
    const shop = await getShop((await params).slug); if (!shop) return NextResponse.json({ error: "Not found." }, { status: 404 });
    const { privyUserId } = await verifyPrivyAccessToken(token);
    const user = await getOrCreateUser(privyUserId);
    if (!canCreateReview(user.verificationStatus)) return NextResponse.json({ error: "Verification is required before writing a review." }, { status: 403 });
    const [createdReview] = await db().insert(reviews).values({ id: randomUUID(), shopId: shop.id, userId: user.id, rating: review.rating, body: review.body }).returning();
    return NextResponse.json({ review: createdReview }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthenticationError) return NextResponse.json({ error: "Invalid or expired session." }, { status: 401 });
    return NextResponse.json({ error: "Unable to submit review." }, { status: 500 });
  }
}
