import type { Metadata } from "next";
import { TeamsOverview } from "./teams-overview";

export const metadata: Metadata = {
  title: "Teams",
  description: "View FloBrain teams, leads, progress, and completed work.",
};

export default function LeadershipTeamsPage() {
  return <TeamsOverview />;
}
