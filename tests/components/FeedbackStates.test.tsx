import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { LoadingSkeleton } from "@/components/feedback/LoadingSkeleton";
import { ErrorState } from "@/components/feedback/ErrorState";
import { StaleIndicator } from "@/components/feedback/StaleIndicator";

describe("Feedback States", () => {
  it("renders LoadingSkeleton with proper busy attributes", async () => {
    const { container } = render(<LoadingSkeleton />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("renders ErrorState with retry button", async () => {
    const user = userEvent.setup();
    const handleRetry = vi.fn();
    const { container } = render(<ErrorState message="Custom error" onRetry={handleRetry} />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Custom error")).toBeInTheDocument();

    const retryBtn = screen.getByRole("button", { name: /try again/i });
    await user.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledTimes(1);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("renders StaleIndicator only when isStale is true", () => {
    const { rerender, container } = render(<StaleIndicator isStale={false} />);
    expect(container).toBeEmptyDOMElement();

    rerender(<StaleIndicator isStale={true} timestamp="10:00 AM" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText(/recent data/i)).toBeInTheDocument();
  });
});
