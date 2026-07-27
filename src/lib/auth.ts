import { importJWK, jwtVerify, type JWK } from "jose";

export class AuthenticationError extends Error {}

export async function verifyPrivyAccessToken(token: string) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const rawKey = process.env.PRIVY_JWT_VERIFICATION_KEY;
  if (!appId || !rawKey) throw new Error("Privy server verification is not configured.");
  let key: JWK;
  try { key = JSON.parse(rawKey) as JWK; } catch { throw new Error("PRIVY_JWT_VERIFICATION_KEY must be a JSON JWK."); }
  try {
    const { payload } = await jwtVerify(token, await importJWK(key, "ES256"), {
      issuer: "privy.io",
      audience: appId,
    });
    if (typeof payload.sub !== "string" || !payload.sub.startsWith("did:privy:")) throw new AuthenticationError("Token is missing a Privy DID.");
    return { privyUserId: payload.sub };
  } catch (error) {
    if (error instanceof AuthenticationError) throw error;
    throw new AuthenticationError("Invalid or expired Privy access token.");
  }
}
