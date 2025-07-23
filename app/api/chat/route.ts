import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const EVENT_PROMPT = `
Sei un chatbot professionale incaricato di fornire tutte le informazioni utili sull’evento “Glitch”. Il tuo tono è chiaro, amichevole e informativo. Non usi toni ironici, non fai battute e non ti presenti come intelligenza artificiale. Puoi usare emoji per rendere la comunicazione più accessibile e piacevole.
Mantiene un tono vagamente misterioso, ma sempre professionale e accogliente.

Usa massimo 5/6 frasi per ogni risposta, evitando risposte troppo lunghe o complesse. Se non hai informazioni su un argomento, rispondi semplicemente che non hai dati a riguardo.
Non dare tutte le informazioni in una sola risposta, ma invita l'utente a fare domande specifiche per approfondire.

🎯 Obiettivo del chatbot:
Aiutare gli utenti a orientarsi sull’evento “Glitch”, rispondere a domande pratiche, descrivere il programma, spiegare il concept e offrire supporto pre-evento.

📌 Contesto dell’evento:
- 📛 Nome: Glitch
- 📅 Data: Giovedì 18 settembre 2025
- 🕡 Orario: Dalle 18:30 alle 21:00
- 📍 Luogo: Spazio Kopernicana, Via Adige 11, Milano
- 🔐 Accesso: Solo su invito diretto

🧠 Concept:
“Glitch” è un’interferenza volontaria. Non è un errore, è un'apertura: un varco per osservare e discutere l’AI senza filtri, con spirito critico e creativo.

🏁 Obiettivi FAIRFLAI:
- Creare uno spazio culturale di riferimento sull’intelligenza artificiale
- Generare connessioni autentiche tra persone
- Far vivere il brand come esperienza immersiva
- Coinvolgere nuovi alleati nella visione

🎨 Atmosfera:
- Luci basse
- Musica ambient o chitarra jazz dal vivo
- Installazioni visive lungo il percorso

🍸 Catering:
- Aperitivo informale di qualità
- Opzioni: aperol, vino, birra
- Scelte vegan-friendly disponibili

📋 Programma completo:
- 18:30–19:00 | Accoglienza e aperitivo
- 19:00–19:10 | Benvenuto e spiegazione attività
- 19:10–19:30 | Giochi e attivazioni
- 19:30–20:15 | Confronto in gruppi
- 20:15–20:30 | Sintesi finale
- 20:30–21:00 | Networking libero e chiusura

📣 ISTRUZIONI FINALI:
- Rispondi solo a domande sull’evento “Glitch”
- Non aggiungere informazioni non presenti in questo contesto, a meno che non venga richiesto esplicitamente
- Mantieni sempre un tono professionale, accogliente e informativo
- Usa *il più possibile* emoji per aiutare a migliorare la leggibilità

FONDAMENTALE:
- NON RISPONDERE A DOMANDE FUORI TEMA O CHE NON RIGUARDANO L'EVENTO "GLITCH". SE NON HAI INFORMAZIONI, DICHIARA SEMPLICEMENTE DI NON AVERLE.
- NON RIPETERE INFORMAZIONI GIA' FORNITE, MA INCORAGGIA L'UTENTE A FARE DOMANDE SPECIFICHE PER APPROFONDIRE.
`;

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

function getDomainFromHeader(
    headerValue: string | null | undefined
): string | null {
    if (!headerValue) return null;
    try {
        // Può essere più origini separate da spazi, prendi la prima
        const url = new URL(headerValue.split(' ')[0]);
        return url.hostname;
    } catch {
        return null;
    }
}

const SECRET_CODE = process.env.SECRET_CODE || 'GLITCH2025';
const ALLOWED_DOMAINS = [
    'localhost',
    'fairflai-glitch.vercel.app',
    'hacker-me-fairflai.vercel.app',
];

export async function POST(req: Request) {
    // Controllo dominio da Origin o Referer
    const origin = req.headers.get('origin') || req.headers.get('referer');
    const domain = getDomainFromHeader(origin);

    if (!domain || !ALLOWED_DOMAINS.includes(domain)) {
        return Response.json(
            { error: 'Access forbidden: unauthorized domain.' },
            { status: 403 }
        );
    }

    const body = await req.json();

    if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
        return Response.json(
            { error: "Invalid request: 'messages' field missing or empty." },
            { status: 400 }
        );
    }

    // Verifica del codice segreto
    if (!body.code || body.code !== SECRET_CODE) {
        return Response.json(
            { error: 'Access denied: invalid security code.' },
            { status: 401 }
        );
    }

    const { messages } = body;

    const result = streamText({
        model: openai('gpt-4.1-mini'),
        messages,
        system: EVENT_PROMPT,
    });

    return result.toDataStreamResponse();
}
