"use client";

import { useId, useState, type FormEvent, type KeyboardEvent } from "react";
import { ArrowUp, Mic, Paperclip, Square } from "lucide-react";
import { mockModelOptions } from "./mockChats";

export type ComposerSubmission =
  | { kind: "text"; text: string; model: string }
  | { kind: "audio"; model: string };

type ChatComposerProps = {
  placeholder?: string;
  label?: string;
  /** Pre-fills the text box, for example from a quick prompt. */
  initialValue?: string;
  disabled?: boolean;
  /** When a document is attached the send button stays on, so an empty send can warn. */
  hasAttachment?: boolean;
  onSend: (submission: ComposerSubmission) => void;
  onAttach?: () => void;
  /** Called when the user tries to send an attached document without a prompt. */
  onMissingPrompt?: () => void;
};

export function ChatComposer({
  placeholder = "Ask FloBrain anything...",
  label = "Message FloBrain",
  initialValue = "",
  disabled = false,
  hasAttachment = false,
  onSend,
  onAttach,
  onMissingPrompt,
}: ChatComposerProps) {
  const [text, setText] = useState(initialValue);
  const [model, setModel] = useState(mockModelOptions[0].value);
  const [recording, setRecording] = useState(false);
  const inputId = useId();
  const modelId = useId();

  const trimmed = text.trim();
  const canSend = !disabled && (recording || trimmed.length > 0 || hasAttachment);

  function submit() {
    if (!canSend) return;
    if (recording) {
      // Feature 3: a prompt is audio OR text, never both.
      onSend({ kind: "audio", model });
      setRecording(false);
      return;
    }
    if (!trimmed) {
      onMissingPrompt?.();
      return;
    }
    onSend({ kind: "text", text: trimmed, model });
    setText("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <div className="fb-v2-chat-footer">
      <form className="fb-v2-chat-composer" onSubmit={handleSubmit}>
        {recording ? (
          <p className="fb-v2-chat-recording" role="status">
            <span className="fb-v2-chat-recording-dot" aria-hidden="true" />
            Recording your question. Send it, or stop to type instead.
          </p>
        ) : (
          <>
            <label htmlFor={inputId} className="sr-only">
              {label}
            </label>
            <textarea
              id={inputId}
              rows={1}
              placeholder={placeholder}
              value={text}
              disabled={disabled}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={handleKeyDown}
            />
          </>
        )}
        <div className="fb-v2-chat-composer-row">
          <button
            type="button"
            className="fb-v2-chat-tool"
            onClick={onAttach}
            disabled={recording || disabled}
          >
            <Paperclip size={14} aria-hidden="true" />
            Attach
          </button>
          <button
            type="button"
            className="fb-v2-chat-tool"
            aria-pressed={recording}
            aria-label={recording ? "Stop recording" : "Record a voice prompt"}
            onClick={() => setRecording((value) => !value)}
            disabled={disabled}
          >
            {recording ? (
              <Square size={14} aria-hidden="true" />
            ) : (
              <Mic size={14} aria-hidden="true" />
            )}
          </button>
          <label htmlFor={modelId} className="sr-only">
            Model
          </label>
          <select
            id={modelId}
            className="fb-v2-chat-model"
            value={model}
            onChange={(event) => setModel(event.target.value)}
          >
            {mockModelOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button type="submit" className="fb-v2-chat-send" aria-label="Send" disabled={!canSend}>
            <ArrowUp size={14} aria-hidden="true" />
          </button>
        </div>
      </form>
      <p className="fb-v2-chat-disclaimer">AI can make mistakes. Check important information.</p>
    </div>
  );
}
