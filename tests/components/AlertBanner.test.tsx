import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import { AlertBanner } from "@/components/dashboard/AlertBanner";
import { getAqiBand } from "@/domain/aqi";

describe("AlertBanner", () => {
  it("renders when AQI is 201+ (Poor)", () => {
    const band = getAqiBand(250);
    render(<AlertBanner aqi={250} band={band} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/Air Quality Alert/i)).toBeInTheDocument();
  });

  it("does not render when AQI <= 200 (Moderate)", () => {
    const band = getAqiBand(150);
    const { container } = render(<AlertBanner aqi={150} band={band} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("has no serious axe violations when active", async () => {
    const band = getAqiBand(350);
    const { container } = render(<AlertBanner aqi={350} band={band} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
