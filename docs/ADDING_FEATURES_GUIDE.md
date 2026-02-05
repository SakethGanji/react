# Adding Features Guide

A step-by-step guide to adding new features to the dashboard. Uses the Settings page (2 APIs) as a reference example.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [The Data Flow](#the-data-flow)
3. [Step-by-Step: Adding a New Feature](#step-by-step-adding-a-new-feature)
4. [Real Example: Settings Page](#real-example-settings-page)
5. [Adding a New Page](#adding-a-new-page)
6. [Common Patterns](#common-patterns)
7. [File Checklist](#file-checklist)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         ROUTES                                   │
│  src/routeTree.gen.tsx                                          │
│  - Maps URLs to page components                                 │
│  - Handles redirects and auth                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         PAGES                                    │
│  src/apps/guardrails/pages/                                     │
│  - Dashboard.tsx, Settings.tsx                                  │
│  - Compose components, call hooks                               │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   COMPONENTS    │  │     HOOKS       │  │     STORE       │
│   /components/  │  │   hooks.ts      │  │   store.ts      │
│   UI elements   │  │   useQuery()    │  │   Zustand       │
│   Presentational│  │   Data fetching │  │   Client state  │
└─────────────────┘  └─────────────────┘  └─────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SERVICES                                  │
│  src/apps/guardrails/services.ts                                │
│  - API fetch functions                                          │
│  - Response transformations                                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         TYPES                                    │
│  src/apps/guardrails/types.ts                                   │
│  - TypeScript interfaces                                        │
│  - API response shapes                                          │
│  - Component props                                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        CONFIG                                    │
│  src/config/backends.ts                                         │
│  - Backend URLs per environment                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## The Data Flow

```
User visits /guardrails/settings
        │
        ▼
┌─ routeTree.gen.tsx ─────────────────────────────────────────────┐
│  guardrailsSettingsRoute → component: Settings                  │
└─────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─ Settings.tsx ──────────────────────────────────────────────────┐
│  const general = useGeneralSettings()                           │
│  const notifications = useNotificationSettings()                │
└─────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─ hooks.ts ──────────────────────────────────────────────────────┐
│  useQuery({                                                     │
│    queryKey: ['settings', 'general'],                           │
│    queryFn: fetchGeneralSettings,                               │
│  })                                                             │
└─────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─ services.ts ───────────────────────────────────────────────────┐
│  async function fetchGeneralSettings() {                        │
│    const response = await fetch(`${backends.settings}/api/...`) │
│    return response.json()                                       │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─ backends.ts ───────────────────────────────────────────────────┐
│  backends.settings = 'http://localhost:8000'                    │
└─────────────────────────────────────────────────────────────────┘
        │
        ▼
    API Server
```

---

## Step-by-Step: Adding a New Feature

Let's say you want to add a new "Alerts Configuration" feature that fetches from `/api/alerts/config`.

### Step 1: Define Types (`types.ts`)

```typescript
// src/apps/guardrails/types.ts

// Add your new types
export interface AlertConfig {
  id: string
  name: string
  enabled: boolean
  threshold: number
  channels: string[]
}

export interface AlertConfigResponse {
  data: AlertConfig[]
  total: number
}
```

### Step 2: Add Service Function (`services.ts`)

```typescript
// src/apps/guardrails/services.ts

import type { AlertConfigResponse } from './types'

export async function fetchAlertConfig(): Promise<AlertConfigResponse> {
  const endpoint = '/api/alerts/config'
  try {
    const response = await fetch(`${backends.dashboard}${endpoint}`)
    if (!response.ok) throw ApiError.fromResponse(response, endpoint)
    return response.json()
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw ApiError.networkError(endpoint, error as Error)
  }
}
```

### Step 3: Create Hook (`hooks.ts`)

```typescript
// src/apps/guardrails/hooks.ts

import { fetchAlertConfig } from './services'

export function useAlertConfig() {
  return useQuery({
    queryKey: ['alertConfig'],
    queryFn: fetchAlertConfig,
  })
}
```

### Step 4: Use in Component/Page

```typescript
// In any component or page
import { useAlertConfig } from '../hooks'

function AlertSettings() {
  const { data, isLoading, error } = useAlertConfig()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      {data?.data.map((alert) => (
        <div key={alert.id}>{alert.name}</div>
      ))}
    </div>
  )
}
```

### Step 5: Export (Optional)

If the hook/types need to be used outside the guardrails app:

```typescript
// src/apps/guardrails/index.ts

export type { AlertConfig, AlertConfigResponse } from './types'
export { useAlertConfig } from './hooks'
```

---

## Real Example: Settings Page

The Settings page demonstrates fetching from 2 separate APIs.

### Types (`types.ts`)

```typescript
export interface GeneralSettings {
  siteName: string
  language: string
  timezone: string
}

export interface NotificationSettings {
  email: boolean
  push: boolean
  frequency: string
}
```

### Services (`services.ts`)

```typescript
export async function fetchGeneralSettings(): Promise<GeneralSettings> {
  const endpoint = '/api/settings/general'
  try {
    const response = await fetch(`${backends.settings}${endpoint}`)
    if (!response.ok) throw ApiError.fromResponse(response, endpoint)
    return response.json()
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw ApiError.networkError(endpoint, error as Error)
  }
}

export async function fetchNotificationSettings(): Promise<NotificationSettings> {
  const endpoint = '/api/settings/notifications'
  try {
    const response = await fetch(`${backends.settings}${endpoint}`)
    if (!response.ok) throw ApiError.fromResponse(response, endpoint)
    return response.json()
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw ApiError.networkError(endpoint, error as Error)
  }
}
```

### Hooks (`hooks.ts`)

```typescript
export function useGeneralSettings() {
  return useQuery({
    queryKey: ['settings', 'general'],
    queryFn: fetchGeneralSettings,
  })
}

export function useNotificationSettings() {
  return useQuery({
    queryKey: ['settings', 'notifications'],
    queryFn: fetchNotificationSettings,
  })
}
```

### Page (`pages/Settings.tsx`)

```typescript
import { useGeneralSettings, useNotificationSettings } from '../hooks'

export function Settings() {
  // Two separate API calls, managed independently
  const general = useGeneralSettings()
  const notifications = useNotificationSettings()

  // Combined loading/error state
  const isLoading = general.isLoading || notifications.isLoading
  const error = general.error || notifications.error

  if (isLoading) return <div className="loading">Loading settings...</div>
  if (error) return <div className="error">Error: {error.message}</div>

  return (
    <main className="dashboard-content">
      <section className="settings-section">
        <h2>General Settings</h2>
        <div className="settings-card">
          <div className="settings-item">
            <span className="settings-label">Site Name</span>
            <span className="settings-value">{general.data?.siteName}</span>
          </div>
          {/* ... more fields */}
        </div>
      </section>

      <section className="settings-section">
        <h2>Notification Settings</h2>
        <div className="settings-card">
          <div className="settings-item">
            <span className="settings-label">Email Notifications</span>
            <span className="settings-value">
              {notifications.data?.email ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          {/* ... more fields */}
        </div>
      </section>
    </main>
  )
}
```

---

## Adding a New Page

### Step 1: Create the Page Component

```typescript
// src/apps/guardrails/pages/Reports.tsx

import { useReports } from '../hooks'

export function Reports() {
  const { data, isLoading, error } = useReports()

  if (isLoading) return <div className="loading">Loading...</div>
  if (error) return <div className="error">Error: {error.message}</div>

  return (
    <main className="dashboard-content">
      <h1>Reports</h1>
      {/* Your content */}
    </main>
  )
}
```

### Step 2: Export from Pages Index

```typescript
// src/apps/guardrails/pages/index.ts

export { Dashboard } from './Dashboard'
export { Settings } from './Settings'
export { Reports } from './Reports'  // Add this
```

### Step 3: Export from App Index

```typescript
// src/apps/guardrails/index.ts

export { Dashboard, Settings, Reports } from './pages'  // Add Reports
```

### Step 4: Add Route

```typescript
// src/routeTree.gen.tsx

import { Dashboard, Settings, Reports } from './apps/guardrails'

// Add route definition
export const guardrailsReportsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/guardrails/reports',
  component: Reports,
})

// Add to route tree
export const routeTree = rootRoute.addChildren([
  appLayoutRoute.addChildren([
    indexRoute,
    guardrailsIndexRoute,
    guardrailsDashboardRoute,
    guardrailsSettingsRoute,
    guardrailsReportsRoute,  // Add this
  ]),
  // ...
])
```

### Step 5: Add to Navigation

```typescript
// src/apps/guardrails/navigation.ts

export const GUARDRAILS_NAV: NavItem[] = [
  { path: '/guardrails/dashboard', label: 'Dashboard' },
  { path: '/guardrails/settings', label: 'Settings' },
  { path: '/guardrails/reports', label: 'Reports' },  // Add this
]
```

---

## Common Patterns

### Pattern 1: Filtered Data with Store

For data that needs filters (like the Dashboard):

```typescript
// store.ts - Manage filter state
export const useMyStore = create((set) => ({
  filters: { category: null, dateRange: { start: null, end: null } },
  setCategory: (category) => set((state) => ({
    filters: { ...state.filters, category }
  })),
}))

// hooks.ts - Use filters in query
export function useFilteredData() {
  const filters = useMyStore((state) => state.filters)

  return useQuery({
    queryKey: ['myData', filters],  // Re-fetches when filters change
    queryFn: () => fetchData(filters),
  })
}
```

### Pattern 2: Infinite Scroll

```typescript
// hooks.ts
export function useInfiniteData() {
  return useInfiniteQuery({
    queryKey: ['infiniteData'],
    queryFn: ({ pageParam }) => fetchData({ cursor: pageParam }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.pagination.next_cursor,
  })
}
```

### Pattern 3: Dependent Queries

```typescript
// hooks.ts - Second query depends on first
export function useUserDetails(userId: string | null) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId!),
    enabled: !!userId,  // Only runs when userId exists
  })
}
```

### Pattern 4: Mutations (POST/PUT/DELETE)

```typescript
// services.ts
export async function updateSettings(data: SettingsUpdate): Promise<void> {
  const response = await fetch(`${backends.settings}/api/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to update')
}

// hooks.ts
export function useUpdateSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
  })
}

// Usage in component
const mutation = useUpdateSettings()
mutation.mutate({ siteName: 'New Name' })
```

### Pattern 5: Error Handling with ApiError

```typescript
// errors.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public endpoint: string
  ) {
    super(message)
  }

  static fromResponse(response: Response, endpoint: string) {
    return new ApiError(
      `API Error: ${response.status} ${response.statusText}`,
      response.status,
      endpoint
    )
  }

  static networkError(endpoint: string, error: Error) {
    return new ApiError(
      `Network Error: ${error.message}`,
      0,
      endpoint
    )
  }
}

