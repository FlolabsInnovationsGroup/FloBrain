---
name: flobrain-v2-ui
description: FloBrain V2 UI implementation skill. Load this before building or editing any screen in the V2 Lead Controls module (Teams, Projects, Tasks, Interns, Activity Logs). Covers design tokens, component patterns, theming rules, layout structure, and a step-by-step build checklist.
---

# FloBrain V2 UI — Implementation Skill

Load this skill before writing any component for the V2 UI. It contains the design rules, token system, component patterns, and checklist that all contributors must follow for consistency.

---

## 1. What We Are Building — V2 Screen Inventory

The V2 "Lead Controls" module adds a project/team management layer to FloBrain. The following screens must be implemented, in this order of priority:

| Screen | Route (suggested) | Type |
|---|---|---|
| Dashboard Overview | `/dashboard` | Overview cards + metrics |
| View Teams | `/teams` | Data table + status badges |
| View Teams Detail | `/teams/[id]` | Detail panel + member list |
| Create Team | `/teams/new` | Form |
| View Interns | `/interns` | Data table + status |
| View Projects | `/projects` | Data table + status badges |
| Create Project | `/projects/new` | Form |
| View Tasks | `/tasks` | Data table + colored status |
| Create Task | `/tasks/new` | Form + rich fields |
| Task Details | `/tasks/[id]` | Detail panel |
| Time Activity Logs | `/activity` | Log table + filters |

Each screen follows the same **App Shell** layout (see Section 3).

---

## 2. Design System Foundation

### Fonts
- **Primary**: `Inter` (loaded via Google Fonts in `globals.css`)
- Fallback: `Inter, system-ui, -apple-system, sans-serif`
- Do not import additional fonts without updating `globals.css`.

### V2 Color Palette

The V2 module uses a **neutral dark theme** — distinct from the purple/violet palette of the V1 Brain and Memory screens. Do not apply V1 purple tokens to V2 screens.

**V2 Background Layers** (darkest → lightest):
| Role | Dark value | Token name |
|---|---|---|
| Page / app background | `#0d1117` | `--fb-v2-page-bg` |
| Sidebar background | `#13161d` | `--fb-v2-sidebar-bg` |
| Card / panel surface | `#1a1d24` | `--fb-v2-surface` |
| Elevated panel / modal | `#1f2330` | `--fb-v2-surface-raised` |
| Input / field background | `#252a36` | `--fb-v2-input-bg` |

**V2 Border colors:**
| Role | Dark value | Token name |
|---|---|---|
| Default border | `#2a2f3d` | `--fb-v2-border` |
| Subtle divider | `#1f2330` | `--fb-v2-divider` |
| Input border | `#363d52` | `--fb-v2-input-border` |
| Input focus ring | `#3b82f6` | `--fb-v2-focus-ring` |

**V2 Text:**
| Role | Dark value | Token name |
|---|---|---|
| Primary text | `#e2e8f0` | `--fb-v2-text` |
| Muted text / labels | `#94a3b8` | `--fb-v2-text-muted` |
| Subtle / placeholder | `#64748b` | `--fb-v2-text-subtle` |
| Heading | `#f8fafc` | `--fb-v2-heading` |

**V2 Accent — Blue (primary action):**
| Role | Dark value | Token name |
|---|---|---|
| Primary action / CTA | `#3b82f6` | `--fb-v2-accent` |
| Accent hover | `#2563eb` | `--fb-v2-accent-hover` |
| Accent subtle bg | `rgba(59,130,246,0.12)` | `--fb-v2-accent-subtle` |
| Active / selected | `#1d4ed8` | `--fb-v2-accent-active` |

**V2 Status colors:**
| Status | Dark value | Token name |
|---|---|---|
| Success / active | `#22c55e` | `--fb-v2-success` |
| Success subtle bg | `rgba(34,197,94,0.12)` | `--fb-v2-success-subtle` |
| Warning / pending | `#f59e0b` | `--fb-v2-warning` |
| Warning subtle bg | `rgba(245,158,11,0.12)` | `--fb-v2-warning-subtle` |
| Error / overdue | `#ef4444` | `--fb-v2-error` |
| Error subtle bg | `rgba(239,68,68,0.12)` | `--fb-v2-error-subtle` |
| Inactive / archived | `#64748b` | `--fb-v2-inactive` |

