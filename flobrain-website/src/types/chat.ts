// src/types/chat.ts
export interface Message {
  id: string;
  type: 'user' | 'assistant';
  text?: string;
  image?: string;
  timestamp?: Date;
  prompt_tokens?: number;
  completion_tokens?: number;
}

export interface Chat {
  id: string;
  title: string;
  lastMessage?: string;
  timestamp: Date;
  messages: Message[];
}

export interface ChatHistory {
  id: number;
  title: string;
  timestamp: Date;
  folderId?: number | null;
  messages: Message[];
}

export interface Folder {
  id: number;
  name: string;
  chats: number[];
}