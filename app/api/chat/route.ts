import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = streamText({
    model: openai("gpt-4.1-nano"),
    messages,
    system: "Sei un assistente AI utile e amichevole. Rispondi in modo chiaro e conciso.",
  })

  return result.toDataStreamResponse()
}
