import CredentialsProvider from 'next-auth/providers/credentials'
import type { NextAuthOptions } from 'next-auth'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'CBF Demo Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Demo users para Sprint 2
        const demoUsers = [
          {
            id: 'user-001',
            email: 'admin@cbf.org.br',
            name: 'Administrador',
            password: 'admin123',
          },
          {
            id: 'user-002',
            email: 'contador@cbf.org.br',
            name: 'Contador',
            password: 'contador123',
          },
          {
            id: 'user-003',
            email: 'auditor@cbf.org.br',
            name: 'Auditor',
            password: 'auditor123',
          },
        ]

        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = demoUsers.find(
          (u) => u.email === credentials.email && u.password === credentials.password
        )

        if (!user) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
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
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
      }
      return token
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'cbf-secret-key-dev',
}
