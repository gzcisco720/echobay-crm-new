import NextAuth from 'next-auth'
import type { NextAuthConfig } from 'next-auth'
import type { UserRole } from '@/lib/db/models/user.model'

const edgeAuthConfig: NextAuthConfig = {
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.role = user.role as UserRole
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.role = token.role as UserRole
      return session
    },
  },
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
}

export const { auth } = NextAuth(edgeAuthConfig)
