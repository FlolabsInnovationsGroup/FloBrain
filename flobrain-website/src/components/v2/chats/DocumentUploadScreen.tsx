"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { Check, FileText, Info, X } from "lucide-react";
import { ChatComposer } from "./ChatComposer";
import { ChatHeader } from "./ChatHeader";
import { ChatThread } from "./ChatThread";
import { submissionText } from "./ChatScreen";
import type { ChatAttachment } from "./chatTypes";
import { useMockChat } from "./useMockChat";
import "./ChatViews.css";

export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = [".pdf", ".docx", ".txt"];

export const MISSING_PROMPT_MESSAGE =
  "Add a question before sending. A document can't be sent without a prompt.";

export function validateDocument(file: Pick<File, "name" | "size">): string | null {
  const name = file.name.toLowerCase();
  if (!ACCEPTED_EXTENSIONS.some((extension) => name.endsWith(extension))) {
    return "Only PDF, DOCX, or TXT files can be added.";
  }
  if (file.size > MAX_DOCUMENT_BYTES) {
    return "This file is larger than 10 MB.";
  }
  return null;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentUploadScreen() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [attachment, setAttachment] = useState<ChatAttachment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const { messages, pending, send } = useMockChat();
  const started = messages.length > 0;

  function pick(file: File | undefined) {
    if (!file) return;
    const problem = validateDocument(file);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setAttachment({ name: file.name, sizeLabel: formatFileSize(file.size) });
  }

  function handleInput(event: ChangeEvent<HTMLInputElement>) {
    pick(event.target.files?.[0]);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    pick(event.dataTransfer.files?.[0]);
  }

  return (
    <div className="fb-v2-chat">
      <ChatHeader title="Chat with a document" subtitle="Upload, ask, understand" />
      <div className={started ? "fb-v2-chat-body" : "fb-v2-chat-body fb-v2-chat-body-center"}>
        {started ? (
          <ChatThread messages={messages} pending={pending} onFollowUp={(text) => send({ text })} />
        ) : (
          <>
            <h2 className="fb-v2-chat-hero">Less reading. More understanding.</h2>
            <p className="fb-v2-chat-lede">
              Add a document, then ask FloBrain to explain or summarize it.
            </p>
            <div
              className="fb-v2-chat-dropzone"
              data-dragging={dragging}
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <FileText size={22} aria-hidden="true" />
              <p className="fb-v2-chat-dropzone-title">Drop a document here</p>
              <p className="fb-v2-chat-card-text">PDF, DOCX, or TXT · Up to 10 MB</p>
              <button
                type="button"
                className="fb-v2-chat-btn"
                onClick={() => inputRef.current?.click()}
              >
                Browse files
              </button>
            </div>
          </>
        )}
        {error ? (
          <p className="fb-v2-chat-error" role="alert">
            {error}
          </p>
        ) : null}
        {attachment ? (
          <section className="fb-v2-chat-section" aria-labelledby="fb-v2-attached-label">
            <p id="fb-v2-attached-label" className="fb-v2-chat-kicker">
              Attached document
            </p>
            <div className="fb-v2-chat-file">
              <FileText size={18} aria-hidden="true" />
              <span className="fb-v2-chat-card-col">
                <span className="fb-v2-chat-file-name">{attachment.name}</span>
                <span className="fb-v2-chat-card-text">{attachment.sizeLabel} · Ready to use</span>
              </span>
              <Check size={16} aria-label="Ready" />
              <button
                type="button"
                className="fb-v2-chat-tool"
                aria-label={`Remove ${attachment.name}`}
                onClick={() => setAttachment(null)}
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
            <p className="fb-v2-chat-notice fb-v2-chat-notice-tight">
              <Info size={14} aria-hidden="true" />
              Add a question below to continue. Try &quot;Summarize the key points.&quot;
            </p>
          </section>
        ) : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS.join(",")}
        className="sr-only"
        aria-label="Choose a document"
        onChange={handleInput}
      />
      <ChatComposer
        placeholder="Ask a question about your document..."
        label="Ask about your document"
        disabled={pending}
        hasAttachment={attachment !== null}
        onAttach={() => inputRef.current?.click()}
        onMissingPrompt={() => setError(MISSING_PROMPT_MESSAGE)}
        onSend={(submission) => {
          setError(null);
          send({ text: submissionText(submission), attachment: attachment ?? undefined });
          setAttachment(null);
        }}
      />
    </div>
  );
}
