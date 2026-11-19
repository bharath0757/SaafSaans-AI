import type { HourlyAqiPoint } from "@/services/air-quality";
import { getAqiBand } from "@/domain/aqi";
import { AqiBandIcon } from "@/components/icons/AqiBandIcon";

type Props = {
  point: HourlyAqiPoint;
  isCleanest: boolean;
};

export function HourlyCard({ point, isCleanest }: Props) {
  const band = getAqiBand(point.aqi);
  const barHeight = Math.min(100, Math.max(12, Math.round((point.aqi / 500) * 80)));
  const hourLabel = `${point.hour % 12 === 0 ? 12 : point.hour % 12} ${
    point.hour >= 12 ? "PM" : "AM"
  }`;

  return (
    <div
      aria-label={`${hourLabel}: AQI ${point.aqi}, ${band.label}`}
      className={`flex min-w-[76px] flex-col items-center justify-between rounded-surface border p-2.5 transition-colors ${
        isCleanest ? "border-teal bg-fog/80" : "border-line bg-paper"
      }`}
    >
      <span className="text-xs font-medium text-muted">{hourLabel}</span>
      <div className="my-2 flex h-20 w-5 items-end justify-center rounded-control bg-fog p-0.5">
        <div
          className="visualization-bar w-full rounded-control"
          style={{ height: `${barHeight}%`, backgroundColor: band.color }}
        />
      </div>
      <div className="flex flex-col items-center gap-1">
        <AqiBandIcon band={band.key} className="h-4 w-4" title={band.label} />
        <span className="font-sans text-sm font-semibold tabular-nums text-ink">{point.aqi}</span>
      </div>
      {isCleanest && (
        <span className="mt-1.5 rounded-control bg-teal px-1.5 py-0.5 text-[10px] font-medium text-paper">
          Best
        </span>
      )}
    </div>
  );
}
