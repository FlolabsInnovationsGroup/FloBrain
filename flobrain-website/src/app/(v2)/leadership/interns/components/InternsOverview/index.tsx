"use client";

import { useMemo, useState } from "react";
import { useLeadershipSearch } from "@/components/v2/LeadershipSearch";

type Intern = {
  id: number;
  name: string;
  role: string;
  /** Tab the intern is filed under, e.g. "Team 1" */
  teamTab: string;
  /** Display name of the team shown on the card */
  team: string;
  project: string;
  hours: number;
  specialization: string;
};

const WEEKLY_HOURS = 40;

const interns: Intern[] = [
  {
    id: 1,
    name: "Claudia Lopez",
    role: "UX/UI Designer",
    teamTab: "Team 1",
    team: "Design / Moodchanger",
    project: "FloBrain Portal",
    hours: 38,
    specialization: "User Research & Interface Design",
  },
  {
    id: 2,
    name: "Intern #2",
    role: "AI Engineer",
    teamTab: "Team 2",
    team: "Team 2",
    project: "FloHealth Buddy",
    hours: 41,
    specialization: "Machine Learning",
  },
  {
    id: 3,
    name: "Intern #3",
    role: "Data Scientist",
    teamTab: "Team 2",
    team: "Team 2",
    project: "FloHealth Buddy",
    hours: 29,
    specialization: "Bio Statistics",
  },
  {
    id: 4,
    name: "Intern #4",
    role: "Frontend Developer",
    teamTab: "Team 3",
    team: "Team 3",
    project: "FloBrain Portal",
    hours: 20,
    specialization: "Frontend Development",
  },
  {
    id: 5,
    name: "Intern #5",
    role: "Product Designer",
    teamTab: "Team 4",
    team: "Team 4",
    project: "Team Project",
    hours: 24,
    specialization: "Product Design",
  },
  {
    id: 6,
    name: "Intern #6",
    role: "Data Analyst",
    teamTab: "Team 5",
    team: "Team 5",
    project: "Team Project",
    hours: 18,
    specialization: "Data Analytics",
  },
  {
    id: 7,
    name: "Intern #7",
    role: "Automation Engineer",
    teamTab: "Team 6",
    team: "Team 6",
    project: "Team Project",
    hours: 30,
    specialization: "Automation",
  },
  {
    id: 8,
    name: "Intern #8",
    role: "Backend Developer",
    teamTab: "Team 7",
    team: "Team 7",
    project: "Team Project",
    hours: 26,
    specialization: "Backend Development",
  },
  {
    id: 9,
    name: "Intern #9",
    role: "AI Researcher",
    teamTab: "Team 3",
    team: "Team 3",
    project: "FloBrain Portal",
    hours: 32,
    specialization: "Artificial Intelligence",
  },
];

const teams = ["All", "Team 1", "Team 2", "Team 3", "Team 4", "Team 5", "Team 6", "Team 7"];

function InternCard({ intern }: { intern: Intern }) {
  return (
    <article className="fb-v2-tile flex min-w-0 flex-col overflow-hidden">
      <div className="flex-1 px-3 pb-2 pt-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div aria-hidden className="fb-v2-avatar h-8 w-8 shrink-0 rounded-full" />
          <div className="min-w-0 leading-tight">
            <h2 className="truncate text-[11px] font-medium">{intern.name}</h2>
            <p className="truncate text-[11px]">{intern.role}</p>
          </div>
        </div>

        <dl className="mt-5 space-y-2.5 px-1 text-[11px]">
          <div className="flex min-w-0 items-center justify-between gap-2">
            <dt className="shrink-0">Team</dt>
            <dd className="truncate text-right">{intern.team}</dd>
          </div>
          <div className="flex min-w-0 items-center justify-between gap-2">
            <dt className="shrink-0">Projects</dt>
            <dd className="truncate text-right">{intern.project}</dd>
          </div>
          <div className="flex items-center justify-between gap-2">
            <dt>Hours</dt>
            <dd className="tabular-nums">
              {intern.hours}/{WEEKLY_HOURS}
            </dd>
          </div>
        </dl>
      </div>

      <div className="mx-1 border-t border-(--fb-v2-border) px-2 pb-2.5 pt-1.5">
        <p className="text-[9px]">Specialization</p>
        <p className="mt-1 wrap-break-word text-[11px] leading-4">{intern.specialization}</p>
      </div>
    </article>
  );
}

export function InternsOverview() {
  const [selectedTeam, setSelectedTeam] = useState("All");
  const { query: search } = useLeadershipSearch();

  const filteredInterns = useMemo(() => {
    const query = search.trim().toLowerCase();

    return interns.filter((intern) => {
      const matchesTeam = selectedTeam === "All" || intern.teamTab === selectedTeam;
      const matchesSearch =
        !query ||
        [intern.name, intern.role, intern.team, intern.project, intern.specialization].some(
          (value) => value.toLowerCase().includes(query)
        );

      return matchesTeam && matchesSearch;
    });
  }, [selectedTeam, search]);

  return (
    <div className="flex min-w-0 flex-col">
      <div
        role="tablist"
        aria-label="Filter by team"
        className="flex h-7 shrink-0 items-end overflow-x-auto overflow-y-hidden px-4"
      >
        {teams.map((team, index) => (
          <button
            key={team}
            type="button"
            role="tab"
            aria-selected={selectedTeam === team}
            onClick={() => setSelectedTeam(team)}
            className={`fb-v2-folder-tab shrink-0 px-3 text-[11px] leading-none ${
              selectedTeam === team
                ? "fb-v2-folder-tab-active"
                : index % 2 === 0
                  ? "fb-v2-folder-tab-light"
                  : "fb-v2-folder-tab-dark"
            }`}
          >
            {team}
          </button>
        ))}
      </div>

      <div className="shrink-0 border-t border-(--fb-v2-border) px-1 py-2">
        <p className="text-xs font-semibold sm:text-sm" aria-live="polite">
          {filteredInterns.length} {filteredInterns.length === 1 ? "intern" : "interns"}
        </p>
      </div>

      {filteredInterns.length > 0 ? (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredInterns.map((intern) => (
            <InternCard key={intern.id} intern={intern} />
          ))}
        </div>
      ) : (
        <p className="py-10 text-center text-sm text-(--fb-v2-text-muted)">
          No interns found. Try another search or team.
        </p>
      )}
    </div>
  );
}
