export interface RateLimitConfig {
  limit: number
  windowMs: number
}

interface RateLimitEntry {
  count: number
  startTime: number
}

const rateLimits = new Map<string, RateLimitEntry>()

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { success: boolean; remaining: number; reset: number } {
  console.log('[rate-limiter] Checking rate limit for:', identifier)

  const now = Date.now()
  const entry = rateLimits.get(identifier)

  if (!entry) {
    rateLimits.set(identifier, { count: 1, startTime: now })
    return {
      success: true,
      remaining: config.limit - 1,
      reset: now + config.windowMs,
    }
  }

  if (now - entry.startTime > config.windowMs) {
    // Reset window
    entry.count = 1
    entry.startTime = now
    return {
      success: true,
      remaining: config.limit - 1,
      reset: now + config.windowMs,
    }
  }

  if (entry.count >= config.limit) {
    return {
      success: false,
      remaining: 0,
      reset: entry.startTime + config.windowMs,
    }
  }

  entry.count++
  return {
    success: true,
    remaining: config.limit - entry.count,
    reset: entry.startTime + config.windowMs,
  }
}

// Clean up old entries periodically to prevent memory leaks
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimits.entries()) {
    if (now - entry.startTime > 60000) {
      // Default cleanup older than 1 min
      rateLimits.delete(key)
    }
  }
}, 60000)
