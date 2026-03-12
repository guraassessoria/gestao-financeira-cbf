import CredentialsProvider from 'next-auth/providers/credentials'
import type { NextAuthOptions } from 'next-auth'
import type { UserRole } from '@/lib/access'

// Usuários demo: em produção estes viram do banco (tabela usuarios)
const DEMO_USERS = [
  {
    id: 'user-001',
    email: process.env.DEMO_ADMIN_EMAIL || 'admin@cbf.org.br',
    name: 'Administrador',
    password: process.env.DEMO_ADMIN_PASSWORD || 'admin123',
    role: 'admin' as UserRole,
  },
  {
    id: 'user-002',
    email: process.env.DEMO_CONTADOR_EMAIL || 'contador@cbf.org.br',
    name: 'Contador',
    password: process.env.DEMO_CONTADOR_PASSWORD || 'contador123',
    role: 'contador' as UserRole,
  },
  {
    id: 'user-003',
    email: process.env.DEMO_AUDITOR_EMAIL || 'auditor@cbf.org.br',
    name: 'Auditor',
    password: process.env.DEMO_AUDITOR_PASSWORD || 'auditor123',
    role: 'auditor' as UserRole,
  },
  {
    id: 'user-004',
    email: process.env.DEMO_DIRETOR_EMAIL || 'diretor@cbf.org.br',
    name: 'Diretor',
    password: process.env.DEMO_DIRETOR_PASSWORD || 'diretor123',
    role: 'diretor' as UserRole,
  },
]

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'CBF Demo Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = DEMO_USERS.find(
          (u) => u.email === credentials.email && u.password === credentials.password
        )

        if (!user) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub || ''
        session.user.role = (token.role as UserRole) || 'auditor'
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
        token.role = user.role
      }
      return token
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
