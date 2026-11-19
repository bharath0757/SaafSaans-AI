import Link from "next/link";
import type { Locale } from "@/i18n/dictionaries";
import { t } from "@/i18n/dictionaries";

type Props = {
  locale: Locale;
  cityName: string;
  aqi: number;
  band: string;
  onPrint: () => void;
};

export function CommunityHeader({ locale, cityName, aqi, band, onPrint }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-control border border-line bg-paper px-3 py-2 text-sm font-semibold text-ink hover:bg-surface focus:outline-none focus:ring-2 focus:ring-teal"
        >
          <span aria-hidden="true">←</span>
          <span>{t(locale, "backToDashboard")}</span>
        </Link>
        <button
          type="button"
          onClick={onPrint}
          className="inline-flex items-center gap-1.5 rounded-control bg-teal px-4 py-2 text-sm font-semibold text-paper shadow-sm hover:bg-teal-hover focus:outline-none focus:ring-2 focus:ring-teal"
        >
          <span aria-hidden="true">🖨️</span>
          <span>{t(locale, "printPack")}</span>
        </button>
      </div>

      <header className="border-b border-line pb-4 print:border-ink">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal print:text-ink">
              SaafSaans Clean Air Coalition
            </span>
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink md:text-3xl">
              {t(locale, "communityActionPack")} — {cityName}
            </h1>
          </div>
          <div className="flex items-center gap-2 rounded-control border border-line bg-surface px-3 py-1.5 print:border-ink">
            <span className="text-xs font-medium text-muted print:text-ink">Current AQI:</span>
            <span className="font-mono text-lg font-bold text-ink">{aqi}</span>
            <span className="rounded px-2 py-0.5 text-xs font-bold uppercase bg-sand text-ink print:border print:border-ink">
              {band}
            </span>
          </div>
        </div>
        <p className="mt-2 text-sm text-muted print:text-ink">
          Actionable protocols for housing societies, apartment blocks, Resident Welfare
          Associations (RWAs), and school campuses navigating severe winter air pollution.
        </p>
      </header>
    </div>
  );
}
