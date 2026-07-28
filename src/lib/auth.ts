import { importJWK, importSPKI, jwtVerify, type JWK } from "jose";
import { getAddress, isAddress } from "viem";

export class AuthenticationError extends Error {}

async function getPrivyVerificationKey() {
  const rawKey = process.env.PRIVY_JWT_VERIFICATION_KEY;
  if (!rawKey) throw new Error("Privy server verification is not configured.");
  const configuredKey = rawKey.trim().replace(/^['"]|['"]$/g, "").replace(/\\n/g, "\n");
  if (configuredKey.startsWith("-----BEGIN")) return importSPKI(configuredKey, "ES256");
  let key: JWK;
  try { key = JSON.parse(configuredKey) as JWK; } catch { throw new Error("PRIVY_JWT_VERIFICATION_KEY must be a PEM public key or JSON JWK."); }
  const algorithm = key.alg ?? (key.kty === "OKP" ? "EdDSA" : "ES256");
  return importJWK(key, algorithm);
}

async function verifyPrivyToken(token: string) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  if (!appId) throw new Error("Privy server verification is not configured.");
  const key = await getPrivyVerificationKey();
  return jwtVerify(token, key, { issuer: "privy.io", audience: appId });
}

export async function verifyPrivyAccessToken(token: string) {
  try {
    const { payload } = await verifyPrivyToken(token);
    if (typeof payload.sub !== "string" || !payload.sub.startsWith("did:privy:")) throw new AuthenticationError("Token is missing a Privy DID.");
    return { privyUserId: payload.sub };
  } catch (error) {
    if (error instanceof AuthenticationError) throw error;
    console.error("Privy access-token verification failed", {
      name: error instanceof Error ? error.name : "UnknownError",
    });
    throw new AuthenticationError("Invalid or expired Privy access token.");
  }
}

type LinkedAccount = { type?: string; address?: string; chain_type?: string; wallet_client_type?: string };

export async function verifyPrivyIdentityToken(token: string) {
  try {
    const { payload } = await verifyPrivyToken(token);
    if (typeof payload.sub !== "string" || !payload.sub.startsWith("did:privy:")) throw new AuthenticationError("Identity token is missing a Privy DID.");
    if (typeof payload.linked_accounts !== "string") throw new AuthenticationError("Identity token does not include linked accounts.");
    const accounts = JSON.parse(payload.linked_accounts) as LinkedAccount[];
    const wallet = accounts.find((account) => account.type === "wallet" && account.chain_type === "ethereum" && (account.wallet_client_type === "privy" || account.wallet_client_type === "privy-v2"))
      ?? accounts.find((account) => account.type === "wallet" && account.chain_type === "ethereum");
    if (!wallet?.address || !isAddress(wallet.address)) throw new AuthenticationError("Identity token does not include an Ethereum wallet.");
    return { privyUserId: payload.sub, walletAddress: getAddress(wallet.address) };
  } catch (error) {
    if (error instanceof AuthenticationError) throw error;
    console.error("Privy identity-token verification failed", { name: error instanceof Error ? error.name : "UnknownError" });
    throw new AuthenticationError("Invalid or expired Privy identity token.");
  }
}
