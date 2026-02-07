import { createRootRoute, createRoute, redirect } from '@tanstack/react-router'
import { Suspense } from 'react'
import { RootLayout } from './routes/__root'
import { AppLayout, appBeforeLoad } from './routes/_app'
import { NotFound } from './shared/components/NotFound'
import { APP_REGISTRY } from './apps'

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

// Redirect root to first app's default route
export const indexRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: APP_REGISTRY[0]?.defaultRoute ?? '/' })
  },
})

// Dynamically create routes for each app from APP_REGISTRY
const appRoutes = APP_REGISTRY.flatMap((app) => {
  // Redirect /guardrails → /guardrails/dashboard (basePath → defaultRoute)
  const appIndexRoute = createRoute({
    getParentRoute: () => appLayoutRoute,
    path: app.basePath,
    beforeLoad: () => {
      throw redirect({ to: app.defaultRoute })
    },
  })

  // Create a route for each page in the app
  const pageRoutes = app.routes.map((route) => {
    const Component = route.component
    return createRoute({
      getParentRoute: () => appLayoutRoute,
      path: `${app.basePath}/${route.path}`,
      component: () => (
        <Suspense fallback={<div className="loading">Loading...</div>}>
          <Component />
        </Suspense>
      ),
    })
  })

  return [appIndexRoute, ...pageRoutes]
})

// =============================================================================
// POC Layout Route (dev only)
// =============================================================================
// Static imports here, but they are ONLY referenced inside the
// `import.meta.env.DEV` block below. Vite replaces DEV with `false` in
// production builds, making the block dead code. The tree-shaker then
// drops these imports (and their transitive dependencies) from the bundle.
import { PocLayout, pocBeforeLoad } from './routes/_poc'
import { PocGallery } from './poc/PocGallery'
import { POC_REGISTRY, getPocByPath } from './poc'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pocRouteTree: any[] = []

if (import.meta.env.DEV) {
  const pocLayoutRoute = createRoute({
    getParentRoute: () => rootRoute,
    id: '_poc',
    component: PocLayout,
    beforeLoad: pocBeforeLoad,
  })

  const pocGalleryRoute = createRoute({
    getParentRoute: () => pocLayoutRoute,
    path: '/gallery',
    component: PocGallery,
  })

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

  const pocRoutes = POC_REGISTRY.map((poc) =>
    createRoute({
      getParentRoute: () => pocLayoutRoute,
      path: poc.path,
      component: createPocComponent(poc.path),
    })
  )

  pocRouteTree = [pocLayoutRoute.addChildren([pocGalleryRoute, ...pocRoutes])]
}

// =============================================================================
// Route Tree
// =============================================================================
export const routeTree = rootRoute.addChildren([
  appLayoutRoute.addChildren([
    indexRoute,
    ...appRoutes,
  ]),
  ...pocRouteTree,
])
