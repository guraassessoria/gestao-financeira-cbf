'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import clsx from 'clsx'
import { mainNavigation } from './navigation'

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600 text-white"
        aria-label="Menu"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed md:static top-0 left-0 h-screen w-64 bg-slate-950 text-white transition-transform duration-300 z-40',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold">CBF Financeiro</h1>
          <p className="text-xs text-slate-400 mt-1">Gestão Financeira</p>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-6 space-y-1 px-3">
          {mainNavigation.map((item) => (
            <SidebarItem key={item.href} item={item} isActive={isActive(item.href)} pathname={pathname} />
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800">
          <p className="text-xs text-slate-400">v1.0.0</p>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}

interface SidebarItemProps {
  item: (typeof mainNavigation)[0]
  isActive: boolean
  pathname: string
}

function SidebarItem({ item, isActive, pathname }: SidebarItemProps) {
  const [expanded, setExpanded] = useState(isActive)
  const Icon = item.icon

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className={clsx(
            'w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors',
            isActive
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          )}
        >
          <div className="flex items-center gap-3">
            <Icon size={18} />
            <span>{item.label}</span>
          </div>
          <svg
            className={clsx('w-4 h-4 transition-transform', expanded && 'rotate-180')}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
        {expanded && (
          <div className="pl-6 mt-1 space-y-1">
            {item.children.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className={clsx(
                  'flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
                  pathname === child.href
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                )}
              >
                <span className="w-1 h-1 bg-current rounded-full" />
                {child.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Link
      href={item.href}
      className={clsx(
        'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
        isActive
          ? 'bg-blue-600 text-white'
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      )}
      title={item.description}
    >
      <Icon size={18} />
      <span>{item.label}</span>
    </Link>
  )
}
