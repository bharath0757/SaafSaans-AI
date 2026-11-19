import type { CollectiveImpact } from "@/domain/collective";

type Props = {
  households: number;
  impact: CollectiveImpact;
  onChangeHouseholds: (n: number) => void;
};

export function CollectiveSimulator({ households, impact, onChangeHouseholds }: Props) {
  return (
    <section
      aria-labelledby="collective-impact-heading"
      className="rounded-card border border-line bg-surface p-6 shadow-card print:border-ink print:bg-transparent print:p-4 print:shadow-none"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4 print:border-ink">
        <div>
          <h2 id="collective-impact-heading" className="font-display text-xl font-bold text-ink">
            Collective Community Impact
          </h2>
          <p className="text-xs text-muted print:text-ink">
            Projected daily clean air benefits scaled across your entire residential complex.
          </p>
        </div>
        <div className="flex items-center gap-3 print:hidden">
          <label htmlFor="households-slider" className="text-xs font-semibold text-ink">
            Households: <span className="font-mono text-sm text-teal">{households}</span>
          </label>
          <input
            id="households-slider"
            type="range"
            min={5}
            max={500}
            step={5}
            value={households}
            onChange={(e) => onChangeHouseholds(Number(e.target.value))}
            className="h-2 w-32 cursor-pointer accent-teal"
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 print:mt-4">
        <div className="rounded-control border border-line bg-paper p-3 print:border-ink">
          <p className="text-xs font-semibold text-muted print:text-ink">PM2.5 Avoided</p>
          <p className="mt-1 font-mono text-xl font-bold text-ink sm:text-2xl">
            {impact.totalPm25AvoidedGrams} <span className="text-sm font-normal">grams/day</span>
          </p>
          <p className="mt-0.5 text-xs text-muted print:text-ink">🛡️ Inhaled particulate mass</p>
        </div>

        <div className="rounded-control border border-line bg-paper p-3 print:border-ink">
          <p className="text-xs font-semibold text-muted print:text-ink">Cigarette Equiv.</p>
          <p className="mt-1 font-mono text-xl font-bold text-ink sm:text-2xl">
            {impact.totalCigarettesAvoided} <span className="text-sm font-normal">avoided/day</span>
          </p>
          <p className="mt-0.5 text-xs text-muted print:text-ink">🚭 Berkeley Earth model</p>
        </div>

        <div className="rounded-control border border-line bg-paper p-3 print:border-ink">
          <p className="text-xs font-semibold text-muted print:text-ink">CO2e Emissions</p>
          <p className="mt-1 font-mono text-xl font-bold text-ink sm:text-2xl">
            {impact.totalCo2eAvoidedKg} <span className="text-sm font-normal">kg saved</span>
          </p>
          <p className="mt-0.5 text-xs text-muted print:text-ink">🌱 Transit & fuel swaps</p>
        </div>

        <div className="rounded-control border border-line bg-paper p-3 print:border-ink">
          <p className="text-xs font-semibold text-muted print:text-ink">Clean Air Delivered</p>
          <p className="mt-1 font-mono text-xl font-bold text-ink sm:text-2xl">
            {impact.cleanAirVolumeM3.toLocaleString()}{" "}
            <span className="text-sm font-normal">m³</span>
          </p>
          <p className="mt-0.5 text-xs text-muted print:text-ink">💨 Filtered zone volume</p>
        </div>
      </div>
    </section>
  );
}
