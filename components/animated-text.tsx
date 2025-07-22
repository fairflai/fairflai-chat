'use client';

import { useState, useEffect, useRef } from 'react';

const TypewriterText = ({
    text,
    onTypingComplete,
    messageId,
}: {
    text: string;
    onTypingComplete?: (messageId: string) => void;
    messageId?: string;
}) => {
    const [displayText, setDisplayText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showCursor, setShowCursor] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const cursorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const currentIndexRef = useRef(0);

    // Initialize or reset when text changes significantly
    useEffect(() => {
        if (text.length === 0) {
            setDisplayText('');
            currentIndexRef.current = 0;
            setIsTyping(false);
            setShowCursor(false);
            onTypingComplete?.(messageId || '');
            return;
        }

        // Se il testo è più corto di quello che stiamo mostrando, è un nuovo messaggio
        if (text.length < displayText.length) {
            setDisplayText('');
            currentIndexRef.current = 0;
            setIsTyping(true);
            setShowCursor(true);
            startTyping();
        }
        // Se abbiamo nuovo testo da mostrare
        else if (displayText.length < text.length && !isTyping) {
            setIsTyping(true);
            setShowCursor(true);
            startTyping();
        }
    }, [text]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            if (cursorTimeoutRef.current) {
                clearTimeout(cursorTimeoutRef.current);
            }
        };
    }, []);

    const startTyping = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        const typeNextChar = () => {
            if (currentIndexRef.current >= text.length) {
                setIsTyping(false);
                // Mantieni il cursore visibile per un po' dopo aver finito di scrivere
                cursorTimeoutRef.current = setTimeout(() => {
                    setShowCursor(false);
                    // Chiama onTypingComplete solo quando anche il cursore ha finito di lampeggiare
                    onTypingComplete?.(messageId || '');
                }, 800); // Tempo per vedere il cursore alla fine
                return;
            }

            setDisplayText(text.slice(0, currentIndexRef.current + 1));
            currentIndexRef.current += 1;

            // Calcola il delay per il prossimo carattere
            let delay = 10;
            // Rallenta per la punteggiatura
            const lastChar = text[currentIndexRef.current - 1];
            if (lastChar === '.' || lastChar === '!' || lastChar === '?') {
                delay = 45;
            } else if (lastChar === ',' || lastChar === ';') {
                delay = 25;
            } else if (lastChar === ' ') {
                delay = 15;
            }

            // Aggiungi variazione randomica
            delay += Math.random() * 15;

            timeoutRef.current = setTimeout(typeNextChar, delay);
        };

        typeNextChar();
    };

    return (
        <span className="relative">
            {displayText}
        </span>
    );
};

// Componente per il testo animato (per compatibilità)
export function AnimatedText({
    text,
    speed,
    onTypingComplete,
    messageId
}: {
    text: string;
    speed?: number;
    onTypingComplete?: (messageId: string) => void;
    messageId?: string;
}) {
    return <TypewriterText text={text} onTypingComplete={onTypingComplete} messageId={messageId} />;
}

export default TypewriterText;