> ⚠️ **Exact hex values above are best-read from a small screenshot.** Verify each color against the Figma when the file has view access and update these tokens accordingly. The naming convention is final even if the exact values shift.

### Adding V2 Tokens to globals.css

Add all `--fb-v2-*` tokens to **both** the `.dark` and `.light` blocks in `src/app/globals.css`. V2 screens are dark-first; the light values should be visually appropriate light-mode equivalents (consult the lead engineer if the Figma has no light spec):

```css
/* Inside .dark { } in globals.css */
--fb-v2-page-bg: #0d1117;
--fb-v2-sidebar-bg: #13161d;
--fb-v2-surface: #1a1d24;
--fb-v2-surface-raised: #1f2330;
--fb-v2-input-bg: #252a36;
--fb-v2-border: #2a2f3d;
--fb-v2-divider: #1f2330;
--fb-v2-input-border: #363d52;
--fb-v2-focus-ring: #3b82f6;
--fb-v2-text: #e2e8f0;
--fb-v2-text-muted: #94a3b8;
--fb-v2-text-subtle: #64748b;
--fb-v2-heading: #f8fafc;
--fb-v2-accent: #3b82f6;
--fb-v2-accent-hover: #2563eb;
--fb-v2-accent-subtle: rgba(59,130,246,0.12);
--fb-v2-accent-active: #1d4ed8;
--fb-v2-success: #22c55e;
--fb-v2-success-subtle: rgba(34,197,94,0.12);
--fb-v2-warning: #f59e0b;
--fb-v2-warning-subtle: rgba(245,158,11,0.12);
--fb-v2-error: #ef4444;
--fb-v2-error-subtle: rgba(239,68,68,0.12);
--fb-v2-inactive: #64748b;

/* Inside .light { } in globals.css — fill with light-mode equivalents */
--fb-v2-page-bg: #f1f5f9;
--fb-v2-sidebar-bg: #e2e8f0;
--fb-v2-surface: #ffffff;
--fb-v2-surface-raised: #f8fafc;
--fb-v2-input-bg: #f8fafc;
/* ... continue for all tokens */
```

---

## 3. V2 App Shell Layout

Every V2 screen uses this layout:

```
┌─────────────────────────────────────────────────────┐
│  Top Navbar (shared — full width, ~56px tall)        │
├──────────┬──────────────────────────────────────────┤
│          │                                           │
│  Left    │  Main content area                        │
│ Sidebar  │  (scrollable, flex-col, gap-6)            │
│ (~220px) │                                           │
│          │                                           │
└──────────┴──────────────────────────────────────────┘
```

**Sidebar characteristics:**
- Width: `w-56` (224px) — fixed, not collapsible on desktop
- Background: `var(--fb-v2-sidebar-bg)`
- Border right: `1px solid var(--fb-v2-border)`
- Navigation items: full-width, `px-4 py-2.5`, left-aligned icon + label
- Active item: `bg-[var(--fb-v2-accent-subtle)] text-[var(--fb-v2-accent)]`
- Inactive item: `text-[var(--fb-v2-text-muted)] hover:text-[var(--fb-v2-text)]`
- Icon size: `16px` (Lucide, `size={16}`)

**Main content area:**
- Padding: `p-6` on desktop, `p-4` on mobile
- Max width: none (full width of the content column)
- Background: `var(--fb-v2-page-bg)`

**Semantic CSS class to add to globals.css:**
```css
.fb-v2-shell {
  background: var(--fb-v2-page-bg);
  color: var(--fb-v2-text);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.fb-v2-sidebar {
  background: var(--fb-v2-sidebar-bg);
  border-right: 1px solid var(--fb-v2-border);
  width: 14rem;
  flex-shrink: 0;
}
.fb-v2-content {
  flex: 1;
  background: var(--fb-v2-page-bg);
  padding: 1.5rem;
}
.fb-v2-card {
  background: var(--fb-v2-surface);
  border: 1px solid var(--fb-v2-border);
  border-radius: 0.5rem;
  padding: 1.25rem 1.5rem;
}
.fb-v2-table-row {
  border-bottom: 1px solid var(--fb-v2-divider);
}
.fb-v2-table-row:hover {
  background: var(--fb-v2-surface-raised);
}
```

