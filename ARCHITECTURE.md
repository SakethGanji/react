# React Dashboard Architecture

Multiple production UI apps and POC experiments in one repo.

---

## Directory Structure

```
src/
├── main.tsx                         # Entry point (QueryClient, global error handler)
├── App.tsx                          # Router setup
├── routeTree.gen.tsx                # Route tree (auto-generated from registries)
│
├── config/
│   └── backends.ts                  # Environment-based backend URL config
│
├── shared/
│   ├── components/
│   │   ├── AppSwitcher.tsx          # Dropdown to switch between apps
│   │   ├── AppNavigation.tsx        # Per-app nav links (reads from APP_REGISTRY)
│   │   ├── ErrorBoundary.tsx
│   │   ├── NotFound.tsx
│   │   └── index.ts
│   ├── charts/                      # ECharts components (Line, Bar, Area, Pie, StackedBar)
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── themes/
│   │   ├── types.ts
│   │   └── index.ts
│   ├── store/
│   │   ├── useUIStore.ts            # Theme, sidebar state
│   │   ├── useAlertStore.ts         # Toast notifications (success/error/warning/info)
│   │   └── index.ts
│   └── auth/
│       ├── AuthGuard.tsx
│       ├── authService.ts
│       ├── config.ts
│       └── index.ts
│
├── apps/
│   ├── index.ts                     # APP_REGISTRY (drives routes, nav, lazy loading)
│   └── guardrails/
│       ├── index.ts                 # Public exports (types, hooks)
│       ├── pages/
│       │   ├── Dashboard.tsx
│       │   └── Settings.tsx
│       ├── components/
│       │   ├── MetricCard.tsx
│       │   ├── EChartsChart.tsx
│       │   ├── EChartsPieChart.tsx
│       │   ├── FilterBar.tsx
│       │   ├── DataTable.tsx
│       │   ├── AlertContainer.tsx
│       │   ├── ConversationModal.tsx
│       │   ├── Skeletons.tsx
│       │   └── index.ts
│       ├── hooks.ts
│       ├── services.ts
│       ├── store.ts                 # App-specific Zustand store (filters)
│       ├── errors.ts
│       └── types.ts
│
├── poc/
│   ├── index.ts                     # POC_REGISTRY
│   ├── PocGallery.tsx               # Gallery at /gallery
│   └── chart-experiments/
│       └── index.tsx
│
└── routes/
    ├── __root.tsx                   # Root layout (ErrorBoundary)
    ├── _app.tsx                     # App layout (header, nav, auth)
    └── _poc.tsx                     # POC layout (dev only, minimal header)
```

Routes are **not** file-based. They are dynamically generated from `APP_REGISTRY` and `POC_REGISTRY` in `routeTree.gen.tsx`.

---

## Import Rules

```
config/     ← Anyone can import
shared/     ← apps/ and poc/ can import
apps/       ← Only routeTree.gen.tsx can import (no cross-app imports)
poc/        ← Only routeTree.gen.tsx can import (no app imports)
```

Apps and POCs are isolated from each other. Both can use shared code. The route tree file is the only place that wires registries to layouts.

---

## Styling Strategy: Wrap and Fill

If your company has a design system / component library, **do not use Shadcn UI alongside it**. Having `CompanyButton` (blue, rounded) and `ShadcnButton` (black, slightly rounded) in the same app looks unprofessional and confuses developers.

Instead, `shared/components` becomes an **abstraction layer**:

- **Primary Source:** Use the Company Library for everything it offers (Buttons, Inputs, Typography).
- **Gap Filling:** If the Company Library is missing a complex component (e.g., Combobox, Sheet), build it using a Headless UI library (Radix UI or React Aria) and style it to match the Company Library.

### Shared Components Structure

