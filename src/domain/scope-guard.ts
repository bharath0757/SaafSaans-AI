/**
 * Strict Air Quality Scope Guard.
 * Evaluates whether a user's prompt is strictly relevant to air quality,
 * winter smog, exposure reduction, masks, purifiers, or sustainable alternatives.
 * Intercepts off-topic queries and prompt injection attempts before LLM processing.
 */

const INJECTION_PATTERNS = [
  /ignore (all )?(previous|prior) (instructions|prompts)/i,
  /system prompt/i,
  /you are now (dan|unrestricted|an evil)/i,
  /bypass (all )?(safety|content) (rules|filters)/i,
  /developer mode/i,
];

const AIR_QUALITY_TERMS = [
  /\baqi\b/i,
  /air\s*quality/i,
  /smog/i,
  /pollution/i,
  /pm\s*2\.?5/i,
  /pm\s*10/i,
  /mask/i,
  /n95/i,
  /kn95/i,
  /respirator/i,
  /purifier/i,
  /hepa/i,
  /cadr/i,
  /corsi/i,
  /filter/i,
  /window/i,
  /ventilat/i,
  /breath/i,
  /lung/i,
  /asthma/i,
  /cough/i,
  /inversion/i,
  /stubble/i,
  /smoke/i,
  /commute/i,
  /two-wheeler/i,
  /chulha/i,
  /biomass/i,
  /cpcb/i,
  /grap/i,
  /clean air/i,
  /indoor/i,
  /outdoor/i,
  /routine/i,
];

export type ScopeCheckResult = {
  inScope: boolean;
  isInjectionAttempt: boolean;
};

export function checkChatScope(query: string): ScopeCheckResult {
  const trimmed = query.trim();
  if (trimmed.length === 0) {
    return { inScope: false, isInjectionAttempt: false };
  }

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { inScope: false, isInjectionAttempt: true };
    }
  }

  for (const term of AIR_QUALITY_TERMS) {
    if (term.test(trimmed)) {
      return { inScope: true, isInjectionAttempt: false };
    }
  }

  return { inScope: false, isInjectionAttempt: false };
}

export function getOutOfScopeReply(): string {
  return "I am SaafSaans, your winter smog and urban air pollution assistant. I can only assist with air quality, smog navigation, mask guidance, indoor air purification, daily routine timing, and sustainable alternatives. How can I help you protect your household today?";
}
