import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import { AuthProvider } from '@/components/AuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'InkBot - AI-Powered Blog Generation',
  description: 'InkBot: Intelligent AI-powered blog generation using advanced Groq API technology',
  icons: {
    icon: '/InkBotLogo4.png',
    apple: '/InkBotLogo4.png',
  },
  keywords: ['AI', 'blog generation', 'InkBot', 'artificial intelligence', 'content creation', 'Groq API'],
  authors: [{ name: 'InkBot Team' }],
  creator: 'InkBot',
  publisher: 'InkBot',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Header />
          <main className="min-h-screen bg-gray-950">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}
