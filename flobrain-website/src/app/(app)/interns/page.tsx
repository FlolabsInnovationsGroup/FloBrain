
"use client";

import { useMemo, useState } from "react";
import {
  Video,
  ChevronDown,
  Search,
  MessageCircle,
  Play,
} from "lucide-react";

type Intern = {
  id: number;
  name: string;
  role: string;
  team: string;
  project: string;
  hours: number;
  specialization: string;
};

const interns: Intern[] = [
  {
    id: 1,
    name: "Claudia Lopez",
    role: "UX/UI Designer",
    team: "Design / Moodchanger",
    project: "FloBrain Portal",
    hours: 38,
    specialization: "User Research & Interface Design",
  },
  {
    id: 2,
    name: "Intern #2",
    role: "AI Engineer",
    team: "Team 2",
    project: "FloHealth Buddy",
    hours: 41,
    specialization: "Machine Learning",
  },
  {
    id: 3,
    name: "Intern #3",
    role: "Data Scientist",
    team: "Team 2",
    project: "FloHealth Buddy",
    hours: 29,
    specialization: "Bio Statistics",
  },
  {
    id: 4,
    name: "Intern #4",
    role: "Frontend Developer",
    team: "Team 3",
    project: "FloBrain Portal",
    hours: 20,
    specialization: "Frontend Development",
  },
  {
    id: 5,
    name: "Intern #5",
    role: "Product Designer",
    team: "Team 4",
    project: "Team Project",
    hours: 24,
    specialization: "Product Design",
  },
  {
    id: 6,
    name: "Intern #6",
    role: "Data Analyst",
    team: "Team 5",
    project: "Team Project",
    hours: 18,
    specialization: "Data Analytics",
  },
  {
    id: 7,
    name: "Intern #7",
    role: "Automation Engineer",
    team: "Team 6",
    project: "Team Project",
    hours: 30,
    specialization: "Automation",
  },
  {
    id: 8,
    name: "Intern #8",
    role: "Backend Developer",
    team: "Team 7",
    project: "Team Project",
    hours: 26,
    specialization: "Backend Development",
  },
  {
    id: 9,
    name: "Intern #9",
    role: "AI Researcher",
    team: "Team 3",
    project: "FloBrain Portal",
    hours: 32,
    specialization: "Artificial Intelligence",
  },
];

const teams = [
  "All",
  "Team 1",
  "Team 2",
  "Team 3",
  "Team 4",
  "Team 5",
  "Team 6",
  "Team 7",
];

const topNavigation = [
  "MY TASKS",
  "MY DOCS",
  "MY CALENDAR",
  "MY CHATS",
  "MY TIME",
  "MY VAULT",
  "LEADERSHIP",
];

const leadershipNavigation = [
  "DASHBOARD",
  "INTERNS",
  "TEAMS",
  "PROJECT",
  "TASKS",
  "SCORECARD",
  "TEAM ACTIVITY",
];

const chatGroups = [
  {
    heading: "GROUPS",
    items: ["Admin", "Finance", "Executive"],
  },
  {
    heading: "TEAMS",
    items: [
      "Humanoid - general",
      "Flo-Brain front end",
      "Flo-Brain backend",
      "AI & Robotics Team",
      "Automation Team",
      "Analytics Team",
      "Design Team",
      "Space Team",
      "Legal Team",
      "Moodchanger Team",
      "Development Team",
    ],
  },
];

const buddyColors = [
  "border-cyan-400",
  "border-cyan-400",
  "border-rose-400",
  "border-orange-400",
  "border-emerald-400",
  "border-violet-400",
  "border-blue-500",
  "border-teal-400",
  "border-rose-400",
];

