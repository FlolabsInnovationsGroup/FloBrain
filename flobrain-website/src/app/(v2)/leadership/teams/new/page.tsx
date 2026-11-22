import type { Metadata } from "next";
import CreateTeamForm from "@/components/v2/teams/CreateTeamForm";

export const metadata: Metadata = {
  title: "Create Team",
};

/** Create Team content for the V2 shell. The shell owns the navigation, create links and h1. */
export default function CreateTeamPage() {
  return (
    <div className="fb-v2-create-panel fb-v2-create-team">
      <h2 className="fb-v2-form-title">Create Team</h2>
      <CreateTeamForm />
    </div>
  );
}
