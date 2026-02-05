# React Dashboard Architecture

Multiple production UI apps and POC experiments in one repo.

---

## Directory Structure

```
src/
├── main.tsx
├── App.tsx
│
├── config/                       # App configuration
│   ├── index.ts
│   ├── env.ts
│   └── api.ts
│
├── shared/                       # Shared across all apps and POCs
│   ├── components/
│   ├── charts/
│   ├── hooks/
│   ├── utils/
│   ├── store/
│   ├── auth/
│   └── types/
│
├── apps/                         # Production apps (each is a separate UI product)
│   ├── guardrails/               # Guardrails app
│   │   ├── index.ts              # Public exports
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Settings.tsx
│   │   │   └── Reports.tsx
│   │   ├── components/
│   │   ├── hooks.ts
│   │   ├── services.ts
│   │   └── types.ts
│   │
│   └── analytics/                # Analytics app (separate product)
│       ├── index.ts
│       ├── pages/
│       │   ├── Overview.tsx
│       │   ├── Metrics.tsx
│       │   └── Alerts.tsx
│       ├── components/
│       ├── hooks.ts
│       └── types.ts
│
├── poc/                          # POCs (dev only, excluded from prod builds)
│   ├── index.ts                  # Registry
│   │
│   ├── chart-experiments/        # Simple POC
│   │   └── index.tsx
│   │
│   └── rag-experiment/           # Complex POC (same structure as apps)
│       ├── index.tsx             # Entry point
│       ├── pages/
│       │   ├── Upload.tsx
│       │   ├── Query.tsx
│       │   └── Results.tsx
│       ├── components/
│       ├── hooks.ts
│       └── types.ts
│
└── routes/                       # TanStack Router
    ├── __root.tsx
    ├── _app.tsx                  # Shared prod layout (auth + app switcher)
    ├── _poc.tsx                  # POC layout (minimal)
    ├── _public.tsx               # Public layout (no auth)
    │
    ├── _app/
    │   ├── index.tsx             # / (app selector or default redirect)
    │   │
    │   ├── guardrails/           # /guardrails/*
    │   │   ├── index.tsx         # /guardrails
    │   │   ├── dashboard.tsx     # /guardrails/dashboard
    │   │   ├── settings.tsx      # /guardrails/settings
    │   │   └── reports.tsx       # /guardrails/reports
    │   │
    │   └── analytics/            # /analytics/*
    │       ├── index.tsx         # /analytics
    │       ├── overview.tsx      # /analytics/overview
    │       ├── metrics.tsx       # /analytics/metrics
    │       └── alerts.tsx        # /analytics/alerts
    │
    └── _poc/
        ├── index.tsx             # /poc (gallery)
        └── $pocId/
            ├── index.tsx         # /poc/:pocId
            └── $.tsx             # /poc/:pocId/* (catch-all for sub-routes)
```

---

## Import Rules

```
config/     ← Anyone can import
shared/     ← apps/ and poc/ can import
apps/       ← Only routes/ can import (no cross-app imports)
poc/        ← Only routes/poc/ can import (no app imports)
```

Apps and POCs are isolated from each other. Both can use shared code.

All apps and POCs can mix styling frameworks (tailwind + shadcn + internal) as needed.

---

## Multi-App System

Each app is a **separate UI product** that lives under its own URL prefix. Apps share common infrastructure (auth, components, charts) but are otherwise independent.

### App Registry

```typescript
// src/apps/index.ts
export interface AppEntry {
  id: string
  name: string
  description: string
  basePath: string
  icon?: string
  defaultRoute?: string
}

export const APP_REGISTRY: AppEntry[] = [
  {
    id: 'guardrails',
    name: 'Guardrails',
    description: 'Policy management and compliance',
    basePath: '/guardrails',
    defaultRoute: '/guardrails/dashboard',
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'Metrics and reporting',
    basePath: '/analytics',
    defaultRoute: '/analytics/overview',
  },
]
```

### App Switcher

The shared layout includes an app switcher for navigation between apps:

```typescript
// src/shared/components/AppSwitcher.tsx
import { APP_REGISTRY } from '@/apps'
import { Link } from '@tanstack/react-router'

export function AppSwitcher({ currentAppId }: { currentAppId?: string }) {
  return (
    <nav className="app-switcher">
      {APP_REGISTRY.map((app) => (
        <Link
          key={app.id}
          to={app.defaultRoute}
          className={currentAppId === app.id ? 'active' : ''}
        >
          {app.name}
        </Link>
      ))}
    </nav>
  )
}
```

### App-Specific Navigation

Each app has its own internal navigation:

