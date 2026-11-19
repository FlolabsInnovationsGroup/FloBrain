import type { Metadata } from "next";
import { ProjectsOverview } from "./projects-overview";

export const metadata: Metadata = {
  title: "Projects",
  description: "View projects, team leads, progress, and target dates.",
};

export default function LeadershipProjectsPage() {
  return <ProjectsOverview />;
}
