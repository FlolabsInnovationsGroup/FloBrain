"use client";

import { useMemo, useState } from "react";
import { Users } from "lucide-react";
import { EmptyState } from "@/components/states";
import { InternCard } from "./InternCard";
import { mockInterns } from "./mockData";

export function InternsHome() {
  const [activeTeam, setActiveTeam] = useState("All");

  const teams = useMemo(
    () => ["All", ...Array.from(new Set(mockInterns.map((intern) => intern.team))).filter(Boolean)],
    []
  );

  const filteredInterns = useMemo(
    () =>
      activeTeam === "All"
        ? mockInterns
        : mockInterns.filter((intern) => intern.team === activeTeam),
    [activeTeam]
  );

  if (mockInterns.length === 0) {
    return (
      <main className="h-full w-full px-6 py-6 md:py-8 lg:px-[72px]">
        <div className="mx-auto w-full max-w-[1200px]">
          <EmptyState
            icon={Users}
            title="No interns yet"
            description="Interns will appear here once they join a team."
          />
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-full w-full flex-col">
      <div
        role="tablist"
        aria-label="Filter by team"
        className="mx-auto flex w-full max-w-[1200px] items-end overflow-x-auto border-b border-[var(--fb-v2-border)] px-6 pb-0 pt-6 md:pt-8 lg:px-[72px]"
      >
        {teams.map((team) => {
          const isActive = activeTeam === team;

          return (
            <button
              key={team}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTeam(team)}
              className={`mb-[-1px] flex w-fit min-w-[89px] shrink-0 items-center justify-center whitespace-nowrap rounded-t-[10px] border-b-0 px-2 text-center font-['Inter'] text-[14px] leading-[17px] transition-all duration-200 ${
                isActive
                  ? "h-[44px] bg-[#D9D9D9] px-3 font-semibold text-[#323131] dark:bg-[#D9D9D9] dark:text-[#323131]"
                  : "h-[30px] odd:bg-slate-200 even:bg-slate-100 font-normal text-slate-700 hover:bg-slate-300 dark:odd:bg-[#7E7E7E] dark:even:bg-[#929292] dark:text-[#D9D9D9] dark:hover:bg-[#A0A0A0]"
              }`}
            >
              {team}
            </button>
          );
        })}
      </div>

      <div className="mx-auto w-full max-w-[1200px] flex-1 px-6 py-6 md:py-8 lg:px-[72px]">
        {/* Intern Count */}
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-[var(--fb-v2-text)]">
            {filteredInterns.length} interns
          </h2>
        </div>

        {/* Intern Cards */}
        <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredInterns.map((intern) => (
            <InternCard key={intern.id} intern={intern} />
          ))}
        </div>
      </div>
    </main>
  );
}
