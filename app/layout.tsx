import type { Metadata } from 'next'
import Script from 'next/script'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'FAIRFLAI - Light up your organization',
  description:
    'Sposiamo la visione della “Centauro Organization” in cui le persone collaborano con agenti intelligenti. Crediamo in un approccio olistico che valorizzi la decentralizzazione della sperimentazione e la capitalizzazione dell’intelligenza collettiva Aiutiamo le organizzazioni a cogliere la sfida trasformativa dell’AI per evolvere in modo etico e performante. Combiniamo intelligenza artificiale, design organizzativo e potenziale umano',
  icons: {
    icon: '/favicon.ico',
  },
}
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="it">
      <Script
        src="https://cloud.umami.is/script.js"
        data-website-id="454930de-3979-466c-bedd-cfe78e8569e3"
        strategy="afterInteractive"
      />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
