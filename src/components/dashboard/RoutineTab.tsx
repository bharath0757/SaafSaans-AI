import type { PlanOutput } from "@/services/llm/types";
import type { Locale } from "@/i18n/dictionaries";
import { t } from "@/i18n/dictionaries";

type Props = {
  routine: PlanOutput["routine"];
  locale: Locale;
};

export function RoutineTab({ routine, locale }: Props) {
  const getLocationLabel = (loc: "indoor" | "outdoor" | "transit") => {
    if (loc === "indoor") return t(locale, "locationIndoor");
    if (loc === "outdoor") return t(locale, "locationOutdoor");
    return t(locale, "locationTransit");
  };

  return (
    <div className="space-y-3">
      {routine.map((item, idx) => (
        <div
          key={idx}
          className="flex flex-col gap-2 rounded-surface border border-line bg-paper p-4 md:flex-row md:items-center md:justify-between"
        >
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-ink">{item.timeWindow}</span>
              <span className="text-sm font-medium text-muted">• {item.activity}</span>
              <span className="rounded-control bg-fog px-2 py-0.5 text-xs font-medium text-ink">
                {getLocationLabel(item.location)}
              </span>
            </div>
            <p className="text-sm text-ink">{item.action}</p>
          </div>
          {item.maskRecommended && (
            <span className="inline-flex w-fit items-center rounded-control bg-teal/15 px-2.5 py-1 text-xs font-medium text-teal">
              {t(locale, "maskRequired")}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
