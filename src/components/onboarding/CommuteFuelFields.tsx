import type { Locale } from "@/i18n/dictionaries";
import { t } from "@/i18n/dictionaries";
import type { HouseholdProfile } from "@/domain/actions";
import type { TransportKey } from "@/domain/constants";

type Props = {
  locale: Locale;
  profile: HouseholdProfile;
  onChange: (patch: Partial<HouseholdProfile>) => void;
};

const COMMUTE_OPTIONS: Array<{
  value: TransportKey;
  key: "walk" | "cycle" | "twoWheeler" | "car" | "bus" | "metro";
}> = [
  { value: "twoWheeler", key: "twoWheeler" },
  { value: "metro", key: "metro" },
  { value: "bus", key: "bus" },
  { value: "car", key: "car" },
  { value: "walk", key: "walk" },
  { value: "cycle", key: "cycle" },
];

function CookingFuelField({
  locale,
  value,
  onChange,
}: {
  locale: Locale;
  value: HouseholdProfile["cookingFuel"];
  onChange: (fuel: HouseholdProfile["cookingFuel"]) => void;
}) {
  return (
    <div>
      <label htmlFor="cooking-fuel" className="block text-sm font-medium text-ink">
        {t(locale, "cookingFuelLabel")}
      </label>
      <select
        id="cooking-fuel"
        value={value}
        onChange={(e) => onChange(e.target.value as HouseholdProfile["cookingFuel"])}
        className="mt-1 w-full rounded-control border border-line bg-paper px-3 py-2 text-sm text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal"
      >
        <option value="lpg">{t(locale, "lpg")}</option>
        <option value="induction">{t(locale, "induction")}</option>
        <option value="biomass">{t(locale, "biomass")}</option>
        <option value="kerosene">{t(locale, "kerosene")}</option>
      </select>
    </div>
  );
}

export function CommuteFuelFields({ locale, profile, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="commute-mode" className="block text-sm font-medium text-ink">
          {t(locale, "commuteLabel")}
        </label>
        <select
          id="commute-mode"
          value={profile.commuteMode}
          onChange={(e) => onChange({ commuteMode: e.target.value as TransportKey })}
          className="mt-1 w-full rounded-control border border-line bg-paper px-3 py-2 text-sm text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal"
        >
          {COMMUTE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {t(locale, opt.key)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="commute-distance" className="block text-sm font-medium text-ink">
          {t(locale, "commuteDistance")}: {profile.commuteDistanceKm} {t(locale, "kmUnit")}
        </label>
        <input
          id="commute-distance"
          type="range"
          min={0}
          max={50}
          step={1}
          value={profile.commuteDistanceKm}
          onChange={(e) => onChange({ commuteDistanceKm: Number(e.target.value) })}
          className="mt-1 w-full accent-teal"
        />
      </div>

      <CookingFuelField
        locale={locale}
        value={profile.cookingFuel}
        onChange={(cookingFuel) => onChange({ cookingFuel })}
      />
    </div>
  );
}
