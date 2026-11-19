import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import { PlanTabs } from "@/components/dashboard/PlanTabs";
import type { PlanOutput } from "@/services/llm/types";

const mockPlan: PlanOutput = {
  headline: "Protect vulnerable family members",
  summary: "Smog will peak morning and evening.",
  providerUsed: "rule-based",
  routine: [
    {
      timeWindow: "Morning (7:00 – 10:00 AM)",
      activity: "Morning routine",
      action: "Keep windows closed",
      location: "indoor",
      maskRecommended: false,
    },
    {
      timeWindow: "Transit (10:00 – 11:00 AM)",
      activity: "Commute",
      action: "Wear N95",
      location: "transit",
      maskRecommended: true,
    },
  ],
  indoorHacks: [
    {
      title: "Seal door bottoms",
      description: "Use rolled towels to block outdoor air gaps.",
      costBand: "free",
    },
    {
      title: "DIY Fan Filter",
      description: "Attach HEPA filter to a table fan.",
      costBand: "medium",
    },
  ],
  sustainableSwaps: [
    {
      title: "Switch to Delhi Metro",
      description: "Cuts personal particulate exposure in transit.",
      estimatedCo2eSaved: "350g CO2e/day",
    },
  ],
};

describe("PlanTabs", () => {
  it("renders 3 tabs and switches active tab on click", async () => {
    const user = userEvent.setup();
    render(<PlanTabs plan={mockPlan} />);

    expect(screen.getByRole("tab", { name: "Today" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Keep windows closed")).toBeInTheDocument();

    const homeTab = screen.getByRole("tab", { name: "At Home" });
    await user.click(homeTab);

    expect(homeTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Seal door bottoms")).toBeInTheDocument();

    const swapsTab = screen.getByRole("tab", { name: "Switch It Up" });
    await user.click(swapsTab);

    expect(swapsTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Switch to Delhi Metro")).toBeInTheDocument();
  });

  it("has no serious axe violations", async () => {
    const { container } = render(<PlanTabs plan={mockPlan} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
