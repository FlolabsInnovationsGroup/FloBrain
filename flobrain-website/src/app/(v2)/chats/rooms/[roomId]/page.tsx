import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TeamRoomScreen } from "@/components/v2/chats/TeamRoomScreen";
import { getMockTeamRoom } from "@/components/v2/chats/mockChats";

type TeamRoomPageProps = {
  params: Promise<{ roomId: string }>;
};

export async function generateMetadata({ params }: TeamRoomPageProps): Promise<Metadata> {
  const { roomId } = await params;
  return { title: getMockTeamRoom(roomId)?.name ?? "Team room" };
}

export default async function TeamRoomPage({ params }: TeamRoomPageProps) {
  const { roomId } = await params;
  const room = getMockTeamRoom(roomId);
  if (!room) notFound();

  return <TeamRoomScreen key={room.id} room={room} />;
}
