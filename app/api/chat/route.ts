import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { SYSTEM_PROMPT } from './SYSTEM_PROMPT'
import { verifySession } from '@/lib/security/access-control'
import { checkRateLimit } from '@/lib/security/rate-limiter'
import {
  validateChatRequest,
  sanitizeInput,
} from '@/lib/security/request-validator'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

function getDomainFromHeader(
  headerValue: string | null | undefined
): string | null {
  if (!headerValue) return null
  try {
    // Può essere più origini separate da spazi, prendi la prima
    const url = new URL(headerValue.split(' ')[0])
    return url.hostname
  } catch {
    return null
  }
}

const ALLOWED_DOMAINS = [
  'localhost',
  '192.168.1.145',
  'fairflai-glitch.vercel.app',
  'hacker-me-fairflai.vercel.app',
  'glitch.fairflai.com',
]

export async function POST(req: Request) {
  // Controllo dominio da Origin o Referer
  const origin = req.headers.get('origin') || req.headers.get('referer')
  const domain = getDomainFromHeader(origin)

  if (!domain || !ALLOWED_DOMAINS.includes(domain)) {
    return Response.json(
      { error: 'Access forbidden: unauthorized domain.' },
      { status: 403 }
    )
  }

  const body = await req.json()

  // 1. Request Validation
  const validation = validateChatRequest(body)
  if (!validation.valid) {
    return Response.json({ error: validation.error }, { status: 400 })
  }

  const { messages, sessionId } = validation.data

  // 2. Session Verification
  if (!sessionId || !verifySession(sessionId)) {
    return Response.json(
      { error: 'Access denied: invalid or expired session.' },
      { status: 401 }
    )
  }

  // 3. Input Sanitization (Sanitize user messages)
  const sanitizedMessages = messages.map(msg => ({
    ...msg,
    content: msg.role === 'user' ? sanitizeInput(msg.content) : msg.content,
  }))

  const result = streamText({
    model: openai('gpt-4.1'),
    messages: sanitizedMessages,
    system: SYSTEM_PROMPT,
  })

  return result.toDataStreamResponse()
}
