"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";
import LeadershipShell from "@/components/layout/leadershipShell";

type ActivityUser = {
  name: string;
  role: "Team Lead" | "Intern";
  team: string;
};

type Activity = {
  id: number;
  timeRange: string;
  date: string;
  user: ActivityUser;
  type: string;
  project: string;
  minutesSpent: number;
};

type Filters = {
  user: string;
  type: string;
  project: string;
  team: string;
};

const PAGE_SIZE = 7;
const ALL = "All";

const summary = [
  { label: "TOTAL ACTIVITIES", value: 250, caption: "All time activities" },
  { label: "TODAY'S ACTIVITIES", value: 8, caption: "Activities today" },
  { label: "USERS ACTIVE", value: 12, caption: "Active users today" },
];

const users: ActivityUser[] = [
  { name: "Ceren Genc", role: "Team Lead", team: "Design Team" },
  { name: "Diogo Sela", role: "Intern", team: "Design Team" },
  { name: "Claudia", role: "Intern", team: "Moodchanger Team" },
  { name: "Chilo", role: "Intern", team: "Development Team" },
];

const activityTypes = ["Created Project", "Created Task", "Updated Task", "Completed Task"];
const projectNames = ["Flohealth", "FloBrain"];
const dates = ["May 29, 2026", "May 28, 2026", "May 27, 2026", "May 26, 2026", "May 25, 2026"];

/** Placeholder log until the activity API exists: 50 entries cycling through the users above */
const activities: Activity[] = Array.from({ length: 50 }, (_, index) => ({
  id: index + 1,
  timeRange: "10:24 - 10:40 AM",
  date: dates[Math.floor(index / 10)],
  user: users[index % users.length],
  type: index < 7 ? activityTypes[0] : activityTypes[index % activityTypes.length],
  project: index < 7 ? projectNames[0] : projectNames[Math.floor(index / 4) % projectNames.length],
  minutesSpent: 32,
}));

const unique = (values: string[]) => Array.from(new Set(values));

const filterOptions: { key: keyof Filters; allLabel: string; options: string[] }[] = [
  { key: "user", allLabel: "All Interns", options: users.map(({ name }) => name) },
  { key: "type", allLabel: "All Activities", options: activityTypes },
  { key: "project", allLabel: "All Projects", options: projectNames },
  { key: "team", allLabel: "All Teams", options: unique(users.map(({ team }) => team)) },
];

const columns = ["TIME", "USER", "ACTIVITY TYPE", "DETAILS", "TIME SPENT"];

/** Page numbers to show, e.g. 1 2 3 4 … 8, with gaps marked by "gap-*" keys */
function getPageItems(current: number, total: number): (number | `gap-${string}`)[] {
  if (total <= 6) return Array.from({ length: total }, (_, index) => index + 1);

  const start = Math.min(Math.max(current - 1, 1), total - 3);
  const window = [start, start + 1, start + 2, start + 3];
  const items: (number | `gap-${string}`)[] = [];

  if (start > 1) items.push(1);
  if (start > 2) items.push("gap-start");
  items.push(...window);
  if (start + 3 < total - 1) items.push("gap-end");
  if (start + 3 < total) items.push(total);

  return items;
}