// services.ts - Consistent error handling
export async function fetchSomething(): Promise<Something> {
  const endpoint = '/api/something'
  try {
    const response = await fetch(`${backends.dashboard}${endpoint}`)
    if (!response.ok) throw ApiError.fromResponse(response, endpoint)
    return response.json()
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw ApiError.networkError(endpoint, error as Error)
  }
}
```

---

## File Checklist

When adding a new feature, here are all the files you might need to touch:

### Required Files

| File | Purpose | When to Edit |
|------|---------|--------------|
| `types.ts` | TypeScript interfaces | Always - define your data shapes |
| `services.ts` | API fetch functions | Always - add fetch function |
| `hooks.ts` | React Query hooks | Always - wrap service in hook |

### Often Needed

| File | Purpose | When to Edit |
|------|---------|--------------|
| `components/*.tsx` | UI components | When you need new UI elements |
| `pages/*.tsx` | Page components | When adding a new page |
| `index.ts` | Public exports | When exposing to other apps |

### Sometimes Needed

| File | Purpose | When to Edit |
|------|---------|--------------|
| `store.ts` | Zustand state | When you need client-side state (filters, UI state) |
| `routeTree.gen.tsx` | Route definitions | When adding a new page/URL |
| `navigation.ts` | Nav menu items | When adding nav link for new page |
| `App.css` | Styles | When adding new component styles |
| `backends.ts` | API URLs | When connecting to a new backend |

### File Locations Summary

```
src/apps/guardrails/
├── index.ts          # Public exports
├── types.ts          # All TypeScript types
├── services.ts       # All API fetch functions
├── hooks.ts          # All React Query hooks
├── store.ts          # Zustand store (filters, UI state)
├── errors.ts         # Error classes
├── alerts.ts         # Alert/toast system
├── navigation.ts     # Nav menu items
├── components/       # Reusable components
│   ├── index.ts      # Component exports
│   ├── MetricCard.tsx
│   ├── DataTable.tsx
│   └── ...
└── pages/            # Page components
    ├── index.ts      # Page exports
    ├── Dashboard.tsx
    └── Settings.tsx

src/config/
└── backends.ts       # Backend URL configuration

src/
└── routeTree.gen.tsx # Route definitions
```

---

## Quick Reference: Adding an API Endpoint

```bash
# 1. Add types
echo "Add interface to types.ts"

# 2. Add service
echo "Add fetch function to services.ts"

# 3. Add hook
echo "Add useQuery hook to hooks.ts"

# 4. Use it
echo "Import hook in your component"
```

Minimal example:

```typescript
// types.ts
export interface Widget { id: string; name: string }

// services.ts
export const fetchWidgets = () =>
  fetch(`${backends.dashboard}/api/widgets`).then(r => r.json())

// hooks.ts
export const useWidgets = () =>
  useQuery({ queryKey: ['widgets'], queryFn: fetchWidgets })

// Component.tsx
const { data } = useWidgets()
```

That's it! The React Query cache handles loading states, errors, and refetching automatically.
