"use client";

import { createContext, useContext } from "react";

export type LeadershipSearchState = {
  query: string;
  setQuery: (query: string) => void;
};

/** Shares the toolbar's "Search by name" value with the page that filters on it. */
export const LeadershipSearchContext = createContext<LeadershipSearchState | null>(null);

/** Search state from the V2 shell; the query is empty outside it. */
export function useLeadershipSearch(): LeadershipSearchState {
  return useContext(LeadershipSearchContext) ?? { query: "", setQuery: () => {} };
}
