"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { FilterSelect, type FilterOption } from "@/components/v2/FilterSelect";

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

const toOptions = (values: string[]): FilterOption[] =>
  Array.from(new Set(values), (value) => ({ value, label: value }));

const filterOptions: { key: keyof Filters; allLabel: string; options: FilterOption[] }[] = [
  { key: "user", allLabel: "All Interns", options: toOptions(users.map(({ name }) => name)) },
  { key: "type", allLabel: "All Activities", options: toOptions(activityTypes) },
  { key: "project", allLabel: "All Projects", options: toOptions(projectNames) },
  { key: "team", allLabel: "All Teams", options: toOptions(users.map(({ team }) => team)) },
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

export function ActivityLog() {
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
    // Fills the content area: the table scrolls on its own and the pagination stays in view
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div>
        <h2 className="text-xs font-medium sm:text-sm">TIME &amp; ACTIVITY LOG</h2>

        <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {summary.map(({ label, value, caption }) => (
            <div key={label} className="fb-v2-tile px-3 py-3 text-center">
              <dt className="text-[9px] font-semibold">{label}</dt>
              <dd className="mt-1 text-base tabular-nums">{String(value).padStart(2, "0")}</dd>
              <dd className="text-[9px]">{caption}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 border-y border-[var(--fb-v2-border)] py-2 sm:grid-cols-4">
        {filterOptions.map(({ key, allLabel, options }) => (
          <div key={key} className="flex justify-center">
            <FilterSelect
              label={allLabel}
              value={filters[key]}
              options={[{ value: ALL, label: allLabel }, ...options]}
              onChange={(value) => updateFilter(key, value)}
            />
          </div>
        ))}
      </div>

      <div className="mt-4 min-h-48 flex-1 overflow-auto">
        <table className="fb-v2-table w-full min-w-140 border-collapse text-left text-[9px]">
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
          <p className="py-6 text-center text-sm text-[var(--fb-v2-text-muted)]">
            No activities match these filters.
          </p>
        )}
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 pt-4 text-[9px]">
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
            className="flex items-center gap-1 hover:text-[var(--fb-v2-accent)] disabled:opacity-40"
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
                className={`min-w-3 ${item === page ? "font-bold text-[var(--fb-v2-accent)]" : "hover:text-[var(--fb-v2-accent)]"}`}
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
            className="flex items-center gap-1 hover:text-[var(--fb-v2-accent)] disabled:opacity-40"
          >
            Next <ArrowRight size={11} />
          </button>
        </nav>
      </div>
    </div>
  );
}
