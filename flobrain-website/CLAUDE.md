# FloBrain Website — Claude Project Context

## Project Overview
FloBrain is an AI-powered application. The frontend is a Next.js 15 app (App Router) with React 19, TypeScript, Tailwind CSS v4, and `next-themes` for light/dark theming.

## Stack at a Glance
| Concern | Tool |
|---|---|
| Framework | Next.js 15 App Router |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + CSS custom properties (`--fb-*`) |
| Theming | `next-themes` — sets `.light` / `.dark` on `<html>` |
| Data fetching | TanStack Query v5 via `src/lib/axios.ts` + `src/lib/api.ts` |
| Icons | `lucide-react` (primary), `react-icons` (secondary) |
| Animation | `framer-motion` + `tw-animate-css` |
| Accessible primitives | Radix UI (`@radix-ui/react-dialog`, `react-label`, `react-slot`) |
| Charts | Recharts |
| Force graph | `react-force-graph-2d` |
| Type checking | `tsc` (no `any` without justification) |
| Tests | Vitest + Testing Library |

## Directory Structure
```
src/
  app/
    (app)/          # Authenticated app routes (brain, memory, dashboard, profile…)
    home/           # Marketing landing page
    pricing/
    signin/ register/ forgot-password/
    globals.css     # ALL design tokens live here
  components/
    layout/         # Shared layout pieces (Navbar, Footer, AppChrome, ThemeToggle)
    states/         # EmptyState, NotConnectedState, NoPermissionState, NoDataState
    auth/           # Auth modals
    errors/         # ErrorBoundary
  lib/
    api.ts          # Typed API client (api.sendMessage, api.login, …)
    axios.ts        # Axios instance + base URL helper
    memory-visual.ts
  types/
    chat.ts         # Message, ChatHistory, Folder
    MemoryNodes.d.ts
```

## Key Rules for All Contributors

### 1. Never add inline color values
All colors must come from the `--fb-*` CSS custom property system defined in `src/app/globals.css`. Never hardcode hex values directly in component files. If a new token is needed, add it to `globals.css` in both `.light` and `.dark` blocks.

### 2. Use the semantic CSS utility classes
A set of semantic classes is defined in `globals.css` (e.g. `.fb-brain-shell`, `.fb-memory-panel`, `.fb-dashboard-card`). Use these on structural elements instead of repeating token references inline. If a class doesn't exist for a new page section, add it to `globals.css`.

### 3. `"use client"` only when necessary
Server Components are the default. Add `"use client"` only when the component uses browser APIs, React hooks with interactivity, or event listeners. Data-fetching components that only display static data do not need it.

### 4. Theme-aware styling via `.light` / `.dark` Tailwind variants
The custom Tailwind variants `dark:` and `light:` are available (defined via `@custom-variant`). Use them to override specific values when the CSS token system is not enough. Prefer token overrides in `globals.css` over inline `dark:`/`light:` variants — tokens keep the theme logic in one place.

### 5. TanStack Query for all server data
Use `useQuery` / `useMutation` from `@tanstack/react-query` for all API calls inside components. Never `useEffect` + `fetch`. The query client is set up in the root layout.

### 6. Naming conventions
- Page files: `page.tsx` (Next.js convention)
- Component folders: `src/app/(app)/brain/components/ComponentName/index.tsx`
- Shared components: `src/components/category/ComponentName.tsx`
- CSS token names follow `--fb-{page}-{role}` (e.g. `--fb-brain-btn`, `--fb-memory-accent`)
- Utility class names follow `.fb-{page}-{role}` (e.g. `.fb-brain-shell`, `.fb-memory-panel`)

### 7. V2 UI implementation
When implementing screens from the V2 Figma, load the **`flobrain-v2-ui`** skill before writing any component. It contains V2-specific design tokens, spacing rules, component patterns, and a step-by-step build checklist.

```
/flobrain-v2-ui
```
