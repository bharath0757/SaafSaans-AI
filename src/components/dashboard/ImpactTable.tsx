import type { DayImpactSummary } from "@/domain/impact";
import type { Locale } from "@/i18n/dictionaries";
import { t } from "@/i18n/dictionaries";

type Props = {
  impact: DayImpactSummary;
  locale?: Locale;
};

function buildImpactRows(impact: DayImpactSummary) {
  return [
    {
      key: "metricDoseBefore" as const,
      low: `${impact.low.personalDoseBeforeUg} µg`,
      central: `${impact.central.personalDoseBeforeUg} µg`,
      high: `${impact.high.personalDoseBeforeUg} µg`,
    },
    {
      key: "metricDoseAfter" as const,
      low: `${impact.low.personalDoseAfterUg} µg`,
      central: `${impact.central.personalDoseAfterUg} µg`,
      high: `${impact.high.personalDoseAfterUg} µg`,
    },
    {
      key: "metricReduction" as const,
      low: `${impact.low.doseReductionPct}%`,
      central: `${impact.central.doseReductionPct}%`,
      high: `${impact.high.doseReductionPct}%`,
    },
    {
      key: "metricDoseSaved" as const,
      low: `${impact.low.doseSavedUg} µg`,
      central: `${impact.central.doseSavedUg} µg`,
      high: `${impact.high.doseSavedUg} µg`,
    },
  ];
}

function ImpactTableHeader({ locale }: { locale: Locale }) {
  return (
    <thead>
      <tr className="border-b border-line bg-fog/50 text-xs font-semibold text-muted">
        <th scope="col" className="p-3">
          {t(locale, "metricHeader")}
        </th>
        <th scope="col" className="p-3">
          {t(locale, "lowHeader")}
        </th>
        <th scope="col" className="p-3">
          {t(locale, "centralHeader")}
        </th>
        <th scope="col" className="p-3">
          {t(locale, "highHeader")}
        </th>
      </tr>
    </thead>
  );
}

export function ImpactTable({ impact, locale = "en" }: Props) {
  const rows = buildImpactRows(impact);

  return (
    <div className="overflow-x-auto rounded-surface border border-line bg-paper">
      <table className="w-full border-collapse text-left text-sm">
        <caption className="sr-only">{t(locale, "impactTableCaption")}</caption>
        <ImpactTableHeader locale={locale} />
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} className="border-b border-line/50 hover:bg-fog/30">
              <th scope="row" className="p-3 font-medium text-ink">
                {t(locale, r.key)}
              </th>
              <td className="p-3 tabular-nums text-muted">{r.low}</td>
              <td className="p-3 tabular-nums font-semibold text-teal">{r.central}</td>
              <td className="p-3 tabular-nums text-muted">{r.high}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