export default function ActivityLogsPage() {
  const [filters, setFilters] = useState<Filters>({
    user: ALL,
    type: ALL,
    project: ALL,
    team: ALL,
  });
  const [page, setPage] = useState(1);

  const filteredActivities = useMemo(
    () =>
      activities.filter(
        ({ user, type, project }) =>
          (filters.user === ALL || user.name === filters.user) &&
          (filters.type === ALL || type === filters.type) &&
          (filters.project === ALL || project === filters.project) &&
          (filters.team === ALL || user.team === filters.team)
      ),
    [filters]
  );

  const totalPages = Math.max(1, Math.ceil(filteredActivities.length / PAGE_SIZE));
  const pageStart = (page - 1) * PAGE_SIZE;
  const pageActivities = filteredActivities.slice(pageStart, pageStart + PAGE_SIZE);

  const updateFilter = (key: keyof Filters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };

  return (
    <LeadershipShell>
      <div className="fb-lead-scroll mr-2 flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="px-6 pt-2">
          <h1 className="text-xs font-medium sm:text-sm">TIME &amp; ACTIVITY LOG</h1>

          <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {summary.map(({ label, value, caption }) => (
              <div key={label} className="fb-lead-card rounded-md px-3 py-3 text-center">
                <dt className="text-[9px] font-semibold">{label}</dt>
                <dd className="mt-1 text-base tabular-nums">{String(value).padStart(2, "0")}</dd>
                <dd className="text-[9px]">{caption}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="fb-lead-card-divider mt-4 grid grid-cols-2 gap-2 border-y px-6 py-2 sm:grid-cols-4">
          {filterOptions.map(({ key, allLabel, options }) => (
            <label key={key} className="relative flex items-center justify-center text-[11px]">
              <span className="sr-only">{allLabel}</span>
              <select
                value={filters[key]}
                onChange={(event) => updateFilter(key, event.target.value)}
                className="fb-lead-select cursor-pointer appearance-none bg-transparent py-1.5 pl-2 pr-7 outline-none"
              >
                <option value={ALL}>{allLabel}</option>
                {options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none -ml-6 opacity-80" />
            </label>
          ))}
        </div>

        <div className="overflow-x-auto px-5 pt-4">
          <table className="fb-lead-table w-full min-w-140 border-collapse text-left text-[9px]">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column} scope="col" className="px-3 py-3 font-semibold">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageActivities.map((activity) => (
                <tr key={activity.id}>
                  <td className="px-3 py-3 leading-5">
                    <p className="font-medium">{activity.timeRange}</p>
                    <p>{activity.date}</p>
                  </td>
                  <td className="px-3 py-3 leading-5">
                    <p className="font-medium">{activity.user.name}</p>
                    <p>({activity.user.role})</p>
                  </td>
                  <td className="px-3 py-3">{activity.type}</td>
                  <td className="px-3 py-3 leading-4">
                    {activity.type}
                    <br />
                    &quot;{activity.project}&quot;
                  </td>
                  <td className="px-3 py-3">{activity.minutesSpent} Mins</td>
                </tr>
              ))}
            </tbody>
          </table>

          {pageActivities.length === 0 && (
            <p className="fb-lead-muted py-6 text-center text-sm">
              No activities match these filters.
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 text-[9px]">
          <p aria-live="polite">
            {filteredActivities.length === 0
              ? "Showing 0 activities"
              : `Showing ${pageStart + 1} to ${pageStart + pageActivities.length} of ${
                  filteredActivities.length
                } activities`}
          </p>

          <nav aria-label="Activity pages" className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPage((current) => current - 1)}
              disabled={page === 1}
              className="fb-lead-link-hover flex items-center gap-1 disabled:opacity-40"
            >
              <ArrowLeft size={11} /> Prev
            </button>
            {getPageItems(page, totalPages).map((item) =>
              typeof item === "number" ? (
                <button
                  key={item}
                  type="button"
                  aria-current={item === page ? "page" : undefined}
                  onClick={() => setPage(item)}
                  className={`min-w-3 ${item === page ? "fb-lead-room-active font-bold" : "fb-lead-link-hover"}`}
                >
                  {item}
                </button>
              ) : (
                <span key={item} aria-hidden>
                  …
                </span>
              )
            )}
            <button
              type="button"
              onClick={() => setPage((current) => current + 1)}
              disabled={page === totalPages}
              className="fb-lead-link-hover flex items-center gap-1 disabled:opacity-40"
            >
              Next <ArrowRight size={11} />
            </button>
          </nav>
        </div>
      </div>
    </LeadershipShell>
  );
}
