"use client";

import { usePathname } from "next/navigation";
import { PageStructure } from "@/components/v2/PageStructure";
import { ChatSidebar } from "@/components/v2/chats/ChatSidebar";
import type { ReactNode } from "react";
import { ProjectLeftPanel } from "./leadership/projects/components/ProjectLeftPanel";
import { ProjectRightPanel } from "./leadership/projects/components/ProjectRightPanel";

export default function V2Layout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const showSidebars =
    pathname.startsWith("/leadership/projects") ||
    pathname.startsWith("/calendar") ||
    pathname.startsWith("/docs");

  const showChatSidebar = pathname === "/chats" || pathname.startsWith("/chats/");

  return (
    <PageStructure
      leftPanel={
        showChatSidebar ? <ChatSidebar /> : showSidebars ? <ProjectLeftPanel /> : undefined
      }
      rightPanel={showSidebars ? <ProjectRightPanel /> : undefined}
    >
      {children}
    </PageStructure>
  );
}
