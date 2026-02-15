"use client";

import { NoDataState } from "@/components/states";

export default function BrainPlaceholder() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0033] via-[#2a1a4a] to-[#0f0f23] flex items-center justify-center">
      <NoDataState
        title="Brain Interface Coming Soon"
        description="The AI brain chat interface is currently under development. Check back soon for intelligent conversations and context-aware interactions."
        action={{
          label: "View Dashboard",
          onClick: () => window.location.href = "/dashboard"
        }}
      />
    </div>
  );
}