import { describe, expect, it } from "vitest";
import { redact } from "@/lib/logger";

describe("redacting logger", () => {
  it("redacts API keys and health-related fields", () => {
    const result = redact({
      ANTHROPIC_API_KEY: "sk-secret-value",
      authorization: "Bearer abc",
      breathingCondition: "asthma",
      city: "Pune",
    }) as Record<string, unknown>;

    expect(result.ANTHROPIC_API_KEY).toBe("[REDACTED]");
    expect(result.authorization).toBe("[REDACTED]");
    expect(result.breathingCondition).toBe("[REDACTED]");
    expect(result.city).toBe("Pune");
  });

  it("redacts bearer-like strings in values", () => {
    expect(redact("Bearer eyJhbGciOi")).toBe("[REDACTED]");
  });
});