```typescript
// src/apps/guardrails/navigation.ts
export const GUARDRAILS_NAV = [
  { path: '/guardrails/dashboard', label: 'Dashboard' },
  { path: '/guardrails/settings', label: 'Settings' },
  { path: '/guardrails/reports', label: 'Reports' },
]

// src/apps/analytics/navigation.ts
export const ANALYTICS_NAV = [
  { path: '/analytics/overview', label: 'Overview' },
  { path: '/analytics/metrics', label: 'Metrics' },
  { path: '/analytics/alerts', label: 'Alerts' },
]
```

### Shared Layout with App Context

```typescript
// src/routes/_app.tsx
import { createFileRoute, Outlet, useMatches } from '@tanstack/react-router'
import { AppSwitcher } from '@/shared/components/AppSwitcher'
import { AppNavigation } from '@/shared/components/AppNavigation'

export const Route = createFileRoute('/_app')({
  beforeLoad: async () => {
    if (!isAuthenticated()) {
      throw redirect({ to: '/login' })
    }
  },
  component: AppLayout,
})

function AppLayout() {
  const matches = useMatches()
  // Extract current app from route: /guardrails/... → 'guardrails'
  const currentAppId = matches[1]?.pathname.split('/')[1]

  return (
    <div className="app-layout">
      <header>
        <AppSwitcher currentAppId={currentAppId} />
      </header>
      <aside>
        <AppNavigation appId={currentAppId} />
      </aside>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
```

### Adding a New App

1. **Create app folder**

```
src/apps/my-app/
├── index.ts              # Public exports
├── navigation.ts         # App-specific nav items
├── pages/
│   ├── Home.tsx
│   ├── Settings.tsx
│   └── Details.tsx
├── components/
├── hooks.ts
└── types.ts
```

2. **Register the app**

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
  },
]
```

3. **Create routes**

```
src/routes/_app/my-app/
├── index.tsx             # /my-app (redirect to default)
├── home.tsx              # /my-app/home
├── settings.tsx          # /my-app/settings
└── details.$id.tsx       # /my-app/details/:id
```

```typescript
// src/routes/_app/my-app/home.tsx
import { createFileRoute } from '@tanstack/react-router'
import { HomePage } from '@/apps/my-app'

export const Route = createFileRoute('/_app/my-app/home')({
  component: HomePage,
})
```

4. **Add navigation**

```typescript
// src/apps/my-app/navigation.ts
export const MY_APP_NAV = [
  { path: '/my-app/home', label: 'Home' },
  { path: '/my-app/settings', label: 'Settings' },
]
```

The app will automatically appear in the app switcher.

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
export interface POCEntry {
  id: string
  name: string
  description?: string
  tags?: string[]
  component: () => Promise<{ default: ComponentType }>
}

export const POC_REGISTRY: POCEntry[] = [
  {
    id: 'chart-experiments',
    name: 'Chart Experiments',
    description: 'Testing ECharts configs',
    tags: ['charts'],
    component: () => import('./chart-experiments'),
  },
  {
    id: 'rag-experiment',
    name: 'RAG Experiment',
    description: 'Document upload and querying',
    tags: ['rag', 'llm'],
    component: () => import('./rag-experiment'),
  },
]
```

The registry is just metadata for the gallery. Each POC handles its own styling, layout, routing, and backend internally.

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

POCs can have multiple pages with their own routing:

```
src/poc/rag-experiment/
├── index.tsx                   # Entry point with internal router
├── pages/
│   ├── Upload.tsx              # /poc/rag-experiment/upload
│   ├── Query.tsx               # /poc/rag-experiment/query
│   └── Results.tsx             # /poc/rag-experiment/results/:id
└── components/
```

```typescript
// src/poc/rag-experiment/index.tsx
import { Routes, Route } from 'react-router-dom'
import { Upload } from './pages/Upload'
import { Query } from './pages/Query'
import { Results } from './pages/Results'

export default function RagExperiment() {
  return (
    <Routes>
      <Route index element={<Upload />} />
      <Route path="upload" element={<Upload />} />
      <Route path="query" element={<Query />} />
      <Route path="results/:id" element={<Results />} />
    </Routes>
  )
}
```

The catch-all route `src/routes/_poc/$pocId/$.tsx` passes sub-paths to the POC's internal router.


### Adding a POC

1. Create `src/poc/my-poc/index.tsx` with a default export
2. Add entry to `POC_REGISTRY`
3. Navigate to `/poc/my-poc`

### Promoting POC to Production App

When a POC is ready to become a production app:

**1. Move the code**

```bash
mv src/poc/my-poc src/apps/my-app
```

**2. Update imports (if any relative paths)**

```typescript
// Fix any relative imports to use aliases
import { something } from '@/shared/components'
```