function MeetingsSidebar() {
  return (
    <aside className="flex min-h-0 w-full flex-col gap-3 overflow-hidden text-white lg:w-[22%] lg:shrink-0">
      <section className="shrink-0 rounded-xl bg-[#505050] p-4">
        <div className="flex items-center justify-center gap-5 py-1">
          <Video size={20} fill="white" />
          <h2 className="text-lg font-medium tracking-wide">
            MEETINGS
          </h2>
        </div>

        <div className="mt-8 flex flex-wrap justify-between gap-2 text-[10px]">
          {["Meeting Links", "Recordings", "Transcripts"].map((item) => (
            <button
              key={item}
              type="button"
              className="flex items-center gap-1 hover:text-cyan-300"
            >
              {item}
              <ChevronDown size={12} />
            </button>
          ))}
        </div>
      </section>

      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-lg bg-[#464444]">
        <div className="shrink-0 border-b border-white/20 px-4 py-3">
          <h2 className="text-xl">Chat Rooms</h2>
          <p className="text-xs text-gray-200">
            Channels, Groups and DM’s
          </p>
        </div>

        <div className="shrink-0 p-2">
          <label className="flex items-center gap-2 rounded-md border border-white/20 bg-white/5 px-2 py-1.5">
            <Search size={17} className="text-white/50" />
            <input
              placeholder="Search Rooms"
              aria-label="Search chat rooms"
              className="min-w-0 w-full bg-transparent text-xs outline-none placeholder:text-white/40"
            />
          </label>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
          {chatGroups.map((group) => (
            <div key={group.heading} className="mb-5">
              <h3 className="mb-1 text-sm font-medium">
                {group.heading}
              </h3>

              <div className="space-y-0.5 pl-4">
                {group.items.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="block w-full truncate text-left text-sm leading-5 text-gray-100 hover:text-cyan-300"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="mt-6">
            <h3 className="mb-3 text-sm font-medium">
              DIRECT MESSAGES
            </h3>

            <div className="space-y-3">
              <MessageCircle
                size={23}
                fill="#36c5e9"
                className="text-cyan-400"
              />
              <MessageCircle
                size={23}
                fill="#36c5e9"
                className="text-cyan-400"
              />
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-white/20 px-5 py-3">
          <button
            type="button"
            className="block text-sm hover:text-cyan-300"
          >
            Settings
          </button>

          <button
            type="button"
            className="mt-1 block text-sm text-red-400 hover:text-red-300"
          >
            Sign Out
          </button>
        </div>
      </section>
    </aside>
  );
}

function InternCard({ intern }: { intern: Intern }) {
  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-md border border-white/60 bg-[#454545] text-white">
      <div className="flex-1 p-2.5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="h-9 w-9 shrink-0 rounded-full bg-gray-200" />

          <div className="min-w-0">
            <h2 className="truncate text-xs font-medium sm:text-[13px]">
              {intern.name}
            </h2>
            <p className="truncate text-[11px] text-gray-300">
              {intern.role}
            </p>
          </div>
        </div>

        <div className="mt-3 space-y-2 text-[10px] sm:text-xs">
          <div className="flex min-w-0 items-center justify-between gap-2">
            <span className="shrink-0 text-gray-300">Team</span>
            <span className="truncate text-right">{intern.team}</span>
          </div>

          <div className="flex min-w-0 items-center justify-between gap-2">
            <span className="shrink-0 text-gray-300">Projects</span>
            <span className="truncate text-right">{intern.project}</span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-gray-300">Hours</span>
            <span>{intern.hours}/40</span>
          </div>
        </div>
      </div>

      <div className="border-t border-white/60 px-3 py-2">
        <p className="text-[10px] text-gray-300">Specialization</p>
        <p className="mt-1 break-words text-[11px] leading-4">
          {intern.specialization}
        </p>
      </div>
    </article>
  );
}

function BuddiesSidebar() {
  return (
    <aside className="hidden min-h-0 w-[16%] shrink-0 flex-col overflow-hidden rounded-md bg-[#464444] text-white lg:flex">
      <div className="shrink-0 px-3 pt-8">
        <div className="flex h-[74px] items-center justify-center gap-3 rounded-md bg-gray-200 text-gray-900">
          <span className="text-xs font-medium">00:00:00</span>

          <div className="h-12 w-12 rounded-full border-4 border-blue-400 border-l-gray-300" />

          <Play
            size={25}
            fill="#252540"
            className="text-[#252540]"
          />
        </div>

        <h2 className="mt-12 text-center text-lg font-bold">
          Buddies - AI Agents
        </h2>

        <div className="-mx-3 mt-2 border-b border-white/60" />

        <p className="py-2 text-center text-xs">
          Tap a Buddy to route chat.
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 pb-4 pt-7">
        {buddyColors.map((color, index) => (
          <button
            key={`${color}-${index}`}
            type="button"
            aria-label={`AI Buddy ${index + 1}`}
            className={`flex h-[53px] w-full items-center justify-center rounded-md border ${color} bg-white/5 transition hover:bg-white/15`}
          >
            <span className="sr-only">
              AI Buddy {index + 1}
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
}

export default function InternsPage() {
  const [selectedTeam, setSelectedTeam] = useState("All");
  const [search, setSearch] = useState("");

  const filteredInterns = useMemo(() => {
    const query = search.trim().toLowerCase();

    return interns.filter((intern) => {
      const matchesTeam =
        selectedTeam === "All" ||
        intern.team === selectedTeam ||
        (selectedTeam === "Team 1" &&
          intern.team === "Design / Moodchanger");

      const matchesSearch =
        !query ||
        [
          intern.name,
          intern.role,
          intern.team,
          intern.project,
          intern.specialization,
        ].some((value) => value.toLowerCase().includes(query));

      return matchesTeam && matchesSearch;
    });
  }, [selectedTeam, search]);

  return (
    <div className="flex h-full min-h-0 w-full gap-2.5 overflow-hidden bg-[#303030] p-2 text-white">
      <MeetingsSidebar />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <nav className="flex shrink-0 items-center justify-between gap-3 overflow-x-auto px-2 py-2">
          {topNavigation.map((item) => (
            <button
              key={item}
              type="button"
              className={`shrink-0 whitespace-nowrap px-1 pb-2 text-[11px] font-semibold sm:text-sm ${
                item === "LEADERSHIP"
                  ? "border-b-2 border-blue-500 text-white"
                  : "text-white hover:text-blue-300"
              }`}
            >
              {item}
            </button>
          ))}
        </nav>

        <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md bg-[#454545]">
          <nav className="flex shrink-0 items-center justify-between gap-1 overflow-x-auto border-b border-white/50 px-2">
            {leadershipNavigation.map((item) => (
              <button
                key={item}
                type="button"
                className={`shrink-0 whitespace-nowrap px-2 py-3 text-[10px] sm:px-3 sm:text-xs ${
                  item === "INTERNS"
                    ? "border-b-2 border-blue-500 font-bold"
                    : "text-gray-200 hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </nav>

          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-white/60 px-4 py-3">
            <div className="flex flex-wrap gap-2">
              {["Create Team", "Create Project", "Create Task"].map(
                (label) => (
                  <button
                    key={label}
                    type="button"
                    className="rounded-md bg-[#2864ff] px-3 py-2 text-xs font-medium hover:bg-blue-700 sm:text-sm"
                  >
                    {label}
                  </button>
                )
              )}
            </div>

            <label className="flex w-full items-center gap-2 rounded-md border-2 border-white/60 px-3 py-2 sm:ml-auto sm:w-56">
              <Search size={18} className="shrink-0 text-white/50" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name"
                aria-label="Search interns by name"
                className="min-w-0 w-full bg-transparent text-xs outline-none placeholder:text-white/50 sm:text-sm"
              />
            </label>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="sticky top-0 z-10 bg-[#454545]">
              <div className="flex gap-0.5 overflow-x-auto border-b border-white/50 px-4 pt-4">
                {teams.map((team) => (
                  <button
                    key={team}
                    type="button"
                    onClick={() => setSelectedTeam(team)}
                    aria-pressed={selectedTeam === team}
                    className={`shrink-0 rounded-t-xl px-3 py-2 text-xs sm:px-4 ${
                      selectedTeam === team
                        ? "bg-gray-200 font-semibold text-gray-900"
                        : "bg-white/25 text-white hover:bg-white/40"
                    }`}
                  >
                    {team}
                  </button>
                ))}
              </div>

              <p className="px-4 py-2 text-xs font-semibold sm:text-sm">
                {filteredInterns.length} interns
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 px-2 pb-4">
              {filteredInterns.map((intern) => (
                <InternCard key={intern.id} intern={intern} />
              ))}
            </div>

            {filteredInterns.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-gray-300">
                No interns found. Try another search or team.
              </p>
            )}
          </div>
        </section>
      </main>

      <BuddiesSidebar />
    </div>
  );
}
