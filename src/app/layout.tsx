import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Toaster } from '@/components/ui/sonner'
import { Providers } from '@/components/Providers'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'Lumen — Make Research Reusable',
  description: 'A platform where research is packaged, shared, forked, and credited.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <Providers>
          <div className="relative min-h-screen bg-background">
            {/* Background gradient decoration */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-500/20 dark:bg-violet-500/10 rounded-full blur-3xl" />
              <div className="absolute top-1/3 -left-40 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
              <Header />
              <main className="container px-6 md:px-8 py-8 flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </div>
          <Toaster position="bottom-right" />
        </Providers>
      </body>
    </html>
  )
}
