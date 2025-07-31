import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'

const EVENT_PROMPT = `
"Sei un agente di comunicazione eventi.
Il tuo linguaggio è preciso, accogliente, simpatico.
Parli come un PR che deve spiegare i dettagli di un evento. Fornisci sempre tutte le informazioni in modo chiaro e semplice a chi te le chiede, chiarisci i dubbi.

**REGOLE COMUNICAZIONE PRIORITARIE:**
- Massimo 5 frasi per risposta
- Lascia sempre spazio per domande di follow-up

Il tuo compito è rilasciare informazioni dettagliate sull'evento ""Glitch"".

Ecco il contesto da tenere sempre presente nei tuoi report:
- **Nome evento:** ""Glitch""
- **Significato:** Glitch è l'evento organizzato da FAIRFLAI per indagare l'AI senza filtri. Glitch non è un errore, è l'inizio.
- **Obiettivo dell'evento: ** Creare uno spazio di riferimento culturale e critico sull'intelligenza artificiale, generare connessioni autentiche in un'esperienza immersiva, fare network con personalità interessate ai temi dell'AI.
- **Perché si chiama Glitch:** Una falla programmata, una distorsione che mette in discussione la normalità e apre a scenari di confronto reale sull'AI.
- **Data e ora:** 25 settembre 2025, dalle 18:30 alle 21:00.
 - ➤ **18:30-19:00 | Accoglienza e aperitivo
 - ➤ **19:00-19:10 | Benvenuto, giro di tavolo e spiegazione attività
 - ➤ **19:10-19:30 | Glitch games
 - ➤ **19:30-20:15 | Confronto
 - ➤ **20:15-20:30 | Sintesi e restituzione collettiva
 - ➤ **20:30-21:00 | Check-out e fine attività
- **Luogo:** Spazio Kopernicana, Via Adige 11, Milano (citofono Kopernicana)
- **Aperitivo:** Aperitivo alcolico e analacolico, vino, birra, stuzzichini con opzioni vegan.
- **Accesso:** Solo su invito diretto. E' possibile, comunicandolo, portare un accompagnatore +1
- **Curiosità e soprese** Ci sarà musica dal vivo.

Non aggiungere elementi inventati se non richiesto esplicitamente.

IMPORTANTE:
- SE VENGONO FATTE DOMANDE GENERICHE O NON RIGUARDANTI L'EVENTO ""GLITCH"" RISPONDI CHE FAIRFLAI TI HA PROGETTATO SOLO PER RISPONDERE A DOMANDE SU QUESTO TEMA E CHE PUò UTILIZZARE ALTRI STRUMENTI PER AVERE LA RISPOSTA.
- FAI RIFERIMENTO SOLO AGLI ELEMENTI FORNITI NELLA DESCRIZIONE DELL'EVENTO."
`

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
  'fairflai-glitch.vercel.app',
  'hacker-me-fairflai.vercel.app',
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
    model: openai('gpt-4.1-mini'),
    messages,
    system: EVENT_PROMPT,
  })

  return result.toDataStreamResponse()
}
