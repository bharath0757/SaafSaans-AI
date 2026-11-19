import type { DayImpactSummary } from "@/domain/impact";
import type { Locale } from "@/i18n/dictionaries";
import { t } from "@/i18n/dictionaries";

type Props = {
  impact: DayImpactSummary;
  locale: Locale;
};

export function ImpactDetails({ impact, locale }: Props) {
  return (
    <details className="rounded-surface border border-line bg-fog/30 p-4 text-sm">
      <summary className="cursor-pointer font-medium text-ink hover:text-teal focus-visible:outline focus-visible:outline-teal">
        {t(locale, "howCalculated")}
      </summary>
      <div className="mt-3 space-y-3 pt-2 text-muted">
        <div>
          <p className="font-semibold text-ink">{t(locale, "massBalanceFormula")}</p>
          <p className="font-mono text-xs">{impact.formulaSummary}</p>
        </div>
        <div>
          <p className="font-semibold text-ink">{t(locale, "uncertaintyRange")}</p>
          <p className="text-xs">
            Low: {impact.low.doseReductionPct}% reduction | Central:{" "}
            {impact.central.doseReductionPct}% | High: {impact.high.doseReductionPct}%
          </p>
        </div>
        <div>
          <p className="font-semibold text-ink">{t(locale, "sourcesTitle")}</p>
          <ul className="list-inside list-disc text-xs">
            {impact.primarySources.map((s, idx) => (
              <li key={idx}>{s}</li>
            ))}
          </ul>
        </div>
        <p className="border-t border-line/60 pt-2 text-xs italic text-muted">
          {t(locale, "impactDisclaimer")}
        </p>
      </div>
    </details>
  );
}
