
import MetricCard from "@/components/v2/MetricCard";
import TeamOverview, { type Team } from "@/components/v2/TeamOverview";

const metrics = [
  { label: "Total Interns", value: 24 },
  { label: "Active Projects", value: 8 },
  { label: "Tasks Completed This Week", value: 37 },
  { label: "Pending Tasks", value: 12 },
  { label: "Project Blockers", value: 3 },
];

const teams: Team[] = [
  {
    id: 1,
    name: "Frontend",
    lead: "Maria",
    members: 6,
    progress: 75,
    status: "On track",
  },
  {
    id: 2,
    name: "Backend",
    lead: "Ofon",
    members: 8,
    progress: 60,
    status: "At risk",
  },
  {
    id: 3,
    name: "Design",
    lead: "Ceren",
    members: 4,
    progress: 90,
    status: "On track",
  },
];

export default function LeadershipPreview() {
  return (
    <main className="min-h-screen bg-[var(--fb-v2-page-bg)] px-6 py-10 text-[var(--fb-v2-text)]">
      <div className="mx-auto max-w-[1500px] space-y-8">
        <h1 className="text-2xl font-bold">
          Leadership Dashboard
        </h1>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {metrics.map((metric) => (
            <MetricCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
            />
          ))}
        </div>

        <TeamOverview teams={teams} />
      </div>
    </main>
  );
}
