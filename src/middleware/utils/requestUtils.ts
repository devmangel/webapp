import { NextRequest } from 'next/server';
import { RequestContext } from '../types/security';

/**
 * Extrae información básica de la solicitud
 */
export function getRequestContext(req: NextRequest): RequestContext {
  return {
    req,
    startTime: Date.now(),
    realIp: getRealIp(req),
    pathname: req.nextUrl.pathname,
    accessToken: req.cookies.get("pai")?.value,
    refreshToken: req.cookies.get("refresh")?.value
  };
}

/**
 * Obtiene la IP real del cliente considerando los headers de proxy
 */
export function getRealIp(req: NextRequest): string {
  return req.headers.get('x-real-ip') || 
         req.headers.get('x-forwarded-for')?.split(',')[0] || 
         'IP no disponible';
}

/**
 * Verifica si una ruta requiere autenticación
 */
export function requiresAuth(pathname: string): boolean {
  const pathnameWithoutLocale = pathname.replace(/^\/[a-z]{2}\//, '/');
  return pathnameWithoutLocale.startsWith('/dashboard') && 
         !pathnameWithoutLocale.match(/^\/dashboard\/(login|loading)/);
}

/**
 * Verifica si es una ruta del sistema que debe ser ignorada
 */
export function isSystemPath(pathname: string): boolean {
  return pathname.startsWith('/_next/') || 
         pathname.startsWith('/api/') || 
         !!pathname.match(/\.[a-zA-Z0-9]+$/);
}

/**
 * Verifica si es una ruta que necesita redirección de locale
 */
export function needsLocaleRedirect(pathname: string): boolean {
  return !pathname.match(/^\/[a-z]{2}(?:\/|$)/) && 
         !isSystemPath(pathname);
}

/**
 * Extrae headers seguros para logging
 */
export function getSafeHeaders(req: NextRequest): Record<string, string> {
  const safeHeaders: Record<string, string> = {};
  const relevantHeaders = [
    'host', 
    'user-agent', 
    'referer', 
    'origin', 
    'accept', 
    'accept-language', 
    'accept-encoding', 
    'x-requested-with'
  ];
  
  for (const header of relevantHeaders) {
    const value = req.headers.get(header);
    if (value) safeHeaders[header] = value;
  }
  
  return safeHeaders;
}

/**
 * Verifica si un referer es válido para el dominio
 */
export function isValidReferer(referer: string | null, allowedDomain: string = 'productos-ai.com'): boolean {
  if (!referer) return true;
  try {
    const refererUrl = new URL(referer);
    return refererUrl.hostname === allowedDomain || 
           refererUrl.hostname.endsWith(`.${allowedDomain}`);
  } catch {
    return false;
  }
}
