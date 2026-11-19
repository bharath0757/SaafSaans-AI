import { describe, expect, it } from "vitest";
import { RateLimiter, clientKeyFromHeaders } from "@/lib/rate-limit";

describe("RateLimiter", () => {
  it("allows requests under the cap and blocks after", () => {
    const limiter = new RateLimiter(2, 60_000);
    expect(limiter.check("a").allowed).toBe(true);
    expect(limiter.check("a").allowed).toBe(true);
    expect(limiter.check("a").allowed).toBe(false);
    expect(limiter.check("b").allowed).toBe(true);
  });

  it("derives a client key from forwarded headers", () => {
    const headers = new Headers({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" });
    expect(clientKeyFromHeaders(headers)).toBe("1.2.3.4");
  });
});
