import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Route configurations
const ROUTES = {
  public: [
    '/',
    '/auth/*',
    '/how-it-works',
    '/browse-pros',
  ],
  profileCreation: [
    '/client/create-profile/*',
    '/pro-signup/*',
  ],
  protected: [
    '/dashboard/*',
    '/post-job',
    '/messages/*',
    '/bookings/*',
    '/admin/*',
  ],
  professional: [
    '/dashboard/professional/*',
  ],
  client: [
    '/post-job',
    '/dashboard/client/*',
  ]
} as const

// Helper to check if a path matches a route pattern
const matchesRoute = (pathname: string, pattern: string): boolean => {
  if (pattern.endsWith('/*')) {
    return pathname.startsWith(pattern.slice(0, -2))
  }
  return pathname === pattern
}

// Helper to check if a path matches any route in a route group
const matchesRouteGroup = (pathname: string, routes: readonly string[]): boolean => {
  return routes.some(route => matchesRoute(pathname, route))
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const { pathname } = request.nextUrl

  // Allow access to public routes
  if (matchesRouteGroup(pathname, ROUTES.public)) {
    return response
  }

  // Check for session cookie
  const sessionCookie = request.cookies.get('session')?.value

  if (!sessionCookie) {
    // Redirect to sign in if not on sign in page
    if (pathname !== '/auth/signin') {
      const redirectUrl = new URL('/auth/signin', request.url)
      redirectUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(redirectUrl)
    }
    return response
  }

  // For protected routes, we'll verify the session in the API routes
  // This is a simple presence check for the middleware
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|api/).*)',
  ],
} 