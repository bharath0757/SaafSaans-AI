import { useState } from "react";
import type { PlanOutput } from "@/services/llm/types";
import type { Locale } from "@/i18n/dictionaries";
import { t } from "@/i18n/dictionaries";
import { RoutineTab } from "./RoutineTab";
import { IndoorTab } from "./IndoorTab";
import { SwapsTab } from "./SwapsTab";

type Props = {
  plan: PlanOutput;
  locale?: Locale;
};

type TabId = "today" | "home" | "swaps";

type TabItem = {
  id: TabId;
  label: string;
};

function PlanTabList({
  tabs,
  activeTab,
  onSelect,
}: {
  tabs: TabItem[];
  activeTab: TabId;
  onSelect: (tab: TabId) => void;
}) {
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowRight") {
      const nextTab = tabs[(index + 1) % tabs.length];
      if (nextTab) onSelect(nextTab.id);
    } else if (e.key === "ArrowLeft") {
      const prevTab = tabs[(index - 1 + tabs.length) % tabs.length];
      if (prevTab) onSelect(prevTab.id);
    }
  };

  return (
    <div
      role="tablist"
      aria-label="Action plan sections"
      className="flex gap-2 border-b border-line pb-px"
    >
      {tabs.map((tab, idx) => {
        const isSelected = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={isSelected}
            aria-controls={`panel-${tab.id}`}
            onClick={() => onSelect(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={`rounded-control px-4 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal ${
              isSelected
                ? "border-b-2 border-teal bg-paper text-teal font-semibold"
                : "text-muted hover:text-ink"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function PlanTabPanel({
  activeTab,
  plan,
  locale,
}: {
  activeTab: TabId;
  plan: PlanOutput;
  locale: Locale;
}) {
  return (
    <div
      role="tabpanel"
      id={`panel-${activeTab}`}
      aria-labelledby={`tab-${activeTab}`}
      className="focus-visible:outline-none"
    >
      {activeTab === "today" && <RoutineTab routine={plan.routine} locale={locale} />}
      {activeTab === "home" && <IndoorTab hacks={plan.indoorHacks} locale={locale} />}
      {activeTab === "swaps" && <SwapsTab swaps={plan.sustainableSwaps} locale={locale} />}
    </div>
  );
}

export function PlanTabs({ plan, locale = "en" }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("today");

  const tabs: TabItem[] = [
    { id: "today", label: t(locale, "tabToday") },
    { id: "home", label: t(locale, "tabHome") },
    { id: "swaps", label: t(locale, "tabSwaps") },
  ];

  return (
    <section aria-labelledby="plan-section-heading" className="space-y-4">
      <div className="space-y-1">
        <h2 id="plan-section-heading" className="font-display text-xl font-semibold text-ink">
          {plan.headline}
        </h2>
        <p className="text-sm text-muted">{plan.summary}</p>
      </div>

      <PlanTabList tabs={tabs} activeTab={activeTab} onSelect={setActiveTab} />
      <PlanTabPanel activeTab={activeTab} plan={plan} locale={locale} />
    </section>
  );
}
