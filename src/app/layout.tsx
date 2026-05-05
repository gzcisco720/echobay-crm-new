import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'EchoBay CRM',
  description: 'EchoBay CRM',
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale} className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider messages={messages}>
          {children}
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
