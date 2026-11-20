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

function formatTableHour(hour: number): string {
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const suffix = hour >= 12 ? "PM" : "AM";
  return `${displayHour}:00 ${suffix}`;
}

function isPointInBestWindow(hour: number, bestWindow?: BestOutdoorWindow): boolean {
  if (!bestWindow) return false;
  return hour >= bestWindow.startHour && hour <= bestWindow.endHour;
}

function HourlyTableRow({
  point,
  isCleanest,
  cleanestLabel,
}: {
  point: HourlyAqiPoint;
  isCleanest: boolean;
  cleanestLabel: string;
}) {
  const band = getAqiBand(point.aqi);
  const hourLabel = formatTableHour(point.hour);

  return (
    <tr className="border-b border-line/50 hover:bg-fog/30">
      <td className="p-3 font-medium text-ink">{hourLabel}</td>
      <td className="p-3 tabular-nums text-ink">{point.aqi}</td>
      <td className="p-3">
        <span className="inline-flex items-center gap-1.5 text-ink">
          <AqiBandIcon band={band.key} className="h-3.5 w-3.5" title={band.label} />
          <span>{band.label}</span>
        </span>
      </td>
      <td className="p-3 tabular-nums text-muted">{point.pm25}</td>
      <td className="p-3 text-muted">
        {isCleanest ? (
          <span className="rounded-control bg-teal/15 px-2 py-0.5 text-xs font-medium text-teal">
            {cleanestLabel}
          </span>
        ) : (
          "—"
        )}
      </td>
    </tr>
  );
}

export function HourlyTable({ hourly, bestWindow, locale = "en" }: Props) {
  const cleanestLabel = t(locale, "cleanestWindow");

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
          {hourly.map((pt) => (
            <HourlyTableRow
              key={pt.hour}
              point={pt}
              isCleanest={isPointInBestWindow(pt.hour, bestWindow)}
              cleanestLabel={cleanestLabel}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
