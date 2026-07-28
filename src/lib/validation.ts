export function getBearerToken(header: string | null) {
  if (!header) return null;
  const match = /^Bearer\s+([^\s]+)$/i.exec(header.trim());
  return match?.[1] ?? null;
}

export type ReviewInput = { rating: number; body: string };

export function validateReviewInput(input: unknown): ReviewInput | null {
  if (!input || typeof input !== "object") return null;
  const { rating, body } = input as { rating?: unknown; body?: unknown };
  const normalizedBody = typeof body === "string" ? body.trim() : "";
  if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5 || normalizedBody.length < 10 || normalizedBody.length > 2000) {
    return null;
  }
  return { rating, body: normalizedBody };
}

export function canCreateReview(verificationStatus: string) {
  return verificationStatus === "verified";
}
