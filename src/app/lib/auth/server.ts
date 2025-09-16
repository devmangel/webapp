'use server'

import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { UserSession, AuthProvider, SignInOptions } from 'types/auth'
import { DEFAULT_CALLBACK_URL, DEFAULT_SIGNIN_URL } from './utils'

// ======================
// SERVER SESSION FUNCTIONS
// ======================

/**
 * Obtiene la sesión actual del servidor
 */
export async function getCurrentSession(): Promise<UserSession | null> {
  try {
    const session = await getServerSession()
    return session as UserSession | null
  } catch (error) {
    console.error('Error obteniendo sesión del servidor:', error)
    return null
  }
}

/**
 * Verifica si el usuario está autenticado
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getCurrentSession()
  return !!session?.user
}

/**
 * Obtiene información del usuario actual
 */
export async function getCurrentUser() {
  const session = await getCurrentSession()
  return session?.user || null
}

// ======================
// SERVER ACTIONS - AUTENTICACIÓN
// ======================

/**
 * Server Action para iniciar sesión
 */
export async function signInAction(provider: AuthProvider, options?: Partial<SignInOptions>) {
  try {
    const callbackUrl = options?.callbackUrl || DEFAULT_CALLBACK_URL
    
    // Para email provider, necesitamos manejar diferente
    if (provider === 'email' && options?.email) {
      // Redirigir a NextAuth con los parámetros
      redirect(`/api/auth/signin/email?email=${encodeURIComponent(options.email)}&callbackUrl=${encodeURIComponent(callbackUrl)}`)
    } else {
      // Para OAuth providers
      redirect(`/api/auth/signin/${provider}?callbackUrl=${encodeURIComponent(callbackUrl)}`)
    }
  } catch (error) {
    console.error('Error en signInAction:', error)
    throw error
  }
}

/**
 * Server Action para cerrar sesión
 */
export async function signOutAction(callbackUrl?: string) {
  try {
    const finalCallbackUrl = callbackUrl || DEFAULT_SIGNIN_URL
    redirect(`/api/auth/signout?callbackUrl=${encodeURIComponent(finalCallbackUrl)}`)
  } catch (error) {
    console.error('Error en signOutAction:', error)
    throw error
  }
}

// ======================
// SERVER ACTIONS - REDIRECCIONES
// ======================

/**
 * Redirige basado en el estado de autenticación
 */
export async function redirectAfterAuth(authenticatedUrl: string = '/', unauthenticatedUrl: string = DEFAULT_SIGNIN_URL) {
  const isAuth = await isAuthenticated()
  
  if (isAuth) {
    redirect(authenticatedUrl)
  } else {
    redirect(unauthenticatedUrl)
  }
}

/**
 * Protege una ruta requiriendo autenticación
 */
export async function requireAuth(redirectTo: string = DEFAULT_SIGNIN_URL) {
  const isAuth = await isAuthenticated()
  
  if (!isAuth) {
    redirect(redirectTo)
  }
}

/**
 * Server Action para redirigir a la página de inicio de sesión
 */
export async function redirectToSignIn(callbackUrl?: string) {
  const url = callbackUrl ? `${DEFAULT_SIGNIN_URL}?callbackUrl=${encodeURIComponent(callbackUrl)}` : DEFAULT_SIGNIN_URL
  redirect(url)
}

/**
 * Server Action para redirigir después del logout
 */
export async function redirectToHome() {
  redirect('/')
}

/**
 * Server Action para redirigir al dashboard si está autenticado
 */
export async function redirectToDashboard() {
  const isAuth = await isAuthenticated()
  if (isAuth) {
    redirect('/dashboard')
  }
}

// ======================
// SERVER UTILITIES
// ======================

/**
 * Verifica si el usuario tiene un rol específico (extensible)
 */
export async function hasRole(role: string): Promise<boolean> {
  const session = await getCurrentSession()
  // @ts-expect-error - Para futuras extensiones de roles
  return session?.user?.role === role || false
}

/**
 * Obtiene información extendida del usuario (extensible)
 */
export async function getUserProfile() {
  const session = await getCurrentSession()
  if (!session?.user) return null
  
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
    // Aquí se pueden agregar más campos en el futuro
  }
}