```
src/shared/components/
├── core/                   # 1. WRAPPERS around Company Library
│   ├── Button.tsx          # Re-exports or wraps CompanyButton
│   ├── Input.tsx
│   ├── Typography.tsx
│   └── ...
│
├── extended/               # 2. GAP FILLERS (custom built to match)
│   ├── DatePicker.tsx      # Company didn't have one, so we built it
│   ├── MultiSelect.tsx     # Built using Headless UI + Company styles
│   └── DataTable.tsx       # TanStack Table + Company styles
│
├── patterns/               # 3. APP PATTERNS (composition)
│   ├── FilterBar.tsx       # Input + DatePicker + Button
│   ├── UserMenu.tsx        # Avatar + Dropdown
│   └── PageLayout.tsx
│
└── index.ts                # Single entry point
```

### Scenario A: Complete Company Library

It has Buttons, Modals, Dropdowns, Grids, etc.

**Action:** Do not install Shadcn. Use the company library. Create wrappers in `shared/components/core` so your apps don't depend directly on the npm package name.

```typescript
// src/shared/components/core/Button.tsx
import { CompanyButton } from '@acme/design-system'

// Wrap it so if the company lib changes later, we only fix it here.
export const Button = CompanyButton
```

### Scenario B: Basic Company Library (Most Common)

It has Buttons and Inputs, but lacks complex interactive components like Dialogs, Popovers, or Data Tables.

**Action:** Use Radix UI (the headless logic behind Shadcn) directly. Do not use Shadcn (which comes pre-styled with Tailwind).

```typescript
// src/shared/components/extended/Modal.tsx
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Button } from '../core/Button' // Your wrapped company button

export function Modal({ isOpen, onClose, title, children }) {
  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onClose}>
      <DialogPrimitive.Overlay className="company-overlay-class" />
      <DialogPrimitive.Content className="company-card-class">
        <DialogPrimitive.Title className="company-h2-class">
          {title}
        </DialogPrimitive.Title>
        <div className="company-body-text">
          {children}
        </div>
        <div className="company-footer-class">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Root>
  )
}
```

### Styling Rules for Apps vs POCs

- **Production Apps:** MUST import from `@/shared/components`. This ensures they stay on-brand.
- **POCs:**
  - **Ideally:** Use `@/shared/components` to validate the design system works for the new feature.
  - **Allowed:** If a POC needs a specialized component the company lib doesn't have, it can install a POC-specific package.
  - **Rule:** If that POC gets promoted to Production, you must rebuild the component in `shared/components/extended` to match company styles.

### Styling Checklist

- Keep the `shared/components` folder. It is vital for isolation.
- Do not use Shadcn (pre-styled components) alongside a company library.
- Do use Radix UI / React Aria (headless libraries) to build complex components the company library is missing.
- Wrap everything. Even if you just re-export the company button, do it in `shared/components`. It protects your code from breaking changes in company library updates.

---

## Multi-App System

Each app is a **separate UI product** that lives under its own URL prefix. Apps share common infrastructure (auth, components, charts) but are otherwise independent.

### App Registry

The registry is the single source of truth for apps. It drives:
- Route creation (automatic, no manual route files needed)
- App switcher navigation
- Per-app nav bar links
- Lazy loading (each page is a separate chunk)

```typescript
// src/apps/index.ts
export interface AppRoute {
  path: string           // Subpath relative to basePath, e.g. 'dashboard'
  label: string          // Navigation label
  component: ComponentType // Lazy-loaded page component
}

export interface AppEntry {
  id: string
  name: string
  description: string
  basePath: string       // URL prefix, e.g. '/guardrails'
  defaultRoute: string   // Redirect target, e.g. '/guardrails/dashboard'
  routes: AppRoute[]     // All pages for this app
}

export const APP_REGISTRY: AppEntry[] = [
  {
    id: 'guardrails',
    name: 'Guardrails',
    description: 'Guardrail monitoring and configuration dashboard',
    basePath: '/guardrails',
    defaultRoute: '/guardrails/dashboard',
    routes: [
      {
        path: 'dashboard',
        label: 'Dashboard',
        component: lazy(() => import('./guardrails/pages/Dashboard').then(m => ({ default: m.Dashboard }))),
      },
      {
        path: 'settings',
        label: 'Settings',
        component: lazy(() => import('./guardrails/pages/Settings').then(m => ({ default: m.Settings }))),
      },
    ],
  },
]
```

Routes are auto-generated from this registry in `routeTree.gen.tsx`. No manual route files needed — adding an entry here creates the route, the nav link, and the lazy-loaded chunk automatically.

