import { ssoConfig } from './config'

export interface User {
  id: string
  email: string
  name: string
  // Add more fields as needed from your SSO provider
}

/**
 * Check if user is authenticated
 * TODO: Implement actual token validation
 */
export function isAuthenticated(): boolean {
  const token = localStorage.getItem(ssoConfig.tokenKey)
  // TODO: Validate token expiry, signature, etc.
  return !!token
}

/**
 * Get current user from token
 * TODO: Implement actual token parsing
 */
export function getCurrentUser(): User | null {
  const token = localStorage.getItem(ssoConfig.tokenKey)
  if (!token) return null

  // TODO: Decode JWT or fetch user from your SSO provider
  // Example: return jwtDecode<User>(token)

  // Placeholder - replace with actual implementation
  return null
}

/**
 * Redirect to SSO login
 */
export function redirectToLogin(): void {
  const returnUrl = encodeURIComponent(window.location.href)
  window.location.href = `${ssoConfig.loginUrl}?returnUrl=${returnUrl}`
}

/**
 * Handle SSO callback
 * TODO: Implement actual token extraction from callback
 */
export function handleAuthCallback(): boolean {
  // TODO: Extract token from URL params or response
  // Example:
  // const params = new URLSearchParams(window.location.search)
  // const token = params.get('token')
  // if (token) {
  //   localStorage.setItem(ssoConfig.tokenKey, token)
  //   return true
  // }
  return false
}

/**
 * Logout and redirect to SSO logout
 */
export function logout(): void {
  localStorage.removeItem(ssoConfig.tokenKey)
  window.location.href = ssoConfig.logoutUrl
}
