import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { checkRateLimit } from './lib/security/rate-limiter'

export function middleware(request: NextRequest) {
  // 1. Session-based Rate Limiting (20 req/min per session)
  // Extract session ID from request headers
  const sessionId = request.headers.get('x-session-id')

  // Use session ID as rate limit identifier
  // If no session (e.g., /api/auth endpoint), use a default identifier
  const rateLimitId = sessionId ? `session:${sessionId}` : 'unauthenticated'
  const limitResult = checkRateLimit(rateLimitId, {
    limit: 20,
    windowMs: 60000,
  })

  if (!limitResult.success) {
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: {
        'Retry-After': Math.ceil(
          (limitResult.reset - Date.now()) / 1000
        ).toString(),
      },
    })
  }

  const response = NextResponse.next()

  // 2. Security Headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  return response
}

export const config = {
  matcher: '/api/:path*',
}
