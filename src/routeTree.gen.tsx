import { createRootRoute, createRoute, redirect } from '@tanstack/react-router'
import { Suspense } from 'react'
import { RootLayout } from './routes/__root'
import { AppLayout, appBeforeLoad } from './routes/_app'
import { PocLayout, pocBeforeLoad } from './routes/_poc'
import { Dashboard, Settings } from './apps/guardrails'
import { PocGallery } from './poc/PocGallery'
import { POC_REGISTRY, getPocByPath } from './poc'
import { NotFound } from './shared/components/NotFound'

// Root route
export const rootRoute = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
})

// =============================================================================
// App Layout Routes (requires auth)
// =============================================================================
export const appLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: '_app',
  component: AppLayout,
  beforeLoad: appBeforeLoad,
})

// Redirect root to /guardrails/dashboard
export const indexRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/guardrails/dashboard' })
  },
})

// Redirect /guardrails to /guardrails/dashboard
export const guardrailsIndexRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/guardrails',
  beforeLoad: () => {
    throw redirect({ to: '/guardrails/dashboard' })
  },
})

export const guardrailsDashboardRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/guardrails/dashboard',
  component: Dashboard,
})

export const guardrailsSettingsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/guardrails/settings',
  component: Settings,
})

// =============================================================================
// POC Layout Route (dev only, pathless - wraps all POC routes)
// =============================================================================
export const pocLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: '_poc',
  component: PocLayout,
  beforeLoad: pocBeforeLoad,
})

// POC Gallery at /poc
export const pocGalleryRoute = createRoute({
  getParentRoute: () => pocLayoutRoute,
  path: '/poc',
  component: PocGallery,
})

// Dynamic POC component loader
function createPocComponent(pocPath: string) {
  return function PocLoader() {
    const poc = getPocByPath(pocPath)

    if (!poc) {
      return (
        <main className="poc-content">
          <h1>POC Not Found</h1>
          <p>The requested POC does not exist.</p>
        </main>
      )
    }

    const Component = poc.component

    return (
      <Suspense fallback={<div className="loading">Loading POC...</div>}>
        <Component />
      </Suspense>
    )
  }
}

// Create individual routes for each POC at their custom paths
const pocRoutes = POC_REGISTRY.map((poc) =>
  createRoute({
    getParentRoute: () => pocLayoutRoute,
    path: poc.path,
    component: createPocComponent(poc.path),
  })
)

// =============================================================================
// Route Tree
// =============================================================================
export const routeTree = rootRoute.addChildren([
  appLayoutRoute.addChildren([
    indexRoute,
    guardrailsIndexRoute,
    guardrailsDashboardRoute,
    guardrailsSettingsRoute,
  ]),
  pocLayoutRoute.addChildren([
    pocGalleryRoute,
    ...pocRoutes,
  ]),
])
