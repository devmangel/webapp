import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { requiresAuth, extractLocale, buildLoginUrl } from './app/lib/auth/server';

// Crear middleware de next-intl
const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Excluir rutas que no necesitan procesamiento
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname === '/manifest.json' ||
    pathname.startsWith('/_vercel') ||
    pathname.includes('.') // Archivos estáticos
  ) {
    return NextResponse.next();
  }

  // Verificar si la ruta requiere autenticación
  if (requiresAuth(pathname)) {
    try {
      // Obtener token de NextAuth
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      });

      // Si no hay token (no autenticado), redirigir a login
      if (!token) {
        const locale = extractLocale(pathname);
        const loginUrl = buildLoginUrl(locale, request.nextUrl.toString());

        console.log(`🔒 Acceso no autorizado a ${pathname}, redirigiendo a login`);
        return NextResponse.redirect(new URL(loginUrl, request.url));
      }

      // Si está autenticado, continuar con el flujo normal
      console.log(`✅ Usuario autenticado accediendo a ${pathname}`);
    } catch (error) {
      console.error('❌ Error verificando autenticación:', error);

      // En caso de error, redirigir a login por seguridad
      const locale = extractLocale(pathname);
      const loginUrl = buildLoginUrl(locale);
      return NextResponse.redirect(new URL(loginUrl, request.url));
    }
  }

  // Aplicar middleware de internacionalización
  return intlMiddleware(request);
}

// Configuración del matcher
export const config = {
  runtime: 'nodejs',
  matcher: [
    // Incluye la raíz y rutas principales para redirección de locale
    '/',
    // Incluye todas las rutas excepto las excluidas
    '/((?!api/|_next|_vercel|.*\\..*).*)',
  ]
};
