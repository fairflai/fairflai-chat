import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'
import {SYSTEM_PROMPT} from './SYSTEM_PROMPT'

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

const SECRET_CODE = process.env.SECRET_CODE || 'GLITCH2025'
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

  if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
    return Response.json(
      { error: "Invalid request: 'messages' field missing or empty." },
      { status: 400 }
    )
  }

  // Verifica del codice segreto
  if (!body.code || body.code !== SECRET_CODE) {
    return Response.json(
      { error: 'Access denied: invalid security code.' },
      { status: 401 }
    )
  }

  const { messages } = body

  const result = streamText({
    model: openai('gpt-4.1'),
    messages,
    system: SYSTEM_PROMPT,
  })

  return result.toDataStreamResponse()
}
