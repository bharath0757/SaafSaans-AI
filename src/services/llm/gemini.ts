/**
 * Gemini LLM Provider.
 */

import { getEnv } from "@/lib/env";
import { safeFetch } from "@/lib/http";
import { logger } from "@/lib/logger";
import {
  type LLMProvider,
  type PlanInput,
  type PlanOutput,
  type ChatMessage,
} from "@/services/llm/types";
import { RuleBasedPlanner } from "@/services/llm/rule-based";
import { SYSTEM_PROMPT, JSON_INDENT, buildPlanPromptContext, parsePlanJson } from "./shared";

const HTTP_OK = 200;
const DEFAULT_GEMINI_MODEL = "gemini-2.0-flash";

function buildGeminiPayload(input: PlanInput) {
  const ctx = buildPlanPromptContext(input);
  return {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Personalized daily plan for:\n${JSON.stringify(ctx, null, JSON_INDENT)}\nReturn valid JSON matching schema.`,
          },
        ],
      },
    ],
    generationConfig: { response_mime_type: "application/json" },
  };
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

function extractFirstPartText(data: GeminiResponse): string | null {
  const parts = data.candidates?.[0]?.content?.parts;
  if (!parts || parts.length === 0) return null;
  return parts[0].text ?? null;
}

function parseGeminiPlanText(text: string): PlanOutput | null {
  try {
    const rawContent = extractFirstPartText(JSON.parse(text) as GeminiResponse);
    return rawContent ? parsePlanJson(rawContent, "gemini") : null;
  } catch {
    return null;
  }
}

function extractGeminiChatReply(text: string, status: number): string | null {
  if (status !== HTTP_OK) return null;
  try {
    return extractFirstPartText(JSON.parse(text) as GeminiResponse);
  } catch {
    return null;
  }
}

export class GeminiProvider implements LLMProvider {
  readonly id = "gemini" as const;
  private readonly fallback = new RuleBasedPlanner();

  async generatePlan(input: PlanInput): Promise<PlanOutput> {
    const env = getEnv();
    if (!env.GEMINI_API_KEY) return this.fallback.generatePlan(input);

    const model = env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;
    const payload = buildGeminiPayload(input);

    try {
      const { text, status } = await safeFetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (status !== HTTP_OK) return this.fallback.generatePlan(input);
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

    const model = env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;
    const sysPrompt = `${SYSTEM_PROMPT}\nPLAN CONTEXT:\n${JSON.stringify(planContext ?? {}, null, JSON_INDENT)}`;
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
      const reply = extractGeminiChatReply(text, status);
      if (!reply) {
        yield* this.fallback.streamChat(messages, planContext);
        return;
      }
      for (const word of reply.split(" ")) yield `${word} `;
    } catch (error) {
      logger.error("gemini_chat_error", { error: String(error) });
      yield* this.fallback.streamChat(messages, planContext);
    }
  }
}