### Adding a New App

1. **Create app folder**

```
src/apps/my-app/
├── index.ts              # Public exports (types, hooks)
├── pages/
│   ├── Home.tsx
│   ├── Settings.tsx
│   └── Details.tsx
├── components/
├── hooks.ts
└── types.ts
```

2. **Register the app** — this is the only step that creates routes and navigation

```typescript
// src/apps/index.ts
export const APP_REGISTRY: AppEntry[] = [
  // ... existing apps
  {
    id: 'my-app',
    name: 'My App',
    description: 'What this app does',
    basePath: '/my-app',
    defaultRoute: '/my-app/home',
    routes: [
      {
        path: 'home',
        label: 'Home',
        component: lazy(() => import('./my-app/pages/Home').then(m => ({ default: m.Home }))),
      },
      {
        path: 'settings',
        label: 'Settings',
        component: lazy(() => import('./my-app/pages/Settings').then(m => ({ default: m.Settings }))),
      },
    ],
  },
]
```

That's it. The app automatically gets:
- Routes at `/my-app/home`, `/my-app/settings`
- A redirect from `/my-app` to `/my-app/home`
- An entry in the app switcher
- Nav links in the app nav bar
- Lazy-loaded page chunks

---

## POC System

POCs allow experimentation without affecting production code. They're excluded from prod builds.

### Full Flexibility

Each POC is fully self-contained. You can use:

- **Any styling** — Tailwind, shadcn, internal library, CSS modules, or mix them
- **Any backend** — Python API, Node API, mock data, different endpoints
- **Any layout** — Custom headers, sidebars, full-screen, whatever you need
- **Any routing** — Single page or multiple sub-routes
- **Any state management** — Zustand, Redux, React Query, local state
- **Any auth** — Use `AuthGuard` from shared, or roll your own
- **Any dependencies** — Add POC-specific packages as needed

No auto-wrappers or magic. You control everything inside your POC.

### Registry

```typescript
// src/poc/index.ts
import { ComponentType, lazy } from 'react'

export interface POCEntry {
  id: string
  name: string
  description: string
  path: string           // Top-level route path, e.g. '/chart-experiments'
  tags: string[]
  component: ComponentType // React.lazy component
}

// Entries are wrapped in import.meta.env.DEV so that the lazy import()
// calls become dead code in production — Vite tree-shakes them entirely.
export const POC_REGISTRY: POCEntry[] = import.meta.env.DEV
  ? [
      {
        id: 'chart-experiments',
        name: 'Chart Experiments',
        description: 'Experimental chart components and visualizations',
        path: '/chart-experiments',
        tags: ['charts', 'visualization', 'echarts'],
        component: lazy(() => import('./chart-experiments')),
      },
    ]
  : []
```

The registry is just metadata for the gallery. Each POC handles its own styling, layout, routing, and backend internally. POC code is excluded from production builds because the entire POC route tree is wrapped in `if (import.meta.env.DEV)` in `routeTree.gen.tsx` — Vite tree-shakes it away in production.

### POC Structure

```
poc/
└── my-poc/
    ├── index.tsx           # Entry point (default export)
    ├── Layout.tsx          # Custom layout (optional)
    └── components/
```

### Custom Layouts

POCs can define their own header/layout:

```typescript
// src/poc/my-poc/index.tsx
import { MyLayout } from './Layout'

export default function MyPoc() {
  return (
    <MyLayout>
      <Content />
    </MyLayout>
  )
}
```

### POC Sub-routes

POCs can have multiple pages using state-based navigation or the TanStack Router catch-all:

```
src/poc/rag-experiment/
├── index.tsx                   # Entry point with internal navigation
├── pages/
│   ├── Upload.tsx
│   ├── Query.tsx
│   └── Results.tsx
└── components/
```

**Option A: State-based navigation (simple, no extra router)**

