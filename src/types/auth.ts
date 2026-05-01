import type { UserRole } from '@/lib/db/models/user.model'

export interface SessionUser {
  id: string
  email: string
  name: string
  role: UserRole
}
