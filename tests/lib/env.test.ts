import { afterEach, describe, expect, it } from "vitest";
import { getEnv, hasLlmKey, resetEnvCache } from "@/lib/env";

describe("env validation", () => {
  afterEach(() => {
    resetEnvCache();
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.GEMINI_API_KEY;
  });

  it("parses defaults without LLM keys", () => {
    const env = getEnv();
    expect(env.LOG_LEVEL).toBeDefined();
    expect(hasLlmKey()).toBe(false);
  });

  it("detects a configured Anthropic key", () => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    resetEnvCache();
    expect(hasLlmKey()).toBe(true);
  });
});
