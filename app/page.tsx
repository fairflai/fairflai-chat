/* eslint-disable @next/next/no-img-element */
'use client'

import { useChat } from '@ai-sdk/react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { ArrowUp, ArrowLeft } from 'lucide-react'
import { useEffect, useRef, useMemo, useState } from 'react'
import { useScrollToBottom } from '@/hooks/use-scroll-to-bottom'
import MarkdownIt from 'markdown-it'

type QuickQuestion = {
  text: string
  message: string
}

export default function ChatBot() {
  const id = 'chatbot'
  const [showSplashScreen, setShowSplashScreen] = useState(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const md = useMemo(() => {
    return new MarkdownIt({
      html: false,
      breaks: true,
      linkify: true,
    })
  }, [])

  const quickQuestions = useMemo<QuickQuestion[]>(
    () => [
      { text: '🚩 Location', message: "Dove si svolgerà l'evento?" },
      { text: '🕓 Agenda', message: "Qual è il programma dell'evento?" },
      { text: '🕹️ Games', message: 'Quali giochi ci saranno?' },
    ],
    []
  )

  const { containerRef, endRef, scrollToBottom } = useScrollToBottom()

  const [sessionId, setSessionId] = useState<string | null>(null)
  const [accessError, setAccessError] = useState<string | null>(null)

  useEffect(() => {
    // Check for code in URL
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')

    if (code) {
      // Verify code and get session (simulated for now, ideally this would be an API call to exchange code for session)
      // For this implementation, we'll just store the code as "verified" if it matches locally or assume the backend will verify.
      // However, the requirement says "Upon verification, a unique session ID is generated".
      // Since we can't easily do a backend exchange without a new endpoint, we'll simulate the "session creation" client-side
      // OR better, we should have an endpoint to exchange code for session.
      // Given the constraints, let's assume we pass the code to the first chat request or we need a way to get a session.
      // Wait, the plan said "Store session ID in sessionStorage".
      // Let's create a simple server action or API route to exchange code for session?
      // Or we can just generate a UUID client side? No, the guide says "Upon verification... session ID is generated".
      // Let's assume for now we pass the code in the body, and if valid, the server returns a session ID?
      // But `useChat` expects a stream.
      // Let's add a new API route for session creation? Or just use a client-side UUID and validate the code on every request?
      // The guide says: "Users must provide a valid access code... Upon verification, a unique session ID is generated".
      // Let's add a simple server action or just a fetch call to a new endpoint `api/auth`?
      // To keep it simple and stick to the plan, let's assume we need to implement `api/auth/session`.

      // actually, let's just implement the client logic to strip the code and store it,
      // but wait, the plan says "Pass session ID in API requests".
      // The `access-control.ts` has `createSession`. We need to expose this.

      // Let's add a small API route for auth.
      fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
        .then(res => {
          if (res.ok) return res.json()
          throw new Error('Invalid code')
        })
        .then(data => {
          sessionStorage.setItem('sessionId', data.sessionId)
          setSessionId(data.sessionId)
          sessionStorage.setItem('sessionId', data.sessionId)
          setSessionId(data.sessionId)
          // Keep code in URL as requested
        })
        .catch(() => {
          setAccessError('Invalid access code')
        })
    } else {
      const storedSession = sessionStorage.getItem('sessionId')
      if (storedSession) {
        setSessionId(storedSession)
      } else {
        // No code, no session
        // setAccessError('Access code required') // Don't show error immediately, maybe show login screen?
      }
    }
  }, [])

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    append,
    setMessages,
  } = useChat({
    id,
    streamProtocol: 'data',
    body: {
      sessionId: sessionId,
    },
    headers: {
      'x-session-id': sessionId || '',
    },
    onResponse: response => {
      if (response.status === 401) {
        setAccessError('Session expired or invalid')
        sessionStorage.removeItem('sessionId')
        setSessionId(null)
      } else if (response.status === 429) {
        // Handle rate limit
        const retryAfter = response.headers.get('Retry-After')
        alert(`Too many requests. Please try again in ${retryAfter} seconds.`)
      }
    },
  })

  useEffect(() => {
    scrollToBottom('auto')
  }, [messages, scrollToBottom])

  const updateTextareaHeight = () => {
    const textarea = textareaRef.current
    if (!textarea) return

    const scrollTop = textarea.scrollTop
    textarea.style.height = 'auto'

    const minHeight = 56
    const maxHeight = 112
    const scrollHeight = textarea.scrollHeight
    const newHeight = Math.max(minHeight, Math.min(scrollHeight, maxHeight))

    textarea.style.height = `${newHeight}px`
    textarea.scrollTop = scrollTop
  }

  const resetChat = () => {
    setMessages([])
    setShowSplashScreen(true)
    if (textareaRef.current) {
      textareaRef.current.style.height = '56px'
    }
  }

  const handleInputChangeWithResize = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    handleInputChange(e)
    setTimeout(updateTextareaHeight, 0)
  }

  useEffect(() => {
    if (input === '' && textareaRef.current) {
      textareaRef.current.style.height = '56px'
    }
  }, [input])

  const handleQuickQuestion = (questionObj: QuickQuestion) => {
    setShowSplashScreen(false)
    append({
      role: 'user',
      content: questionObj.message,
    })
  }

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setShowSplashScreen(false)
    handleSubmit(e)
  }

  if (!sessionId) {
    return (
      <main className="relative min-h-dvh bg-[#04020a] text-white flex justify-center items-center px-4">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,222,140,0.28),_transparent_60%)]" />
        <div className="z-10 flex flex-col items-center gap-6 text-center w-full max-w-sm">
          <img
            src="/logo-white.png"
            alt="FairFlai Logo"
            className="h-24 w-24 object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.35)]"
          />
          <h1 className="text-2xl font-semibold">Access Required</h1>
          <p className="text-white/70">
            Please enter the access code to continue.
          </p>

          <form
            onSubmit={e => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const code = formData.get('code') as string
              if (!code) return

              fetch('/api/auth/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code }),
              })
                .then(res => {
                  if (res.ok) return res.json()
                  throw new Error('Invalid code')
                })
                .then(data => {
                  sessionStorage.setItem('sessionId', data.sessionId)
                  setSessionId(data.sessionId)
                  // Update URL with code
                  const newUrl = new URL(window.location.href)
                  newUrl.searchParams.set('code', code)
                  window.history.replaceState({}, '', newUrl.toString())
                })
                .catch(() => {
                  setAccessError('Invalid access code')
                })
            }}
            className="w-full flex flex-col gap-4"
          >
            <input
              name="code"
              type="text"
              placeholder="Enter access code"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-white/30 focus:outline-none"
              autoComplete="off"
            />
            <Button
              type="submit"
              className="w-full rounded-lg bg-gradient-to-br from-[#ffe87d] via-[#ffc857] to-[#ff9f1c] py-3 text-[#2b1200] font-semibold hover:opacity-90 transition"
            >
              Enter
            </Button>
          </form>

          {accessError && (
            <div className="px-4 py-2 text-sm text-red-200 bg-red-900/50 rounded-lg border border-red-500/30 w-full">
              {accessError}
            </div>
          )}
        </div>
      </main>
    )
  }

  return (
    <main className="relative min-h-dvh bg-[#04020a] text-white flex justify-center md:items-center px-0 sm:px-4 py-0 sm:py-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,222,140,0.28),_transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_rgba(255,196,110,0.22),_transparent_55%)]" />

      <section className="relative z-10 flex h-dvh w-full max-w-md flex-col overflow-hidden rounded-none border-white/10 bg-gradient-to-b from-[#1d1127] via-[#090412] to-[#04020a] text-white shadow-[0_45px_120px_rgba(0,0,0,0.65)] sm:h-[760px] sm:rounded-[2.75rem] sm:border">
        {error && (
          <div className="px-6 py-3 text-sm text-red-100 bg-red-500/15 border-b border-red-500/30">
            ⚠️ Si è verificato un errore durante la comunicazione
          </div>
        )}

        <header className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between gap-4">
            {!showSplashScreen && (
              <Button
                onClick={resetChat}
                variant="ghost"
                size="icon"
                disabled={showSplashScreen}
                className="h-11 w-11 rounded-full border border-white/5 bg-white/5 text-white/70 hover:bg-white/10"
                title="Torna all'inizio"
              >
                <ArrowLeft size={20} className="text-white" />
              </Button>
            )}

            <div className="flex flex-1 flex-row flex-wrap items-center justify-start gap-2 sm:gap-4">
              <div className="flex items-center justify-start gap-3 sm:flex-1">
                <div
                  className={`flex h-11 w-12 ${
                    showSplashScreen ? 'rounded-[1.1rem]' : 'rounded-2xl'
                  } items-center justify-center bg-gradient-to-br from-[#ffe87d] via-[#ffc857] to-[#ff9f1c] shadow-[0_8px_25px_rgba(255,185,70,0.45)]`}
                >
                  <img
                    src="/logo.png"
                    alt="FairFlai Logo"
                    className="h-6 w-6 object-contain"
                  />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-medium uppercase text-white/50 sm:text-xs">
                    FAIRFLAI
                  </p>
                  <p className="text-[12px] font-semibold text-white sm:text-sm leading-tight">
                    Light up your
                    <br />
                    organization
                  </p>
                </div>
              </div>
              {showSplashScreen && (
                <>
                  <div className="flex items-center gap-2 text-white/75 whitespace-nowrap ml-auto text-right">
                    <span className="text-[7px] font-semibold uppercase tracking-[0.3em] text-white/40 sm:text-[8px]">
                      BY
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.08em] sm:text-xs">
                      KOPERNICANA
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          {showSplashScreen ? (
            <div className="flex h-full flex-col items-center justify-center gap-8 px-8 text-center">
              <img
                src="/logo-white.png"
                alt="FairFlai Logo"
                className="h-24 w-24 object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.35)]"
              />
              <div className="space-y-3 flex flex-col items-center">
                <h1 className="text-4xl font-semibold text-white">Ciao,</h1>
                <p className="text-base text-white/70 max-w-[300px]">
                  chiedimi quello che vuoi sull’evento o clicca uno dei box
                  sotto
                </p>
              </div>
              <div className="flex flex-wrap justify-center w-full gap-3 text-left sm:grid-cols-2">
                {quickQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    onClick={() => handleQuickQuestion(question)}
                    className="w-[200px] rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-left text-white/90 transition hover:bg-white/10"
                    disabled={isLoading}
                  >
                    <span className="text-base font-semibold text-white">
                      {question.text}
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <ScrollArea className="h-full px-6 pb-4" ref={containerRef}>
              <div className="space-y-6 pb-6">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex w-full ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[82%] rounded-[28px] px-5 py-4 text-base leading-relaxed ${
                        message.role === 'user'
                          ? 'bg-gradient-to-b from-[#fff1a6] via-[#ffd15a] to-[#ff9f1c] text-[#2b1200] shadow-[0_8px_18px_rgba(255,170,54,0.25)]'
                          : 'border border-white/8 bg-white/5 text-white/85 backdrop-blur-[30px] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                      }`}
                    >
                      <div
                        className={
                          message.role === 'assistant'
                            ? 'markdown-content text-white/90'
                            : 'whitespace-pre-wrap'
                        }
                      >
                        {message.parts.map((part, i) => {
                          switch (part.type) {
                            case 'text':
                              return (
                                <div
                                  key={`${message.id}-${i}`}
                                  {...(message.role === 'assistant'
                                    ? {
                                        dangerouslySetInnerHTML: {
                                          __html: md.render(part.text),
                                        },
                                      }
                                    : { children: part.text })}
                                />
                              )
                            default:
                              return null
                          }
                        })}
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading &&
                  (() => {
                    const lastMessage = messages[messages.length - 1]
                    const isAssistantStreaming =
                      lastMessage &&
                      lastMessage.role === 'assistant' &&
                      lastMessage.parts.some(
                        part => part.type === 'text' && part.text.trim()
                      )

                    if (isAssistantStreaming) return null

                    return (
                      <div className="flex justify-start">
                        <div className="flex items-center gap-2 rounded-[28px] border border-white/8 bg-white/5 px-4 py-3 text-sm text-white/70 backdrop-blur-[30px]">
                          <div className="flex gap-1.5">
                            <span className="h-2 w-2 animate-bounce rounded-full bg-white/60"></span>
                            <span
                              className="h-2 w-2 animate-bounce rounded-full bg-white/60"
                              style={{ animationDelay: '0.12s' }}
                            ></span>
                            <span
                              className="h-2 w-2 animate-bounce rounded-full bg-white/60"
                              style={{ animationDelay: '0.24s' }}
                            ></span>
                          </div>
                          <span className="text-xs tracking-[0.4em] uppercase text-white/50">
                            typing
                          </span>
                        </div>
                      </div>
                    )
                  })()}
              </div>
              <div ref={endRef} className="h-6" />
            </ScrollArea>
          )}
        </div>

        <div className="border-t border-white/5 bg-gradient-to-t from-[#04020a]/95 via-[#06030f]/90 to-transparent px-6 pb-6 pt-4">
          <form onSubmit={handleFormSubmit} className="flex items-end">
            <div className="relative flex-1">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChangeWithResize}
                placeholder="Scrivi il tuo messaggio..."
                className="w-full min-h-14 max-h-32 resize-none rounded-full border border-white/10 bg-white/5 px-6 pr-14 pt-4 pb-4 text-base text-white placeholder:text-white/40 focus-visible:border-white/30 focus-visible:ring-0"
                rows={1}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    if (input.trim()) {
                      setShowSplashScreen(false)
                      handleSubmit(
                        e as unknown as React.FormEvent<HTMLFormElement>
                      )
                    }
                  }
                }}
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
              />

              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-3 top-1/2 h-12 w-12 -translate-y-1/2 rounded-full border-0 bg-gradient-to-br from-[#ffe87d] via-[#ffc857] to-[#ff9f1c] text-[#2b1200] shadow-[0_6px_16px_rgba(255,178,58,0.3)] transition disabled:opacity-40"
              >
                <ArrowUp className="text-white" size={20} strokeWidth={2} />
              </Button>
            </div>
          </form>
        </div>
      </section>
    </main>
  )
}
