import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

// next-intl middleware to handle locale prefixes and routing
const handleI18nRouting = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  // Force explicit locale prefix for root path
  if (request.nextUrl.pathname === '/') {
    const url = new URL('/es', request.url);
    return NextResponse.redirect(url);
  }

  return handleI18nRouting(request);
}

// Limit middleware to localized paths and root for redirects
export const config = {
  // Run on all non-static routes to ensure locale handling
  matcher: [
    '/((?!api|_next|.*\\..*).*)'
  ]
};
