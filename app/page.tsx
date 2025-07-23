'use client';

import { useChat } from '@ai-sdk/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
import { AnimatedText } from '@/components/animated-text';
import { useScrollToBottom } from '@/hooks/use-scroll-to-bottom';

export default function ChatBot() {
    const id = 'chatbot'; // Unique identifier for the chat session
    const [isWelcomeTyping, setIsWelcomeTyping] = useState(true);
    const [isWelcomeVisible, setIsWelcomeVisible] = useState(false);

    // Scroll hook
    const { containerRef, endRef, scrollToBottom } = useScrollToBottom();

    // Domande rapide
    const [quickQuestions, setQuickQuestions] = useState([
        "Che cos'è FAIRFLAI GLITCH?",
        "Quando e dove si svolge l'evento?",
        "Come posso partecipare?",
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
        initialMessages: [
            {
                id: 'welcome',
                role: 'assistant',
                content: `Ciao! Sono l’assistente AI di FAIRFLAI.
Se hai domande sull’evento, chiedi pure.
Oppure clicca uno dei box qui sotto, ti rispondo in un attimo.
`,
            },
        ],
        streamProtocol: 'data',
        body: { code: typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('code') : null },
    });

    // Callback per gestire il completamento dell'animazione del messaggio di benvenuto
    const handleWelcomeTypingComplete = (messageId: string) => {
        if (messageId === 'welcome') {
            setIsWelcomeTyping(false);
        }
    };

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        scrollToBottom('auto');
    }, [messages, scrollToBottom]);

    // Gestisci l'apparizione del messaggio di benvenuto con delay
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsWelcomeVisible(true);
        }, 100); // 500ms delay solo per il messaggio di benvenuto

        return () => clearTimeout(timer);
    }, []);

    // Funzione per gestire il click su una domanda rapida
    const handleQuickQuestion = (question: string) => {
        // Rimuovi la domanda dalla lista
        setQuickQuestions(prev => prev.filter(q => q !== question));

        // Invia il messaggio usando append
        append({
            role: 'user',
            content: question,
        });
    };

    return (
        <div
            className="min-h-dvh flex flex-col relative"
            style={{
                backgroundImage:
                    'url(https://fairflai.com/wp-content/uploads/2025/03/fireflies-mystic-stream-3.webp)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed',
            }}
        >
            {/* Background overlay filter */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    background:
                        'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(59,130,246,0.3) 50%, rgba(147,197,253,0.2) 100%)',
                }}
            ></div>

            {/* Header */}
            <div className="bg-white/40 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-3 justify-center md:justify-start">
                        <div>
                            <img
                                src="/logo.png"
                                alt="FairFlai Logo"
                                className="h-4 w-auto"
                            />
                        </div>
                        <div className="text-xl font-bold text-black">
                            FAIRFLAI // GLITCH
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 backdrop-blur-sm border-b border-red-200 relative z-10">
                    <div className="max-w-4xl mx-auto px-4 py-3">
                        <p className="text-sm font-medium">
                            ⚠️ Si è verificato un errore durante la
                            comunicazione
                        </p>
                    </div>
                </div>
            )}

            {/* Chat Area */}
            <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 relative z-10">
                <ScrollArea
                    className={`${quickQuestions.length > 0 && !isWelcomeTyping ? 'h-[calc(100dvh-280px)]' : 'h-[calc(100dvh-200px)]'}`}
                    ref={containerRef}
                >
                    <div className="space-y-6">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex gap-3 ${
                                    message.role === 'user'
                                        ? 'justify-end'
                                        : 'justify-start'
                                } ${
                                    message.id === 'welcome'
                                        ? `transition-all duration-500 ease-out ${
                                              isWelcomeVisible
                                                  ? 'opacity-100 translate-y-0'
                                                  : 'opacity-0 translate-y-4'
                                          }`
                                        : ''
                                }`}
                            >
                                {/* message.role === 'assistant' && (
                                    <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                        <Bot className="w-4 h-4 text-white" />
                                    </div>
                                )*/}

                                <Card
                                    className={`max-w-[80%] p-4 backdrop-blur-md border-none ${
                                        message.role === 'user'
                                            ? 'bg-gray-900/40 text-white'
                                            : 'bg-white/40 shadow-sm'
                                    }`}
                                >
                                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                        {message.parts.map((part, i) => {
                                            switch (part.type) {
                                                case 'text':
                                                    // Anima solo il messaggio di benvenuto
                                                    if (
                                                        message.role ===
                                                            'assistant' &&
                                                        message.id === 'welcome'
                                                    ) {
                                                        return (
                                                            <div
                                                                key={`${message.id}-${i}`}
                                                            >
                                                                <AnimatedText
                                                                    text={
                                                                        part.text
                                                                    }
                                                                    speed={30}
                                                                    onTypingComplete={
                                                                        handleWelcomeTypingComplete
                                                                    }
                                                                    messageId={
                                                                        message.id
                                                                    }
                                                                />
                                                            </div>
                                                        );
                                                    } else {
                                                        return (
                                                            <div
                                                                key={`${message.id}-${i}`}
                                                            >
                                                                {part.text}
                                                            </div>
                                                        );
                                                    }
                                                default:
                                                    return null;
                                            }
                                        })}
                                    </div>
                                </Card>

                                {/* message.role === 'user' && (
                                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                        <User className="w-4 h-4 text-gray-600" />
                                    </div>
                                )} */}
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
                                        {/*
                                        <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                            <Bot className="w-4 h-4 text-white" />
                                        </div>
                                         */}
                                        <Card className="bg-white/40 shadow-sm p-4 backdrop-blur-md border-none">
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

            {/* Input Area */}
            <div className="bg-white/40 backdrop-blur-sm sticky bottom-0">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    {/* Quick Questions */}
                    {quickQuestions.length > 0 && !isWelcomeTyping && (
                        <div className="mb-4">
                            <h3 className="text-xs font-medium text-gray-800 mb-2 text-center">
                                Domande frequenti:
                            </h3>
                            <div className="overflow-x-auto pb-1 scrollbar-thin">
                                <div className="flex gap-2 min-w-max">
                                    {quickQuestions.map((question, index) => (
                                        <Button
                                            key={index}
                                            variant="outline"
                                            onClick={() => handleQuickQuestion(question)}
                                            className="flex-shrink-0 whitespace-nowrap h-auto px-3 py-2 bg-white/60 backdrop-blur-md border-gray-300 hover:bg-white/80 transition-all duration-200 text-xs font-normal text-gray-800 hover:text-gray-900"
                                            disabled={isLoading}
                                        >
                                            {question}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex gap-3">
                        <Input
                            value={input}
                            onChange={handleInputChange}
                            placeholder={'Scrivi il tuo messaggio...'}
                            className="flex-1 border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                            disabled={isLoading || isWelcomeTyping}
                        />
                        <Button
                            type="submit"
                            disabled={
                                isLoading || !input.trim() || isWelcomeTyping
                            }
                            className="bg-gray-900 hover:bg-gray-800 text-white px-4"
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </form>
                    <p className="text-xs text-gray-700 mt-2 text-center font-medium">
                        Premi Invio per inviare il messaggio
                    </p>
                </div>
            </div>
        </div>
    );
}
