import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// next-intl middleware to handle locale prefixes and routing
export default createMiddleware(routing);

// Limit middleware to localized paths and root for redirects
export const config = {
  runtime: 'nodejs',
  matcher: [
    // Incluye la raíz y rutas principales para redirección de locale
    '/',
    '/((?!api|_next|_vercel|.*\\..*).*)' // Excluye API routes, assets estáticos y archivos
  ]
};
