'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

interface AppFrameProps {
  children: React.ReactNode
}

export function AppFrame({ children }: AppFrameProps) {
  const pathname = usePathname()
  const isPublicAuthPage = pathname === '/login' || pathname === '/acesso'

  if (isPublicAuthPage) {
    return <main className="min-h-screen">{children}</main>
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto">{children}</main>
        <Footer />
      </div>
    </div>
  )
}
