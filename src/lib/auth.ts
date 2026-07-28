import { importJWK, importSPKI, jwtVerify, type JWK } from "jose";

export class AuthenticationError extends Error {}

export async function verifyPrivyAccessToken(token: string) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const rawKey = process.env.PRIVY_JWT_VERIFICATION_KEY;
  if (!appId || !rawKey) throw new Error("Privy server verification is not configured.");
  try {
    // Privy commonly displays a PEM public key. Keep JSON JWK support for
    // existing deployments and local development configurations.
    const verificationKey = rawKey.trim().startsWith("-----BEGIN")
      ? await importSPKI(rawKey.trim().replace(/\\n/g, "\n"), "ES256")
      : await (async () => {
          let key: JWK;
          try { key = JSON.parse(rawKey) as JWK; } catch { throw new Error("PRIVY_JWT_VERIFICATION_KEY must be a PEM public key or JSON JWK."); }
          const algorithm = key.alg ?? (key.kty === "OKP" ? "EdDSA" : "ES256");
          return importJWK(key, algorithm);
        })();
    const { payload } = await jwtVerify(token, verificationKey, {
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