---

## 4. V2 Component Patterns

### Page Header
Every V2 screen starts with a page header row:
```tsx
<div className="flex items-center justify-between mb-6">
  <h1 className="text-xl font-semibold text-[var(--fb-v2-heading)]">
    View Teams
  </h1>
  <button className="fb-v2-btn-primary">
    + Create Team
  </button>
</div>
```

### Data Table
The primary view pattern for list screens (view teams, view projects, view tasks, view interns):
```tsx
<div className="fb-v2-card overflow-hidden p-0">
  {/* Table header */}
  <div className="grid grid-cols-[...] px-4 py-3 border-b border-[var(--fb-v2-border)]
                  text-xs font-medium text-[var(--fb-v2-text-muted)] uppercase tracking-wide">
    <span>Name</span>
    <span>Status</span>
    <span>Members</span>
    <span>Created</span>
  </div>
  {/* Table rows */}
  {items.map(item => (
    <div key={item.id}
         className="fb-v2-table-row grid grid-cols-[...] px-4 py-3 cursor-pointer">
      ...
    </div>
  ))}
</div>
```

### Status Badge
Used for task status, project status, member role, etc.:
```tsx
type StatusVariant = 'active' | 'pending' | 'overdue' | 'inactive' | 'completed';

const badgeClasses: Record<StatusVariant, string> = {
  active:    'bg-[var(--fb-v2-success-subtle)] text-[var(--fb-v2-success)]',
  completed: 'bg-[var(--fb-v2-success-subtle)] text-[var(--fb-v2-success)]',
  pending:   'bg-[var(--fb-v2-warning-subtle)] text-[var(--fb-v2-warning)]',
  overdue:   'bg-[var(--fb-v2-error-subtle)]   text-[var(--fb-v2-error)]',
  inactive:  'bg-[var(--fb-v2-accent-subtle)]  text-[var(--fb-v2-inactive)]',
};

<span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${badgeClasses[status]}`}>
  {status}
</span>
```

### Form Layout (Create screens)
All create screens (create team, create project, create task) use a centered single-column form card:
```tsx
<div className="max-w-2xl mx-auto">
  <div className="fb-v2-card space-y-5">
    <h2 className="text-lg font-semibold text-[var(--fb-v2-heading)]">
      Create Team
    </h2>
    <div className="space-y-1.5">
      <label className="fb-v2-label">Team Name</label>
      <input className="fb-v2-input" placeholder="Enter team name" />
    </div>
    <div className="flex justify-end gap-3 pt-2">
      <button className="fb-v2-btn-ghost">Cancel</button>
      <button className="fb-v2-btn-primary">Create Team</button>
    </div>
  </div>
</div>
```

### Detail Panel (Task Details / Teams Detail)
```tsx
<div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
  {/* Main detail */}
  <div className="fb-v2-card space-y-4">...</div>
  {/* Side metadata panel */}
  <div className="fb-v2-card space-y-4 h-fit">
    <div className="space-y-3">
      <p className="text-xs text-[var(--fb-v2-text-muted)] uppercase tracking-wide">
        Assignee
      </p>
      <p className="text-sm text-[var(--fb-v2-text)]">...</p>
    </div>
  </div>
</div>
```

### Interactive Button Classes (add to globals.css)
```css
.fb-v2-btn-primary {
  background: var(--fb-v2-accent);
  color: #fff;
  border-radius: 0.375rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background 0.15s;
}
.fb-v2-btn-primary:hover { background: var(--fb-v2-accent-hover); }

.fb-v2-btn-ghost {
  background: transparent;
  color: var(--fb-v2-text-muted);
  border: 1px solid var(--fb-v2-border);
  border-radius: 0.375rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background 0.15s, color 0.15s;
}
.fb-v2-btn-ghost:hover {
  background: var(--fb-v2-surface-raised);
  color: var(--fb-v2-text);
}

