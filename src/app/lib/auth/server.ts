import { getServerSession } from 'next-auth/next';
import { authOptions } from './config';
import { redirect } from 'next/navigation';
import type { Session } from 'next-auth';

/**
 * Obtiene la sesión del usuario en el servidor
 * @returns Promise<Session | null>
 */
export async function getServerAuthSession(): Promise<Session | null> {
  return await getServerSession(authOptions);
}

/**
 * Verifica si el usuario está autenticado
 * @returns Promise<boolean>
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getServerAuthSession();
  return !!session?.user;
}

/**
 * Obtiene el usuario autenticado o null
 * @returns Promise<Session['user'] | null>
 */
export async function getCurrentUser(): Promise<Session['user'] | null> {
  const session = await getServerAuthSession();
  return session?.user ?? null;
}

/**
 * Requiere autenticación y redirige a login si no está autenticado
 * @param callbackUrl - URL a la que redirigir después del login
 * @param locale - Locale actual para la redirección
 */
export async function requireAuth(callbackUrl?: string, locale: string = 'es'): Promise<Session> {
  const session = await getServerAuthSession();
  
  if (!session || !session.user) {
    const loginUrl = `/${locale}/login`;
    const redirectUrl = callbackUrl 
      ? `${loginUrl}?callbackUrl=${encodeURIComponent(callbackUrl)}` 
      : loginUrl;
    
    redirect(redirectUrl);
  }
  
  return session;
}

/**
 * Verifica si una ruta necesita autenticación
 * @param pathname - Ruta a verificar
 * @returns boolean
 */
export function requiresAuth(pathname: string): boolean {
  // Rutas que requieren autenticación
  const protectedRoutes = [
    '/dashboard',
  ];
  
  // Rutas públicas (no requieren auth)
  const publicRoutes = [
    '/login',
    '/signup',
    '/auth',
    '/api/auth',
    '/',
    '/blog',
    '/privacidad',
    '/terminos',
  ];

  // Remover el locale del pathname para la verificación
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, '') || '/';
  
  // Verificar si es una ruta pública
  if (publicRoutes.some(route => pathWithoutLocale.startsWith(route))) {
    return false;
  }
  
  // Verificar si es una ruta protegida
  return protectedRoutes.some(route => pathWithoutLocale.startsWith(route));
}

/**
 * Extrae el locale de una ruta
 * @param pathname - Ruta completa
 * @returns string - Locale extraído o 'es' por defecto
 */
export function extractLocale(pathname: string): string {
  const match = pathname.match(/^\/([a-z]{2}(-[A-Z]{2})?)/);
  return match ? match[1] : 'es';
}

/**
 * Construye URL de login con callback
 * @param locale - Locale actual
 * @param callbackUrl - URL de callback
 * @returns string - URL completa de login
 */
export function buildLoginUrl(locale: string, callbackUrl?: string): string {
  const loginPath = `/${locale}/login`;
  return callbackUrl 
    ? `${loginPath}?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : loginPath;
}
