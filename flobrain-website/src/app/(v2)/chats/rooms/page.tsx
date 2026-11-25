import { redirect } from "next/navigation";
import { mockTeamRooms } from "@/components/v2/chats/mockChats";

/** Opens the first room until a room list exists in the design. */
export default function TeamRoomsPage() {
  redirect(`/chats/rooms/${mockTeamRooms[0].id}`);
}
