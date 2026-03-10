import type { BrainChatApi, BrainChatDetailApi, BrainMessageApi } from "@/lib/api";
import type { ChatHistory, Message } from "@/types/chat";

function parseTimestamp(ts: string | null | undefined): Date {
  if (!ts) return new Date();
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

function apiMessageToMessage(m: BrainMessageApi): Message {
  return {
    id: m.id,
    type: m.type === "user" ? "user" : "assistant",
    text: m.text ?? undefined,
    image: m.image ?? undefined,
    timestamp: parseTimestamp(m.timestamp),
  };
}

export function apiChatToChatHistory(chat: BrainChatApi | BrainChatDetailApi): ChatHistory {
  return {
    id: chat.id,
    title: chat.title,
    timestamp: parseTimestamp(chat.timestamp),
    messages: (chat.messages ?? []).map(apiMessageToMessage),
  };
}

export function apiChatListToChatHistory(list: BrainChatApi[]): ChatHistory[] {
  return list.map(apiChatToChatHistory);
}
