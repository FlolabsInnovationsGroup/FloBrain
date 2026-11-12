"use client";

import { useMemo, useState, type CSSProperties, type SubmitEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, X } from "lucide-react";
import { defaultChatGroups } from "@/components/layout/sidePanels";

type Priority = "High" | "Medium" | "Low";

const PROJECTS_PATH = "/leadership/projects";

const teams = defaultChatGroups.find(({ heading }) => heading === "TEAMS")?.items ?? [];

const projectManagers = ["Ceren Genc", "Mohamed"];

const members = [
  "Ceren Genc",
  "Chilo",
  "Claudia Lopez",
  "Diogo Sela",
  "Mohamed",
  "Intern #2",
  "Intern #3",
  "Intern #4",
  "Intern #5",
];

const priorities: { label: Priority; color: string }[] = [
  { label: "High", color: "var(--fb-v2-error)" },
  { label: "Medium", color: "var(--fb-v2-warning)" },
  { label: "Low", color: "var(--fb-v2-success)" },
];

const statuses = ["Active", "On Hold", "Completed"];

const alphabet = Array.from({ length: 26 }, (_, index) => String.fromCharCode(65 + index));

const labelClass = "fb-v2-label fb-v2-label-strong mb-1.5";

export default function CreateProjectPage() {
  const router = useRouter();
  const [priority, setPriority] = useState<Priority>("High");
  const [status, setStatus] = useState(statuses[0]);
  const [memberQuery, setMemberQuery] = useState("");
  const [memberLetter, setMemberLetter] = useState<string | null>(null);
  const [isMemberListOpen, setIsMemberListOpen] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const memberOptions = useMemo(() => {
    const query = memberQuery.trim().toLowerCase();

    return members.filter(
      (member) =>
        !selectedMembers.includes(member) &&
        (!memberLetter || member.toUpperCase().startsWith(memberLetter)) &&
        (!query || member.toLowerCase().includes(query))
    );
  }, [memberQuery, memberLetter, selectedMembers]);

  const addMember = (member: string) => {
    setSelectedMembers((current) => [...current, member]);
    setMemberQuery("");
  };

  const removeMember = (member: string) => {
    setSelectedMembers((current) => current.filter((name) => name !== member));
  };

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    // TODO: send the project to the API once the projects endpoint exists
    router.push(PROJECTS_PATH);
  };

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Create project"
      className="fb-v2-card fb-v2-outlined mx-auto w-full max-w-3xl"
    >
      <title>Create Project | FloBrain</title>
      <div className="space-y-4">
        <div>
          <label htmlFor="project-name" className={labelClass}>
            PROJECT NAME
          </label>
          <input
            id="project-name"
            name="name"
            required
            placeholder="e.g. wearable team 1"
            className="fb-v2-input fb-v2-outlined"
          />
        </div>

        <div>
          <label htmlFor="project-team" className={labelClass}>
            TEAM
          </label>
          <input
            id="project-team"
            name="team"
            required
            list="project-team-options"
            placeholder="e.g. Design Team"
            className="fb-v2-input fb-v2-outlined"
          />
          <datalist id="project-team-options">
            {teams.map((team) => (
              <option key={team} value={team} />
            ))}
          </datalist>
        </div>

        <div>
          <label htmlFor="project-description" className={labelClass}>
            DESCRIPTION - optional
          </label>
          <textarea
            id="project-description"
            name="description"
            rows={3}
            placeholder="What is this project about?"
            className="fb-v2-input fb-v2-outlined resize-none"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="project-manager" className={labelClass}>
              PROJECT MANAGER
            </label>
            <div className="relative">
              <select
                id="project-manager"
                name="manager"
                required
                defaultValue=""
                className="fb-v2-input fb-v2-outlined fb-v2-select appearance-none"
              >
                <option value="" disabled>
                  Select a manager
                </option>
                {projectManagers.map((manager) => (
                  <option key={manager} value={manager}>
                    {manager}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
              />
            </div>
          </div>

          <div>
            <label htmlFor="project-due-date" className={labelClass}>
              TARGET DUE DATE
            </label>
            <input
              id="project-due-date"
              name="dueDate"
              type="date"
              required
              className="fb-v2-input fb-v2-outlined"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4 pt-2">
          <fieldset>
            <legend className={labelClass}>PRIORITY</legend>
            <div className="flex gap-1.5">
              {priorities.map(({ label, color }) => (
                <button
                  key={label}
                  type="button"
                  aria-pressed={priority === label}
                  onClick={() => setPriority(label)}
                  style={{ "--fb-pill-color": color } as CSSProperties}
                  className="fb-v2-pill w-16 rounded-sm py-1.5 text-[11px]"
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="text-center">
            <span id="project-status-label" className={labelClass}>
              STATUS
            </span>
            <button
              type="button"
              aria-labelledby="project-status-label"
              aria-describedby="project-status-hint"
              onClick={() => setStatus(statuses[(statuses.indexOf(status) + 1) % statuses.length])}
              style={{ "--fb-pill-color": "var(--fb-v2-success)" } as CSSProperties}
              className="fb-v2-pill w-18 rounded-sm py-1.5 text-[11px]"
            >
              {status}
            </button>
            <span id="project-status-hint" className="sr-only">
              Click to change the status
            </span>
          </div>
        </div>

        <div className="pt-4">
          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="project-members" className="fb-v2-label fb-v2-label-strong">
              ADD MEMBERS
            </label>
            <div role="group" aria-label="Filter members by first letter" className="flex">
              {alphabet.map((letter) => (
                <button
                  key={letter}
                  type="button"
                  aria-pressed={memberLetter === letter}
                  onClick={() => {
                    setMemberLetter((current) => (current === letter ? null : letter));
                    setIsMemberListOpen(true);
                  }}
                  className={`px-0.75 text-[8px] ${
                    memberLetter === letter
                      ? "font-bold text-(--fb-v2-accent)"
                      : "hover:text-(--fb-v2-accent)"
                  }`}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="fb-v2-input fb-v2-outlined flex items-center gap-2">
              <input
                id="project-members"
                type="search"
                role="combobox"
                aria-expanded={isMemberListOpen}
                aria-controls="project-member-options"
                autoComplete="off"
                value={memberQuery}
                onChange={(event) => {
                  setMemberQuery(event.target.value);
                  setIsMemberListOpen(true);
                }}
                onFocus={() => setIsMemberListOpen(true)}
                onBlur={() => setIsMemberListOpen(false)}
                placeholder="SEARCH MEMBERS"
                className="w-full min-w-0 bg-transparent text-xs outline-none placeholder:text-(--fb-v2-text-subtle)"
              />
              <button
                type="button"
                aria-label={isMemberListOpen ? "Hide members" : "Show members"}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => setIsMemberListOpen((open) => !open)}
              >
                <ChevronDown size={14} />
              </button>
            </div>

            {isMemberListOpen && (
              <ul
                id="project-member-options"
                role="listbox"
                aria-label="Members"
                className="fb-v2-tile absolute inset-x-0 top-full z-10 mt-1 max-h-40 overflow-y-auto py-1 text-[11px] shadow-lg"
              >
                {memberOptions.length > 0 ? (
                  memberOptions.map((member) => (
                    <li
                      key={member}
                      role="option"
                      aria-selected={false}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => addMember(member)}
                      className="cursor-pointer px-3 py-1.5 hover:bg-(--fb-v2-surface-raised)"
                    >
                      {member}
                    </li>
                  ))
                ) : (
                  <li className="px-3 py-1.5 text-(--fb-v2-text-muted)">No members found</li>
                )}
              </ul>
            )}
          </div>

          {selectedMembers.length > 0 && (
            <ul aria-label="Selected members" className="mt-2 flex flex-wrap gap-1.5">
              {selectedMembers.map((member) => (
                <li
                  key={member}
                  className="flex items-center gap-1 rounded-full border border-(--fb-v2-border) py-0.5 pl-2.5 pr-1 text-[10px]"
                >
                  {member}
                  <button
                    type="button"
                    aria-label={`Remove ${member}`}
                    onClick={() => removeMember(member)}
                    className="rounded-full p-0.5 hover:bg-(--fb-v2-surface-raised)"
                  >
                    <X size={10} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-between gap-3">
        <Link
          href={PROJECTS_PATH}
          className="fb-v2-btn-ghost fb-v2-outlined w-40 whitespace-nowrap text-center"
        >
          CANCEL
        </Link>
        <button type="submit" className="fb-v2-btn-primary w-40 whitespace-nowrap">
          CREATE PROJECT
        </button>
      </div>
    </form>
  );
}
