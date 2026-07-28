"use client";

import { getIdentityToken, getAccessToken, useIdentityToken, usePrivy, useSendTransaction } from "@privy-io/react-auth";
import { encodeFunctionData } from "viem";
import { useState } from "react";

const usdc = "0x833589fCD6EDb6E08f4c7C32D4f71b54bdA02913" as const;
const recipient = process.env.NEXT_PUBLIC_VERIFICATION_RECIPIENT_ADDRESS;
const transferAbi = [{ type: "function", name: "transfer", stateMutability: "nonpayable", inputs: [{ name: "to", type: "address" }, { name: "amount", type: "uint256" }], outputs: [{ name: "", type: "bool" }] }] as const;

type VerificationResponse = { verificationStatus?: "pending" | "confirmed" | "failed"; error?: string; transactionHash?: string };

export function BaseVerification() {
  const { authenticated, user } = usePrivy();
  const { identityToken } = useIdentityToken();
  const { sendTransaction } = useSendTransaction();
  const [status, setStatus] = useState<"idle" | "sending" | "pending" | "confirmed" | "failed">("idle");
  const [message, setMessage] = useState("");
  const wallet = user?.linkedAccounts.find((account): account is typeof account & { address: string } => account.type === "wallet" && "address" in account && typeof account.address === "string");

  if (!authenticated) return <p>Sign in first to verify your scoop.</p>;
  if (!wallet?.address) return <section className="account-card"><h1>Wallet is still being created</h1><p>Refresh this page once your Privy embedded wallet is ready.</p></section>;
  const walletAddress = wallet.address;
  if (!recipient) return <section className="account-card"><h1>Verification is not configured</h1><p>Add the public verification recipient address before using the Base flow.</p></section>;

  async function checkTransaction(hash: `0x${string}`, method: "POST" | "GET") {
    const token = await getAccessToken();
    const idToken = identityToken ?? await getIdentityToken();
    const response = await fetch(method === "POST" ? "/api/verification/base" : `/api/verification/base?transactionHash=${hash}`, {
      method, headers: { authorization: `Bearer ${token ?? ""}`, "privy-id-token": idToken ?? "", ...(method === "POST" ? { "content-type": "application/json" } : {}) },
      ...(method === "POST" ? { body: JSON.stringify({ transactionHash: hash }) } : {}),
    });
    const result = await response.json() as VerificationResponse;
    if (!response.ok && result.verificationStatus !== "pending") throw new Error(result.error ?? "Unable to verify transaction.");
    return result;
  }

  async function verify() {
    setStatus("sending"); setMessage("Approve the $1 USDC payment in Privy…");
    try {
      const { hash } = await sendTransaction({ to: usdc, chainId: 8453, data: encodeFunctionData({ abi: transferAbi, functionName: "transfer", args: [recipient as `0x${string}`, BigInt(1_000_000)] }) }, { address: walletAddress });
      let result = await checkTransaction(hash, "POST");
      for (let attempt = 0; result.verificationStatus === "pending" && attempt < 15; attempt += 1) {
        setStatus("pending"); setMessage("Transaction submitted. Waiting for Base confirmation…");
        await new Promise((resolve) => setTimeout(resolve, 4000));
        result = await checkTransaction(hash, "GET");
      }
      if (result.verificationStatus === "confirmed") { setStatus("confirmed"); setMessage("Payment confirmed on Base. You are verified and can write reviews."); }
      else if (result.verificationStatus === "pending") { setStatus("pending"); setMessage("Payment is still pending. Refresh to check again."); }
      else { setStatus("failed"); setMessage(result.error ?? "The payment could not be verified."); }
    } catch (error) { setStatus("failed"); setMessage(error instanceof Error ? error.message : "The payment could not be sent."); }
  }

  return <section className="account-card"><p className="eyebrow">Base mainnet</p><h1>Verify with $1 USDC</h1><p>Send exactly 1 USDC from your authenticated Privy wallet to the configured verification address. The server confirms the Base receipt before unlocking reviews.</p><p className="account-note">This is a real mainnet payment. Check the recipient and network before approving.</p><button className="button button-primary" onClick={verify} disabled={status === "sending" || status === "pending"}>{status === "sending" ? "Waiting for approval…" : status === "pending" ? "Waiting for confirmation…" : "Send $1 USDC to verify"}</button><p aria-live="polite">{message}</p></section>;
}
