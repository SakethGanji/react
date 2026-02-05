import { Link } from '@tanstack/react-router'

export function NotFound() {
  return (
    <main className="not-found">
      <h1>404</h1>
      <p>Page not found</p>
      <Link to="/guardrails/dashboard" className="not-found-link">
        Go to Dashboard
      </Link>
    </main>
  )
}
