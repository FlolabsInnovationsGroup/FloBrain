export type V2NavItem = {
  label: string;
  href: string;
};

export const MAIN_NAV_ITEMS: readonly V2NavItem[] = [
  { label: "TASKS", href: "/tasks" },
  { label: "DOCS", href: "/docs" },
  { label: "CALENDAR", href: "/calendar" },
  { label: "CHATS", href: "/chats" },
  { label: "TIME", href: "/time" },
  { label: "VAULT", href: "/vault" },
  { label: "LEADERSHIP", href: "/leadership/dashboard" },
];


export const LEADERSHIP_NAV_ITEMS: readonly V2NavItem[] = [
  { label: "DASHBOARD", href: "/leadership/dashboard" },
  { label: "INTERNS", href: "/leadership/interns" },
  { label: "TEAMS", href: "/leadership/teams" },
  { label: "PROJECTS", href: "/leadership/projects" },
  { label: "TASKS", href: "/leadership/tasks" },
  { label: "SCORECARD", href: "/leadership/scorecard" },
  { label: "ACTIVITY LOGS", href: "/leadership/activity" },
];

export const CREATE_ACTION_ITEMS: readonly V2NavItem[] = [
  { label: "Create Team", href: "/leadership/teams/new" },
  { label: "Create Project", href: "/leadership/projects/new" },
  { label: "Create Task", href: "/leadership/tasks/new" },
];


export function isPathActive(href: string, pathname: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function isMainNavActive(href: string, pathname: string): boolean {
  // Leadership entry is /leadership/dashboard, but the whole section stays selected.
  if (href === "/leadership/dashboard") return isLeadershipSection(pathname);
  return isPathActive(href, pathname);
}

/** Dashboard is only its own route, so nested pages do not keep it selected. */
export function isLeadershipNavActive(href: string, pathname: string): boolean {
  if (href === "/leadership/dashboard") return pathname === "/leadership/dashboard";
  return isPathActive(href, pathname);
}

export function isLeadershipSection(pathname: string): boolean {
  return isPathActive("/leadership", pathname);
}

/** True for any route that uses the FloBrain V2 shell (no V1 navbar/footer). */
export function isV2ShellRoute(pathname: string): boolean {
  if (isLeadershipSection(pathname)) return true;
  return MAIN_NAV_ITEMS.some((item) => isPathActive(item.href, pathname));
}

/** Dashboard, View Teams, and View Interns show the leadership search field. */
export function showLeadershipSearch(pathname: string): boolean {
  return (
    pathname === "/leadership/dashboard" ||
    pathname === "/leadership/teams" ||
    pathname === "/leadership/interns"
  );
}
