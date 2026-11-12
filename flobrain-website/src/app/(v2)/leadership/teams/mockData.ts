import type { Team, TeamDetail, TeamProject } from "./types";

export const mockTeams: Team[] = [
  {
    id: "1",
    name: "DESIGN",
    lead: "Ceren Genc",
    description: "UX research, product design, prototyping and visual identity.",
    progress: 82,
    memberCount: 8,
    completedTasks: 14,
    totalTasks: 18,
  },
  {
    id: "2",
    name: "Team: AI & Data",
    lead: "Alex Rivera",
    description: "Machine learning models, data pipelines and AI integration",
    progress: 64,
    memberCount: 11,
    completedTasks: 9,
    totalTasks: 14,
  },
  {
    id: "3",
    name: "Team Engineering",
    lead: "Sarah Jenkins",
    description: "Back end systems, infrastructure, APIs and hardware integration",
    progress: 88,
    memberCount: 8,
    completedTasks: 17,
    totalTasks: 19,
  },
  {
    id: "4",
    name: "Flo-Brain front end",
    lead: "Elena Rostova",
    description: "Building responsive user interfaces and component libraries.",
    progress: 75,
    memberCount: 5,
    completedTasks: 15,
    totalTasks: 20,
  },
  {
    id: "5",
    name: "Flo-Brain backend",
    lead: "Dr. Michael Chen",
    description: "Microservices, database migrations, and secure authentication.",
    progress: 50,
    memberCount: 6,
    completedTasks: 10,
    totalTasks: 20,
  },
  {
    id: "6",
    name: "Automation Team",
    lead: "David Kim",
    description: "CI/CD pipelines, automated testing, and deployment scripts.",
    progress: 92,
    memberCount: 4,
    completedTasks: 23,
    totalTasks: 25,
  },
  {
    id: "7",
    name: "QA & Testing",
    lead: "Marcus Vance",
    description: "End-to-end testing, integration test suites, and regression checks.",
    progress: 70,
    memberCount: 6,
    completedTasks: 14,
    totalTasks: 20,
  },
  {
    id: "8",
    name: "DevOps & Cloud",
    lead: "Sophia Martinez",
    description: "Cloud architecture, Kubernetes cluster orchestration, and monitoring.",
    progress: 85,
    memberCount: 5,
    completedTasks: 17,
    totalTasks: 20,
  },
  {
    id: "9",
    name: "Security & Compliance",
    lead: "Tariq Al-Mansoor",
    description: "Vulnerability assessments, penetration testing, and access auditing.",
    progress: 60,
    memberCount: 4,
    completedTasks: 9,
    totalTasks: 15,
  },
];

const detailById: Record<string, Omit<TeamDetail, keyof Team>> = {
  "1": {
    blockers: 2,
    activeProjects: 5,
    activeInterns: 8,
    projects: [
      {
        id: "p1",
        name: "HealthBuddy",
        activeTasks: 6,
        closedTasks: 12,
        activeInterns: 3,
        progress: 48,
      },
      { id: "p2", name: "Project #2", activeTasks: 4, closedTasks: 2, activeInterns: 2, progress: 20 },
      { id: "p3", name: "Project #3", activeTasks: 3, closedTasks: 5, activeInterns: 1, progress: 35 },
      { id: "p4", name: "Project #4", activeTasks: 2, closedTasks: 1, activeInterns: 1, progress: 10 },
      { id: "p5", name: "Project #5", activeTasks: 5, closedTasks: 0, activeInterns: 2, progress: 5 },
    ],
  },
};

function buildProjects(team: Team): TeamProject[] {
  return Array.from({ length: 5 }, (_, index) => ({
    id: `${team.id}-p${index + 1}`,
    name: index === 0 ? `${team.name.replace(/^Team:?\s*/i, "")} Initiative` : `Project #${index + 1}`,
    activeTasks: Math.max(1, Math.round(team.totalTasks / (index + 3))),
    closedTasks: Math.max(0, Math.round(team.completedTasks / (index + 2))),
    activeInterns: Math.max(1, Math.round(team.memberCount / (index + 3))),
    progress: Math.max(5, Math.min(95, team.progress - index * 12)),
  }));
}

export function getMockTeams(): Team[] {
  return mockTeams;
}

export function getMockTeam(id: string): TeamDetail | undefined {
  const team = mockTeams.find((item) => item.id === id);
  if (!team) return undefined;

  const extra = detailById[id];
  if (extra) return { ...team, ...extra };

  const projects = buildProjects(team);
  return {
    ...team,
    blockers: Math.max(0, Math.round((100 - team.progress) / 25)),
    activeProjects: projects.length,
    activeInterns: team.memberCount,
    projects,
  };
}
