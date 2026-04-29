import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/contexts/auth-context'
import './globals.css'

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: 'DigitalTv - Tu Plataforma de Streaming Premium',
  description: 'Accede a las mejores cuentas de streaming, promociones exclusivas y contenido premium. Netflix, Disney+, HBO Max y más.',
  generator: 'v0.app',
  keywords: ['streaming', 'netflix', 'disney+', 'hbo max', 'cuentas premium', 'digitaltv'],
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#1a1a1a',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
