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
  const publicRoutes = ['/login', '/acesso', '/api/auth']

  // Se é rota pública, continua
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Verificar sessão em ambos os formatos de cookie do NextAuth
  const token =
    request.cookies.get('next-auth.session-token')?.value ||
    request.cookies.get('__Secure-next-auth.session-token')?.value

  // Se não tem token e não é rota pública, redireciona para login
  if (!token && !publicRoutes.includes(pathname)) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
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

