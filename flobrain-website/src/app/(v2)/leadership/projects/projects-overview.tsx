"use client";

import { useMemo, useState } from "react";
import { mockProjects } from "./mockData";
import type { ProjectStatus } from "./types";

type ProjectFilter = "All" | ProjectStatus;

export function ProjectsOverview() {
  const [filter, setFilter] = useState<ProjectFilter>("All");

  const filteredProjects = useMemo(() => {
    if (filter === "All") return mockProjects;
    return mockProjects.filter((project) => project.status === filter);
  }, [filter]);

  const cellStyle = {
    border: "1px solid var(--fb-v2-border)",
  };

  return (
    <main className="h-full w-full px-4 py-5 md:px-5 md:py-6">
      <div className="mx-auto w-full">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold" style={{ color: "var(--fb-v2-heading)" }}>
            Projects
          </h2>

          <label className="flex items-center gap-3 text-xs">
            <span style={{ color: "var(--fb-v2-text-muted)" }}>Filter by</span>
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value as ProjectFilter)}
              className="rounded-md border px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                background: "var(--fb-v2-surface)",
                color: "var(--fb-v2-text)",
                borderColor: "var(--fb-v2-border)",
              }}
            >
              <option value="All">All Projects</option>
              <option value="On Track">On Track</option>
              <option value="At Risk">At Risk</option>
              <option value="Completed">Completed</option>
            </select>
          </label>
        </div>

        <div
          className="max-h-[calc(100vh-300px)] min-h-[260px] overflow-auto rounded-md border"
          style={{
            background: "var(--fb-v2-surface)",
            borderColor: "var(--fb-v2-border)",
          }}
        >
          <table className="w-full min-w-[720px] table-fixed text-left">
            <thead>
              <tr
                className="text-[10px] font-semibold"
                style={{
                  color: "var(--fb-v2-text-muted)",
                  background: "var(--fb-v2-sidebar-bg)",
                }}
              >
                <th className="px-2 py-3" style={cellStyle}>
                  Project
                </th>
                <th className="px-2 py-3" style={cellStyle}>
                  Team Lead
                </th>
                <th className="px-2 py-3" style={cellStyle}>
                  Team
                </th>
                <th className="px-2 py-3" style={cellStyle}>
                  Interns
                </th>
                <th className="px-2 py-3" style={cellStyle}>
                  Progress Milestones
                </th>
                <th className="px-2 py-3" style={cellStyle}>
                  Status
                </th>
                <th className="px-2 py-3" style={cellStyle}>
                  Target Date
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredProjects.map((project) => {
                const progress = Math.min(100, Math.max(0, project.progress));

                return (
                  <tr key={project.id} className="text-xs" style={{ color: "var(--fb-v2-text)" }}>
                    <td className="break-words px-2 py-3" style={cellStyle}>
                      {project.name}
                    </td>
                    <td className="break-words px-2 py-3" style={cellStyle}>
                      {project.teamLead}
                    </td>
                    <td className="break-words px-2 py-3" style={cellStyle}>
                      {project.team}
                    </td>
                    <td className="px-2 py-3" style={cellStyle}>
                      {project.interns}
                    </td>
                    <td className="px-2 py-3" style={cellStyle}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full"
                          style={{ background: "var(--fb-v2-border)" }}
                          role="progressbar"
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={progress}
                          aria-label={`${project.name} progress`}
                        >
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${progress}%`,
                              background: "#22c55e",
                            }}
                          />
                        </div>
                        <span
                          className="shrink-0 text-[10px]"
                          style={{ color: "var(--fb-v2-text-muted)" }}
                        >
                          {progress}%
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-3" style={cellStyle}>
                      <span
                        className="whitespace-nowrap text-[10px] font-medium"
                        style={{
                          color:
                            project.status === "Completed"
                              ? "#22c55e"
                              : project.status === "At Risk"
                                ? "#f97316"
                                : "#22c55e",
                        }}
                      >
                        {project.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-2 py-3" style={cellStyle}>
                      {project.targetDate}
                    </td>
                  </tr>
                );
              })}

              {filteredProjects.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-xs"
                    style={{
                      ...cellStyle,
                      color: "var(--fb-v2-text-muted)",
                    }}
                  >
                    No projects found for this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
