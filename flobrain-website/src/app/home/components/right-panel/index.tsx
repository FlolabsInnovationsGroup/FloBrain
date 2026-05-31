"use client";

import React, { memo } from "react";
import { RecentInteractions } from "./recent-interactions";
import type { InteractionEntry, RecentInteractionsAnalytics } from "./recent-interactions";

export interface RightPanelProps {
  /** Future: pass real data when API is available */
  interactions?: InteractionEntry[];
  /** Future: pass real analytics when API is available */
  analytics?: RecentInteractionsAnalytics;
}

const RightPanel = memo(function RightPanel({
  interactions,
  analytics,
}: RightPanelProps) {
  return (
    <aside
      className="flex min-h-0 w-[21rem] flex-col bg-slate-900/55"
      aria-label="Recent interactions"
    >
      <div className="flex flex-col min-h-0">
        <div className="flex-1 min-h-0 rounded-2xl bg-[#0B0F1A]/50 border border-[#767676]/50 p-5 shadow-inner">
          <RecentInteractions
            interactions={interactions}
            analytics={analytics}
          />
        </div>
      </div>
    </aside>
  );
});

export { RightPanel };