**3. Add navigation config**

```typescript
// src/apps/my-app/navigation.ts
export const MY_APP_NAV = [
  { path: '/my-app', label: 'Home' },
  { path: '/my-app/settings', label: 'Settings' },
]
```

**4. Create production routes**

```
src/routes/_app/my-app/
├── index.tsx           # /my-app
├── settings.tsx        # /my-app/settings
└── details.$id.tsx     # /my-app/details/:id
```

```typescript
// src/routes/_app/my-app/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { HomePage } from '@/apps/my-app'

export const Route = createFileRoute('/_app/my-app/')({
  component: HomePage,
})
```

**5. Register the app**

```typescript
// src/apps/index.ts
export const APP_REGISTRY: AppEntry[] = [
  // ... existing apps
  {
    id: 'my-app',
    name: 'My App',
    description: 'Description here',
    basePath: '/my-app',
    defaultRoute: '/my-app',
  },
]
```

**6. Remove from POC registry**

```typescript
// src/poc/index.ts - delete the entry
```

Now accessible at `/my-app` instead of `/poc/my-poc`, and appears in the app switcher.

---

## Routing & Auth

Three layout groups with different auth requirements:

| Layout | Routes | Auth | Navbar |
|--------|--------|------|--------|
| `_app` | `/`, `/settings` | Required | Yes |
| `_poc` | `/poc/*` | None | No |
| `_public` | `/login` | None | No |

Auth is enforced at the layout level:

```typescript
// src/routes/_app.tsx
export const Route = createFileRoute('/_app')({
  beforeLoad: async () => {
    if (!isAuthenticated()) {
      throw redirect({ to: '/login' })
    }
  },
  component: AppLayout,
})
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

## App Structure Details

Apps have the same flexibility as POCs — any styling, backend, layout, routing, state management. The difference is apps are in production and use the `_app` layout with auth.

### App with Multiple Routes

```
src/apps/guardrails/
├── index.ts                    # Exports pages
├── navigation.ts               # App nav items
├── pages/
│   ├── Dashboard.tsx           # /guardrails/dashboard
│   ├── Settings.tsx            # /guardrails/settings
│   └── Reports.tsx             # /guardrails/reports
├── components/
└── hooks.ts

src/routes/_app/guardrails/
├── index.tsx                   # /guardrails (redirect or landing)
├── dashboard.tsx               # /guardrails/dashboard
├── settings.tsx                # /guardrails/settings
└── reports.tsx                 # /guardrails/reports
```

```typescript
// src/routes/_app/guardrails/dashboard.tsx
import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '@/apps/guardrails'

export const Route = createFileRoute('/_app/guardrails/dashboard')({
  component: Dashboard,
})
```

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

- POC gallery: `http://localhost:5173/poc`
- Specific POC: `http://localhost:5173/poc/my-poc`
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

### Code Exclusion from Production

POC code is excluded from production builds:

**1. Route-level redirect**

```typescript
// src/routes/_poc.tsx
import { createFileRoute, Navigate, Outlet } from '@tanstack/react-router'
import { ENV } from '@/config'

export const Route = createFileRoute('/_poc')({
  component: () => {
    if (ENV.isProd) {
      return <Navigate to="/" />
    }
    return <Outlet />
  },
})
```

**2. Vite config (guaranteed exclusion)**

```typescript
// vite.config.ts
export default defineConfig(({ mode }) => ({
  build: {
    rollupOptions: {
      external: mode === 'production'
        ? (id) => id.includes('/src/poc/')
        : [],
    },
  },
}))
```

### What Gets Excluded

| Code | Dev | Prod |
|------|-----|------|
| `src/poc/*` | Loaded | Excluded |
| `src/apps/*` | Loaded | Loaded |
| `src/shared/*` | Loaded | Only used parts |

---

## Quick Reference

### What's in Shared

Available for all apps and POCs to import:

| Module | What's there |
|--------|--------------|
| `@/shared/components` | Button, Modal, NavigationBar, etc. |
| `@/shared/charts` | LineChart, BarChart, PieChart (ECharts) |
| `@/shared/hooks` | useDebounce, useLocalStorage, etc. |
| `@/shared/store` | useUIStore (Zustand) |
| `@/shared/auth` | AuthGuard, isAuthenticated |
| `@/shared/utils` | formatDate, validation helpers |
| `@/shared/types` | Common TypeScript types |
| `@/config` | API_URL, env vars, constants |

Use what you need, or don't — apps and POCs can bring their own everything.

### Naming

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `MetricCard.tsx` |
| Hooks | `use` prefix | `useDebounce.ts` |
| Constants | UPPER_SNAKE | `API_URL` |
