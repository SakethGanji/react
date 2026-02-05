# SSO Implementation Guide

## Quick Start

1. **Enable auth checking** in `AuthGuard.tsx`:
   ```ts
   const ENABLE_AUTH = true
   ```

2. **Configure SSO URLs** in `config.ts` for each environment

3. **Implement the auth functions** in `authService.ts`

---

## Step-by-Step

### 1. Configure SSO URLs (`config.ts`)

Update the `SSO_CONFIG` object with your SSO provider URLs:

```ts
const SSO_CONFIG: Record<string, SSOConfig> = {
  'localhost': {
    loginUrl: 'http://localhost:8080/sso/login',
    logoutUrl: 'http://localhost:8080/sso/logout',
    callbackUrl: 'http://localhost:5173/auth/callback',
    tokenKey: 'sso_token',
  },
  'app.yourcompany.com': {
    loginUrl: 'https://sso.yourcompany.com/login',
    logoutUrl: 'https://sso.yourcompany.com/logout',
    callbackUrl: 'https://app.yourcompany.com/auth/callback',
    tokenKey: 'sso_token',
  },
}
```

### 2. Implement `isAuthenticated()` (`authService.ts`)

Check if the user has a valid token:

```ts
export function isAuthenticated(): boolean {
  const token = localStorage.getItem(ssoConfig.tokenKey)
  if (!token) return false

  // Option A: Decode JWT and check expiry
  try {
    const decoded = jwtDecode<{ exp: number }>(token)
    return decoded.exp * 1000 > Date.now()
  } catch {
    return false
  }

  // Option B: Call your SSO validation endpoint
  // return await fetch('/api/auth/validate').then(r => r.ok)
}
```

### 3. Implement `getCurrentUser()` (`authService.ts`)

Extract user info from the token:

```ts
export function getCurrentUser(): User | null {
  const token = localStorage.getItem(ssoConfig.tokenKey)
  if (!token) return null

  try {
    const decoded = jwtDecode<User>(token)
    return {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
    }
  } catch {
    return null
  }
}
```

### 4. Implement `handleAuthCallback()` (`authService.ts`)

Handle the redirect back from SSO:

```ts
export function handleAuthCallback(): boolean {
  const params = new URLSearchParams(window.location.search)
  const token = params.get('token')

  if (token) {
    localStorage.setItem(ssoConfig.tokenKey, token)
    // Clean up URL
    window.history.replaceState({}, '', window.location.pathname)
    return true
  }
  return false
}
```

### 5. Add callback route (if needed)

If your SSO redirects to `/auth/callback`, add a route in `routeTree.gen.ts`:

```ts
export const authCallbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/callback',
  beforeLoad: () => {
    handleAuthCallback()
    throw redirect({ to: '/guardrail-dashboard' })
  },
})

export const routeTree = rootRoute.addChildren([
  indexRoute,
  guardrailDashboardRoute,
  settingsRoute,
  authCallbackRoute,  // Add this
])
```

### 6. Enable auth

In `AuthGuard.tsx`:

```ts
const ENABLE_AUTH = true
```

---

## Optional: Add user info to NavBar

```tsx
// In NavigationBar.tsx
import { getCurrentUser, logout } from '../auth'

export function NavigationBar() {
  const user = getCurrentUser()

  return (
    <header className="dashboard-header">
      {/* ... existing nav ... */}
      {user && (
        <div className="user-menu">
          <span>{user.name}</span>
          <button onClick={logout}>Logout</button>
        </div>
      )}
    </header>
  )
}
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Infinite redirect loop | Check `isAuthenticated()` returns true after login |
| Token not persisting | Verify `tokenKey` matches in config |
| CORS errors | Ensure SSO provider allows your callback URL |
| User always null | Check JWT decode matches your token structure |
