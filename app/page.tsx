/* eslint-disable @next/next/no-img-element */
'use client';

import { useChat } from '@ai-sdk/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { ArrowUp } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useScrollToBottom } from '@/hooks/use-scroll-to-bottom';

export default function ChatBot() {
    const id = 'chatbot'; // Unique identifier for the chat session
    const [showSplashScreen, setShowSplashScreen] = useState(true);
    const [inputAreaHeight, setInputAreaHeight] = useState(56); // Altezza iniziale del textarea
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Scroll hook
    const { containerRef, endRef, scrollToBottom } = useScrollToBottom();

    // Domande rapide
    const [quickQuestions, setQuickQuestions] = useState([
        "Che cos'è FAIRFLAI GLITCH?",
        "Quando e dove si svolge l'evento?",
        'Come posso partecipare?',
        "Cosa si mangia all'evento?",
        "Quanto dura l'evento?",
    ]);

    const {
        messages,
        input,
        handleInputChange,
        handleSubmit,
        isLoading,
        error,
        append,
    } = useChat({
        id,
        streamProtocol: 'data',
        body: {
            code:
                typeof window !== 'undefined'
                    ? new URLSearchParams(window.location.search).get('code')
                    : null,
        },
    });

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        scrollToBottom('auto');
    }, [messages, scrollToBottom]);

    // Funzione per calcolare e aggiornare l'altezza del textarea
    const updateTextareaHeight = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        // Salva il valore di scroll corrente
        const scrollTop = textarea.scrollTop;

        // Reset temporaneo per calcolare la vera altezza necessaria
        textarea.style.height = 'auto';

        // Calcola la nuova altezza con limiti
        const minHeight = 56;
        const maxHeight = 112;
        const scrollHeight = textarea.scrollHeight;
        const newHeight = Math.max(minHeight, Math.min(scrollHeight, maxHeight));

        // Applica la nuova altezza
        textarea.style.height = `${newHeight}px`;

        // Ripristina lo scroll se necessario
        textarea.scrollTop = scrollTop;

        // Aggiorna lo stato solo se necessario
        if (inputAreaHeight !== newHeight) {
            setInputAreaHeight(newHeight);
        }
    };

    // Gestisce il cambio di input con debounce implicito
    const handleInputChangeWithResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        handleInputChange(e);
        // Aggiorna l'altezza dopo che React ha aggiornato il DOM
        setTimeout(updateTextareaHeight, 0);
    };

    // Reset dell'altezza quando l'input viene svuotato (dopo l'invio)
    useEffect(() => {
        if (input === '') {
            setInputAreaHeight(56);
            if (textareaRef.current) {
                textareaRef.current.style.height = '56px';
            }
        }
    }, [input]);

    // Funzione per gestire il click su una domanda rapida
    const handleQuickQuestion = (question: string) => {
        // Nasconde lo splash screen
        setShowSplashScreen(false);

        // Rimuovi la domanda dalla lista
        setQuickQuestions((prev) => prev.filter((q) => q !== question));

        // Invia il messaggio usando append
        append({
            role: 'user',
            content: question,
        });
    };

    // Funzione personalizzata per gestire il submit del form
    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        // Nasconde lo splash screen
        setShowSplashScreen(false);

        // Chiama il handleSubmit originale
        handleSubmit(e);
    };

    return (
        <main
            className="min-h-dvh flex flex-col relative"
            style={{
                background:
                    'linear-gradient(40deg, #fef3c7 0%, #fffbcc 35%, #fefce8 50%, #fefbfdc5 100%)',
            }}
        >
            {/* Error Display */}
            {error && (
                <div className="absolute top-0 bg-red-50 backdrop-blur-sm border-b border-red-200 z-10">
                    <div className="max-w-4xl mx-auto px-4 py-3">
                        <p className="text-sm font-medium">
                            ⚠️ Si è verificato un errore durante la
                            comunicazione
                        </p>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="sticky top-0 z-10">
                {!showSplashScreen && (
                    <div className="max-w-4xl mx-auto px-4 py-4">
                        <div className="flex items-center gap-3 justify-center">
                            <img
                                src="/logo.png"
                                alt="FairFlai Logo"
                                className="h-6 md:h-10 w-auto"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Splash Screen */}
            {showSplashScreen && (
                <div className="flex-1 flex items-center justify-center px-4">
                    <div className="max-w-2xl mx-auto text-center space-y-8">
                        {/* Logo */}
                        <div className="mb-8">
                            <img
                                src="/logo.png"
                                alt="FairFlai Logo"
                                className="h-20 w-auto mx-auto"
                            />
                        </div>

                        {/* Titolo e Descrizione */}
                        <div className="space-y-4">
                            <h1 className="text-2xl font-bold text-gray-900">
                                Ciao, sono l'assistente di FAIRFLAI
                            </h1>
                            <p className="text-lg text-gray-700 leading-relaxed">
                                Fammi pure domande sull'evento oppure clicca uno
                                dei box qui sotto.
                            </p>
                        </div>

                        {/* CTA con le domande frequenti */}
                        <div className="flex flex-wrap gap-4 justify-center">
                            {quickQuestions.map((question, index) => (
                                <Button
                                    key={index}
                                    variant="outline"
                                    onClick={() =>
                                        handleQuickQuestion(question)
                                    }
                                    className="w-[320px] shadow-none h-auto px-6 py-3 bg-gray-900/5 border-black/10 text-black backdrop-blur transition-all duration-200 text-base rounded-3xl hover:bg-gray-900/10 hover:text-gray-900"
                                    disabled={isLoading}
                                >
                                    {question}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {!showSplashScreen && (
                // Chat Area
                <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-2 pb-0 mt-0 lg:mt-10 relative z-10 bg-red">
                    <ScrollArea
                        className="pb-0"
                        ref={containerRef}
                        style={{
                            height: `calc(100dvh - ${inputAreaHeight + 100}px)`, // 140px include header + padding e margini dell'input area
                        }}
                    >
                        <div className="space-y-6">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex gap-3 ${
                                        message.role === 'user'
                                            ? 'justify-end'
                                            : 'justify-start'
                                    }`}
                                >
                                    <Card
                                        className={`rounded-3xl py-3 px-6 backdrop-blur-md ${
                                            message.role === 'user'
                                                ? 'bg-gray-900/5 border-black/10 text-black backdrop-blur max-w-[80%]'
                                                : 'bg-transparent border-none shadow-none text-gray-800 lg:max-w-[80%]'
                                        }`}
                                    >
                                        <div className="whitespace-pre-wrap text-base leading-relaxed">
                                            {message.parts.map((part, i) => {
                                                switch (part.type) {
                                                    case 'text':
                                                        return (
                                                            <div
                                                                key={`${message.id}-${i}`}
                                                            >
                                                                {part.text}
                                                            </div>
                                                        );
                                                    default:
                                                        return null;
                                                }
                                            })}
                                        </div>
                                    </Card>
                                </div>
                            ))}

                            {isLoading &&
                                (() => {
                                    // Controlla se l'ultimo messaggio è un assistant message con contenuto
                                    const lastMessage =
                                        messages[messages.length - 1];
                                    const isAssistantStreaming =
                                        lastMessage &&
                                        lastMessage.role === 'assistant' &&
                                        lastMessage.parts.some(
                                            (part) =>
                                                part.type === 'text' &&
                                                part.text.trim()
                                        );

                                    // Mostra "Sto scrivendo..." solo se non c'è testo in streaming
                                    if (isAssistantStreaming) return null;

                                    return (
                                        <div className="flex gap-3 justify-start transition-all duration-500 ease-out opacity-100 translate-y-0">
                                            <Card className="bg-white/0 shadow-none p-4 backdrop-blur-md border-none">
                                                <div className="flex items-center gap-2 text-gray-800">
                                                    <div className="flex gap-1">
                                                        <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                                                        <div
                                                            className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"
                                                            style={{
                                                                animationDelay:
                                                                    '0.1s',
                                                            }}
                                                        ></div>
                                                        <div
                                                            className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"
                                                            style={{
                                                                animationDelay:
                                                                    '0.2s',
                                                            }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm">
                                                        Sto pensando...
                                                    </span>
                                                </div>
                                            </Card>
                                        </div>
                                    );
                                })()}
                        </div>
                        {/* End reference for scroll */}
                        <div ref={endRef} />
                    </ScrollArea>
                </div>
            )}

            {/* Input Area */}
            <div className="sticky bottom-0 z-999">
                <div className="max-w-4xl mx-auto px-8 py-8 pt-0">
                    {!showSplashScreen && (
                        <form onSubmit={handleFormSubmit} className="relative">
                            <div className="relative">
                                <Textarea
                                    ref={textareaRef}
                                    value={input}
                                    onChange={handleInputChangeWithResize}
                                    placeholder={'Scrivi il tuo messaggio...'}
                                    className="w-full min-h-14 max-h-30 pr-10 pl-6 py-4 text-base md:text-base text-black rounded-3xl border border-black/10 bg-black/5 backdrop-blur-3xl shadow-lg placeholder:text-gray-600/50 placeholder:text-base focus:outline-none focus:ring-0 focus:ring-offset-0 focus:border-black/10 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-none scrollbar-hide"
                                    rows={1}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleFormSubmit(e as any);
                                        }
                                    }}
                                    style={{
                                        minHeight: '56px',
                                        maxHeight: '112px',
                                        scrollbarWidth: 'none',
                                        msOverflowStyle: 'none',
                                    }}
                                />
                                <Button
                                    type="submit"
                                    disabled={isLoading || !input.trim()}
                                    className="absolute right-2 bottom-2 w-8 h-8 shadow-none rounded-full bg-transparent hover:bg-transparent p-0 flex items-center justify-center transition-all duration-200 border border-none"
                                >
                                    <ArrowUp className="text-black" size={10} />
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </main>
    );
}
