export { AuthGuard } from './AuthGuard'
export { ssoConfig } from './config'
export type { SSOConfig } from './config'
export {
  isAuthenticated,
  getCurrentUser,
  redirectToLogin,
  handleAuthCallback,
  logout,
} from './authService'
export type { User } from './authService'
