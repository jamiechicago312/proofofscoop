import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { AuthenticationError, verifyPrivyAccessToken } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, verificationEvents } from "@/lib/schema";
import { getOrCreateUser } from "@/lib/users";
import { getBearerToken } from "@/lib/validation";

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production") return NextResponse.json({ error: "Mock verification is disabled in production." }, { status: 404 });
  const token = getBearerToken(request.headers.get("authorization"));
  if (!token) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  try {
    const { privyUserId } = await verifyPrivyAccessToken(token);
    const user = await getOrCreateUser(privyUserId);
    const reference = `mock:${privyUserId}`;
    await db().transaction(async (tx) => {
      await tx.insert(verificationEvents).values({ id: randomUUID(), userId: user.id, source: "mock", providerReference: reference, status: "confirmed", confirmedAt: new Date() })
        .onConflictDoUpdate({ target: verificationEvents.providerReference, set: { status: "confirmed", confirmedAt: new Date() } });
      await tx.update(users).set({ verificationStatus: "verified", verifiedAt: new Date(), updatedAt: new Date() }).where(eq(users.id, user.id));
    });
    return NextResponse.json({ verificationStatus: "verified" });
  } catch (error) {
    if (error instanceof AuthenticationError) return NextResponse.json({ error: "Invalid or expired session." }, { status: 401 });
    return NextResponse.json({ error: "Unable to complete mock verification." }, { status: 500 });
  }
}
