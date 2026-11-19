import type { HourlyAqiPoint, BestOutdoorWindow } from "@/services/air-quality";
import { getAqiBand } from "@/domain/aqi";
import { AqiBandIcon } from "@/components/icons/AqiBandIcon";
import type { Locale } from "@/i18n/dictionaries";
import { t } from "@/i18n/dictionaries";

type Props = {
  hourly: HourlyAqiPoint[];
  bestWindow?: BestOutdoorWindow;
  locale?: Locale;
};

export function HourlyTable({ hourly, bestWindow, locale = "en" }: Props) {
  return (
    <div className="overflow-x-auto rounded-surface border border-line bg-paper">
      <table className="w-full border-collapse text-left text-sm">
        <caption className="sr-only">{t(locale, "hourlyTableCaption")}</caption>
        <thead>
          <tr className="border-b border-line bg-fog/50 text-xs font-semibold text-muted">
            <th scope="col" className="p-3">
              {t(locale, "hourHeader")}
            </th>
            <th scope="col" className="p-3">
              {t(locale, "aqiHeader")}
            </th>
            <th scope="col" className="p-3">
              {t(locale, "bandHeader")}
            </th>
            <th scope="col" className="p-3">
              {t(locale, "pm25Header")}
            </th>
            <th scope="col" className="p-3">
              {t(locale, "windowHeader")}
            </th>
          </tr>
        </thead>
        <tbody>
          {hourly.map((pt) => {
            const band = getAqiBand(pt.aqi);
            const isCleanest =
              Boolean(bestWindow) &&
              pt.hour >= (bestWindow?.startHour ?? -1) &&
              pt.hour <= (bestWindow?.endHour ?? -1);
            const hourLabel = `${pt.hour % 12 === 0 ? 12 : pt.hour % 12}:00 ${
              pt.hour >= 12 ? "PM" : "AM"
            }`;
            return (
              <tr key={pt.hour} className="border-b border-line/50 hover:bg-fog/30">
                <td className="p-3 font-medium text-ink">{hourLabel}</td>
                <td className="p-3 tabular-nums text-ink">{pt.aqi}</td>
                <td className="p-3">
                  <span className="inline-flex items-center gap-1.5 text-ink">
                    <AqiBandIcon band={band.key} className="h-3.5 w-3.5" title={band.label} />
                    <span>{band.label}</span>
                  </span>
                </td>
                <td className="p-3 tabular-nums text-muted">{pt.pm25}</td>
                <td className="p-3 text-muted">
                  {isCleanest ? (
                    <span className="rounded-control bg-teal/15 px-2 py-0.5 text-xs font-medium text-teal">
                      {t(locale, "cleanestWindow")}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
