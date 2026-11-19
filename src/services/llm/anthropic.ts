/**
 * Anthropic Claude LLM Provider.
 * Calls Anthropic Messages API with structured JSON output and stream support.
 * Constrained strictly by Zod validation and air quality system instructions.
 */

import { getEnv } from "@/lib/env";
import { safeFetch } from "@/lib/http";
import { logger } from "@/lib/logger";
import {
  planOutputSchema,
  type LLMProvider,
  type PlanInput,
  type PlanOutput,
  type ChatMessage,
} from "@/services/llm/types";
import { RuleBasedPlanner } from "@/services/llm/rule-based";

const SYSTEM_PROMPT = `You are SaafSaans, an expert assistant helping families navigate severe winter smog and urban air pollution in India.
CRITICAL RULES:
1. NEVER invent or hallucinate numeric estimates, doses, percentages, or concentrations. Use ONLY the deterministic figures supplied in the input context.
2. Structure your output exactly as valid JSON matching the requested schema.
3. Be calm, actionable, and empathetic. Do not use alarming language. All recommendations are educational estimates, not medical advice.
4. Keep explanations concise, practical, and tailored to the household's lifestyle and vulnerable members.`;

export class AnthropicProvider implements LLMProvider {
  readonly id = "anthropic" as const;
  private readonly fallback = new RuleBasedPlanner();

  async generatePlan(input: PlanInput): Promise<PlanOutput> {
    const env = getEnv();
    if (!env.ANTHROPIC_API_KEY) {
      return this.fallback.generatePlan(input);
    }

    const model = env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514";
    const url = "https://api.anthropic.com/v1/messages";

    const promptContext = {
      location: input.cityName,
      currentAqi: input.aqi,
      band: input.bandLabel,
      cleanestOutdoorWindow: input.bestWindow,
      householdProfile: input.profile,
      calculatedImpact: {
        personalDoseReductionPct: input.impact.central.doseReductionPct,
        personalDoseSavedUg: input.impact.central.doseSavedUg,
        indoorPm25Before: input.impact.central.indoorPm25Before,
        indoorPm25After: input.impact.central.indoorPm25After,
        transportCo2eSavedG: input.impact.central.transportCo2eSavedG,
        cookingCo2eSavedG: input.impact.central.cookingCo2eSavedG,
      },
      recommendedActions: input.applicableActions.map((a) => ({
        id: a.id,
        category: a.category,
        title: a.title,
        description: a.description,
        costBand: a.costBand,
      })),
    };

    const payload = {
      model,
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Generate a personalized daily plan and explanation for this household using these exact numbers:\n${JSON.stringify(promptContext, null, 2)}\nReturn ONLY raw valid JSON conforming to the schema with fields: headline, summary, routine, indoorHacks, sustainableSwaps.`,
        },
      ],
    };

    try {
      const { text, status } = await safeFetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify(payload),
      });

      if (status !== 200) {
        logger.warn("anthropic_generate_failed", { status });
        return this.fallback.generatePlan(input);
      }

      const resJson = JSON.parse(text);
      const rawText = resJson.content?.[0]?.text;
      if (!rawText) return this.fallback.generatePlan(input);

      const parsed = JSON.parse(rawText);
      const validated = planOutputSchema.safeParse({
        ...parsed,
        providerUsed: "anthropic",
      });

      if (!validated.success) {
        logger.warn("anthropic_schema_validation_failed", { errors: validated.error.issues });
        return this.fallback.generatePlan(input);
      }

      return validated.data;
    } catch (error) {
      logger.error("anthropic_call_error", { error: String(error) });
      return this.fallback.generatePlan(input);
    }
  }

  async *streamChat(messages: ChatMessage[], planContext?: PlanOutput): AsyncIterable<string> {
    const env = getEnv();
    if (!env.ANTHROPIC_API_KEY) {
      yield* this.fallback.streamChat(messages, planContext);
      return;
    }

    const model = env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514";
    const url = "https://api.anthropic.com/v1/messages";

    const systemPromptWithContext = `${SYSTEM_PROMPT}\nCURRENT USER PLAN CONTEXT:\n${JSON.stringify(planContext ?? {}, null, 2)}\nScope rule: If the user asks about anything unrelated to air quality, weather, health during smog, or sustainable living, politely decline and steer them back to air quality.`;

    const payload = {
      model,
      max_tokens: 1024,
      system: systemPromptWithContext,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    };

    try {
      const { text, status } = await safeFetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify(payload),
      });

      if (status !== 200) {
        yield* this.fallback.streamChat(messages, planContext);
        return;
      }

      const resJson = JSON.parse(text);
      const reply = resJson.content?.[0]?.text;
      if (!reply) {
        yield* this.fallback.streamChat(messages, planContext);
        return;
      }

      const words = reply.split(" ");
      for (const word of words) {
        yield `${word} `;
      }
    } catch (error) {
      logger.error("anthropic_chat_error", { error: String(error) });
      yield* this.fallback.streamChat(messages, planContext);
    }
  }
}
