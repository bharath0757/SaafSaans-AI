/**
 * Gemini LLM Provider.
 * Calls Google Gemini API with structured JSON output and stream support.
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

function buildGeminiPromptPayload(input: PlanInput) {
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

  return {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Generate a personalized daily plan and explanation for this household using these exact numbers:\n${JSON.stringify(promptContext, null, 2)}\nReturn valid JSON matching the schema.`,
          },
        ],
      },
    ],
    generationConfig: { response_mime_type: "application/json" },
  };
}

function parseGeminiPlanText(text: string): PlanOutput | null {
  try {
    const resJson = JSON.parse(text);
    const rawContent = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawContent) return null;

    const parsed = JSON.parse(rawContent);
    const validated = planOutputSchema.safeParse({ ...parsed, providerUsed: "gemini" });
    return validated.success ? validated.data : null;
  } catch {
    return null;
  }
}

async function fetchGeminiChatReply(
  url: string,
  messages: ChatMessage[],
  planContext?: PlanOutput,
): Promise<string | null> {
  const sysPrompt = `${SYSTEM_PROMPT}\nCURRENT USER PLAN CONTEXT:\n${JSON.stringify(planContext ?? {}, null, 2)}\nScope rule: If the user asks about anything unrelated to air quality, weather, health during smog, or sustainable living, politely decline and steer them back to air quality.`;

  const payload = {
    system_instruction: { parts: [{ text: sysPrompt }] },
    contents: messages.map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    })),
  };

  try {
    const { text, status } = await safeFetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return status === 200 ? JSON.parse(text).candidates?.[0]?.content?.parts?.[0]?.text : null;
  } catch (error) {
    logger.error("gemini_chat_error", { error: String(error) });
    return null;
  }
}

export class GeminiProvider implements LLMProvider {
  readonly id = "gemini" as const;
  private readonly fallback = new RuleBasedPlanner();

  async generatePlan(input: PlanInput): Promise<PlanOutput> {
    const env = getEnv();
    if (!env.GEMINI_API_KEY) {
      return this.fallback.generatePlan(input);
    }

    const model = env.GEMINI_MODEL || "gemini-2.0-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;
    const payload = buildGeminiPromptPayload(input);

    try {
      const { text, status } = await safeFetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (status !== 200) return this.fallback.generatePlan(input);

      const parsedPlan = parseGeminiPlanText(text);
      return parsedPlan ?? this.fallback.generatePlan(input);
    } catch (error) {
      logger.error("gemini_call_error", { error: String(error) });
      return this.fallback.generatePlan(input);
    }
  }

  async *streamChat(messages: ChatMessage[], planContext?: PlanOutput): AsyncIterable<string> {
    const env = getEnv();
    if (!env.GEMINI_API_KEY) {
      yield* this.fallback.streamChat(messages, planContext);
      return;
    }

    const model = env.GEMINI_MODEL || "gemini-2.0-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;

    const reply = await fetchGeminiChatReply(url, messages, planContext);
    if (!reply) {
      yield* this.fallback.streamChat(messages, planContext);
      return;
    }

    for (const word of reply.split(" ")) {
      yield `${word} `;
    }
  }
}
