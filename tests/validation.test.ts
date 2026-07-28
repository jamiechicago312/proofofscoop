import { describe, expect, it } from "vitest";
import { canCreateReview, getBearerToken, validateReviewInput } from "../src/lib/validation";

describe("request validation", () => {
  it("accepts only a complete bearer token", () => {
    expect(getBearerToken("Bearer abc123")).toBe("abc123");
    expect(getBearerToken("bearer abc123")).toBe("abc123");
    expect(getBearerToken(null)).toBeNull();
    expect(getBearerToken("Basic abc123")).toBeNull();
    expect(getBearerToken("Bearer ")).toBeNull();
    expect(getBearerToken("Bearer abc def")).toBeNull();
  });

  it("normalizes valid review input and rejects unsafe boundaries", () => {
    expect(validateReviewInput({ rating: 5, body: "  Great scoop!  " })).toEqual({ rating: 5, body: "Great scoop!" });
    expect(validateReviewInput({ rating: 0, body: "Long enough review" })).toBeNull();
    expect(validateReviewInput({ rating: 4.5, body: "Long enough review" })).toBeNull();
    expect(validateReviewInput({ rating: 4, body: "Too short" })).toBeNull();
    expect(validateReviewInput({ rating: 4, body: "x".repeat(2001) })).toBeNull();
    expect(validateReviewInput(null)).toBeNull();
  });

  it("allows reviews only for verified users", () => {
    expect(canCreateReview("verified")).toBe(true);
    expect(canCreateReview("unverified")).toBe(false);
    expect(canCreateReview("pending")).toBe(false);
  });
});
