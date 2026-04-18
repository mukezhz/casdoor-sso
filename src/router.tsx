import { createRouter } from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'
import { routeTree } from './routeTree.gen'

export const queryClient = new QueryClient()

// Set up a Router instance
export const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
  defaultNotFoundComponent: () => (
    <section className="auth-card">
      <h1 className="auth-title">Page not found</h1>
      <p className="auth-subtitle">Check the URL and try again.</p>
    </section>
  ),
})

export function getRouter() {
  return router
}

// Register things for typesafety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}