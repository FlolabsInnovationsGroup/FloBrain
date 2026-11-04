"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import SidePanelsLayout from "@/components/layout/sidePanels";

type NavItem = {
  label: string;
  /** Route for the item; items without one are not built yet */
  href?: string;
};

const topNavigation = [
  "MY TASKS",
  "MY DOCS",
  "MY CALENDAR",
  "MY CHATS",
  "MY TIME",
  "MY VAULT",
  "LEADERSHIP",
];

const leadershipNavigation: NavItem[] = [
  { label: "DASHBOARD" },
  { label: "INTERNS", href: "/interns" },
  { label: "TEAMS" },
  { label: "PROJECTS", href: "/projects" },
  { label: "TASKS" },
  { label: "SCORECARD" },
  { label: "ACTIVITY LOGS", href: "/activity-logs" },
];

const createActions: NavItem[] = [
  { label: "Create Team" },
  { label: "Create Project", href: "/projects/new" },
  { label: "Create Task" },
];

/** True for the route itself and anything nested under it, e.g. /projects/new under /projects */
function matchesRoute(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

type LeadershipShellProps = {
  children: ReactNode;
  /** Extra controls shown at the right end of the create-actions bar, e.g. a search box */
  toolbar?: ReactNode;
};

/** Side panels, workspace nav, Leadership tabs and create actions shared by every Leadership page. */
export default function LeadershipShell({ children, toolbar }: LeadershipShellProps) {
  const pathname = usePathname() ?? "";
  // Create actions point at nested routes, so match them exactly and let tabs match by prefix
  const activeAction = createActions.find(({ href }) => href === pathname);

  return (
    <SidePanelsLayout>
      <nav
        aria-label="Workspace"
        className="flex shrink-0 items-center justify-between gap-4 overflow-x-auto px-2 pb-2"
      >
        {topNavigation.map((item) => (
          <button
            key={item}
            type="button"
            aria-current={item === "LEADERSHIP" ? "page" : undefined}
            className={`shrink-0 whitespace-nowrap pb-0.5 font-medium ${
              item === "LEADERSHIP"
                ? "fb-lead-tab-active text-sm font-bold sm:text-base"
                : "fb-lead-link-hover text-xs sm:text-[13px]"
            }`}
          >
            {item}
          </button>
        ))}
      </nav>

      <section className="fb-lead-surface flex min-h-0 flex-1 flex-col overflow-hidden rounded-md">
        <nav
          aria-label="Leadership"
          className="flex shrink-0 items-center justify-between gap-2 overflow-x-auto px-8 pb-3 pt-1"
        >
          {leadershipNavigation.map(({ label, href }) => {
            const isActive = href !== undefined && matchesRoute(pathname, href);
            const className = `shrink-0 whitespace-nowrap pb-0.5 pt-2 text-[11px] sm:text-xs ${
              isActive ? "fb-lead-tab-active font-bold" : "fb-lead-link-hover"
            }`;

            return href ? (
              <Link
                key={label}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={className}
              >
                {label}
              </Link>
            ) : (
              <button key={label} type="button" className={className}>
                {label}
              </button>
            );
          })}
        </nav>

        <div className="fb-lead-card-divider mb-2 flex shrink-0 flex-wrap items-center gap-3 border-y px-8 py-3">
          <div className="flex flex-wrap gap-3">
            {createActions.map((action) => {
              const isActive = action === activeAction;
              const className = `fb-lead-btn-primary rounded-sm px-3 py-1.5 text-xs font-medium ${
                isActive ? "fb-lead-btn-pressed" : ""
              }`;

              return action.href ? (
                <Link
                  key={action.label}
                  href={action.href}
                  aria-current={isActive ? "page" : undefined}
                  className={className}
                >
                  {action.label}
                </Link>
              ) : (
                <button key={action.label} type="button" className={className}>
                  {action.label}
                </button>
              );
            })}
          </div>

          {toolbar}
        </div>

        {children}
      </section>
    </SidePanelsLayout>
  );
}
