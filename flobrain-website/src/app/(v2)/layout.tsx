
"use client";

import { usePathname } from "next/navigation";
import { PageStructure } from "@/components/v2/PageStructure";
import type { ReactNode } from "react";
import { ProjectLeftPanel } from "./leadership/projects/components/ProjectLeftPanel";
import { ProjectRightPanel } from "./leadership/projects/components/ProjectRightPanel";

export default function V2Layout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const showSidebars =
    pathname.startsWith("/leadership/projects") ||
    pathname.startsWith("/calendar") ||
    pathname.startsWith("/docs");

  return (
    <PageStructure
      leftPanel={showSidebars ? <ProjectLeftPanel /> : undefined}
      rightPanel={showSidebars ? <ProjectRightPanel /> : undefined}
    >
      {children}
    </PageStructure>
  );
}
