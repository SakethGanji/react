import { ReactNode, useEffect, useState } from 'react'
import { isAuthenticated, redirectToLogin } from './authService'

interface AuthGuardProps {
  children: ReactNode
}

/**
 * Wraps protected routes - redirects to SSO if not authenticated
 *
 * TODO: Set ENABLE_AUTH to true when SSO is implemented
 */

// Toggle this to enable/disable auth checking
const ENABLE_AUTH = false

export function AuthGuard({ children }: AuthGuardProps) {
  const [checking, setChecking] = useState(ENABLE_AUTH)

  useEffect(() => {
    if (!ENABLE_AUTH) return

    if (!isAuthenticated()) {
      redirectToLogin()
    } else {
      setChecking(false)
    }
  }, [])

  if (checking) {
    return (
      <div className="dashboard">
        <div className="dashboard-content">
          <div className="loading">Authenticating...</div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
