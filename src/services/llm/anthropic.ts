/**
 * Anthropic Claude LLM Provider.
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

const ANTHROPIC_ENDPOINT = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-4-20250514";
const HTTP_OK = 200;
const MAX_PLAN_TOKENS = 1500;
const MAX_CHAT_TOKENS = 1024;

function parseAnthropicPlanText(text: string): PlanOutput | null {
  try {
    const resJson = JSON.parse(text) as { content?: Array<{ text?: string }> };
    const rawText = resJson.content?.[0]?.text;
    if (!rawText) return null;
    return parsePlanJson(rawText, "anthropic");
  } catch {
    return null;
  }
}

function extractAnthropicChatReply(text: string): string | null {
  try {
    const res = JSON.parse(text) as { content?: Array<{ text?: string }> };
    return res.content?.[0]?.text ?? null;
  } catch {
    return null;
  }
}

export class AnthropicProvider implements LLMProvider {
  readonly id = "anthropic" as const;
  private readonly fallback = new RuleBasedPlanner();

  async generatePlan(input: PlanInput): Promise<PlanOutput> {
    const env = getEnv();
    if (!env.ANTHROPIC_API_KEY) return this.fallback.generatePlan(input);

    const model = env.ANTHROPIC_MODEL || DEFAULT_ANTHROPIC_MODEL;
    const ctx = buildPlanPromptContext(input);
    const payload = {
      model,
      max_tokens: MAX_PLAN_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Personalized daily plan based on:\n${JSON.stringify(ctx, null, JSON_INDENT)}\nReturn ONLY valid JSON { headline, summary, routine, indoorHacks, sustainableSwaps }.`,
        },
      ],
    };

    try {
      const { text, status } = await safeFetch(ANTHROPIC_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": ANTHROPIC_VERSION,
        },
        body: JSON.stringify(payload),
      });
      if (status !== HTTP_OK) return this.fallback.generatePlan(input);
      const parsed = parseAnthropicPlanText(text);
      return parsed ?? this.fallback.generatePlan(input);
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

    const model = env.ANTHROPIC_MODEL || DEFAULT_ANTHROPIC_MODEL;
    const system = `${SYSTEM_PROMPT}\nPLAN CONTEXT:\n${JSON.stringify(planContext ?? {}, null, JSON_INDENT)}`;
    const payload = {
      model,
      max_tokens: MAX_CHAT_TOKENS,
      system,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    };

    try {
      const { text, status } = await safeFetch(ANTHROPIC_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": ANTHROPIC_VERSION,
        },
        body: JSON.stringify(payload),
      });
      if (status !== HTTP_OK) {
        yield* this.fallback.streamChat(messages, planContext);
        return;
      }
      const reply = extractAnthropicChatReply(text);
      if (!reply) {
        yield* this.fallback.streamChat(messages, planContext);
        return;
      }
      for (const word of reply.split(" ")) yield `${word} `;
    } catch (error) {
      logger.error("anthropic_chat_error", { error: String(error) });
      yield* this.fallback.streamChat(messages, planContext);
    }
  }
}
