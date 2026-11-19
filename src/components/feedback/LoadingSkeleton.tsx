import type { Locale } from "@/i18n/dictionaries";
import { t } from "@/i18n/dictionaries";

type Props = {
  locale?: Locale;
};

export function LoadingSkeleton({ locale = "en" }: Props) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label={t(locale, "loading")}
      className="space-y-8 py-4"
    >
      <div className="space-y-4">
        <div className="h-4 w-40 animate-pulse rounded-control bg-line/40" />
        <div className="h-10 w-3/4 animate-pulse rounded-control bg-line/40" />
        <div className="h-4 w-1/2 animate-pulse rounded-control bg-line/40" />
      </div>

      <div className="space-y-2">
        <div className="h-4 w-28 animate-pulse rounded-control bg-line/40" />
        <div className="h-4 w-full animate-pulse rounded-control bg-line/40" />
        <div className="flex justify-between">
          <div className="h-3 w-8 animate-pulse rounded-control bg-line/40" />
          <div className="h-3 w-8 animate-pulse rounded-control bg-line/40" />
          <div className="h-3 w-8 animate-pulse rounded-control bg-line/40" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="h-6 w-48 animate-pulse rounded-control bg-line/40" />
        <div className="flex gap-3 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-36 w-20 shrink-0 animate-pulse rounded-surface bg-line/30" />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="h-8 w-64 animate-pulse rounded-control bg-line/40" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-28 animate-pulse rounded-surface bg-line/30" />
          <div className="h-28 animate-pulse rounded-surface bg-line/30" />
        </div>
      </div>
    </div>
  );
}
