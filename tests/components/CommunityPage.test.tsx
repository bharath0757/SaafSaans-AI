import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import CommunityPage from "@/app/community/page";

describe("CommunityPage", () => {
  it("renders community action pack title, city, and collective metrics", () => {
    render(<CommunityPage />);

    expect(
      screen.getByRole("heading", { name: /Community Action Pack — Delhi/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Collective Community Impact/i)).toBeInTheDocument();
    expect(screen.getByText(/PM2.5 Avoided/i)).toBeInTheDocument();
    expect(screen.getByText(/Cigarette Equiv/i)).toBeInTheDocument();
    expect(screen.getByText(/1. Common Clean Air Sanctuary/i)).toBeInTheDocument();
    expect(screen.getByText(/High-Risk Member Emergency Shield/i)).toBeInTheDocument();
  });

  it("updates collective impact numbers when household slider changes", () => {
    render(<CommunityPage />);

    const slider = screen.getByLabelText(/Households:/i);
    fireEvent.change(slider, { target: { value: "100" } });

    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("calls window.print when print button is clicked", () => {
    const printSpy = vi.spyOn(window, "print").mockImplementation(() => {});
    render(<CommunityPage />);

    const printBtn = screen.getByRole("button", { name: /Print action pack/i });
    fireEvent.click(printBtn);

    expect(printSpy).toHaveBeenCalled();
  });

  it("has no serious axe accessibility violations", async () => {
    const { container } = render(<CommunityPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
