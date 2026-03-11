import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { AppProvider } from '@/lib/app-context'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Carbon Tracker',
  description: 'Reduce your footprint, preserve our future. Track your carbon emissions from food and transport.',
}

export const viewport: Viewport = {
  themeColor: '#0B0F1A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AppProvider>
          <div className="mx-auto min-h-screen max-w-md bg-background">
            {children}
          </div>
        </AppProvider>
      </body>
    </html>
  )
}
