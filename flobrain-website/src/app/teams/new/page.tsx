import type { Metadata } from "next";

import CreateTeamForm from "@/components/v2/CreateTeamForm";
import PageHeader from "@/components/v2/PageHeader";

export const metadata: Metadata = {
  title: "Create Team",
};

export default function CreateTeamPage() {
  return (
    <div className="fb-v2-preview">
      <main className="fb-v2-content">
        <div className="fb-v2-lead-panel">
          <PageHeader title="Create Team" />
          <p className="text-xs text-[var(--fb-v2-text-muted)]">
            Demo mode: uses mock members. Nothing is saved yet.
          </p>
          <CreateTeamForm />
        </div>
      </main>
    </div>
  );
}
