// middleware.ts
import { withAuth } from 'next-auth/middleware'
import { NextRequest } from 'next/server'

export const middleware = withAuth(
  function middleware(request: NextRequest) {
    // Add custom middleware logic here
    // Example: check subscription status, rate limiting, etc.
    return undefined
  },
  {
    callbacks: {
      authorized({ token, req }) {
        // Protected routes
        if (req.nextUrl.pathname.startsWith('/dashboard')) {
          return !!token
        }
        if (req.nextUrl.pathname.startsWith('/api/shops')) {
          return !!token
        }
        if (req.nextUrl.pathname.startsWith('/api/subscription')) {
          return !!token
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/shops/:path*',
    '/api/subscription/:path*',
    '/api/checkout/:path*',
  ],
}
