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
      code:
        typeof window !== 'undefined'
          ? new URLSearchParams(window.location.search).get('code')
          : null,
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

            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center sm:flex-row sm:gap-4">
              <div className="flex items-center justify-center gap-3 sm:flex-1 sm:justify-start">
                <div
                  className={`flex h-11 ${
                    showSplashScreen
                      ? 'w-16 rounded-[1.1rem]'
                      : 'w-11 rounded-2xl'
                  } items-center justify-center bg-gradient-to-br from-[#ffe87d] via-[#ffc857] to-[#ff9f1c] shadow-[0_8px_25px_rgba(255,185,70,0.45)]`}
                >
                  <img
                    src="/logo.png"
                    alt="FairFlai Logo"
                    className="h-6 w-6 object-contain"
                  />
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-xs font-medium uppercase text-white/50">
                    FAIRFLAI
                  </p>
                  <p className="text-base font-semibold text-white text-sm">
                    Light up your organization
                  </p>
                </div>
              </div>
              {showSplashScreen && (
                <>
                  <div
                    className="hidden h-8 w-px bg-white/10 sm:block"
                    aria-hidden="true"
                  />
                  <div className="flex items-center gap-2 text-white/75 whitespace-nowrap sm:ml-auto sm:text-right">
                    <span className="text-[8px] font-semibold uppercase tracking-[0.3em] text-white/40">
                      BY
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.08em]">
                      KOPERNICANA
                    </span>
                  </div>
                </>
              )}
            </div>
            <div className="h-11 w-11 shrink-0" aria-hidden="true" />
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
