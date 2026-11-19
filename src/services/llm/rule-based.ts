/**
 * Rule-Based Planner: deterministic fallback when no LLM API key is present.
 * Translates household profile and Impact Engine metrics into a structured daily plan.
 */

import type { LLMProvider, PlanInput, PlanOutput, ChatMessage } from "@/services/llm/types";
import { checkChatScope, getOutOfScopeReply } from "@/domain/scope-guard";

function buildRoutine(input: PlanInput) {
  const { profile, aqi, bestWindow } = input;
  const needMask = aqi > 150 || profile.hasRespiratoryCondition;

  const morningAction = profile.hasChildren
    ? "Keep children indoors. Postpone morning outdoor play and school bus stops with a well-fitted mask."
    : "Keep morning commute sealed. Avoid morning jogs or brisk walks while smog sits lowest.";

  return [
    {
      timeWindow: "06:00 AM – 10:00 AM",
      activity: "Morning routine & school/work transit",
      action: morningAction,
      location: "transit" as const,
      maskRecommended: needMask,
    },
    {
      timeWindow: "10:00 AM – 01:00 PM",
      activity: "Indoor work / home routine",
      action:
        "Keep external windows latched. Run air cleaner or box filter in primary occupied room.",
      location: "indoor" as const,
      maskRecommended: false,
    },
    {
      timeWindow: bestWindow.label,
      activity: "Cleanest outdoor window & ventilation",
      action: `Open windows for 15–20 minutes to refresh indoor air. Complete essential outdoor errands during this cleanest period (avg AQI ~${bestWindow.avgAqi}).`,
      location: "outdoor" as const,
      maskRecommended: aqi > 250,
    },
    {
      timeWindow: "04:00 PM – 08:00 PM",
      activity: "Evening commute & return home",
      action:
        "Re-seal all windows before nocturnal inversion descends. Wear respirator for evening commute.",
      location: "transit" as const,
      maskRecommended: needMask,
    },
    {
      timeWindow: "08:00 PM – Overnight",
      activity: "Sleep & bedroom air purification",
      action:
        "Seal bedroom doors and run purifier on night mode to maintain clean air volume while resting.",
      location: "indoor" as const,
      maskRecommended: false,
    },
  ];
}

function buildSummary(input: PlanInput): { headline: string; summary: string } {
  const { aqi, bandLabel, cityName, profile, impact } = input;
  const reduction = impact.central.doseReductionPct;

  let headline = `Air in ${cityName} is ${bandLabel} (AQI ${aqi})`;
  if (profile.hasChildren) {
    headline += " — Prioritize indoor shielding for children";
  } else if (profile.hasRespiratoryCondition) {
    headline += " — Vulnerable respiratory precautions active";
  }

  const summary = `By timing outdoor windows to the afternoon, wearing protective masks during commute, and maintaining an indoor clean air zone, your household can cut personal PM2.5 inhalation by approximately ${reduction}%.`;

  return { headline, summary };
}

type TopicRule = { match: RegExp; reply: (ctx?: PlanOutput) => string };

const TOPIC_RULES: readonly TopicRule[] = [
  {
    match: /purifier|filter|cadr|corsi|box/,
    reply: () =>
      "For indoor air, a HEPA purifier or a DIY Corsi-Rosenthal box creates a steady-state clean air zone. The Impact Engine uses the formula C_in = (P·a·C_out)/(a + k + CADR/V). Even a budget DIY box with a box fan and MERV-13 filters delivers substantial clean air CADR.",
  },
  {
    match: /mask|n95/,
    reply: () =>
      "A certified N95 or KN95 respirator has an Assigned Protection Factor of 10, cutting inhaled PM2.5 by ~90% when fitted properly over both nose and mouth. Cloth and loose surgical masks offer far less sealing.",
  },
  {
    match: /window|ventilat/,
    reply: (ctx) => {
      const windowLabel = ctx?.routine[2]?.timeWindow ?? "between 1:00 PM and 4:00 PM";
      return `According to your plan, the cleanest window is ${windowLabel}. Venting during the afternoon takes advantage of diurnal atmospheric mixing when surface inversions temporarily break.`;
    },
  },
];

function resolveTopicReply(query: string, planContext?: PlanOutput): string {
  for (const rule of TOPIC_RULES) {
    if (rule.match.test(query)) {
      return rule.reply(planContext);
    }
  }
  const headline = planContext?.headline ?? "for smog navigation";
  return `Based on your personalized plan (${headline}), focusing on shifting outdoor transit to the afternoon and keeping a sealed indoor zone provides the most immediate reduction in PM2.5 dose.`;
}

export class RuleBasedPlanner implements LLMProvider {
  readonly id = "rule-based" as const;

  async generatePlan(input: PlanInput): Promise<PlanOutput> {
    const { headline, summary } = buildSummary(input);
    const routine = buildRoutine(input);

    const indoorHacks = input.applicableActions
      .filter((a) => a.category === "indoor")
      .map((a) => ({
        title: a.title,
        description: a.description,
        costBand: a.costBand,
      }));

    const sustainableSwaps = input.applicableActions
      .filter((a) => a.category === "alternative")
      .map((a) => ({
        title: a.title,
        description: a.description,
        estimatedCo2eSaved: `Saves ~${input.impact.central.transportCo2eSavedG + input.impact.central.cookingCo2eSavedG}g CO2e/day`,
      }));

    return {
      headline,
      summary,
      routine,
      indoorHacks:
        indoorHacks.length > 0
          ? indoorHacks
          : [
              {
                title: "Keep windows sealed during peak smog",
                description:
                  "Prevents high ambient particulate concentrations from infiltrating into indoor living areas.",
                costBand: "free",
              },
            ],
      sustainableSwaps:
        sustainableSwaps.length > 0
          ? sustainableSwaps
          : [
              {
                title: "Carpool or shared transit",
                description: "Reduce vehicle density during severe winter smog episodes.",
                estimatedCo2eSaved: "Saves ~150g CO2e/km",
              },
            ],
      providerUsed: "rule-based",
    };
  }

  async *streamChat(messages: ChatMessage[], planContext?: PlanOutput): AsyncIterable<string> {
    const lastUserMessage = messages[messages.length - 1]?.content ?? "";
    const scope = checkChatScope(lastUserMessage);
    if (!scope.inScope) {
      yield getOutOfScopeReply();
      return;
    }

    const topicAnswer = resolveTopicReply(lastUserMessage.toLowerCase(), planContext);
    const reply = `I am SaafSaans, your winter smog assistant. ${topicAnswer}`;

    for (const word of reply.split(" ")) {
      yield `${word} `;
    }
  }
}
