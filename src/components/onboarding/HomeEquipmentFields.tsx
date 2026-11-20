import type { Locale } from "@/i18n/dictionaries";
import { t } from "@/i18n/dictionaries";
import type { HouseholdProfile } from "@/domain/actions";

type Props = {
  locale: Locale;
  profile: HouseholdProfile;
  onChange: (patch: Partial<HouseholdProfile>) => void;
};

function HomeTypeAndPurifier({
  locale,
  profile,
  onChange,
}: {
  locale: Locale;
  profile: HouseholdProfile;
  onChange: (patch: Partial<HouseholdProfile>) => void;
}) {
  return (
    <>
      <div>
        <label htmlFor="home-type" className="block text-sm font-medium text-ink">
          {t(locale, "homeTypeLabel")}
        </label>
        <select
          id="home-type"
          value={profile.homeType}
          onChange={(e) => onChange({ homeType: e.target.value as HouseholdProfile["homeType"] })}
          className="mt-1 w-full rounded-control border border-line bg-paper px-3 py-2 text-sm text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal"
        >
          <option value="leaky">{t(locale, "leaky")}</option>
          <option value="sealed">{t(locale, "sealed")}</option>
        </select>
      </div>

      <div>
        <label htmlFor="purifier-select" className="block text-sm font-medium text-ink">
          {t(locale, "purifierLabel")}
        </label>
        <select
          id="purifier-select"
          value={profile.purifier}
          onChange={(e) => onChange({ purifier: e.target.value as HouseholdProfile["purifier"] })}
          className="mt-1 w-full rounded-control border border-line bg-paper px-3 py-2 text-sm text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal"
        >
          <option value="none">{t(locale, "purifierNone")}</option>
          <option value="small">{t(locale, "purifierSmall")}</option>
          <option value="medium">{t(locale, "purifierMedium")}</option>
          <option value="large">{t(locale, "purifierLarge")}</option>
        </select>
      </div>
    </>
  );
}

function MaskAndBudget({
  locale,
  profile,
  onChange,
}: {
  locale: Locale;
  profile: HouseholdProfile;
  onChange: (patch: Partial<HouseholdProfile>) => void;
}) {
  return (
    <>
      <div>
        <label htmlFor="mask-select" className="block text-sm font-medium text-ink">
          {t(locale, "maskLabel")}
        </label>
        <select
          id="mask-select"
          value={profile.mask}
          onChange={(e) => onChange({ mask: e.target.value as HouseholdProfile["mask"] })}
          className="mt-1 w-full rounded-control border border-line bg-paper px-3 py-2 text-sm text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal"
        >
          <option value="none">{t(locale, "maskNone")}</option>
          <option value="cloth">{t(locale, "maskCloth")}</option>
          <option value="surgical">{t(locale, "maskSurgical")}</option>
          <option value="n95">{t(locale, "maskN95")}</option>
        </select>
      </div>

      <div>
        <label htmlFor="budget-select" className="block text-sm font-medium text-ink">
          {t(locale, "budgetLabel")}
        </label>
        <select
          id="budget-select"
          value={profile.budget}
          onChange={(e) => onChange({ budget: e.target.value as HouseholdProfile["budget"] })}
          className="mt-1 w-full rounded-control border border-line bg-paper px-3 py-2 text-sm text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal"
        >
          <option value="free">{t(locale, "budgetFree")}</option>
          <option value="low">{t(locale, "budgetLow")}</option>
          <option value="medium">{t(locale, "budgetMedium")}</option>
          <option value="high">{t(locale, "budgetHigh")}</option>
        </select>
      </div>
    </>
  );
}

export function HomeEquipmentFields({ locale, profile, onChange }: Props) {
  return (
    <div className="space-y-4">
      <HomeTypeAndPurifier locale={locale} profile={profile} onChange={onChange} />
      <MaskAndBudget locale={locale} profile={profile} onChange={onChange} />
    </div>
  );
}
