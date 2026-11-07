"use client";

import { createContext, useContext, type RefObject } from "react";
import type { DashboardResultsHandle } from "./DashboardOverview";

type LeadershipSearchValue = {
  query: string;
  /** Attached by the page that shows search results. Null on every other route. */
  resultsRef: RefObject<DashboardResultsHandle | null>;
};

/** Connects the search in the shared toolbar to the page rendered in the shell. */
export const LeadershipSearchContext = createContext<LeadershipSearchValue | null>(null);

export function useLeadershipSearch(): LeadershipSearchValue {
  const value = useContext(LeadershipSearchContext);
  if (!value) {
    throw new Error("useLeadershipSearch must be used inside PageStructure");
  }
  return value;
}
