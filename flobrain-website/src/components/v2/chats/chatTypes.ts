export type ChatAuthor = "user" | "assistant";

export type ChatPoint = {
  title: string;
  body: string;
};

/** Structured assistant reply, matching the "Chat response" Figma frame. */
export type AssistantContent = {
  heading?: string;
  paragraphs: string[];
  points?: ChatPoint[];
  followUp?: string;
};

export type ChatAttachment = {
  name: string;
  sizeLabel: string;
};

export type ChatMessage = {
  id: string;
  author: ChatAuthor;
  /** ISO 8601 timestamp. */
  sentAt: string;
  text?: string;
  content?: AssistantContent;
  attachment?: ChatAttachment;
};

export type ChatSummary = {
  id: string;
  title: string;
};

export type ChatConversation = ChatSummary & {
  messages: ChatMessage[];
};

export type ChatModelOption = {
  value: string;
  label: string;
};

export type PromptCategory = "writing" | "ideas" | "planning" | "summarize";

export type QuickPrompt = {
  id: string;
  category: PromptCategory;
  title: string;
  description: string;
  prompt: string;
};

export type RoomResource = {
  id: string;
  title: string;
  meta: string;
};

export type TeamRoom = {
  id: string;
  name: string;
  members: string[];
  suggestions: { id: string; title: string; prompt: string }[];
  resources: RoomResource[];
};

export type ChatUser = {
  name: string;
  firstName: string;
  plan: string;
};
