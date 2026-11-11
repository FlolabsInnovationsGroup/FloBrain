import type { Metadata } from "next";
import { ProjectTable } from "./components/ProjectTable";

export const metadata: Metadata = {
  title: "Projects",
};

export default function LeadershipProjectsPage() {
  return <ProjectTable />;
}
