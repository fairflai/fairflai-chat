import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { checkRateLimit } from './lib/security/rate-limiter'

export function middleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const userAgent = request.headers.get('user-agent') || ''

  // 1. Bot Detection (Basic)
  const botPattern = /bot|crawler|spider|crawling/i
  if (botPattern.test(userAgent)) {
    console.log(`[Security] Suspicious bot detected: ${userAgent} from ${ip}`)
    // Optionally block or just log. For now, we proceed but could add a header or flag.
  }

  // 2. IP-based Rate Limiting (20 req/min)
  if (request.nextUrl.pathname.startsWith('/api')) {
    const limitResult = checkRateLimit(ip, { limit: 20, windowMs: 60000 })
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
  }

  const response = NextResponse.next()

  // 3. Security Headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  return response
}

export const config = {
  matcher: '/:path*',
}
