import { listAqiBands, aqiLadderPosition, type AqiBand } from "@/domain/aqi";
import { AqiBandIcon } from "@/components/icons/AqiBandIcon";

type Props = {
  aqi: number;
  band: AqiBand;
  /** When true, skip CSS transition (prefers-reduced-motion / SSR). */
  reduceMotion?: boolean;
};

type ScaleBarProps = {
  aqi: number;
  band: AqiBand;
  position: number;
  bands: ReturnType<typeof listAqiBands>;
  reduceMotion: boolean;
};

function LadderScaleBar({ aqi, band, position, bands, reduceMotion }: ScaleBarProps) {
  const transitionClass = reduceMotion
    ? ""
    : "transition-[left] duration-300 ease-out motion-reduce:transition-none";

  return (
    <div
      className="relative h-3 w-full overflow-hidden rounded-control"
      role="img"
      aria-label={`AQI ${aqi}, ${band.label}, on a scale from 0 to 500`}
    >
      <div className="absolute inset-0 flex">
        {bands.map((b) => (
          <div
            key={b.key}
            className="visualization-bar h-full flex-1"
            style={{ backgroundColor: b.color }}
            title={`${b.label} ${b.min}–${b.max}`}
          />
        ))}
      </div>
      <div
        className={`absolute top-1/2 h-5 w-1 -translate-y-1/2 rounded-control bg-ink ring-2 ring-paper ${transitionClass}`}
        style={{ left: `calc(${position}% - 2px)` }}
      />
    </div>
  );
}

function LadderLabels({ bands }: { bands: ReturnType<typeof listAqiBands> }) {
  return (
    <ol className="mt-2 flex justify-between gap-1 text-xs text-muted">
      {bands.map((b) => (
        <li key={b.key} className="flex min-w-0 flex-col items-center gap-1">
          <AqiBandIcon band={b.key} className="h-3 w-3" />
          <span className="truncate">{b.min}</span>
        </li>
      ))}
      <li className="text-muted">500</li>
    </ol>
  );
}

/**
 * Signature AQI ladder: scale bar with position marker, band label and icon.
 */
export function AqiLadder({ aqi, band, reduceMotion = false }: Props) {
  const bands = listAqiBands();
  const position = aqiLadderPosition(aqi) * 100;

  return (
    <div className="w-full max-w-prose">
      <div className="mb-2 flex flex-wrap items-baseline gap-3">
        <p className="font-sans text-3xl font-semibold tabular-nums text-ink">
          <span className="sr-only">Air quality index </span>
          {aqi}
        </p>
        <p className="flex items-center gap-2 text-lg text-ink">
          <AqiBandIcon band={band.key} className="h-5 w-5 text-ink" title={band.label} />
          <span>{band.label}</span>
        </p>
      </div>

      <LadderScaleBar
        aqi={aqi}
        band={band}
        position={position}
        bands={bands}
        reduceMotion={reduceMotion}
      />

      <LadderLabels bands={bands} />
    </div>
  );
}
