"use client";

import { usePathname } from "next/navigation";
import { PageStructure } from "@/components/v2/PageStructure";
import type { ReactNode } from "react";
import { ProjectLeftPanel } from "./leadership/projects/components/ProjectLeftPanel";
import { ProjectRightPanel } from "./leadership/projects/components/ProjectRightPanel";

export default function V2Layout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isProjectsPage = pathname === "/leadership/projects";

  return (
    <PageStructure
      leftPanel={isProjectsPage ? <ProjectLeftPanel /> : undefined}
      rightPanel={isProjectsPage ? <ProjectRightPanel /> : undefined}
    >
      {children}
    </PageStructure>
  );
}
