import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DocumentUploadScreen,
  MAX_DOCUMENT_BYTES,
  MISSING_PROMPT_MESSAGE,
  validateDocument,
} from "./DocumentUploadScreen";
import { MOCK_REPLY_DELAY_MS } from "./useMockChat";

function upload(file: File) {
  fireEvent.change(screen.getByLabelText("Choose a document"), { target: { files: [file] } });
}

afterEach(() => {
  vi.useRealTimers();
});

describe("validateDocument", () => {
  it("accepts PDF, DOCX and TXT up to 10 MB", () => {
    expect(validateDocument({ name: "brief.PDF", size: 1000 })).toBeNull();
    expect(validateDocument({ name: "notes.txt", size: MAX_DOCUMENT_BYTES })).toBeNull();
  });

  it("rejects other types and large files", () => {
    expect(validateDocument({ name: "photo.png", size: 10 })).toMatch(/PDF, DOCX, or TXT/);
    expect(validateDocument({ name: "big.pdf", size: MAX_DOCUMENT_BYTES + 1 })).toMatch(/10 MB/);
  });
});

describe("DocumentUploadScreen", () => {
  it("shows the attached document and blocks sending it without a prompt", () => {
    render(<DocumentUploadScreen />);
    upload(new File(["x".repeat(2048)], "Design_Brief.pdf", { type: "application/pdf" }));

    expect(screen.getByText("Design_Brief.pdf")).toBeInTheDocument();
    expect(screen.getByText("2 KB · Ready to use")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(screen.getByRole("alert")).toHaveTextContent(MISSING_PROMPT_MESSAGE);
  });

  it("sends the document with a prompt, shows loading, then the reply", () => {
    vi.useFakeTimers();
    render(<DocumentUploadScreen />);
    upload(new File(["hello"], "Design_Brief.pdf", { type: "application/pdf" }));
    fireEvent.change(screen.getByLabelText("Ask about your document"), {
      target: { value: "Summarize the key points." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    expect(screen.getByText("Summarize the key points.")).toBeInTheDocument();
    expect(screen.getByText("FloBrain is thinking…")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(MOCK_REPLY_DELAY_MS);
    });
    expect(screen.queryByText("FloBrain is thinking…")).not.toBeInTheDocument();
    expect(screen.getByText(/FloBrain received "Design_Brief.pdf"/)).toBeInTheDocument();
  });

  it("can remove the attached document", () => {
    render(<DocumentUploadScreen />);
    upload(new File(["hello"], "notes.txt", { type: "text/plain" }));
    fireEvent.click(screen.getByRole("button", { name: "Remove notes.txt" }));
    expect(screen.queryByText("notes.txt")).not.toBeInTheDocument();
  });

  it("shows an error for an unsupported file", () => {
    render(<DocumentUploadScreen />);
    upload(new File(["x"], "image.png", { type: "image/png" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Only PDF, DOCX, or TXT");
  });
});
