
"use client";

import MetricCard from "./MetricCard";

const activities = [
  {
    id: 1,
    time: "10:24 - 10:40 AM",
    date: "May 29, 2026",
    user: "Ceren Genc",
    role: "Team Lead",
    type: "Created Project",
    details: 'Created Project "Flohealth"',
    duration: "32 Mins",
  },
  {
    id: 2,
    time: "10:24 - 10:40 AM",
    date: "May 29, 2026",
    user: "Diogo Sela",
    role: "Intern",
    type: "Created Project",
    details: 'Created Project "Flohealth"',
    duration: "32 Mins",
  },
  {
    id: 3,
    time: "10:24 - 10:40 AM",
    date: "May 29, 2026",
    user: "Claudia",
    role: "Intern",
    type: "Created Project",
    details: 'Created Project "Flohealth"',
    duration: "32 Mins",
  },
  {
    id: 4,
    time: "10:24 - 10:40 AM",
    date: "May 29, 2026",
    user: "Chilo",
    role: "Intern",
    type: "Created Project",
    details: 'Created Project "Flohealth"',
    duration: "32 Mins",
  },
  {
    id: 5,
    time: "10:24 - 10:40 AM",
    date: "May 29, 2026",
    user: "Ceren Genc",
    role: "Team Lead",
    type: "Created Project",
    details: 'Created Project "Flohealth"',
    duration: "32 Mins",
  },
];

export default function LeadershipActivityLogPanel() {
  return (
    <div className="fb-v2-dashboard fb-v2-activity-log space-y-6">
      <h2 className="text-lg font-semibold">
        TIME & ACTIVITY LOG
      </h2>

      <div className="fb-v2-metrics">
        <MetricCard
          label="Total Activities"
          value={250}
          description="All time activities"
        />
        <MetricCard
          label="Today's Activities"
          value="08"
          description="Activities today"
        />
        <MetricCard
          label="Users Active"
          value={12}
          description="Active users today"
        />
      </div>

      <section className="fb-v2-card space-y-4 border-t border-white/40 pt-4">
        {/* Filters */}
        <div className="grid grid-cols-1 gap-3 border-b border-white/40 px-3 py-3 sm:grid-cols-4">
          <select className="fb-activity-filter">
            <option value="">All Interns</option>
          </select>

          <select className="fb-activity-filter">
            <option value="">All Activities</option>
          </select>

          <select className="fb-activity-filter">
            <option value="">All Projects</option>
          </select>

          <select className="fb-activity-filter">
            <option value="">All Teams</option>
          </select>
        </div>

        {/* Activity table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-0 table-fixed text-left text-xs">
            <thead className="bg-[#323131]">
              <tr className="border-b border-white/30 text-white">
                <th className="p-3">TIME</th>
                <th className="p-3">USER</th>
                <th className="p-3">ACTIVITY TYPE</th>
                <th className="p-3">DETAILS</th>
                <th className="p-3">TIME SPENT</th>
              </tr>
            </thead>

            <tbody>
              {activities.map((activity) => (
                <tr
                  key={activity.id}
                  className="border-b border-white/20"
                >
                  <td className="p-3">
                    <div>{activity.time}</div>
                    <div className="mt-1 text-[10px] text-[var(--fb-v2-text-muted)]">
                      {activity.date}
                    </div>
                  </td>

                  <td className="p-3">
                    <div>{activity.user}</div>
                    <div className="mt-1 text-[10px] text-[var(--fb-v2-text-muted)]">
                      ({activity.role})
                    </div>
                  </td>

                  <td className="p-3">{activity.type}</td>
                  <td className="p-3">{activity.details}</td>
                  <td className="p-3">{activity.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-[var(--fb-v2-text-muted)]">
            Showing 1 to {activities.length} of 50 activities
          </span>

          <div className="flex items-center gap-3">
            <button className="px-2 py-1">← Prev</button>
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>...</span>
            <span>8</span>
            <button className="px-2 py-1">Next →</button>
          </div>
        </div>
      </section>
    </div>
  );
}
