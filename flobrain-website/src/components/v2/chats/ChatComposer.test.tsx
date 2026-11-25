import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ChatComposer } from "./ChatComposer";

describe("ChatComposer", () => {
  it("keeps send off until there is text, then sends it", () => {
    const onSend = vi.fn();
    render(<ChatComposer onSend={onSend} />);
    const send = screen.getByRole("button", { name: "Send" });
    expect(send).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Message FloBrain"), {
      target: { value: "  Hello  " },
    });
    fireEvent.click(send);
    expect(onSend).toHaveBeenCalledWith({ kind: "text", text: "Hello", model: "auto" });
    expect(screen.getByLabelText("Message FloBrain")).toHaveValue("");
  });

  it("sends on Enter but not on Shift+Enter", () => {
    const onSend = vi.fn();
    render(<ChatComposer onSend={onSend} />);
    const box = screen.getByLabelText("Message FloBrain");
    fireEvent.change(box, { target: { value: "Hi" } });
    fireEvent.keyDown(box, { key: "Enter", shiftKey: true });
    expect(onSend).not.toHaveBeenCalled();
    fireEvent.keyDown(box, { key: "Enter" });
    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it("hides the text box while recording and sends audio only", () => {
    const onSend = vi.fn();
    render(<ChatComposer onSend={onSend} />);
    fireEvent.click(screen.getByRole("button", { name: "Record a voice prompt" }));
    expect(screen.queryByLabelText("Message FloBrain")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(onSend).toHaveBeenCalledWith({ kind: "audio", model: "auto" });
  });

  it("asks for a prompt when a document is attached and the text is empty", () => {
    const onSend = vi.fn();
    const onMissingPrompt = vi.fn();
    render(<ChatComposer onSend={onSend} hasAttachment onMissingPrompt={onMissingPrompt} />);
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(onMissingPrompt).toHaveBeenCalled();
    expect(onSend).not.toHaveBeenCalled();
  });

  it("sends the chosen model", () => {
    const onSend = vi.fn();
    render(<ChatComposer onSend={onSend} initialValue="Plan my week" />);
    fireEvent.change(screen.getByLabelText("Model"), { target: { value: "claude" } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(onSend).toHaveBeenCalledWith({ kind: "text", text: "Plan my week", model: "claude" });
  });
});
