import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { resetEnvCache } from "@/lib/env";
import { GeminiProvider } from "@/services/llm/gemini";
import { AnthropicProvider } from "@/services/llm/anthropic";
import { ACTIONS } from "@/domain/actions";
import { computeImpact } from "@/domain/impact";
import type { PlanInput } from "@/services/llm/types";

const testInput: PlanInput = {
  profile: {
    hasChildren: false,
    hasElders: false,
    hasRespiratoryCondition: false,
    commuteMode: "car",
    commuteDistanceKm: 15,
    cookingFuel: "lpg",
    homeType: "sealed",
    purifier: "medium",
    mask: "n95",
    budget: "medium",
  },
  aqi: 220,
  bandLabel: "Poor",
  cityName: "Mumbai",
  bestWindow: {
    startHour: 13,
    endHour: 16,
    label: "1:00 PM – 4:00 PM",
    avgAqi: 140,
  },
  impact: computeImpact(
    {
      hasChildren: false,
      hasElders: false,
      hasRespiratoryCondition: false,
      commuteMode: "car",
      commuteDistanceKm: 15,
      cookingFuel: "lpg",
      homeType: "sealed",
      purifier: "medium",
      mask: "n95",
      budget: "medium",
    },
    160,
    ACTIONS.slice(0, 2),
  ),
  applicableActions: ACTIONS.slice(0, 2),
};

const mockGeneratedPlan = {
  headline: "Mumbai Smog Advisory",
  summary: "Keep windows closed and run purifiers.",
  routine: [
    {
      timeWindow: "01:00 PM – 04:00 PM",
      activity: "Ventilation",
      action: "Open windows briefly",
      location: "outdoor",
      maskRecommended: false,
    },
  ],
  indoorHacks: [{ title: "Run purifier", description: "Use medium mode", costBand: "medium" }],
  sustainableSwaps: [{ title: "Carpool", description: "Share rides", estimatedCo2eSaved: "150g" }],
};

describe("Gemini and Anthropic Providers", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    resetEnvCache();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    resetEnvCache();
    vi.restoreAllMocks();
  });

  it("GeminiProvider calls API and parses valid JSON plan", async () => {
    process.env.GEMINI_API_KEY = "test-gemini-key";
    resetEnvCache();

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          candidates: [
            {
              content: {
                parts: [{ text: JSON.stringify(mockGeneratedPlan) }],
              },
            },
          ],
        }),
        { status: 200 },
      ),
    );

    const provider = new GeminiProvider();
    const plan = await provider.generatePlan(testInput);

    expect(plan.headline).toBe("Mumbai Smog Advisory");
    expect(plan.providerUsed).toBe("gemini");
  });

  it("GeminiProvider streamChat streams reply chunks", async () => {
    process.env.GEMINI_API_KEY = "test-gemini-key";
    resetEnvCache();

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          candidates: [
            {
              content: {
                parts: [{ text: "Keep air filters running on high." }],
              },
            },
          ],
        }),
        { status: 200 },
      ),
    );

    const provider = new GeminiProvider();
    const chunks: string[] = [];
    for await (const chunk of provider.streamChat([
      { role: "user", content: "What fan speed should I use?" },
    ])) {
      chunks.push(chunk);
    }

    expect(chunks.join("")).toContain("filters");
  });

  it("AnthropicProvider calls Messages API and parses valid JSON plan", async () => {
    process.env.ANTHROPIC_API_KEY = "test-anthropic-key";
    resetEnvCache();

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          content: [{ text: JSON.stringify(mockGeneratedPlan) }],
        }),
        { status: 200 },
      ),
    );

    const provider = new AnthropicProvider();
    const plan = await provider.generatePlan(testInput);

    expect(plan.headline).toBe("Mumbai Smog Advisory");
    expect(plan.providerUsed).toBe("anthropic");
  });
});
