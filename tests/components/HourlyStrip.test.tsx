import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import { HourlyStrip } from "@/components/dashboard/HourlyStrip";
import type { HourlyAqiPoint } from "@/services/air-quality";

const mockHourly: HourlyAqiPoint[] = Array.from({ length: 24 }, (_, i) => ({
  hour: i,
  time: `2026-11-19T${String(i).padStart(2, "0")}:00:00Z`,
  aqi: 100 + i * 5,
  bandKey: "moderate",
  pm25: 45 + i,
  pm10: 90 + i,
}));

const mockBestWindow = {
  startHour: 13,
  endHour: 16,
  label: "1:00 PM – 4:00 PM",
  avgAqi: 110,
};

describe("HourlyStrip", () => {
  it("renders 24 hour points and highlights cleanest window", () => {
    render(<HourlyStrip hourly={mockHourly} bestWindow={mockBestWindow} />);
    expect(screen.getByText(/24-Hour hourly forecast/i)).toBeInTheDocument();
    expect(screen.getByText(/1:00 PM – 4:00 PM/i)).toBeInTheDocument();
    expect(screen.getAllByText("Best").length).toBeGreaterThan(0);
  });

  it("toggles table view when toggle button is clicked", async () => {
    const user = userEvent.setup();
    render(<HourlyStrip hourly={mockHourly} bestWindow={mockBestWindow} />);

    const toggleBtn = screen.getByRole("button", { name: /show as table/i });
    await user.click(toggleBtn);

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /show visual cards/i })).toBeInTheDocument();
  });

  it("has no serious axe violations in visual mode", async () => {
    const { container } = render(<HourlyStrip hourly={mockHourly} bestWindow={mockBestWindow} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  }, 15000);

  it("has no serious axe violations in table mode", async () => {
    const user = userEvent.setup();
    const { container } = render(<HourlyStrip hourly={mockHourly} bestWindow={mockBestWindow} />);
    const toggleBtn = screen.getByRole("button", { name: /show as table/i });
    await user.click(toggleBtn);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  }, 15000);
});
