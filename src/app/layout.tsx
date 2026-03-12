import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { AuthSessionProvider } from '@/components/providers/SessionProvider'

export const metadata: Metadata = {
  title: 'Gestão Financeira CBF',
  description: 'Painel de gestão financeira',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-50">
        <AuthSessionProvider>
          <div className="flex min-h-screen flex-col md:flex-row">
            <Sidebar />
            <div className="flex-1 flex flex-col pt-16 md:pt-0">
              <Header />
              <main className="flex-1 overflow-auto">{children}</main>
              <Footer />
            </div>
          </div>
        </AuthSessionProvider>
      </body>
    </html>
  )
}
