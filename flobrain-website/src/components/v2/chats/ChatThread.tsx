"use client";

import { useState } from "react";
import { ArrowRight, Check, Copy, FileText, ThumbsUp } from "lucide-react";
import type { AssistantContent, ChatMessage } from "./chatTypes";
import { formatMessageTime } from "./chatTime";

type ChatThreadProps = {
  messages: ChatMessage[];
  pending?: boolean;
  onFollowUp?: (prompt: string) => void;
};

function contentAsText(content: AssistantContent): string {
  const lines = [content.heading, ...content.paragraphs];
  content.points?.forEach((point, index) => {
    lines.push(`${index + 1}. ${point.title}: ${point.body}`);
  });
  return lines.filter(Boolean).join("\n");
}

function AssistantMessage({
  message,
  onFollowUp,
}: {
  message: ChatMessage;
  onFollowUp?: (prompt: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [helpful, setHelpful] = useState(false);
  const content = message.content;
  if (!content) return null;

  async function copy() {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(contentAsText(content));
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <li className="fb-v2-chat-answer">
      <p className="fb-v2-chat-author">
        FloBrain <span className="fb-v2-chat-time">· {formatMessageTime(message.sentAt)}</span>
      </p>
      {content.heading ? <h3 className="fb-v2-chat-answer-heading">{content.heading}</h3> : null}
      {content.paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      {content.points?.length ? (
        <ol className="fb-v2-chat-points">
          {content.points.map((point, index) => (
            <li key={point.title} className="fb-v2-chat-point">
              <span className="fb-v2-chat-point-num">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <p className="fb-v2-chat-point-title">{point.title}</p>
                <p className="fb-v2-chat-point-body">{point.body}</p>
              </div>
            </li>
          ))}
        </ol>
      ) : null}
      <div className="fb-v2-chat-actions">
        <button type="button" className="fb-v2-chat-tool" onClick={copy}>
          {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
          {copied ? "Copied" : "Copy"}
        </button>
        <button
          type="button"
          className="fb-v2-chat-tool"
          aria-pressed={helpful}
          onClick={() => setHelpful((value) => !value)}
        >
          <ThumbsUp size={14} aria-hidden="true" />
          Helpful
        </button>
        {content.followUp && onFollowUp ? (
          <button
            type="button"
            className="fb-v2-chat-followup"
            onClick={() => onFollowUp(content.followUp ?? "")}
          >
            {content.followUp}
            <ArrowRight size={12} aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </li>
  );
}

export function ChatThread({ messages, pending = false, onFollowUp }: ChatThreadProps) {
  return (
    <ol className="fb-v2-chat-thread" aria-live="polite">
      {messages.map((message) =>
        message.author === "user" ? (
          <li key={message.id} className="fb-v2-chat-msg-user">
            <p className="fb-v2-chat-author">
              You <span className="fb-v2-chat-time">· {formatMessageTime(message.sentAt)}</span>
            </p>
            <div className="fb-v2-chat-bubble">
              {message.attachment ? (
                <span className="fb-v2-chat-attachment">
                  <FileText size={12} aria-hidden="true" />
                  {message.attachment.name}
                </span>
              ) : null}
              <div>{message.text}</div>
            </div>
          </li>
        ) : (
          <AssistantMessage key={message.id} message={message} onFollowUp={onFollowUp} />
        )
      )}
      {pending ? (
        <li className="fb-v2-chat-loading" role="status">
          <span className="fb-v2-chat-loading-dot animate-pulse" aria-hidden="true" />
          FloBrain is thinking…
        </li>
      ) : null}
    </ol>
  );
}
