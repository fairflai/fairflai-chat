'use client';

import { useChat } from '@ai-sdk/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User } from 'lucide-react';
import { useRef, useEffect } from 'react';

export default function ChatBot() {
    const { messages, input, handleInputChange, handleSubmit, isLoading } =
        useChat();
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop =
                scrollAreaRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Header */}
            <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-3">
                        <div>
                            <img
                                src="https://fairflai.com/wp-content/uploads/2025/03/Screenshot-2025-03-08-002645.png"
                                alt="FairFlai Logo"
                                className="h-12 w-auto"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
                <ScrollArea
                    className="h-[calc(100vh-200px)]"
                    ref={scrollAreaRef}
                >
                    <div className="space-y-6">
                        {messages.length === 0 && (
                            <div className="text-center py-12">
                                <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h2 className="text-xl font-medium text-gray-900 mb-2">
                                    Ciao! Come posso aiutarti oggi?
                                </h2>
                                <p className="text-gray-500">
                                    Scrivi un messaggio per iniziare la
                                    conversazione
                                </p>
                            </div>
                        )}

                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex gap-3 ${
                                    message.role === 'user'
                                        ? 'justify-end'
                                        : 'justify-start'
                                }`}
                            >
                                {message.role === 'assistant' && (
                                    <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                        <Bot className="w-4 h-4 text-white" />
                                    </div>
                                )}

                                <Card
                                    className={`max-w-[80%] p-4 ${
                                        message.role === 'user'
                                            ? 'bg-gray-900 text-white border-gray-900'
                                            : 'bg-white border-gray-200 shadow-sm'
                                    }`}
                                >
                                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
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

                                {message.role === 'user' && (
                                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                        <User className="w-4 h-4 text-gray-600" />
                                    </div>
                                )}
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex gap-3 justify-start">
                                <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                                <Card className="bg-white border-gray-200 shadow-sm p-4">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                            <div
                                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                                style={{
                                                    animationDelay: '0.1s',
                                                }}
                                            ></div>
                                            <div
                                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                                style={{
                                                    animationDelay: '0.2s',
                                                }}
                                            ></div>
                                        </div>
                                        <span className="text-sm">
                                            Sto scrivendo...
                                        </span>
                                    </div>
                                </Card>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 bg-white/80 backdrop-blur-sm sticky bottom-0">
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
                    <p className="text-xs text-gray-400 mt-2 text-center">
                        Premi Invio per inviare il messaggio
                    </p>
                </div>
            </div>
        </div>
    );
}