.fb-v2-input {
  background: var(--fb-v2-input-bg);
  border: 1px solid var(--fb-v2-input-border);
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: var(--fb-v2-text);
  width: 100%;
  transition: border-color 0.15s;
}
.fb-v2-input:focus {
  outline: none;
  border-color: var(--fb-v2-focus-ring);
  box-shadow: 0 0 0 3px var(--fb-v2-accent-subtle);
}
.fb-v2-input::placeholder { color: var(--fb-v2-text-subtle); }

.fb-v2-label {
  display: block;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--fb-v2-text-muted);
}
```

---

## 5. V2 Screen-Specific Notes

### Dashboard Overview
- Grid of metric cards (2 or 3 columns on desktop, 1 on mobile)
- Each card: `fb-v2-card`, metric value in large text, label below, optional trend badge
- No chart required in V1 of this screen unless the Figma shows one

### View Teams / View Teams Detail
- Table view with columns: Team Name, Members count, Status, Created date, Actions
- Row click → navigate to `/teams/[id]`
- Team detail shows member list as a sub-table with role badges (intern, lead, manager)
- Progress bar for team capacity (green fill = `var(--fb-v2-success)`)

### View Projects / Create Project
- Table: Project name, Team, Status (active/pending/completed), Due date, Actions
- Create form: name, team selector, description textarea, due date picker, priority selector

### View Tasks / Create Task / Task Details
- Table: Task name, Assigned intern, Project, Status (active/pending/overdue/completed), Due date
- Create task: name, project, assignee, description, due date, priority — red accent visible in Figma for high-priority tasks
- Task detail: 2-column layout (description left, metadata right)

### View Interns
- Table: Name, Email, Team, Active tasks count, Status
- No create screen in this module — interns are created through the auth/user system

### Time Activity Logs
- Log table: Actor, Action, Target (team/project/task name), Timestamp
- Filterable by date range and actor
- Read-only, no create action

---

## 6. Component Architecture Rules

### File Structure for V2
```
src/app/(app)/
  teams/
    page.tsx                   ← view teams
    [id]/
      page.tsx                 ← team detail
    new/
      page.tsx                 ← create team
    components/
      TeamTable/index.tsx
      TeamDetailPanel/index.tsx
  projects/
    page.tsx
    new/page.tsx
    components/
      ProjectTable/index.tsx
  tasks/
    page.tsx
    [id]/page.tsx
    new/page.tsx
    components/
      TaskTable/index.tsx
      TaskStatusBadge/index.tsx
      TaskDetailPanel/index.tsx
  interns/
    page.tsx
    components/
      InternTable/index.tsx
  activity/
    page.tsx
    components/
      ActivityLog/index.tsx
```

### Shared V2 Components (add to `src/components/v2/`)
- `StatusBadge.tsx` — the multi-variant badge (active/pending/overdue/inactive)
- `DataTable.tsx` — generic table wrapper (header + row slot)
- `PageHeader.tsx` — title + optional action button row
- `MetricCard.tsx` — dashboard card with value + label

### Server vs Client
- Page files (`page.tsx`) are Server Components — they fetch data and pass it down
- Table components are Client Components only if they need interactive sorting/filtering
- Form components (`CreateTeamForm`, `CreateTaskForm`) are Client Components

---

## 7. Data Fetching for V2

All V2 data hits new API endpoints. Add these to `src/lib/api.ts` when implementing each screen:

```ts
// Teams
api.getTeams()              → GET /api/teams/
api.getTeam(id)             → GET /api/teams/:id/
api.createTeam(payload)     → POST /api/teams/
api.updateTeam(id, payload) → PATCH /api/teams/:id/

// Projects
api.getProjects()           → GET /api/projects/
api.createProject(payload)  → POST /api/projects/

// Tasks
api.getTasks()              → GET /api/tasks/
api.getTask(id)             → GET /api/tasks/:id/
api.createTask(payload)     → POST /api/tasks/
api.updateTask(id, payload) → PATCH /api/tasks/:id/

// Interns
api.getInterns()            → GET /api/interns/

