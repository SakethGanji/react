# SSO & Auth Implementation Guide

A complete guide for integrating your internal SSO provider, enabling authentication, and adding role-based access control to both Apps and POCs.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [What Already Exists](#what-already-exists)
3. [Implementation Steps](#implementation-steps)
   - [Step 1: Configure SSO URLs](#step-1-configure-sso-urls)
   - [Step 2: Add Roles to the User Type](#step-2-add-roles-to-the-user-type)
   - [Step 3: Implement Auth Functions](#step-3-implement-auth-functions)
   - [Step 4: Add the Auth Callback Route](#step-4-add-the-auth-callback-route)
   - [Step 5: Add Role-Based Access to Apps](#step-5-add-role-based-access-to-apps)
   - [Step 6: Add Role-Based Access to POCs](#step-6-add-role-based-access-to-pocs)
   - [Step 7: Enforce Roles at the Route Level](#step-7-enforce-roles-at-the-route-level)
   - [Step 8: Filter Visible Apps/POCs by Role in the UI](#step-8-filter-visible-appspocs-by-role-in-the-ui)
   - [Step 9: Show User Info and Logout in the Header](#step-9-show-user-info-and-logout-in-the-header)
   - [Step 10: Enable Auth](#step-10-enable-auth)
4. [Auth Flow Diagrams](#auth-flow-diagrams)
5. [File Reference](#file-reference)
6. [Testing Locally](#testing-locally)
7. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

The auth system has two layers:

```
┌─────────────────────────────────────────────────────────────────────┐
│                       ROUTE-LEVEL AUTH                              │
│  beforeLoad() on layout routes                                     │
│  - Runs BEFORE the page renders                                    │
│  - Checks isAuthenticated() → redirects to SSO if not              │
│  - Checks user roles → redirects to / if unauthorized              │
│  - Protects both App routes and POC routes                         │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        UI-LEVEL AUTH                                │
│  Components filter what the user can SEE                           │
│  - AppSwitcher only shows apps the user has roles for              │
│  - Header shows user name + logout button                          │
│  - Navigation hides links to unauthorized pages                    │
└─────────────────────────────────────────────────────────────────────┘
```

Both Apps and POCs follow the same pattern:

| | Apps | POCs |
|---|---|---|
| Registry | `APP_REGISTRY` in `src/apps/index.ts` | `POC_REGISTRY` in `src/poc/index.ts` |
| Layout route | `_app` with `appBeforeLoad` | `_poc` with `pocBeforeLoad` |
| Auth gate | `src/routes/_app.tsx` | `src/routes/_poc.tsx` |
| Role field | `AppEntry.requiredRoles` (to add) | `POCEntry.requiredRoles` (to add) |

---

## What Already Exists

The repo has a complete SSO scaffold with placeholder implementations. Here's what's already wired up and what needs work:

| File | Status | What's There |
|------|--------|-------------|
| `src/shared/auth/config.ts` | Scaffold ready | `SSOConfig` interface, per-hostname config lookup, localhost defaults |
| `src/shared/auth/authService.ts` | Has TODOs | `isAuthenticated()` (just checks token exists), `getCurrentUser()` (returns null), `handleAuthCallback()` (returns false), `redirectToLogin()` (working), `logout()` (working) |
| `src/shared/auth/AuthGuard.tsx` | Ready | Component wrapper with `ENABLE_AUTH` toggle (currently `false`) |
| `src/shared/auth/index.ts` | Ready | Re-exports everything |
| `src/routes/_app.tsx` | Ready | `appBeforeLoad()` calls `isAuthenticated`/`redirectToLogin` when `ENABLE_AUTH` is `true` (currently `false`) |
| `src/routes/_poc.tsx` | No auth yet | `pocBeforeLoad()` only checks `import.meta.env.DEV` |

---

## Implementation Steps

### Step 1: Configure SSO URLs

**File:** `src/shared/auth/config.ts`

Uncomment and update the production config. Add entries for every environment (dev, staging, prod):

```ts
const SSO_CONFIG: Record<string, SSOConfig> = {
  // Local development
  'localhost': {
    loginUrl: 'http://localhost:8080/sso/login',
    logoutUrl: 'http://localhost:8080/sso/logout',
    callbackUrl: 'http://localhost:5173/auth/callback',
    tokenKey: 'sso_token',
  },
  '127.0.0.1': {
    loginUrl: 'http://localhost:8080/sso/login',
    logoutUrl: 'http://localhost:8080/sso/logout',
    callbackUrl: 'http://localhost:5173/auth/callback',
    tokenKey: 'sso_token',
  },

  // Staging
  'staging.yourcompany.com': {
    loginUrl: 'https://sso-staging.yourcompany.com/login',
    logoutUrl: 'https://sso-staging.yourcompany.com/logout',
    callbackUrl: 'https://staging.yourcompany.com/auth/callback',
    tokenKey: 'sso_token',
  },

  // Production
  'app.yourcompany.com': {
    loginUrl: 'https://sso.yourcompany.com/login',
    logoutUrl: 'https://sso.yourcompany.com/logout',
    callbackUrl: 'https://app.yourcompany.com/auth/callback',
    tokenKey: 'sso_token',
  },
}
```

The `getSSOConfig()` function at the bottom of the file already reads `window.location.hostname` to pick the right config. No changes needed there.

> **Important:** The `callbackUrl` must match exactly what your SSO provider expects. Coordinate with your SSO admin.

---

### Step 2: Add Roles to the User Type

**File:** `src/shared/auth/authService.ts`

Add a `roles` field to the `User` interface. This must match the claims your SSO provider puts in the JWT:

```ts
export interface User {
  id: string
  email: string
  name: string
  roles: string[]  // e.g. ['admin', 'guardrails-viewer', 'analytics-admin']
}
```

---

### Step 3: Implement Auth Functions

**File:** `src/shared/auth/authService.ts`

There are three functions with TODO placeholders. Implement all three:

#### 3a. `isAuthenticated()` — validate the token

The current implementation just checks if a token exists. Replace it with actual JWT validation:

```ts
import { jwtDecode } from 'jwt-decode'  // npm install jwt-decode

export function isAuthenticated(): boolean {
  const token = localStorage.getItem(ssoConfig.tokenKey)
  if (!token) return false

  try {
    const decoded = jwtDecode<{ exp: number }>(token)
    // Check if token is expired (exp is in seconds, Date.now() is ms)
    return decoded.exp * 1000 > Date.now()
  } catch {
    // Token is malformed
    localStorage.removeItem(ssoConfig.tokenKey)
    return false
  }
}
```

> **Note:** If your SSO uses opaque tokens instead of JWTs, you'll need to call a validation endpoint instead. Replace the JWT decode with a fetch to your `/api/auth/validate` endpoint.

#### 3b. `getCurrentUser()` — extract user info from the token

```ts
export function getCurrentUser(): User | null {
  const token = localStorage.getItem(ssoConfig.tokenKey)
  if (!token) return null

  try {
    const decoded = jwtDecode<User & { exp: number }>(token)

    // Also check expiry here so we never return a stale user
    if (decoded.exp * 1000 <= Date.now()) {
      localStorage.removeItem(ssoConfig.tokenKey)
      return null
    }

    return {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      roles: decoded.roles ?? [],
    }
  } catch {
    return null
  }
}
```

> **Important:** The field names (`id`, `email`, `name`, `roles`) must match what your SSO provider puts in the JWT payload. Check the actual token structure with your SSO team. Common variations: `sub` instead of `id`, `groups` instead of `roles`, `preferred_username` instead of `name`.

#### 3c. `handleAuthCallback()` — handle the SSO redirect

After the user logs in at the SSO provider, they get redirected back to `/auth/callback?token=...`. This function extracts and stores the token:

```ts
export function handleAuthCallback(): boolean {
  const params = new URLSearchParams(window.location.search)
  const token = params.get('token')

  if (token) {
    localStorage.setItem(ssoConfig.tokenKey, token)
    // Clean the token out of the URL
    window.history.replaceState({}, '', window.location.pathname)
    return true
  }
  return false
}
```

> **Note:** Your SSO provider may pass the token differently — in a hash fragment (`#token=...`), as a cookie, or via a POST body. Adjust accordingly.

---

### Step 4: Add the Auth Callback Route

**File:** `src/routeTree.gen.tsx`

Add a route that handles the SSO redirect. This route sits outside both the `_app` and `_poc` layouts (directly under `rootRoute`) so it doesn't itself require auth:

```ts
// Add this import at the top (next to the existing auth imports)
import { handleAuthCallback } from './shared/auth'

// Add this route AFTER the rootRoute definition, BEFORE the routeTree
const authCallbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/callback',
  beforeLoad: () => {
    handleAuthCallback()
    throw redirect({ to: APP_REGISTRY[0]?.defaultRoute ?? '/' })
  },
})
```

Then add it to the route tree at the bottom of the file:

```ts
export const routeTree = rootRoute.addChildren([
  appLayoutRoute.addChildren([
    indexRoute,
    ...appRoutes,
  ]),
  authCallbackRoute,   // <-- add this line
  ...pocRouteTree,
])
```

---

### Step 5: Add Role-Based Access to Apps

**File:** `src/apps/index.ts`

Add `requiredRoles` to the `AppEntry` interface and to each app's config:

```ts
export interface AppEntry {
  id: string
  name: string
  description: string
  basePath: string
  defaultRoute: string
  routes: AppRoute[]
  header?: ComponentType
  requiredRoles?: string[]  // <-- add this
}

export const APP_REGISTRY: AppEntry[] = [
  {
    id: 'guardrails',
    name: 'Guardrails',
    description: 'Guardrail monitoring and configuration dashboard',
    basePath: '/guardrails',
    defaultRoute: '/guardrails/dashboard',
    requiredRoles: ['guardrails-viewer', 'guardrails-admin', 'admin'],
    routes: [ /* ... unchanged ... */ ],
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'Analytics dashboards and reports',
    basePath: '/analytics',
    defaultRoute: '/analytics/overview',
    requiredRoles: ['analytics-viewer', 'analytics-admin', 'admin'],
    routes: [ /* ... unchanged ... */ ],
  },
  {
    id: 'users',
    name: 'Users',
    description: 'User management and settings',
    basePath: '/users',
    defaultRoute: '/users/list',
    requiredRoles: ['user-admin', 'admin'],
    routes: [ /* ... unchanged ... */ ],
  },
]
```

Also add a helper function to this file:

```ts
export function getAccessibleApps(userRoles: string[]): AppEntry[] {
  return APP_REGISTRY.filter((app) =>
    !app.requiredRoles || app.requiredRoles.some((r) => userRoles.includes(r))
  )
}
```

> **Design decision:** If `requiredRoles` is undefined/empty, the app is accessible to everyone. This lets you have "public" apps alongside restricted ones.

---

### Step 6: Add Role-Based Access to POCs

**File:** `src/poc/index.ts`

Same pattern — add `requiredRoles` to `POCEntry`:

```ts
export interface POCEntry {
  id: string
  name: string
  description: string
  path: string
  tags: string[]
  component: ComponentType
  requiredRoles?: string[]  // <-- add this
}

export const POC_REGISTRY: POCEntry[] = import.meta.env.DEV
  ? [
      {
        id: 'chart-experiments',
        name: 'Chart Experiments',
        description: 'Experimental chart components and visualizations',
        path: '/chart-experiments',
        tags: ['charts', 'visualization', 'echarts'],
        requiredRoles: ['dev', 'admin'],
        component: lazy(() => import('./chart-experiments')),
      },
      // ... other POCs
    ]
  : []
```

---

### Step 7: Enforce Roles at the Route Level

This is the critical step. Both `appBeforeLoad` and `pocBeforeLoad` need to check roles.

#### 7a. App routes

**File:** `src/routes/_app.tsx`

Update `appBeforeLoad` to accept the route context and check roles:

```ts
import { Outlet, useRouterState } from '@tanstack/react-router'
import { Toaster } from '@/shared/components/ui/sonner'
import { DefaultHeader } from '@/shared/components/DefaultHeader'
import { getAppByPath } from '@/apps'

const ENABLE_AUTH = false  // Will flip to true in Step 10

export function AppLayout() {
  // ... unchanged ...
}

export async function appBeforeLoad({ location }: { location: { pathname: string } }) {
  if (!ENABLE_AUTH) return

  const { isAuthenticated, redirectToLogin, getCurrentUser } = await import('@/shared/auth')

  // 1. Check authentication
  if (!isAuthenticated()) {
    redirectToLogin()
    throw new Error('Redirecting to login')
  }

  // 2. Check role-based access
  const user = getCurrentUser()
  const app = getAppByPath(location.pathname)

  if (app?.requiredRoles && app.requiredRoles.length > 0) {
    const userRoles = user?.roles ?? []
    const hasAccess = app.requiredRoles.some((role) => userRoles.includes(role))

    if (!hasAccess) {
      // User is authenticated but doesn't have permission for this app
      const { redirect } = await import('@tanstack/react-router')
      throw redirect({ to: '/' })
    }
  }
}
```

> **Note on the `location` parameter:** TanStack Router's `beforeLoad` receives a context object with `location`. The existing `appBeforeLoad()` doesn't use it, so you need to add the parameter.

#### 7b. POC routes

**File:** `src/routes/_poc.tsx`

Add auth + role checking to `pocBeforeLoad`:

```ts
import { Outlet } from '@tanstack/react-router'
import { useUIStore } from '@/shared/store'
import { Badge } from '@/shared/components/ui/badge'

const IS_DEV = import.meta.env.DEV
const ENABLE_AUTH = false  // Will flip to true in Step 10

export function PocLayout() {
  // ... unchanged ...
}

export async function pocBeforeLoad({ location }: { location: { pathname: string } }) {
  // In production, redirect POC routes to main app
  if (!IS_DEV) {
    throw new Response(null, {
      status: 302,
      headers: { Location: '/' },
    })
  }

  if (!ENABLE_AUTH) return

  const { isAuthenticated, redirectToLogin, getCurrentUser } = await import('@/shared/auth')

  // 1. Check authentication
  if (!isAuthenticated()) {
    redirectToLogin()
    throw new Error('Redirecting to login')
  }

  // 2. Check role-based access
  const { getPocByPath } = await import('@/poc')
  const user = getCurrentUser()
  const poc = getPocByPath(location.pathname)

  if (poc?.requiredRoles && poc.requiredRoles.length > 0) {
    const userRoles = user?.roles ?? []
    const hasAccess = poc.requiredRoles.some((role) => userRoles.includes(role))

    if (!hasAccess) {
      const { redirect } = await import('@tanstack/react-router')
      throw redirect({ to: '/' })
    }
  }
}
```

---

### Step 8: Filter Visible Apps/POCs by Role in the UI

Even though route-level guards prevent unauthorized access, you should also hide apps the user can't access from the navigation — otherwise they'd see an app, click it, and get redirected.

**File:** `src/shared/components/AppSwitcher.tsx`

Update the component to filter `APP_REGISTRY` by the user's roles:

```ts
import { Link } from '@tanstack/react-router'
import { ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { APP_REGISTRY, getAppByPath, getAccessibleApps } from '@/apps'
import { getCurrentUser } from '@/shared/auth'

export function AppSwitcher({ currentPath }: AppSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const currentApp = getAppByPath(currentPath)
  const user = getCurrentUser()
  const visibleApps = getAccessibleApps(user?.roles ?? [])

  // ... rest of the component, but replace APP_REGISTRY with visibleApps:

  if (visibleApps.length <= 1) {
    // ...
  }

  return (
    // ... in the dropdown list:
    {visibleApps.map((app) => (
      // ... unchanged
    ))}
  )
}
```

---

### Step 9: Show User Info and Logout in the Header

**File:** `src/shared/components/DefaultHeader.tsx`

Add user info and a logout button to the existing avatar dropdown:

```ts
import { Sun, Moon, User, LogOut } from 'lucide-react'
import { useUIStore } from '@/shared/store'
import { AppNavigation } from '@/shared/components/AppNavigation'
import { getCurrentUser, logout } from '@/shared/auth'
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/shared/components/ui/dropdown-menu'

interface DefaultHeaderProps {
  currentPath: string
}

export function DefaultHeader({ currentPath }: DefaultHeaderProps) {
  const theme = useUIStore((state) => state.theme)
  const toggleTheme = useUIStore((state) => state.toggleTheme)
  const user = getCurrentUser()

  // Get initials for the avatar (e.g. "John Doe" → "JD")
  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <header className="flex items-center justify-between rounded-2xl bg-primary px-6 py-3 shadow-lg">
      <div className="flex flex-1 justify-center">
        <AppNavigation currentPath={currentPath} />
      </div>
      <div className="shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-ring/50">
              <Avatar size="sm">
                <AvatarFallback className="bg-white/15 text-white/80">
                  {initials ?? <User className="size-3.5" />}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {user && (
              <>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onClick={toggleTheme}>
              {theme === 'light' ? <Moon className="size-4" /> : <Sun className="size-4" />}
              {theme === 'light' ? 'Dark mode' : 'Light mode'}
            </DropdownMenuItem>
            {user && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="size-4" />
                  Log out
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
```

---

### Step 10: Enable Auth

Once Steps 1-9 are done and tested, flip the auth flags:

**File:** `src/routes/_app.tsx` — line 7:
```ts
const ENABLE_AUTH = true  // was false
```

**File:** `src/routes/_poc.tsx` — add and set:
```ts
const ENABLE_AUTH = true  // was false (or didn't exist)
```

**File:** `src/shared/auth/AuthGuard.tsx` — line 15 (only needed if you use the `<AuthGuard>` component wrapper anywhere):
```ts
const ENABLE_AUTH = true  // was false
```

> **Tip:** You can enable auth on apps and POCs independently. If you want POCs to remain open during development, keep `ENABLE_AUTH = false` in `_poc.tsx` while setting it to `true` in `_app.tsx`.

---

## Auth Flow Diagrams

### Login Flow

```
User visits /guardrails/dashboard
        │
        ▼
┌─ routeTree.gen.tsx ────────────────────────────────────────────┐
│  appLayoutRoute.beforeLoad → appBeforeLoad()                   │
└────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─ _app.tsx: appBeforeLoad() ────────────────────────────────────┐
│  1. isAuthenticated()?                                         │
│     - Reads token from localStorage                            │
│     - Decodes JWT, checks expiry                               │
│     - NO → redirectToLogin() → SSO login page                  │
│     - YES ↓                                                    │
│  2. getCurrentUser() → get roles                               │
│  3. getAppByPath() → get requiredRoles                         │
│  4. User has required role?                                    │
│     - NO → redirect to /                                       │
│     - YES → allow page to render                               │
└────────────────────────────────────────────────────────────────┘
```

### SSO Callback Flow

```
SSO provider redirects to /auth/callback?token=eyJhbG...
        │
        ▼
┌─ routeTree.gen.tsx ────────────────────────────────────────────┐
│  authCallbackRoute.beforeLoad                                  │
└────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─ handleAuthCallback() ────────────────────────────────────────┐
│  1. Read ?token= from URL params                               │
│  2. Store in localStorage under ssoConfig.tokenKey             │
│  3. Clean token from URL                                       │
└────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─ redirect to / ───────────────────────────────────────────────┐
│  Which redirects to the first app's default route              │
│  (e.g. /guardrails/dashboard)                                  │
└────────────────────────────────────────────────────────────────┘
```

### Role Check Flow

```
User (roles: ['analytics-viewer']) visits /guardrails/dashboard
        │
        ▼
    isAuthenticated() → true (token is valid)
        │
        ▼
    getCurrentUser() → { roles: ['analytics-viewer'] }
        │
        ▼
    getAppByPath('/guardrails/dashboard') → guardrails app
        │
        ▼
    guardrails.requiredRoles = ['guardrails-viewer', 'guardrails-admin', 'admin']
        │
        ▼
    'analytics-viewer' in requiredRoles? → NO
        │
        ▼
    redirect({ to: '/' })
        │
        ▼
    / redirects to first ACCESSIBLE app for this user
```

---

## File Reference

### Files to Modify (in order)

| # | File | What to Change |
|---|------|---------------|
| 1 | `src/shared/auth/config.ts` | Add real SSO URLs for each environment |
| 2 | `src/shared/auth/authService.ts` | Add `roles` to `User`, implement `isAuthenticated`, `getCurrentUser`, `handleAuthCallback` |
| 3 | `src/routeTree.gen.tsx` | Add `/auth/callback` route + add to route tree |
| 4 | `src/apps/index.ts` | Add `requiredRoles` to `AppEntry` interface and each app, add `getAccessibleApps()` helper |
| 5 | `src/poc/index.ts` | Add `requiredRoles` to `POCEntry` interface and each POC |
| 6 | `src/routes/_app.tsx` | Update `appBeforeLoad` to accept `location` and check roles |
| 7 | `src/routes/_poc.tsx` | Add auth + role checking to `pocBeforeLoad` |
| 8 | `src/shared/components/AppSwitcher.tsx` | Filter apps by user roles |
| 9 | `src/shared/components/DefaultHeader.tsx` | Show user name/email, add logout button |
| 10 | `src/routes/_app.tsx` | Set `ENABLE_AUTH = true` |
| 11 | `src/routes/_poc.tsx` | Set `ENABLE_AUTH = true` |
| 12 | `src/shared/auth/AuthGuard.tsx` | Set `ENABLE_AUTH = true` (if using the component) |

### New Dependencies

| Package | Purpose | Install |
|---------|---------|---------|
| `jwt-decode` | Decode JWT tokens client-side (no validation, just parsing) | `npm install jwt-decode` |

> **Note:** `jwt-decode` only **decodes** the payload — it does NOT validate the signature. Signature validation should happen server-side. The client-side check is only for expiry and extracting claims.

### Files That Don't Need Changes

| File | Why |
|------|-----|
| `src/shared/auth/index.ts` | Already re-exports everything you need |
| `src/shared/auth/AuthGuard.tsx` | Already works — just flip the flag. The `<AuthGuard>` component is a secondary protection layer; the primary protection is `beforeLoad` on the layout routes |
| `src/shared/components/AppNavigation.tsx` | Shows routes for the *current* app only. If the user can't access the app, they'll never reach it thanks to `beforeLoad` |

---

## Testing Locally

### Option A: Mock SSO with a Fake Token

To test without a real SSO provider, manually set a token in the browser console:

```js
// Create a fake JWT payload (base64-encoded)
const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
const payload = btoa(JSON.stringify({
  id: '123',
  email: 'dev@company.com',
  name: 'Dev User',
  roles: ['admin'],
  exp: Math.floor(Date.now() / 1000) + 3600,  // 1 hour from now
}))
const fakeToken = `${header}.${payload}.fake-signature`

localStorage.setItem('sso_token', fakeToken)
```

Then refresh the page. Change the `roles` array to test different access levels.

### Option B: Keep ENABLE_AUTH = false

During development, you can leave auth disabled. Auth is fully opt-in via the `ENABLE_AUTH` flags.

### Option C: Run a Local SSO Mock Server

If you need to test the full redirect flow, run a simple mock SSO server on `:8080` that:
1. Serves a login page at `/sso/login`
2. Redirects to `callbackUrl?token=<jwt>` after "login"
3. Serves a logout endpoint at `/sso/logout`

---

## Troubleshooting

| Issue | Likely Cause | Solution |
|-------|-------------|----------|
| Infinite redirect loop | `isAuthenticated()` returns `false` even after SSO login | Check that `handleAuthCallback()` is actually storing the token, and that the `tokenKey` matches |
| Token not persisting | `tokenKey` mismatch between config environments | Make sure all entries in `SSO_CONFIG` use the same `tokenKey` value |
| CORS errors on SSO redirect | SSO provider doesn't allow your callback URL | Register your exact `callbackUrl` (including port) with your SSO admin |
| User is always null | JWT field names don't match `User` interface | Decode your actual JWT (jwt.io) and check the field names — you may need `sub` instead of `id`, `groups` instead of `roles`, etc. |
| Authorized user gets redirected | `requiredRoles` doesn't include the user's actual role string | Log `user.roles` and `app.requiredRoles` in `appBeforeLoad` to compare |
| POC routes return 302 in dev | `IS_DEV` is false | Make sure you're running with `npm run dev` (not a production build) |
| Auth works for apps but not POCs | `ENABLE_AUTH` not added to `_poc.tsx` | Add the flag and auth logic to `pocBeforeLoad` as described in Step 7b |
| `jwt-decode` import error | Package not installed | Run `npm install jwt-decode` |
