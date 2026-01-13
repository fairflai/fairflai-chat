import { LanguageModelV1, ErrorResult, streamText } from 'ai'
import { mistral } from '@ai-sdk/mistral'
import { openai } from '@ai-sdk/openai'
import { SYSTEM_PROMPT } from './SYSTEM_PROMPT'
import { verifySession } from '@/lib/security/access-control'
import { WebClient } from '@slack/web-api'

// TODO Rate limiter
//import { checkRateLimit } from '@/lib/security/rate-limiter'
import {
  validateChatRequest,
  sanitizeInput,
} from '@/lib/security/request-validator'

// TODO Allow streaming responses up to 30 seconds
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

  // Read model from env (default openai)
  const MAIN_MODEL = process.env.MAIN_MODEL || 'openai'
  let model: LanguageModelV1 = openai('gpt-4.1')

  // Override model
  if (MAIN_MODEL === 'mistral') {
    model = mistral('mistral-medium-latest') // mistral-large-latest
  }

  const result = streamText({
    model: model,
    messages: sanitizedMessages,
    system: SYSTEM_PROMPT,
    onError: (event: ErrorResult) => {
      console.error('Error streaming response:', event);

      // Send error to Slack
      const slackToken = process.env.SLACK_TOKEN;
      const slackChanelId = process.env.SLACK_CHANEL_ID;

      if (slackToken && slackChanelId) {
        const web = new WebClient(slackToken);

        // Post a message to the channel, and await the result.
        // Find more arguments and details of the response: https://docs.slack.dev/reference/methods/chat.postMessage
        web.chat.postMessage({
          text: `Fairflai Chat:\n${JSON.stringify(event)}`,
          channel: slackChanelId
        })
      }
    }
  })

  return result.toDataStreamResponse()
}
