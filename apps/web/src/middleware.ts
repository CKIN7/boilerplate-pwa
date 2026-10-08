import createMiddleware from 'next-intl/middleware';
import { routing } from './lib/i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/es/demo', request.url), 307);
  }
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/((?!api|_next|_vercel|.*\\..*).*)'],
};
