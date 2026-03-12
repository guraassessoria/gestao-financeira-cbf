import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Simple middleware para NextAuth
 * Não é usado auth() do NextAuth aqui porque ainda não temos edge-compatible adapter
 * Em vez disso, deixamos a proteção para cada página/rota
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = ['/login', '/api/auth']

  // Se é rota pública, continua
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Verificar se tem sessão (cookie nextauth.session-token)
  const token = request.cookies.get('next-auth.session-token')

  // Se não tem token e não é rota pública, redireciona para login
  if (!token && !publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

