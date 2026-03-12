import type { Metadata } from 'next'
import './globals.css'
import { AppFrame } from '@/components/layout/AppFrame'
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
          <AppFrame>{children}</AppFrame>
        </AuthSessionProvider>
      </body>
    </html>
  )
}
