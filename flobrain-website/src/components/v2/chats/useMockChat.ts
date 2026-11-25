"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatAttachment, ChatMessage } from "./chatTypes";
import { mockAssistantReply } from "./mockChats";

/** How long the mock "thinking" state lasts before the placeholder reply appears. */
export const MOCK_REPLY_DELAY_MS = 900;

type SendInput = {
  text: string;
  attachment?: ChatAttachment;
};

/**
 * Local message state for the chat pages until the chat API exists.
 * Replace with a TanStack Query mutation through src/lib/api.ts when it does.
 */
export function useMockChat(initialMessages: ChatMessage[] = []) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [pending, setPending] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const counter = useRef(0);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  const send = useCallback(({ text, attachment }: SendInput) => {
    counter.current += 1;
    const id = `local-${counter.current}`;
    setMessages((current) => [
      ...current,
      { id: `${id}-user`, author: "user", sentAt: new Date().toISOString(), text, attachment },
    ]);
    setPending(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          id: `${id}-assistant`,
          author: "assistant",
          sentAt: new Date().toISOString(),
          content: mockAssistantReply(text, attachment?.name),
        },
      ]);
      setPending(false);
    }, MOCK_REPLY_DELAY_MS);
  }, []);

  return { messages, pending, send };
}
