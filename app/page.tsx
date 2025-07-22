'use client';

import { useChat } from '@ai-sdk/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User } from 'lucide-react';
import { useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimatedText } from '@/components/animated-text';

export default function ChatBot() {
    const id = 'chatbot'; // Unique identifier for the chat session
    const searchParams = useSearchParams();
    const code = searchParams.get('code');

    const {
        messages,
        input,
        handleInputChange,
        handleSubmit,
        isLoading,
        error,
    } = useChat({
        id,
        initialMessages: [
            {
                id: 'welcome',
                role: 'assistant',
                content: `🗝 Accesso confermato. Stai per entrare in Glitch.
Un'interferenza voluta, non un errore.
Qui esploriamo l'intelligenza artificiale senza filtri, con occhi critici e mente aperta.

Vuoi iniziare a scoprire i dettagli?
Posso raccontarti quando arrivare, cosa succede, chi ci sarà...
Dimmi tu da dove vuoi partire.`,
            },
        ],
        streamProtocol: 'data',
        body: {
            code: code || undefined,
        },
    });
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop =
                scrollAreaRef.current.scrollHeight;
        }
    }, [messages]);

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
            <div className="bg-white/30 backdrop-blur-sm sticky top-0 z-10">
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
                    className="h-[calc(100vh-200px)]"
                    ref={scrollAreaRef}
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
                                {/* message.role === 'assistant' && (
                                    <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                        <Bot className="w-4 h-4 text-white" />
                                    </div>
                                )*/}

                                <Card
                                    className={`max-w-[80%] p-4 backdrop-blur-md ${
                                        message.role === 'user'
                                            ? 'bg-gray-900/70 text-white border-gray-700/50'
                                            : 'bg-white/70 border-gray-200/50 shadow-sm'
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
                                    <div className="flex gap-3 justify-start">
                                        {/*
                                        <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                            <Bot className="w-4 h-4 text-white" />
                                        </div>
                                         */}
                                        <Card className="bg-white/70 border-gray-200/50 shadow-sm p-4 backdrop-blur-md">
                                            <div className="flex items-center gap-2 text-gray-500">
                                                <div className="flex gap-1">
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                                    <div
                                                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                                        style={{
                                                            animationDelay:
                                                                '0.1s',
                                                        }}
                                                    ></div>
                                                    <div
                                                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
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
                </ScrollArea>
            </div>

            {/* Input Area */}
            <div className="bg-white/30 backdrop-blur-sm sticky bottom-0">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <form onSubmit={handleSubmit} className="flex gap-3">
                        <Input
                            value={input}
                            onChange={handleInputChange}
                            placeholder="Scrivi il tuo messaggio..."
                            className="flex-1 border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                            disabled={isLoading}
                        />
                        <Button
                            type="submit"
                            disabled={isLoading || !input.trim()}
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
