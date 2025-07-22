import type React from 'react';
import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';

const montserrat = Montserrat({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'FairFlai // Glitch',
    description:
        'Scopri Glitch, l’evento di FairFlai dedicato all’intelligenza artificiale.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="it">
            <body className={`${montserrat.className} overflow-hidden`}>
                {children}
            </body>
        </html>
    );
}
