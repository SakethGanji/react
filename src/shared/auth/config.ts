/**
 * SSO Configuration
 *
 * Configure your internal SSO provider here.
 */

export interface SSOConfig {
  // SSO provider URL
  loginUrl: string
  // URL to redirect after logout
  logoutUrl: string
  // Where SSO redirects back after auth
  callbackUrl: string
  // Token storage key
  tokenKey: string
}

// Configure per environment
const SSO_CONFIG: Record<string, SSOConfig> = {
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
  // Production
  // 'app.yourcompany.com': {
  //   loginUrl: 'https://sso.yourcompany.com/login',
  //   logoutUrl: 'https://sso.yourcompany.com/logout',
  //   callbackUrl: 'https://app.yourcompany.com/auth/callback',
  //   tokenKey: 'sso_token',
  // },
}

const DEFAULT_CONFIG: SSOConfig = {
  loginUrl: '/sso/login',
  logoutUrl: '/sso/logout',
  callbackUrl: '/auth/callback',
  tokenKey: 'sso_token',
}

export function getSSOConfig(): SSOConfig {
  const hostname = window.location.hostname
  return SSO_CONFIG[hostname] ?? DEFAULT_CONFIG
}

export const ssoConfig = getSSOConfig()
