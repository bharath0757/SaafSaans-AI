import type { Locale } from "@/i18n/dictionaries";
import type { HouseholdProfile } from "@/domain/actions";
import { CommuteFuelFields } from "./CommuteFuelFields";
import { HomeEquipmentFields } from "./HomeEquipmentFields";

type Props = {
  locale: Locale;
  profile: HouseholdProfile;
  onChange: (patch: Partial<HouseholdProfile>) => void;
};

export function StepHabits({ locale, profile, onChange }: Props) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <CommuteFuelFields locale={locale} profile={profile} onChange={onChange} />
      <HomeEquipmentFields locale={locale} profile={profile} onChange={onChange} />
    </div>
  );
}
