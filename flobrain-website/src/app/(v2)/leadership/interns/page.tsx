import type { Metadata } from "next";
import { InternsHome } from "./interns-home";

export const metadata: Metadata = {
  title: "Interns",
  description: "View FloBrain interns, their teams, projects, hours and specializations.",
};

export default function LeadershipInternsPage() {
  return <InternsHome />;
}
