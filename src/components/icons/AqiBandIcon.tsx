import type { AqiBandKey } from "@/design/tokens";

type Props = {
  band: AqiBandKey;
  className?: string;
  title?: string;
};

const PATHS: Record<AqiBandKey, string> = {
  good: "M12 4a8 8 0 1 0 0 16a8 8 0 1 0 0-16z",
  satisfactory: "M12 3 L21 12 L12 21 L3 12 Z",
  moderate: "M12 3 L22 20 L2 20 Z",
  poor: "M4 4 H20 V20 H4 Z",
  veryPoor: "M12 2 L20 7 L20 17 L12 22 L4 17 L4 7 Z",
  severe: "M8 3 L16 3 L21 8 L21 16 L16 21 L8 21 L3 16 L3 8 Z",
};

/**
 * Distinct geometric shape per AQI band so severity is never colour-only.
 */
export function AqiBandIcon({ band, className = "h-4 w-4", title }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path d={PATHS[band]} />
    </svg>
  );
}
