import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { VerdictHero } from "@/components/dashboard/VerdictHero";
import { getAqiBand } from "@/domain/aqi";

describe("VerdictHero", () => {
  it("renders h1 headline, location, and aqi ladder", () => {
    const band = getAqiBand(320);
    render(
      <VerdictHero
        aqi={320}
        band={band}
        actionSentence="Stay indoors"
        locationName="Delhi"
        timestamp="Updated 10:00 AM"
      />,
    );

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Stay indoors");
    expect(screen.getByText("Delhi")).toBeInTheDocument();
    expect(screen.getByText(/Updated 10:00 AM/i)).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /scale from 0 to 500/i })).toBeInTheDocument();
  });

  it("handles change location and update routine callbacks", async () => {
    const user = userEvent.setup();
    const band = getAqiBand(120);
    const onChangeLoc = vi.fn();
    const onUpdateRoutine = vi.fn();

    render(
      <VerdictHero
        aqi={120}
        band={band}
        locationName="Mumbai"
        onChangeLocation={onChangeLoc}
        onUpdateRoutine={onUpdateRoutine}
      />,
    );

    await user.click(screen.getByRole("button", { name: /change location/i }));
    expect(onChangeLoc).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: /update routine/i }));
    expect(onUpdateRoutine).toHaveBeenCalledTimes(1);
  });

  it("has no serious axe violations", async () => {
    const band = getAqiBand(80);
    const { container } = render(<VerdictHero aqi={80} band={band} locationName="Bengaluru" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
