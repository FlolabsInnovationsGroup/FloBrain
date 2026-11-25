import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChatScreen } from "@/components/v2/chats/ChatScreen";
import { getMockConversation } from "@/components/v2/chats/mockChats";

type ChatPageProps = {
  params: Promise<{ chatId: string }>;
};

export async function generateMetadata({ params }: ChatPageProps): Promise<Metadata> {
  const { chatId } = await params;
  return { title: getMockConversation(chatId)?.title ?? "Chat" };
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { chatId } = await params;
  const conversation = getMockConversation(chatId);
  if (!conversation) notFound();

  return (
    <ChatScreen
      key={conversation.id}
      title={conversation.title}
      subtitle="Chat · Saved automatically"
      initialMessages={conversation.messages}
    />
  );
}
