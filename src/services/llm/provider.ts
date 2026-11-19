/**
 * Provider factory and router.
 * Dispatches to Gemini, Anthropic, or the Rule-based planner depending on configuration.
 */

import { hasLlmKey, getEnv } from "@/lib/env";
import type { LLMProvider } from "@/services/llm/types";
import { RuleBasedPlanner } from "@/services/llm/rule-based";
import { GeminiProvider } from "@/services/llm/gemini";
import { AnthropicProvider } from "@/services/llm/anthropic";

let customProvider: LLMProvider | null = null;

/**
 * Override the active provider (strictly for unit and evaluation tests).
 */
export function setCustomLlmProvider(provider: LLMProvider | null): void {
  customProvider = provider;
}

/**
 * Get the active LLM provider based on env configuration.
 */
export function getLlmProvider(): LLMProvider {
  if (customProvider) return customProvider;

  if (!hasLlmKey()) {
    return new RuleBasedPlanner();
  }

  const env = getEnv();
  if (env.GEMINI_API_KEY) {
    return new GeminiProvider();
  }

  if (env.ANTHROPIC_API_KEY) {
    return new AnthropicProvider();
  }

  return new RuleBasedPlanner();
}
