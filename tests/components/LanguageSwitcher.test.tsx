import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LanguageSwitcher } from "@/components/navigation/LanguageSwitcher";

describe("LanguageSwitcher", () => {
  it("renders all languages with proper aria-pressed attributes", () => {
    render(<LanguageSwitcher currentLocale="en" onLocaleChange={vi.fn()} />);
    const enBtn = screen.getByRole("button", { name: "English" });
    const hiBtn = screen.getByRole("button", { name: "हिन्दी" });
    const teBtn = screen.getByRole("button", { name: "తెలుగు" });

    expect(enBtn).toHaveAttribute("aria-pressed", "true");
    expect(hiBtn).toHaveAttribute("aria-pressed", "false");
    expect(teBtn).toHaveAttribute("aria-pressed", "false");
  });

  it("calls onLocaleChange when a language button is clicked", async () => {
    const user = userEvent.setup();
    const handleLocaleChange = vi.fn();
    render(<LanguageSwitcher currentLocale="en" onLocaleChange={handleLocaleChange} />);

    const hiBtn = screen.getByRole("button", { name: "हिन्दी" });
    await user.click(hiBtn);

    expect(handleLocaleChange).toHaveBeenCalledWith("hi");
  });
});
