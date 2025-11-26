import { z } from 'zod'

const chatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string(),
    })
  ),
  sessionId: z.string().optional(),
  cardId: z.number().min(1).max(15).optional(),
})

type ValidationResult =
  | { valid: false; error: string }
  | { valid: true; data: z.infer<typeof chatSchema> }

export function validateChatRequest(body: unknown): ValidationResult {
  const result = chatSchema.safeParse(body)
  if (!result.success) {
    return { valid: false, error: result.error.message }
  }

  // Content length check for the last user message
  const messages = result.data.messages
  const lastMessage = messages[messages.length - 1]
  if (lastMessage && lastMessage.role === 'user') {
    if (lastMessage.content.length > 3500) {
      return { valid: false, error: 'Message exceeds 3500 characters limit.' }
    }
  }

  return { valid: true, data: result.data }
}

export function sanitizeInput(text: string): string {
  // Basic HTML tag stripping
  return text.replace(/<[^>]*>?/gm, '')
}
