import type { Task } from "@/types/task";

/**
 * Prototype task rows for View Tasks / Task Details.
 * Replace with `api.getTasks()` / `api.getTask(id)` once the backend exists.
 */
export const mockTasks: Task[] = [
  {
    id: "task-1",
    title: "Update Product Structure and Web Experience",
    description: "Restructure the product information architecture for FloHealth.",
    project: { id: "project-flohealth", name: "FloHealth" },
    team: { id: "team-4", name: "UX/UI Design" },
    projectManager: { id: "person-3", name: "Ceren Yilmaz" },
    createdBy: { id: "person-mohamed", name: "Mohamed A." },
    assignedTo: [
      { id: "person-claudia", name: "Claudia L." },
      { id: "person-serina", name: "Serina Z." },
    ],
    dueDate: "2026-08-28",
    priority: "high",
    status: "active",
    sections: {
      objective: "Ship a clearer product structure that supports the FloHealth web experience.",
      context: "Current IA makes discovery of core features difficult for new users.",
      requirements: [
        "Map current information architecture",
        "Propose revised navigation model",
        "Align with brand and content guidelines",
      ],
      steps: [
        "Audit existing product pages",
        "Draft proposed structure",
        "Review with design and product leads",
      ],
      deliverables: ["IA diagram", "Updated sitemap", "Handoff notes"],
      acceptanceCriteria: [
        "Stakeholders approve the new structure",
        "All primary user journeys remain reachable in two clicks or fewer",
      ],
    },
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-10T14:30:00.000Z",
  },
  {
    id: "task-2",
    title: "Mobile MVP",
    description: "Define and validate the FloHealth mobile MVP scope.",
    project: { id: "project-flohealth", name: "FloHealth" },
    team: { id: "team-1", name: "Flo-Brain Front End" },
    projectManager: { id: "person-3", name: "Ceren Yilmaz" },
    createdBy: { id: "person-3", name: "Ceren G." },
    assignedTo: [
      { id: "person-claudia", name: "Claudia L." },
      { id: "person-serina", name: "Serina Z." },
    ],
    dueDate: "2026-09-04",
    priority: "medium",
    status: "active",
    sections: {
      objective: "Deliver a scoped mobile MVP that covers the critical patient flows.",
      context: "Web experience is ahead of mobile; leadership wants parity on core tasks.",
      requirements: ["Prioritize top 5 user stories", "Define offline constraints"],
      steps: ["Workshop with product", "Draft MVP checklist", "Estimate engineering effort"],
      deliverables: ["MVP scope doc", "Story map"],
      acceptanceCriteria: ["MVP approved by product lead", "Effort estimate within Q3 capacity"],
    },
    createdAt: "2026-08-05T09:00:00.000Z",
    updatedAt: "2026-08-12T11:00:00.000Z",
  },
  {
    id: "task-3",
    title: "Competitive Research Onboarding",
    description: "Research competitor onboarding patterns for FloHealth.",
    project: { id: "project-flohealth", name: "FloHealth" },
    team: { id: "team-4", name: "UX/UI Design" },
    projectManager: { id: "person-3", name: "Ceren Yilmaz" },
    createdBy: { id: "person-3", name: "Ceren G." },
    assignedTo: [
      { id: "person-dina", name: "Dina T." },
      { id: "person-claudia", name: "Claudia L." },
    ],
    dueDate: "2026-09-18",
    priority: "low",
    status: "active",
    sections: {
      objective: "Document competitor onboarding patterns that improve first-run completion.",
      context: "Onboarding drop-off is high relative to peer products.",
      requirements: ["Review at least 5 competitors", "Capture screenshots and flow notes"],
      steps: ["Select competitors", "Run heuristic review", "Synthesize findings"],
      deliverables: ["Research deck", "Recommendation summary"],
      acceptanceCriteria: ["Findings shared with design team", "Top 3 recommendations prioritized"],
    },
    createdAt: "2026-08-08T16:00:00.000Z",
    updatedAt: "2026-08-15T09:20:00.000Z",
  },
];

export function getMockTask(id: string): Task | undefined {
  return mockTasks.find((task) => task.id === id);
}

export function getMockTasks(): Task[] {
  return mockTasks;
}
