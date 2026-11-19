import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

describe("OnboardingWizard", () => {
  it("navigates through 3 steps and saves profile on finish", async () => {
    const user = userEvent.setup();
    const handleComplete = vi.fn();

    render(<OnboardingWizard locale="en" onComplete={handleComplete} />);

    expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
    expect(screen.getByLabelText(/search a city/i)).toBeInTheDocument();

    const nextBtn = screen.getByRole("button", { name: "Next" });
    await user.click(nextBtn);

    expect(screen.getByText("Step 2 of 3")).toBeInTheDocument();
    expect(screen.getByLabelText(/children in home/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByText("Step 3 of 3")).toBeInTheDocument();
    expect(screen.getByLabelText(/primary commute mode/i)).toBeInTheDocument();

    const saveBtn = screen.getByRole("button", { name: /save and view plan/i });
    await user.click(saveBtn);

    expect(handleComplete).toHaveBeenCalledTimes(1);
  });

  it("completes immediately when skip button is clicked", async () => {
    const user = userEvent.setup();
    const handleComplete = vi.fn();

    render(<OnboardingWizard locale="en" onComplete={handleComplete} />);

    const skipBtn = screen.getByRole("button", { name: /use defaults/i });
    await user.click(skipBtn);

    expect(handleComplete).toHaveBeenCalledTimes(1);
    expect(handleComplete).toHaveBeenCalledWith(
      expect.objectContaining({ commuteMode: "twoWheeler" }),
      expect.objectContaining({ name: "Delhi" }),
    );
  });

  it("has no serious axe violations", async () => {
    const { container } = render(<OnboardingWizard locale="en" onComplete={vi.fn()} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
