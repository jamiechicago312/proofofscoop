import { NextRequest, NextResponse } from "next/server";
import { AuthenticationError, verifyPrivyAccessToken } from "@/lib/auth";
import { getOrCreateUser } from "@/lib/users";

export async function GET(request: NextRequest) {
  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const token = bearer || request.cookies.get("privy-token")?.value;
  if (!token) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  try {
    const { privyUserId } = await verifyPrivyAccessToken(token);
    return NextResponse.json({ user: await getOrCreateUser(privyUserId) });
  } catch (error) {
    const status = error instanceof AuthenticationError ? 401 : 503;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load user." }, { status });
  }
}
