import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { AuthenticationError, verifyPrivyAccessToken, verifyPrivyIdentityToken } from "@/lib/auth";
import { verifyBaseTransaction, type BaseVerificationResult } from "@/lib/base-verification";
import { db } from "@/lib/db";
import { users, verificationEvents } from "@/lib/schema";
import { getOrCreateUser } from "@/lib/users";
import { getBearerToken } from "@/lib/validation";

function transactionHash(value: unknown): `0x${string}` | null {
  return typeof value === "string" && /^0x[0-9a-fA-F]{64}$/.test(value) ? value.toLowerCase() as `0x${string}` : null;
}

async function authenticate(request: NextRequest) {
  const accessToken = getBearerToken(request.headers.get("authorization"));
  const identityToken = request.headers.get("privy-id-token");
  if (!accessToken) throw new AuthenticationError("Your Privy session is missing or expired. Sign in again and retry.");
  if (!identityToken) throw new AuthenticationError("Privy identity token is unavailable. Enable user data in Privy identity tokens, then refresh and retry.");
  const access = await verifyPrivyAccessToken(accessToken);
  const identity = await verifyPrivyIdentityToken(identityToken);
  if (access.privyUserId !== identity.privyUserId) throw new AuthenticationError("Authentication identities do not match.");
  return identity;
}

async function saveResult(userId: string, hash: `0x${string}`, result: BaseVerificationResult) {
  const now = new Date();
  const status = result.status;
  await db().transaction(async (tx) => {
    await tx.insert(verificationEvents).values({
      id: crypto.randomUUID(), userId, source: "onchain", transactionHash: hash,
      providerReference: `base:${hash}`, status, confirmedAt: status === "confirmed" ? now : null,
    }).onConflictDoUpdate({
      target: verificationEvents.transactionHash,
      set: { status, confirmedAt: status === "confirmed" ? now : null },
    });
    if (status === "confirmed") await tx.update(users).set({ verificationStatus: "verified", verifiedAt: now, updatedAt: now }).where(eq(users.id, userId));
  });
}

async function process(request: NextRequest, hash: `0x${string}`) {
  const identity = await authenticate(request);
  const user = await getOrCreateUser(identity.privyUserId);
  await db().update(users).set({ walletAddress: identity.walletAddress, updatedAt: new Date() }).where(eq(users.id, user.id));
  const existing = await db().query.verificationEvents.findFirst({ where: eq(verificationEvents.transactionHash, hash) });
  if (existing && existing.userId !== user.id) return NextResponse.json({ error: "This transaction has already been submitted by another user." }, { status: 409 });
  if (existing?.status === "confirmed") return NextResponse.json({ verificationStatus: "verified", transactionHash: hash });
  const result = await verifyBaseTransaction(hash, identity.walletAddress);
  await saveResult(user.id, hash, result);
  if (result.status === "failed") return NextResponse.json({ verificationStatus: "failed", error: result.reason }, { status: 400 });
  return NextResponse.json({ verificationStatus: result.status, transactionHash: hash });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { transactionHash?: unknown };
    const hash = transactionHash(body.transactionHash);
    if (!hash) return NextResponse.json({ error: "A valid transaction hash is required." }, { status: 400 });
    return await process(request, hash);
  } catch (error) {
    if (error instanceof AuthenticationError) return NextResponse.json({ error: error.message }, { status: 401 });
    console.error("Base verification failed", { name: error instanceof Error ? error.name : "UnknownError" });
    return NextResponse.json({ error: "Unable to verify the Base transaction." }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const hash = transactionHash(request.nextUrl.searchParams.get("transactionHash"));
    if (!hash) return NextResponse.json({ error: "A valid transaction hash is required." }, { status: 400 });
    return await process(request, hash);
  } catch (error) {
    if (error instanceof AuthenticationError) return NextResponse.json({ error: error.message }, { status: 401 });
    console.error("Base verification polling failed", { name: error instanceof Error ? error.name : "UnknownError" });
    return NextResponse.json({ error: "Unable to check the Base transaction." }, { status: 500 });
  }
}
