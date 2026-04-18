import { Outlet, createRootRoute } from "@tanstack/react-router";

function RootLayout() {
  return (
    <main className="page-shell">
      <Outlet />
    </main>
  );
}

function RootNotFound() {
  return (
    <section className="auth-card">
      <h1 className="auth-title">Page not found</h1>
      <p className="auth-subtitle">The page you requested does not exist.</p>
    </section>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: RootNotFound,
});
