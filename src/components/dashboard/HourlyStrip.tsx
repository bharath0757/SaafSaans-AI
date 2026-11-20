import { useState, useRef } from "react";
import type { HourlyAqiPoint, BestOutdoorWindow } from "@/services/air-quality";
import type { Locale } from "@/i18n/dictionaries";
import { t } from "@/i18n/dictionaries";
import { HourlyCard } from "./HourlyCard";
import { HourlyTable } from "./HourlyTable";

type Props = {
  hourly: HourlyAqiPoint[];
  bestWindow?: BestOutdoorWindow;
  locale?: Locale;
};

function HourlyScrollContainer({
  hourly,
  bestWindow,
  locale,
}: {
  hourly: HourlyAqiPoint[];
  bestWindow?: BestOutdoorWindow;
  locale: Locale;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") {
      containerRef.current?.scrollBy({ left: 150, behavior: "smooth" });
    } else if (e.key === "ArrowLeft") {
      containerRef.current?.scrollBy({ left: -150, behavior: "smooth" });
    }
  };

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role="toolbar"
      aria-label={t(locale, "hourlyForecast")}
      onKeyDown={handleKeyDown}
      className="flex gap-2.5 overflow-x-auto pb-2 pt-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal"
    >
      {hourly.map((pt) => {
        const isCleanest =
          Boolean(bestWindow) &&
          pt.hour >= (bestWindow?.startHour ?? -1) &&
          pt.hour <= (bestWindow?.endHour ?? -1);
        return <HourlyCard key={pt.hour} point={pt} isCleanest={isCleanest} />;
      })}
    </div>
  );
}

export function HourlyStrip({ hourly, bestWindow, locale = "en" }: Props) {
  const [showTable, setShowTable] = useState(false);

  return (
    <section aria-labelledby="hourly-forecast-heading" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="hourly-forecast-heading" className="font-display text-xl font-semibold text-ink">
            {t(locale, "hourlyForecast")}
          </h2>
          {bestWindow && (
            <p className="text-xs text-muted">
              {t(locale, "cleanestWindow")}:{" "}
              <span className="font-medium text-teal">{bestWindow.label}</span> (Avg AQI{" "}
              {bestWindow.avgAqi})
            </p>
          )}
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
        <HourlyTable hourly={hourly} bestWindow={bestWindow} locale={locale} />
      ) : (
        <HourlyScrollContainer hourly={hourly} bestWindow={bestWindow} locale={locale} />
      )}
    </section>
  );
}
