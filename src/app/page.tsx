import { Sidebar } from '@/components/nav/Sidebar'
import { DashboardPage } from '@/components/pages/DashboardPage'

export default function Home() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <DashboardPage />
      </main>
    </div>
  )
}
