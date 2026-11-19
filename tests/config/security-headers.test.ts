import { describe, expect, it } from "vitest";
import { securityHeaders } from "../../config/security-headers";

describe("static security headers", () => {
  it("includes nosniff, frame deny, and HSTS", () => {
    const map = Object.fromEntries(securityHeaders.map((h) => [h.key, h.value]));
    expect(map["X-Content-Type-Options"]).toBe("nosniff");
    expect(map["X-Frame-Options"]).toBe("DENY");
    expect(map["Strict-Transport-Security"]).toContain("max-age=");
    expect(map["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
  });
});
