import type { Metadata } from "next";
import { NewChatScreen } from "@/components/v2/chats/NewChatScreen";

export const metadata: Metadata = {
  title: "Chats",
};

type ChatsPageProps = {
  searchParams: Promise<{ prompt?: string | string[] }>;
};

export default async function MyChatsPage({ searchParams }: ChatsPageProps) {
  const { prompt } = await searchParams;
  const initialPrompt = typeof prompt === "string" ? prompt.slice(0, 2000) : undefined;
  // Keyed so picking a different quick prompt resets the composer.
  return <NewChatScreen key={initialPrompt ?? "new"} initialPrompt={initialPrompt} />;
}
