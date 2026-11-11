import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getMockTeam, getMockTeams } from "../mockData";
import { TeamDetails } from "../team-details";

type TeamDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return getMockTeams().map((team) => ({ id: team.id }));
}

export async function generateMetadata({
  params,
}: TeamDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  const team = getMockTeam(id);
  return {
    title: team ? team.name : "Team",
  };
}

export default async function TeamDetailsPage({ params }: TeamDetailsPageProps) {
  const { id } = await params;
  const team = getMockTeam(id);
  if (!team) notFound();
  return <TeamDetails team={team} />;
}
