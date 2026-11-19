import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import { HomeHero } from "@/components/HomeHero";
import { AppShell } from "@/components/AppShell";

describe("HomeHero + AppShell accessibility", () => {
  it("exposes a single h1 and skip link", () => {
    render(
      <AppShell>
        <HomeHero demoAqi={312} />
      </AppShell>,
    );
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /skip to content/i })).toHaveAttribute("href", "#main");
    expect(screen.getAllByText(/very poor/i).length).toBeGreaterThan(0);
  });

  it("has no serious axe violations", async () => {
    const { container } = render(
      <AppShell>
        <HomeHero demoAqi={85} />
      </AppShell>,
    );
    // Scope axe to the rendered tree only (not the whole jsdom document).
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
