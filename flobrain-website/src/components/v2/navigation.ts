export type V2NavItem = {
  label: string;
  href: string;
};

export const MAIN_NAV_ITEMS: readonly V2NavItem[] = [
  { label: "My TASKS", href: "/my-tasks" },
  { label: "My DOCS", href: "/my-docs" },
  { label: "My CALENDAR", href: "/my-calendar" },
  { label: "My CHATS", href: "/my-chats" },
  { label: "My TIME", href: "/my-time" },
  { label: "My VAULT", href: "/my-vault" },
  { label: "LEADERSHIP", href: "/leadership" },
];

export const LEADERSHIP_NAV_ITEMS: readonly V2NavItem[] = [
  { label: "DASHBOARD", href: "/leadership" },
  { label: "INTERNS", href: "/leadership/interns" },
  { label: "TEAMS", href: "/leadership/teams" },
  { label: "PROJECT", href: "/leadership/projects" },
  { label: "TASKS", href: "/leadership/tasks" },
  { label: "SCORECARD", href: "/leadership/scorecard" },
  { label: "ACTIVITY LOGS", href: "/leadership/activity" },
];

export function isPathActive(href: string, pathname: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function isMainNavActive(href: string, pathname: string): boolean {
  return isPathActive(href, pathname);
}

/** Dashboard is only the leadership index, so nested pages do not keep it selected. */
export function isLeadershipNavActive(href: string, pathname: string): boolean {
  if (href === "/leadership") return pathname === "/leadership";
  return isPathActive(href, pathname);
}

export function isLeadershipSection(pathname: string): boolean {
  return isPathActive("/leadership", pathname);
}
