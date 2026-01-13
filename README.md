# FairFlai Chat

AI chatbot progettato per l'assistenza agli eventi, che fornisce informazioni in tempo reale su luogo, programma e attività. Costruita con [Next.js](https://nextjs.org/) e [Vercel AI SDK](https://sdk.vercel.ai/docs).

## Funzionalità

- **Assistenza Eventi**: Specializzata nel rispondere a domande su luogo dell'evento, agenda e giochi.
- **Chat AI**: Basata su Vercel AI SDK per interazioni in linguaggio naturale.
- **Azioni Rapide**: Accesso immediato alle domande comuni (Location, Agenda, Giochi).
- **Controllo Accessi**: Semplice verifica tramite codice di accesso per proteggere la chat.
- **UI Moderna**: Interfaccia elegante in modalità scura con design responsivo utilizzando Tailwind CSS e Shadcn UI.
- **Risposte in Streaming**: Streaming dei messaggi in tempo reale per un'esperienza utente fluida.

## Stack Tecnologico

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Integrazione AI**: [Vercel AI SDK](https://sdk.vercel.ai/docs)
- **Stile**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Componenti UI**: [Shadcn UI](https://ui.shadcn.com/) / [Radix UI](https://www.radix-ui.com/)
- **Icone**: [Lucide React](https://lucide.dev/)
- **Rendering Markdown**: markdown-it

## Per Iniziare

### Prerequisiti

- Node.js (v18+ raccomandato)
- npm, yarn, pnpm o bun

### Installazione

1. Clona il repository:

   ```bash
   git clone <repository-url>
   cd fairflai-chat
   ```

2. Installa le dipendenze:

   ```bash
   npm install
   # oppure
   bun install
   ```

3. Configura le variabili d'ambiente:
   Crea un file `.env` nella directory principale, per un esempio consulta il file `.env.example`.

4. Avvia il server di sviluppo:

   ```bash
   npm run dev
   # oppure
   bun dev
   ```

   Apri [http://localhost:3000](http://localhost:3000) con il tuo browser per vedere il risultato.

## Struttura del Progetto

- `app/`: Pagine Next.js (App Router) e rotte API.
  - `page.tsx`: Interfaccia principale e logica della chat.
  - `api/`: Rotte API backend per autenticazione e stream chat.
- `components/`: Componenti UI riutilizzabili (pulsanti, input, area di scorrimento).
- `hooks/`: React hooks personalizzati (es. `useScrollToBottom`).
- `lib/`: Funzioni di utilità.
- `public/`: Asset statici (immagini, icone).

## Utilizzo

1. **Accesso**: Inserisci il codice di accesso fornito per entrare nella sessione di chat.
2. **Chat**: Scrivi le tue domande sull'evento o usa i pulsanti di azione rapida.
3. **Reset**: Usa il pulsante indietro nell'intestazione (se disponibile) per resettare la sessione.

## Licenza

Proprietaria. Tutti i diritti riservati.