```typescript
// src/poc/rag-experiment/index.tsx
import { useState } from 'react'
import { Upload } from './pages/Upload'
import { Query } from './pages/Query'
import { Results } from './pages/Results'

type Page = 'upload' | 'query' | 'results'

export default function RagExperiment() {
  const [page, setPage] = useState<Page>('upload')

  return (
    <div>
      <nav>
        <button onClick={() => setPage('upload')}>Upload</button>
        <button onClick={() => setPage('query')}>Query</button>
        <button onClick={() => setPage('results')}>Results</button>
      </nav>
      {page === 'upload' && <Upload onNext={() => setPage('query')} />}
      {page === 'query' && <Query />}
      {page === 'results' && <Results />}
    </div>
  )
}
```

**Option B: TanStack Router catch-all**

The catch-all route `src/routes/_poc/$pocId/$.tsx` passes the remaining path to the POC. The POC can read it via `useParams` and render accordingly. Do **not** nest a second router (e.g., `react-router-dom`) inside TanStack Router — mixing routers causes conflicts.


### Adding a POC

1. Create `src/poc/my-poc/index.tsx` with a default export
2. Add entry to `POC_REGISTRY` with a `path` (e.g., `/my-poc`)
3. Navigate to `/my-poc`

### Promoting POC to Production App

When a POC is ready to become a production app:

**1. Move the folder**

```bash
mv src/poc/my-poc src/apps/my-app
```

**2. Switch registries**

Remove entry from `POC_REGISTRY` and add to `APP_REGISTRY`:

```typescript
// src/apps/index.ts — add entry with lazy-loaded routes
{
  id: 'my-app',
  name: 'My App',
  description: 'What this app does',
  basePath: '/my-app',
  defaultRoute: '/my-app/home',
  routes: [
    {
      path: 'home',
      label: 'Home',
      component: lazy(() => import('./my-app/pages/Home').then(m => ({ default: m.Home }))),
    },
  ],
}
```

```typescript
// src/poc/index.ts — delete the old entry
```

Routes, navigation, and lazy loading are handled automatically by the registry.

**3. Code Review Checklist**

Promoting code from "hacky experiment" to "production standard" must involve a manual review. Before merging the promotion PR, verify:

