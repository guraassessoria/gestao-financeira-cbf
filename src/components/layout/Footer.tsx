export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-slate-50 border-t border-slate-200 py-4 px-6 text-center text-sm text-slate-600">
      <p>
        © {year} CBF — Sistema de Gestão Financeira. <span className="text-slate-400">v1.0.0</span>
      </p>
    </footer>
  )
}
