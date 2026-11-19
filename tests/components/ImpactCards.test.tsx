import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import { ImpactCards } from "@/components/dashboard/ImpactCards";
import type { DayImpactSummary } from "@/domain/impact";

const mockMetrics = {
  indoorPm25Before: 120,
  indoorPm25After: 45,
  personalDoseBeforeUg: 350,
  personalDoseAfterUg: 150,
  doseReductionPct: 57,
  doseSavedUg: 200,
  transportCo2eBeforeG: 500,
  transportCo2eAfterG: 200,
  transportCo2eSavedG: 300,
  cookingCo2eBeforeG: 400,
  cookingCo2eAfterG: 100,
  cookingCo2eSavedG: 300,
  totalCo2eSavedG: 600,
};

const mockImpact: DayImpactSummary = {
  low: { ...mockMetrics, doseReductionPct: 40, doseSavedUg: 140 },
  central: mockMetrics,
  high: { ...mockMetrics, doseReductionPct: 70, doseSavedUg: 245 },
  appliedActions: [],
  formulaSummary: "Steady-state mass-balance: C_in = (P*a*C_out + S/V)/(a + k + CADR/V)",
  primarySources: ["CPCB National AQI Guidelines", "US EPA Exposure Factors Handbook"],
};

describe("ImpactCards", () => {
  it("renders dual-bar chart and headline reduction percentage", () => {
    render(<ImpactCards impact={mockImpact} />);
    expect(screen.getByText(/57% reduction/i)).toBeInTheDocument();
    expect(screen.getByText(/Without changes/i)).toBeInTheDocument();
    expect(screen.getByText(/With your plan/i)).toBeInTheDocument();
  });

  it("toggles table alternative and expands details disclosure", async () => {
    const user = userEvent.setup();
    render(<ImpactCards impact={mockImpact} />);

    const toggleBtn = screen.getByRole("button", { name: /show as table/i });
    await user.click(toggleBtn);
    expect(screen.getByRole("table")).toBeInTheDocument();

    const summary = screen.getByText(/how we calculate this/i);
    await user.click(summary);
    expect(screen.getByText(/CPCB National AQI Guidelines/i)).toBeInTheDocument();
  });

  it("has no serious axe violations", async () => {
    const { container } = render(<ImpactCards impact={mockImpact} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
