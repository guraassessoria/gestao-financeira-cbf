'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Bell, User } from 'lucide-react'

export function Header() {
  const pathname = usePathname()

  // Generate breadcrumb
  const segments = pathname
    .split('/')
    .filter(Boolean)
    .map((segment) => ({
      label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
      href: '/' + pathname.split('/').slice(1, pathname.split('/').indexOf(segment) + 1).join('/'),
    }))

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="flex items-center justify-between p-4 md:p-6">
        {/* Left: Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs md:text-sm">
          <Link href="/" className="text-slate-600 hover:text-slate-900 font-medium">
            Home
          </Link>
          {segments.map((segment, idx) => (
            <div key={segment.href} className="flex items-center gap-2">
              <ChevronRight size={16} className="text-slate-400" />
              {idx === segments.length - 1 ? (
                <span className="text-slate-900 font-medium">{segment.label}</span>
              ) : (
                <Link href={segment.href} className="text-slate-600 hover:text-slate-900">
                  {segment.label}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Right: User Menu */}
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors" aria-label="Notifications">
            <Bell size={20} className="text-slate-600" />
          </button>
          <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors" aria-label="User menu">
            <User size={20} className="text-slate-600" />
          </button>
        </div>
      </div>
    </header>
  )
}
