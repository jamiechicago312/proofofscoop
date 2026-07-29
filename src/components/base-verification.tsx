"use client";

import { getIdentityToken, getAccessToken, useIdentityToken, usePrivy, useSendTransaction } from "@privy-io/react-auth";
import { createPublicClient, encodeFunctionData, fallback, http, parseAbi } from "viem";
import { base } from "viem/chains";
import { useState } from "react";

const usdc = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;
const recipient = process.env.NEXT_PUBLIC_VERIFICATION_RECIPIENT_ADDRESS;
const transferAbi = [{ type: "function", name: "transfer", stateMutability: "nonpayable", inputs: [{ name: "to", type: "address" }, { name: "amount", type: "uint256" }], outputs: [{ name: "", type: "bool" }] }] as const;
const transferEvent = parseAbi(["event Transfer(address indexed from, address indexed to, uint256 value)"])[0];

type VerificationResponse = { verificationStatus?: "pending" | "confirmed" | "failed"; error?: string; transactionHash?: string };

export function BaseVerification() {
  const { authenticated, user } = usePrivy();
  const { identityToken } = useIdentityToken();
  const { sendTransaction } = useSendTransaction();
  const [status, setStatus] = useState<"idle" | "sending" | "pending" | "confirmed" | "failed">("idle");
  const [message, setMessage] = useState("");
  const [hashInput, setHashInput] = useState(() => typeof window === "undefined" ? "" : window.localStorage.getItem("proof-of-scoop:verification-tx") ?? "");
  const wallet = user?.linkedAccounts.find((account): account is typeof account & { address: string } => account.type === "wallet" && "address" in account && typeof account.address === "string");

  if (!authenticated) return <p>Sign in first to verify your scoop.</p>;
  if (!wallet?.address) return <section className="account-card"><h1>Wallet is still being created</h1><p>Refresh this page once your Privy embedded wallet is ready.</p></section>;
  const walletAddress = wallet.address;
  if (!recipient) return <section className="account-card"><h1>Verification is not configured</h1><p>Add the public verification recipient address before using the Base flow.</p></section>;

  async function checkTransaction(hash: `0x${string}`, method: "POST" | "GET") {
    const token = await getAccessToken();
    const idToken = identityToken ?? await getIdentityToken();
    if (!token) throw new Error("Your Privy session is missing or expired. Sign in again and retry.");
    if (!idToken) throw new Error("Privy identity token is unavailable. Enable user data in Privy identity tokens, then refresh and retry.");
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
      setHashInput(hash);
      window.localStorage.setItem("proof-of-scoop:verification-tx", hash);
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

  async function recover(hashValue = hashInput.trim()) {
    const hash = hashValue;
    if (!/^0x[0-9a-fA-F]{64}$/.test(hash)) { setStatus("failed"); setMessage("Paste a valid Base transaction hash."); return; }
    setStatus("pending"); setMessage("Checking the existing Base transaction…");
    try {
      const result = await checkTransaction(hash as `0x${string}`, "POST");
      if (result.verificationStatus === "confirmed") { setStatus("confirmed"); setMessage("Payment confirmed on Base. You are verified and can write reviews."); }
      else if (result.verificationStatus === "pending") setMessage("Payment is still pending. Try checking again after confirmation.");
      else { setStatus("failed"); setMessage(result.error ?? "The payment could not be verified."); }
    } catch (error) { setStatus("failed"); setMessage(error instanceof Error ? error.message : "Unable to check the transaction."); }
  }

  async function findLatestPayment() {
    setStatus("pending"); setMessage("Looking for your latest $1 USDC payment on Base…");
    try {
      const rpcUrls = [process.env.NEXT_PUBLIC_BASE_RPC_URL, "https://mainnet.base.org", "https://mainnet-preconf.base.org"]
        .filter((url, index, urls): url is string => Boolean(url) && urls.indexOf(url) === index);
      const client = createPublicClient({ chain: base, transport: fallback(rpcUrls.map((url) => http(url, { timeout: 8_000 }))) });
      const latest = await client.getBlockNumber();
      for (let chunk = 0; chunk < 10; chunk += 1) {
        const toBlock = latest - BigInt(chunk * 10_000);
        const fromBlock = toBlock > BigInt(9_999) ? toBlock - BigInt(9_999) : BigInt(0);
        const logs = await client.getLogs({ address: usdc, event: transferEvent, args: { from: walletAddress as `0x${string}`, to: recipient as `0x${string}` }, fromBlock, toBlock });
        const match = logs.filter((log) => log.args.value === BigInt(1_000_000)).sort((a, b) => Number(b.blockNumber - a.blockNumber))[0];
        if (match) {
          setHashInput(match.transactionHash);
          window.localStorage.setItem("proof-of-scoop:verification-tx", match.transactionHash);
          await recover(match.transactionHash);
          return;
        }
      }
      setStatus("failed"); setMessage("No matching $1 USDC payment was found in the recent Base history.");
    } catch (error) { setStatus("failed"); setMessage(error instanceof Error ? error.message : "Unable to search Base transaction history."); }
  }

  return <section className="account-card"><p className="eyebrow">Base mainnet</p><h1>Verify with $1 USDC</h1><p>Send exactly 1 USDC from your authenticated Privy wallet to the configured verification address. The server confirms the Base receipt before unlocking reviews.</p><p className="account-note">This is a real mainnet payment. Check the recipient and network before approving.</p><button className="button button-primary" onClick={verify} disabled={status === "sending" || status === "pending"}>{status === "sending" ? "Waiting for approval…" : status === "pending" ? "Waiting for confirmation…" : "Send $1 USDC to verify"}</button><button className="button button-secondary" onClick={findLatestPayment} disabled={status === "sending" || status === "pending"}>Find latest $1 USDC payment</button><label htmlFor="verification-tx">Already paid? Transaction hash (optional)</label><input id="verification-tx" value={hashInput} onChange={(event) => setHashInput(event.target.value)} placeholder="0x…" inputMode="text" /><button className="button button-secondary" onClick={() => recover()} disabled={status === "sending" || status === "pending"}>Check existing payment</button><p aria-live="polite">{message}</p></section>;
}
