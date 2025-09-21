// ======================
// SERVER FUNCTIONS
// ======================
export {
  isAuthenticated,
  getCurrentUser,
  requireAuth,
} from './server'

// ======================
// UTILITY FUNCTIONS
// ======================
export {
  DEFAULT_CALLBACK_URL,
  DEFAULT_SIGNIN_URL,
  AUTH_PROVIDERS,
  getAvailableProviders,
  getProviderDisplayName,
  isValidProvider,
  createCallbackUrl,
  handleAuthError,
  getProviderConfig,
  getErrorFromUrl,
  getCallbackUrlFromParams,
  isValidEmail,
  generateCallbackId,
  formatUserDisplayName,
  getUserInitials,
  isValidCallbackUrl,
  cleanAuthParams
} from './utils'

// ======================
// TYPES (re-export for convenience)
// ======================
export type {
  AuthProvider,
  SignInOptions,
  AuthResponse,
  UserSession,
  NextAuthSignInOptions
} from '../../../types/auth'

// ======================
// COMMON AUTH PATTERNS
// ======================

/**
 * Hook de configuración común para useSession
 */
export const sessionConfig = {
  required: true,
  onUnauthenticated() {
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/signin'
    }
  }
}

/**
 * Hook de configuración opcional para useSession
 */
export const optionalSessionConfig = {
  required: false
}

// ======================
// DOCUMENTATION EXPORTS
// ======================

/**
 * @fileoverview Sistema de autenticación unificado para Next.js App Router
 * 
 * Este módulo exporta funciones organizadas en tres categorías:
 * 
 * 1. **Server Functions** - Para usar en Server Components y Server Actions
 *    - getCurrentSession()
 *    - isAuthenticated()
 *    - signInAction()
 *    - requireAuth()
 *    - etc.
 * 
 * 2. **Utility Functions** - Funciones puras para ambos lados
 *    - handleAuthError()
 *    - formatUserDisplayName()
 *    - isValidEmail()
 *    - etc.
 * 
 * 3. **Components** - Importar directamente desde components/auth/
 *    - SignInButton (from 'components/auth/SignInButton')
 *    - SignOutButton (from 'components/auth/SignOutButton')
 * 
 * @example Server Component
 * ```tsx
 * import { getCurrentSession, requireAuth } from 'lib/auth'
 * 
 * export default async function ProtectedPage() {
 *   await requireAuth()
 *   const session = await getCurrentSession()
 *   return <div>Hello {session?.user?.name}</div>
 * }
 * ```
 * 
 * @example Client Component
 * ```tsx
 * 'use client'
 * import { GoogleSignInButton } from 'components/auth/SignInButton'
 * import { handleAuthError } from 'lib/auth'
 * 
 * export default function LoginForm() {
 *   return <GoogleSignInButton callbackUrl="/dashboard" />
 * }
 * ```
 */
