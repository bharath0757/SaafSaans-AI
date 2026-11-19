/**
 * LLM Provider interfaces, schemas, and shared types.
 * Output is strictly validated using Zod schemas.
 * The deterministic numbers come directly from the Impact Engine.
 */

import { z } from "zod";
import type { HouseholdProfile, ActionItem } from "@/domain/actions";
import type { DayImpactSummary } from "@/domain/impact";
import type { BestOutdoorWindow } from "@/services/air-quality";

export const planOutputSchema = z.object({
  headline: z.string(),
  summary: z.string(),
  routine: z.array(
    z.object({
      timeWindow: z.string(),
      activity: z.string(),
      action: z.string(),
      location: z.enum(["indoor", "outdoor", "transit"]),
      maskRecommended: z.boolean(),
    }),
  ),
  indoorHacks: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      costBand: z.enum(["free", "low", "medium", "high"]),
    }),
  ),
  sustainableSwaps: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      estimatedCo2eSaved: z.string(),
    }),
  ),
  providerUsed: z.enum(["gemini", "anthropic", "rule-based", "mock"]),
});

export type PlanOutput = z.infer<typeof planOutputSchema>;

export type PlanInput = {
  profile: HouseholdProfile;
  aqi: number;
  bandLabel: string;
  cityName: string;
  bestWindow: BestOutdoorWindow;
  impact: DayImpactSummary;
  applicableActions: readonly ActionItem[];
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export interface LLMProvider {
  readonly id: "gemini" | "anthropic" | "rule-based" | "mock";
  generatePlan(input: PlanInput): Promise<PlanOutput>;
  streamChat(messages: ChatMessage[], planContext?: PlanOutput): AsyncIterable<string>;
}
