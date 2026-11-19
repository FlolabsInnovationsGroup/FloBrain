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

  return (
    <main className="h-full w-full px-6 py-6 md:px-8 md:py-8">
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-[var(--fb-teams-heading)]">Projects</h2>

          <label className="flex items-center gap-3 text-sm">
            <span className="text-[var(--fb-teams-body)]">Filter by</span>
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value as ProjectFilter)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Projects</option>
              <option value="On Track">On Track</option>
              <option value="At Risk">At Risk</option>
              <option value="Completed">Completed</option>
            </select>
          </label>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-gray-50">
              <tr className="text-xs font-semibold text-gray-500">
                <th className="px-5 py-4">Project</th>
                <th className="px-5 py-4">Team Lead</th>
                <th className="px-5 py-4">Team</th>
                <th className="px-5 py-4">Interns</th>
                <th className="px-5 py-4">Progress Milestones</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Target Date</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredProjects.map((project) => {
                const progress = Math.min(100, Math.max(0, project.progress));

                return (
                  <tr key={project.id} className="text-sm text-gray-700">
                    <td className="px-5 py-5 font-medium text-gray-900">{project.name}</td>
                    <td className="px-5 py-5">{project.teamLead}</td>
                    <td className="px-5 py-5">{project.team}</td>
                    <td className="px-5 py-5">{project.interns}</td>
                    <td className="px-5 py-5">
                      <div className="flex min-w-[150px] items-center gap-3">
                        <div
                          className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200"
                          role="progressbar"
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={progress}
                          aria-label={`${project.name} progress`}
                        >
                          <div
                            className="h-full rounded-full bg-blue-500 transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="w-10 text-xs text-gray-500">{progress}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-5">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                          project.status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : project.status === "At Risk"
                              ? "bg-red-100 text-red-700"
                              : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {project.status}
                      </span>
                    </td>
                    <td className="px-5 py-5 whitespace-nowrap">{project.targetDate}</td>
                  </tr>
                );
              })}

              {filteredProjects.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-gray-500">
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
