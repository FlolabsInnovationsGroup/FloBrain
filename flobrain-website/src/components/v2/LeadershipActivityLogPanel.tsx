
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
    <div className="fb-v2-dashboard fb-v2-activity-log">
      <h2 className="fb-activity-title">
        TIME & ACTIVITY LOG
      </h2>

      {/* Activity summary cards */}
      <div className="fb-v2-metrics fb-activity-metrics">
        <MetricCard
          label="TOTAL ACTIVITIES"
          value={250}
          description="All time activities"
        />

        <MetricCard
          label="TODAY'S ACTIVITIES"
          value="08"
          description="Activities today"
        />

        <MetricCard
          label="USERS ACTIVE"
          value={12}
          description="Active users today"
        />
      </div>

      {/* Activity filters and table */}
      <section className="fb-activity-content">
        <div className="fb-activity-filters">
          <select className="fb-activity-filter" aria-label="Filter by intern">
            <option value="">All Interns</option>
          </select>

          <select className="fb-activity-filter" aria-label="Filter by activity">
            <option value="">All Activities</option>
          </select>

          <select className="fb-activity-filter" aria-label="Filter by project">
            <option value="">All Projects</option>
          </select>

          <select className="fb-activity-filter" aria-label="Filter by team">
            <option value="">All Teams</option>
          </select>
        </div>

        {/* Activity table */}
        <div className="fb-activity-table-wrap">
          <table className="fb-activity-table">
            <thead>
              <tr>
                <th>TIME</th>
                <th>USER</th>
                <th>ACTIVITY TYPE</th>
                <th>DETAILS</th>
                <th>TIME SPENT</th>
              </tr>
            </thead>

            <tbody>
              {activities.map((activity) => (
                <tr key={activity.id}>
                  <td>{activity.date}</td>

                  <td>
                    <div>{activity.user}</div>
                    <div className="fb-activity-secondary">
                      ({activity.role})
                    </div>
                  </td>

                  <td>{activity.type}</td>

                  <td>{activity.details}</td>

                  <td>{activity.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination display */}
        <div className="fb-activity-pagination">
          <span className="fb-activity-pagination-info">
            Showing 1 to {activities.length} of 50 activities
          </span>

          <div className="fb-activity-pagination-controls">
            <button type="button" disabled>← Prev</button>
            <span className="fb-activity-current-page">1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>...</span>
            <span>8</span>
            <button type="button">Next →</button>
          </div>
        </div>
      </section>
    </div>
  );
}
