import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'


const PUBLIC_PATHS = ['/', '/login', '/register', '/api/auth/login', '/api/auth/register']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths (exactly matching '/' or starting with other public paths)
  if (pathname === '/' || PUBLIC_PATHS.some((p) => p !== '/' && pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Check for auth token presence. Actual verification happens in Server Components/API Routes
  const token = request.cookies.get('spreetail_token')?.value
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
