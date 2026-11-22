import type { Metadata } from "next";
import { TeamDetailClient } from "./TeamDetailClient";

type TeamDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: TeamDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Team ${id}` };
}

export default async function TeamDetailsPage({ params }: TeamDetailsPageProps) {
  const { id } = await params;
  return <TeamDetailClient id={id} />;
}
