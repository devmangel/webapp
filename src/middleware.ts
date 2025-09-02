import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// next-intl middleware to handle locale prefixes and routing
export default createMiddleware(routing);

// Limit middleware to localized paths and root for redirects
export const config = {
  matcher: [
    '/',
    '/(en|es|zh|ar)/:path*'
  ]
};
