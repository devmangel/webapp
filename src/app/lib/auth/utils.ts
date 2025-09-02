import { AuthProvider } from '../../../types/auth'

// Constantes de configuración
export const AUTH_PROVIDERS: Record<AuthProvider, string> = {
  google: 'Google',
  facebook: 'Facebook',
  apple: 'Apple',
  github: 'GitHub',
  email: 'Email'
}

// ======================
// FUNCIONES DE UTILIDAD PURAS
// ======================

/**
 * Obtiene la lista de providers disponibles
 */
export function getAvailableProviders(): AuthProvider[] {
  return Object.keys(AUTH_PROVIDERS) as AuthProvider[]
}

/**
 * Obtiene el nombre display de un provider
 */
export function getProviderDisplayName(provider: AuthProvider): string {
  return AUTH_PROVIDERS[provider] || provider
}

/**
 * Valida si un provider es válido
 */
export function isValidProvider(provider: string): provider is AuthProvider {
  return provider in AUTH_PROVIDERS
}

/**
 * Crea URL de callback personalizada
 */
export function createCallbackUrl(path: string, baseUrl?: string): string {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '')
  return `${base}${path.startsWith('/') ? path : '/' + path}`
}

/**
 * Maneja errores de autenticación
 */
export function handleAuthError(error: string): string {
  const errorMessages: Record<string, string> = {
    'CredentialsSignin': 'Credenciales inválidas',
    'EmailSignin': 'Error al enviar email de verificación',
    'OAuthSignin': 'Error al conectar con el proveedor OAuth',
    'OAuthCallback': 'Error en el callback de OAuth',
    'OAuthCreateAccount': 'Error al crear cuenta con OAuth',
    'EmailCreateAccount': 'Error al crear cuenta con email',
    'Callback': 'Error en el callback de autenticación',
    'OAuthAccountNotLinked': 'Cuenta OAuth no vinculada',
    'SessionRequired': 'Sesión requerida',
    'Default': 'Error de autenticación desconocido'
  }

  return errorMessages[error] || errorMessages['Default']
}

/**
 * Genera configuración para diferentes providers
 */
export function getProviderConfig(provider: AuthProvider) {
  const configs = {
    google: {
      scope: 'openid email profile',
      params: { prompt: 'consent', access_type: 'offline', response_type: 'code' }
    },
    facebook: {
      scope: 'email public_profile'
    },
    apple: {
      scope: 'name email'
    },
    github: {
      scope: 'user:email'
    },
    email: {
      // Configuración específica para email provider si es necesaria
    }
  }

  return configs[provider] || {}
}

/**
 * Extrae el error de los parámetros de URL (útil para páginas de error)
 */
export function getErrorFromUrl(): string | null {
  if (typeof window === 'undefined') return null
  
  const urlParams = new URLSearchParams(window.location.search)
  const error = urlParams.get('error')
  
  return error ? handleAuthError(error) : null
}

/**
 * Obtiene el callback URL de los parámetros de URL
 */
export function getCallbackUrlFromParams(defaultUrl: string = '/'): string {
  if (typeof window === 'undefined') return defaultUrl
  
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('callbackUrl') || defaultUrl
}

/**
 * Valida formato de email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Genera un ID único para callbacks
 */
export function generateCallbackId(): string {
  return `auth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Formatea nombre de usuario para display
 */
export function formatUserDisplayName(name?: string | null, email?: string | null): string {
  if (name) return name
  if (email) return email.split('@')[0]
  return 'Usuario'
}

/**
 * Obtiene las iniciales del usuario para avatares
 */
export function getUserInitials(name?: string | null, email?: string | null): string {
  const displayName = name || email?.split('@')[0] || 'U'
  
  const parts = displayName.split(' ')
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  
  return displayName.substring(0, 2).toUpperCase()
}

/**
 * Verifica si una URL es válida para callback
 */
export function isValidCallbackUrl(url: string): boolean {
  try {
    const parsed = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'http://localhost')
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Limpia parámetros de autenticación de una URL
 */
export function cleanAuthParams(url: string): string {
  try {
    const parsed = new URL(url)
    const authParams = ['error', 'code', 'state', 'session_state']
    
    authParams.forEach(param => {
      parsed.searchParams.delete(param)
    })
    
    return parsed.toString()
  } catch {
    return url
  }
}
