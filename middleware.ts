import { auth } from '@/lib/auth/auth.config'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default auth((req: NextRequest & { auth: { user?: { role?: string } } | null }) => {
  const { nextUrl } = req
  const session = req.auth
  const role = session?.user?.role

  if (nextUrl.pathname.startsWith('/merchant')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', nextUrl))
    }
    if (role !== 'merchant') {
      return NextResponse.redirect(new URL('/login', nextUrl))
    }
  }

  if (nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', nextUrl))
    }
    if (role !== 'admin' && role !== 'super_admin') {
      return NextResponse.redirect(new URL('/login', nextUrl))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/merchant/:path*', '/admin/:path*'],
}
