import { useState } from "react";
import type { DayImpactSummary, ImpactMetrics } from "@/domain/impact";
import type { Locale } from "@/i18n/dictionaries";
import { t } from "@/i18n/dictionaries";
import { ImpactTable } from "./ImpactTable";
import { ImpactDetails } from "./ImpactDetails";

type Props = {
  impact: DayImpactSummary;
  locale?: Locale;
};

function ImpactDoseBars({ central, locale }: { central: ImpactMetrics; locale: Locale }) {
  const maxDose = Math.max(central.personalDoseBeforeUg, central.personalDoseAfterUg, 50);
  const beforePct = Math.min(100, Math.round((central.personalDoseBeforeUg / maxDose) * 100));
  const afterPct = Math.min(100, Math.round((central.personalDoseAfterUg / maxDose) * 100));

  return (
    <div className="space-y-4 rounded-surface border border-line bg-paper p-5">
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-medium text-muted">
          <span>{t(locale, "beforeLabel")}</span>
          <span className="tabular-nums text-ink">{central.personalDoseBeforeUg} µg/day</span>
        </div>
        <div className="h-4 w-full overflow-hidden rounded-control bg-fog">
          <div
            className="visualization-bar h-full rounded-control bg-muted"
            style={{ width: `${beforePct}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs font-medium text-muted">
          <span>{t(locale, "afterLabel")}</span>
          <span className="tabular-nums font-semibold text-teal">
            {central.personalDoseAfterUg} µg/day
          </span>
        </div>
        <div className="h-4 w-full overflow-hidden rounded-control bg-fog">
          <div
            className="visualization-bar h-full rounded-control bg-teal"
            style={{ width: `${afterPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export function ImpactCards({ impact, locale = "en" }: Props) {
  const [showTable, setShowTable] = useState(false);
  const { central } = impact;

  return (
    <section aria-labelledby="impact-heading" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="impact-heading" className="font-display text-xl font-semibold text-ink">
            {t(locale, "impactTitle")}
          </h2>
          <p className="text-sm font-medium text-teal">
            {central.doseReductionPct}% {t(locale, "impactHeadline")} (saves ~{central.doseSavedUg}{" "}
            µg/day)
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowTable((v) => !v)}
          className="rounded-control border border-line bg-paper px-3 py-1.5 text-xs font-medium text-ink hover:bg-fog focus-visible:outline focus-visible:outline-teal"
        >
          {showTable ? t(locale, "showCards") : t(locale, "showTable")}
        </button>
      </div>

      {showTable ? (
        <ImpactTable impact={impact} locale={locale} />
      ) : (
        <ImpactDoseBars central={central} locale={locale} />
      )}

      <ImpactDetails impact={impact} locale={locale} />
    </section>
  );
}
