import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/db/connect'
import { UserModel } from '@/lib/db/models/user.model'
import { loginSchema } from '@/lib/validations/auth.schema'
import type { UserRole } from '@/lib/db/models/user.model'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        await connectDB()
        const user = await UserModel.findOne({
          email: parsed.data.email.toLowerCase(),
          isActive: true,
        }).lean()

        if (!user) return null
        const valid = await bcrypt.compare(parsed.data.password, user.password)
        if (!valid) return null

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role as UserRole,
        }
      },
    }),
  ],
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
})
