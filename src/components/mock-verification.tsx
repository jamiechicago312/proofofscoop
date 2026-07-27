"use client";
import { getAccessToken, usePrivy } from "@privy-io/react-auth";
import { useState } from "react";

export function MockVerification() {
  const { authenticated } = usePrivy(); const [message, setMessage] = useState("");
  if (!authenticated) return <p>Sign in first to use the local development verification flow.</p>;
  async function verify() { setMessage("Confirming mock verification…"); const token = await getAccessToken(); const response = await fetch("/api/verification/mock", { method: "POST", headers: { authorization: `Bearer ${token ?? ""}` } }); const data = await response.json() as { error?: string }; setMessage(response.ok ? "Verified for local development. You can now submit reviews." : data.error ?? "Unable to verify."); }
  return <section className="account-card"><p className="eyebrow">Development only</p><h1>Mock verification</h1><p>This does not charge money, move USDC, or prove a real payment. It only unlocks the local POC review flow.</p><button className="button button-primary" onClick={verify}>Complete mock verification</button><p aria-live="polite">{message}</p></section>;
}
