// types/chat.ts
export interface Message {
  id: string;
  type: 'user' | 'assistant';
  text?: string;
  image?: string;
  timestamp?: Date;
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
  folderId?: number;
}

export interface Folder {
  id: number;
  name: string;
  chats: ChatHistory[];
}