// Activity
api.getActivityLogs()       → GET /api/activity/
```

> These endpoints need to be implemented on the Django backend. Coordinate with the backend team before building the frontend data layer.

---

## 8. General Styling Rules

### Tailwind + CSS Token Split
| Use Tailwind for | Use `--fb-v2-*` tokens for |
|---|---|
| Spacing (`p-4`, `gap-3`, `m-2`) | All background colors |
| Grid / Flex layout | All text colors |
| Border radius (`rounded-lg`) | All border colors |
| Font size, weight, line-height | All button colors |
| Responsive breakpoints | Status badge colors |
| `animate-pulse` skeletons | Input focus ring |

### Responsive Rules
- Sidebar collapses to hamburger menu on `md:` and below
- Tables become scrollable horizontally on mobile (`overflow-x-auto` wrapper)
- Forms go single-column on mobile, centered max-width card on desktop
- Dashboard cards: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`

### Icons
```tsx
import { Users, FolderKanban, CheckSquare, Clock, LayoutDashboard, ChevronRight } from 'lucide-react';
// Sidebar nav icons: size={16}
// Action icons in tables: size={14}
// Page header icons (if used): size={18}
```

---

## 9. V2 Build Checklist

Run through this for every V2 screen before marking it done:

- [ ] Loaded this skill before starting
- [ ] All colors use `--fb-v2-*` tokens — no hardcoded hex, no V1 `--fb-brain-*` tokens
- [ ] All `--fb-v2-*` tokens used on this screen exist in BOTH `.light` and `.dark` in `globals.css`
- [ ] Page layout follows the App Shell (sidebar + content area)
- [ ] Status badges use the shared `StatusBadge` component with correct variant
- [ ] Tables have hover state and bottom border on rows
- [ ] Forms use `.fb-v2-input` and `.fb-v2-label` classes
- [ ] Buttons use `.fb-v2-btn-primary` or `.fb-v2-btn-ghost` — no inline button styles
- [ ] `"use client"` added only to components that actually need interactivity
- [ ] Data fetched with `useQuery` — not `useEffect + fetch`
- [ ] Loading state: skeleton rows (use `animate-pulse` with `bg-[var(--fb-v2-surface-raised)]`)
- [ ] Error state: shared `ErrorState` component
- [ ] Empty state: shared `EmptyState` component (no data message)
- [ ] Layout works at 375px mobile (table has `overflow-x-auto` wrapper)
- [ ] Layout works in both dark and light themes
- [ ] All inputs have visible focus ring (`focus-visible:ring` or `.fb-v2-input` class)
- [ ] No `console.log` in the final code
- [ ] TypeScript types defined for all API response shapes — no `any`
- [ ] Screen added to the V2 sidebar navigation

---

## 10. What Not To Do

- **Don't** apply V1 purple/violet tokens (`--fb-brain-*`, `--fb-memory-*`) to V2 screens
- **Don't** hardcode hex values in component files — add a `--fb-v2-*` token instead
- **Don't** build a custom status badge per screen — use the shared `StatusBadge` component
- **Don't** use `z-index` above `50` without checking existing layers
- **Don't** create a new loading spinner — use `animate-pulse` skeleton rows
- **Don't** import Lucide with `import * as` — use named imports
- **Don't** put API endpoint strings inside components — all calls go through `src/lib/api.ts`
- **Don't** use `useEffect + fetch` for data — use TanStack Query `useQuery`

---

## 11. Existing Design System (V1 — Do Not Mix Into V2 Screens)

The existing `--fb-brain-*`, `--fb-memory-*`, `--fb-dashboard-*` tokens and `.fb-brain-shell`, `.fb-memory-panel` utility classes remain for V1 pages (Brain chat, Memory graph, etc.). V2 Lead Controls screens use only `--fb-v2-*` tokens and `.fb-v2-*` utility classes. The two systems must not cross.

| V1 pages (purple theme) | V2 pages (neutral dark + blue) |
|---|---|
| Brain (chat) | Dashboard Overview |
| Memory | Teams, Team Detail |
| Home / Pricing / Auth | Projects, Tasks, Task Detail |
| Profile / Settings | Interns, Activity Logs |
