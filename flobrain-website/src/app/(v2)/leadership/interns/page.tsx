import type { Metadata } from "next";
import { InternsOverview } from "./components/InternsOverview";

export const metadata: Metadata = {
  title: "Interns",
};

export default function LeadershipInternsPage() {
  return <InternsOverview />;
}
