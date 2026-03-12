export type UserRole = 'admin' | 'contador' | 'auditor' | 'diretor'

export const roleHome: Record<UserRole, string> = {
  admin: '/dashboard',
  contador: '/upload',
  auditor: '/demonstracoes/dre',
  diretor: '/indices',
}

const rolePrefixes: Record<UserRole, string[]> = {
  admin: [
    '/dashboard',
    '/demonstracoes',
    '/indices',
    '/competicoes',
    '/centros-de-custo',
    '/upload',
    '/admin',
  ],
  contador: ['/dashboard', '/demonstracoes', '/indices', '/upload'],
  auditor: ['/dashboard', '/demonstracoes', '/indices'],
  diretor: ['/dashboard', '/demonstracoes', '/indices'],
}

export function hasAccess(role: UserRole, pathname: string): boolean {
  return rolePrefixes[role].some((prefix) => pathname === prefix || pathname.startsWith(prefix + '/'))
}

export function getRoleHome(role?: string | null): string {
  if (!role || !(role in roleHome)) return '/dashboard'
  return roleHome[role as UserRole]
}

export function normalizeRole(input?: string | null): UserRole | null {
  const role = (input || '').toLowerCase().trim()
  if (role === 'admin' || role === 'contador' || role === 'auditor' || role === 'diretor') {
    return role
  }
  return null
}
