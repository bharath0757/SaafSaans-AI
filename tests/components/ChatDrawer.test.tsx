import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { ChatDrawer } from "@/components/chat/ChatDrawer";

describe("ChatDrawer Component", () => {
  it("renders when open and closes on close button click", async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    const { rerender } = render(<ChatDrawer isOpen={false} onClose={handleClose} locale="en" />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    rerender(<ChatDrawer isOpen={true} onClose={handleClose} locale="en" />);
    expect(screen.getByRole("dialog", { name: /Air Quality Assistant/i })).toBeInTheDocument();

    const closeBtn = screen.getByRole("button", { name: /Close assistant/i });
    await user.click(closeBtn);
    expect(handleClose).toHaveBeenCalled();
  });

  it("sends message and renders streamed response", async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("Here is advice on N95 respirators."));
        controller.close();
      },
    });

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      body: mockStream,
    } as unknown as Response);

    render(<ChatDrawer isOpen={true} onClose={handleClose} locale="en" />);

    const input = screen.getByPlaceholderText(/Ask about masks/i);
    await user.type(input, "Which mask should I wear?");
    const sendBtn = screen.getByRole("button", { name: /Send/i });
    await user.click(sendBtn);

    await waitFor(() => {
      expect(screen.getByText(/Here is advice on N95 respirators/i)).toBeInTheDocument();
    });
  });

  it("has no serious axe accessibility violations", async () => {
    const { container } = render(<ChatDrawer isOpen={true} onClose={() => {}} locale="en" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
