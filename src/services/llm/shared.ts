import { planOutputSchema, type PlanInput, type PlanOutput } from "./types";

export const SYSTEM_PROMPT = `You are SaafSaans, an expert assistant helping families navigate severe winter smog and urban air pollution in India.
CRITICAL RULES:
1. NEVER invent or hallucinate numeric estimates, doses, percentages, or concentrations. Use ONLY the deterministic figures supplied in the input context.
2. Structure your output exactly as valid JSON matching the requested schema.
3. Be calm, actionable, and empathetic. Do not use alarming language. All recommendations are educational estimates, not medical advice.
4. Keep explanations concise, practical, and tailored to the household's lifestyle and vulnerable members.`;

export function buildPlanPromptContext(input: PlanInput) {
  return {
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
}

export const JSON_INDENT = 2;

export function buildPlanUserPrompt(input: PlanInput): string {
  const ctx = buildPlanPromptContext(input);
  return `Generate an actionable winter smog daily plan based strictly on this calculated impact context:\n${JSON.stringify(ctx, null, JSON_INDENT)}\n\nRespond ONLY with a JSON object conforming to: { headline, summary, routine, indoorHacks, sustainableSwaps }.`;
}

export function parsePlanJson(
  text: string,
  provider: PlanOutput["providerUsed"],
): PlanOutput | null {
  try {
    const cleaned = text
      .replace(/```json\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    const raw = JSON.parse(cleaned);
    const parsed = planOutputSchema.safeParse({ ...raw, providerUsed: provider });
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
