import type { PlanOutput } from "@/services/llm/types";
import type { Locale } from "@/i18n/dictionaries";
import { t } from "@/i18n/dictionaries";

type Props = {
  hacks: PlanOutput["indoorHacks"];
  locale: Locale;
};

export function IndoorTab({ hacks, locale }: Props) {
  const getCostBadge = (band: "free" | "low" | "medium" | "high") => {
    switch (band) {
      case "free":
        return { label: t(locale, "costFree"), cls: "bg-teal/15 text-teal" };
      case "low":
        return { label: t(locale, "costLow"), cls: "bg-fog text-ink" };
      case "medium":
        return { label: t(locale, "costMedium"), cls: "bg-saffron/15 text-saffron" };
      case "high":
        return { label: t(locale, "costHigh"), cls: "bg-line text-ink" };
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {hacks.map((hack, idx) => {
        const badge = getCostBadge(hack.costBand);
        return (
          <div
            key={idx}
            className="flex flex-col justify-between rounded-surface border border-line bg-paper p-4"
          >
            <div className="space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-sans text-base font-semibold text-ink">{hack.title}</h3>
                <span
                  className={`shrink-0 rounded-control px-2 py-0.5 text-xs font-medium ${badge.cls}`}
                >
                  {badge.label}
                </span>
              </div>
              <p className="text-sm text-muted">{hack.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
