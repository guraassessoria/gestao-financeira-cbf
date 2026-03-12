'use client'

import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { LogIn } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('admin@cbf.org.br')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError('Email ou senha incorretos')
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <div className="mb-6 flex items-center justify-center gap-2">
          <LogIn className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold">CBF Financeiro</h1>
        </div>

        <p className="mb-6 text-center text-sm text-slate-600">
          Sistema de Gestão Financeira
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              placeholder="admin@cbf.org.br"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && <div className="rounded bg-red-50 p-3 text-sm text-red-600">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 space-y-2 border-t border-slate-200 pt-6 text-xs text-slate-500">
          <p>
            <strong>Demo Users:</strong>
          </p>
          <p>
            👤 <code className="rounded bg-slate-100 px-2 py-1">admin@cbf.org.br</code> /
            <code className="rounded bg-slate-100 px-2 py-1">admin123</code>
          </p>
          <p>
            👤 <code className="rounded bg-slate-100 px-2 py-1">contador@cbf.org.br</code> /
            <code className="rounded bg-slate-100 px-2 py-1">contador123</code>
          </p>
          <p>
            👤 <code className="rounded bg-slate-100 px-2 py-1">auditor@cbf.org.br</code> /
            <code className="rounded bg-slate-100 px-2 py-1">auditor123</code>
          </p>
        </div>
      </div>
    </div>
  )
}