- [ ] No hardcoded secrets or API keys
- [ ] Accessibility (ARIA) attributes added (POCs usually skip these)
- [ ] Strict TypeScript types defined (no `any`)
- [ ] API errors handled with user-facing feedback
- [ ] All imports use `@/shared/components` (not POC-specific packages that weren't rebuilt)
- [ ] Styling uses `shared/components/core` or `shared/components/extended` (on-brand)
- [ ] App-specific state lives in `apps/my-app/store.ts`, not in `shared/store`

Now accessible at `/my-app` instead of `/chart-experiments`, and appears in the app switcher.

---

## Routing & Auth

Layout groups with different auth requirements:

| Layout | Routes | Auth | Navbar |
|--------|--------|------|--------|
| `_app` | `/`, `/guardrails/*`, `/analytics/*` | Required | Yes |
| `_poc` | `/gallery`, `/chart-experiments`, etc. | None | No |

> Add a `_public` layout (e.g., for `/login`) when unauthenticated routes are needed.

Auth is enforced at the layout level via `beforeLoad` in `routeTree.gen.tsx`:

```typescript
// src/routes/_app.tsx
export async function appBeforeLoad() {
  if (ENABLE_AUTH && !isAuthenticated()) {
    redirectToLogin()
  }
}
```

POCs that need auth can use the shared auth components:

```typescript
// src/poc/sensitive-poc/index.tsx
import { AuthGuard } from '@/shared/auth'

export default function SensitivePoc() {
  return (
    <AuthGuard fallback={<Login />}>
      <Content />
    </AuthGuard>
  )
}
```

---

## State Management Rules

State is split into three categories with strict ownership boundaries:

### Global State (`shared/store/`)

Only for concerns that span the entire application:

- UI state: sidebar, theme
- User session: auth status, user profile
- Notifications: toast alerts, banners

```typescript
// src/shared/store/useUIStore.ts — global, any app can read/write
export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  theme: 'light',
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setTheme: (theme) => set({ theme }),
}))
```

### App-Specific State (`apps/*/store.ts`)

For state that belongs to a single app. If App A sets `isLoading = true`, it must **not** trigger a loader in App B.

```typescript
// src/apps/guardrails/store.ts — only guardrails reads/writes this
export const useDashboardStore = create<DashboardStore>((set) => ({
  appliedFilters: DEFAULT_FILTERS,
  draftFilters: DEFAULT_FILTERS,
  // ...
}))
```

### Server State (TanStack Query)

For data fetched from APIs. Do not duplicate server data into Zustand stores.

```typescript
// src/apps/guardrails/hooks.ts
export function useDashboardData(filters: DashboardFilters) {
  return useQuery({
    queryKey: ['dashboard', filters],
    queryFn: () => fetchDashboardData(filters),
  })
}
```

### Decision Guide

| Question | Answer |
|----------|--------|
| Is it user session, theme, or toasts? | `shared/store/` |
| Is it fetched from an API? | TanStack Query |
| Is it UI state for one app (filters, drafts, selections)? | `apps/*/store.ts` |
| Is it local to one component? | `useState` / `useReducer` |

---

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Dev server runs at `http://localhost:5173` (Vite default).

- POC gallery: `http://localhost:5173/gallery`
- Specific POC: `http://localhost:5173/chart-experiments`
- Production features: `http://localhost:5173/guardrails/dashboard`

---

## Environment Setup

### Environment Files

```
.env                    # Shared defaults (committed)
.env.local              # Local overrides (gitignored)
.env.development        # Dev-specific
.env.production         # Prod-specific
```

### Defining Variables

```bash
# .env
VITE_APP_NAME=React Dashboard
VITE_API_URL=https://api.example.com

# .env.development
VITE_API_URL=http://localhost:8000

# .env.production
VITE_API_URL=https://api.prod.example.com
```

Vite requires `VITE_` prefix for client-exposed variables.

### Using Variables

```typescript
// src/config/env.ts
export const ENV = {
  isProd: import.meta.env.PROD,
  isDev: import.meta.env.DEV,
  mode: import.meta.env.MODE,  // 'development' | 'production'

  appName: import.meta.env.VITE_APP_NAME,
  apiUrl: import.meta.env.VITE_API_URL,
}

// Usage anywhere
import { ENV } from '@/config'

if (ENV.isDev) {
  console.log('Debug info')
}

fetch(`${ENV.apiUrl}/endpoint`)
```

### Multiple Built Environments

If you build for all environments (not just prod), use `--mode` to distinguish:

```bash
# package.json scripts
"scripts": {
  "dev": "vite",
  "build:dev": "vite build --mode development",
  "build:staging": "vite build --mode staging",
  "build:prod": "vite build --mode production"
}
```

Each mode loads its own `.env` file:

```
.env                    # Shared defaults
.env.development        # Loaded with --mode development
.env.staging            # Loaded with --mode staging
.env.production         # Loaded with --mode production
```

### Checking Environment in Code

Don't rely on `import.meta.env.PROD` — it's `true` for any build. Use a custom variable:

```bash
# .env.development
VITE_ENV=development

# .env.staging
VITE_ENV=staging

# .env.production
VITE_ENV=production
```

```typescript
// src/config/env.ts
export const ENV = {
  current: import.meta.env.VITE_ENV as 'development' | 'staging' | 'production',

  isDev: import.meta.env.VITE_ENV === 'development',
  isStaging: import.meta.env.VITE_ENV === 'staging',
  isProd: import.meta.env.VITE_ENV === 'production',

  apiUrl: import.meta.env.VITE_API_URL,
}

// Usage
if (ENV.isDev) {
  // Show POC gallery, debug tools, etc.
}
```

### Built-in Vite Variables

| Variable | Dev | Prod |
|----------|-----|------|
| `import.meta.env.DEV` | `true` | `false` |
| `import.meta.env.PROD` | `false` | `true` |
| `import.meta.env.MODE` | `'development'` | `'production'` |

### Per-POC Environment (if needed)

POCs needing different backends can override in their own code:

```typescript
// src/poc/my-poc/config.ts
const API_URL = import.meta.env.DEV
  ? 'http://localhost:5000'  // Local Python server
  : 'https://my-poc-api.example.com'
```

---

## Build Configuration

### Lazy Loading (Code Splitting)

Every app page and POC is lazy-loaded. Vite splits each into its own chunk, loaded only when the user navigates to that route.

**App pages** use `React.lazy` in the `APP_REGISTRY`:

```typescript
// src/apps/index.ts — lazy-loaded in the registry, auto-wrapped in Suspense by routeTree
routes: [
  {
    path: 'dashboard',
    label: 'Dashboard',
    component: lazy(() => import('./guardrails/pages/Dashboard').then(m => ({ default: m.Dashboard }))),
  },
]
```

**POCs** use `React.lazy` in the `POC_REGISTRY`:

```typescript
// src/poc/index.ts
component: lazy(() => import('./chart-experiments'))
```

`routeTree.gen.tsx` dynamically generates routes from both registries and wraps each component in `<Suspense>`.

**What this means for the bundle:**

| Chunk | Size | Loaded when |
|-------|------|-------------|
| `index.js` | ~266 kB | Always (shell, router, shared) |
| `Dashboard-*.js` | ~567 kB | User visits `/guardrails/dashboard` (includes ECharts) |
| `Settings-*.js` | ~2 kB | User visits `/guardrails/settings` |
| POC chunks | Varies | User visits POC route (dev only) |

**Rule:** Always use `lazy()` in the registry. Never statically import page components.

---

### Code Exclusion from Production

POC code is excluded from production builds through two layers:

**1. Dead code elimination (primary mechanism)**

Both `POC_REGISTRY` (in `src/poc/index.ts`) and the POC route creation (in `routeTree.gen.tsx`) are wrapped in `import.meta.env.DEV` conditionals. Vite replaces `import.meta.env.DEV` with `false` at build time, making POC registry entries and all route creation dead code. The tree-shaker then drops the `lazy(() => import(...))` calls and their transitive dependencies from the bundle — zero POC code ships to production.

```typescript
// src/routeTree.gen.tsx
import { PocLayout, pocBeforeLoad } from './routes/_poc'
import { PocGallery } from './poc/PocGallery'
import { POC_REGISTRY, getPocByPath } from './poc'

// These imports are ONLY used inside this block.
// In production, the block is dead code and everything is tree-shaken away.
if (import.meta.env.DEV) {
  // ... POC route creation
}
```

**2. Route-level redirect (safety net)**

`_poc.tsx` also checks `import.meta.env.DEV` and redirects to `/` in production, in case any POC route is somehow reached.

**3. Verify with bundle analysis**

After building, confirm no POC code is in the bundle:

```bash
# Install the visualizer
npm install -D rollup-plugin-visualizer

# Add to vite.config.ts plugins array:
# import { visualizer } from 'rollup-plugin-visualizer'
# plugins: [react(), visualizer({ open: true })]

# Build and inspect
npm run build
# Opens a treemap — search for "poc" to confirm it's absent
```

### What Gets Excluded

| Code | Dev | Prod |
|------|-----|------|
| `src/poc/*` | Loaded | Excluded (empty registry + tree-shaking) |
| `src/apps/*` | Loaded | Loaded |
| `src/shared/*` | Loaded | Only used parts |

---

## Quick Reference

### What's in Shared

Available for all apps and POCs to import:

| Module | What's there |
|--------|--------------|
| `@/shared/components` | AppSwitcher, AppNavigation, ErrorBoundary, NotFound |
| `@/shared/charts` | LineChart, BarChart, AreaChart, PieChart, StackedBarChart (ECharts) |
| `@/shared/store` | useUIStore (theme, sidebar), useAlertStore (toast notifications) |
| `@/shared/auth` | AuthGuard, isAuthenticated, authService |
| `@/config` | Backend URL config |

As the project grows, add `shared/hooks/`, `shared/utils/`, `shared/types/` as needed. For company design system integration, add `shared/components/core/`, `extended/`, and `patterns/` per the [Styling Strategy](#styling-strategy-wrap-and-fill).

Use what you need, or don't — apps and POCs can bring their own everything.

### Naming

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `MetricCard.tsx` |
| Hooks | `use` prefix | `useDebounce.ts` |
| Constants | UPPER_SNAKE | `API_URL` |
