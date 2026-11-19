import type { Locale } from "@/i18n/dictionaries";
import { t } from "@/i18n/dictionaries";
import type { HouseholdProfile } from "@/domain/actions";

type Props = {
  locale: Locale;
  profile: HouseholdProfile;
  onChange: (patch: Partial<HouseholdProfile>) => void;
};

type ItemConfig = {
  key: "hasChildren" | "hasElders" | "hasRespiratoryCondition";
  id: string;
  labelKey: "childrenLabel" | "eldersLabel" | "respiratoryLabel";
  descKey: "childrenDesc" | "eldersDesc" | "respiratoryDesc";
};

const ITEMS: ItemConfig[] = [
  {
    key: "hasChildren",
    id: "toggle-children",
    labelKey: "childrenLabel",
    descKey: "childrenDesc",
  },
  {
    key: "hasElders",
    id: "toggle-elders",
    labelKey: "eldersLabel",
    descKey: "eldersDesc",
  },
  {
    key: "hasRespiratoryCondition",
    id: "toggle-respiratory",
    labelKey: "respiratoryLabel",
    descKey: "respiratoryDesc",
  },
];

export function StepHousehold({ locale, profile, onChange }: Props) {
  return (
    <div className="space-y-4">
      {ITEMS.map((item) => {
        const checked = profile[item.key];
        return (
          <div
            key={item.id}
            className={`flex items-start gap-3 rounded-surface border p-3 transition-colors ${
              checked ? "border-teal bg-fog/50" : "border-line bg-paper"
            }`}
          >
            <input
              id={item.id}
              type="checkbox"
              checked={checked}
              onChange={(e) => onChange({ [item.key]: e.target.checked })}
              className="mt-1 h-5 w-5 rounded-control border-line text-teal focus-visible:outline-teal"
            />
            <label htmlFor={item.id} className="cursor-pointer">
              <span className="block text-sm font-medium text-ink">{t(locale, item.labelKey)}</span>
              <span className="block text-xs text-muted">{t(locale, item.descKey)}</span>
            </label>
          </div>
        );
      })}
    </div>
  );
}
