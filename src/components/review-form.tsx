"use client";
import { getAccessToken, usePrivy } from "@privy-io/react-auth";
import { useState } from "react";

export function ReviewForm({ slug }: { slug: string }) {
  const { authenticated } = usePrivy(); const [message, setMessage] = useState("");
  if (!authenticated) return null;
  async function submit(formData: FormData) {
    setMessage("Submitting…"); const token = await getAccessToken();
    const response = await fetch(`/api/shops/${slug}/reviews`, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${token ?? ""}` }, body: JSON.stringify({ rating: Number(formData.get("rating")), body: formData.get("body") }) });
    const result = await response.json() as { error?: string }; setMessage(response.ok ? "Review submitted. Refresh to see it." : result.error ?? "Unable to submit review.");
  }
  return <form className="review-form" action={submit}><h2>Write a review</h2><label>Rating <select name="rating" defaultValue="5"><option value="5">5 — Excellent</option><option value="4">4 — Great</option><option value="3">3 — Good</option><option value="2">2 — Okay</option><option value="1">1 — Not for me</option></select></label><label>Review <textarea name="body" minLength={10} maxLength={2000} required /></label><button className="button button-primary">Submit review</button><p aria-live="polite">{message}</p></form>;
}
