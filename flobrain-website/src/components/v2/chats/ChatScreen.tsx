"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { ChatComposer, type ComposerSubmission } from "./ChatComposer";
import { ChatHeader } from "./ChatHeader";
import { ChatThread } from "./ChatThread";
import type { ChatMessage } from "./chatTypes";
import { useMockChat } from "./useMockChat";
import "./ChatViews.css";

export const VOICE_PROMPT_LABEL = "Voice prompt";

export function submissionText(submission: ComposerSubmission): string {
  return submission.kind === "audio" ? VOICE_PROMPT_LABEL : submission.text;
}

type ChatScreenProps = {
  title: string;
  subtitle: string;
  workspace?: string;
  composerPlaceholder?: string;
  initialMessages?: ChatMessage[];
  initialPrompt?: string;
  /** Shown while the thread is empty; receives `send` so cards can start the chat. */
  renderWelcome?: (send: (text: string) => void) => ReactNode;
};

/** Shared body for New chat, a saved chat and a team room: welcome or thread, then composer. */
export function ChatScreen({
  title,
  subtitle,
  workspace,
  composerPlaceholder,
  initialMessages = [],
  initialPrompt,
  renderWelcome,
}: ChatScreenProps) {
  const router = useRouter();
  const { messages, pending, send } = useMockChat(initialMessages);
  const sendText = (text: string) => send({ text });
  const started = messages.length > 0;

  return (
    <div className="fb-v2-chat">
      <ChatHeader
        title={title}
        subtitle={started && !initialMessages.length ? "Chat · Saved automatically" : subtitle}
        workspace={workspace}
      />
      <div className={started ? "fb-v2-chat-body" : "fb-v2-chat-body fb-v2-chat-body-center"}>
        {started ? (
          <ChatThread messages={messages} pending={pending} onFollowUp={sendText} />
        ) : (
          renderWelcome?.(sendText)
        )}
      </div>
      <ChatComposer
        placeholder={composerPlaceholder}
        initialValue={initialPrompt}
        disabled={pending}
        onSend={(submission) => sendText(submissionText(submission))}
        onAttach={() => router.push("/chats/document")}
      />
    </div>
  );
}
