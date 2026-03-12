"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  Scale,
  ArrowRightLeft,
  BookOpen,
  Upload,
  Settings,
  FileText,
} from "lucide-react";
import { clsx } from "clsx";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dre", label: "DRE", icon: TrendingUp },
  { href: "/bp", label: "BP", icon: Scale },
  { href: "/dfc", label: "DFC", icon: ArrowRightLeft },
  { href: "/dra", label: "DRA", icon: BookOpen },
  { href: "/relatorios", label: "Relatórios", icon: FileText },
  { href: "/upload", label: "Carga de Dados", icon: Upload },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col min-h-screen">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-700">
        <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase">
          CBF
        </p>
        <h1 className="text-lg font-bold mt-0.5 text-white leading-tight">
          Gestão Financeira
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              pathname === href
                ? "bg-blue-600 text-white"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            )}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-slate-700 text-xs text-slate-500">
        Protheus + Supabase · v1.0
      </div>
    </aside>
  );
}
