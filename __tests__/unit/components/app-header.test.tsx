import { render, screen } from '@testing-library/react'
import { AppHeader } from '@/components/shared/layout/app-header'

jest.mock('next/navigation', () => ({
  usePathname: () => '/admin/dashboard',
  useRouter: () => ({ refresh: jest.fn() }),
}))

jest.mock('@/components/shared/layout/locale-switcher', () => ({
  LocaleSwitcher: () => null,
}))

const adminUser = { name: 'Test Admin', email: 'admin@test.com', role: 'admin' as const }
const merchantUser = { name: 'Test Merchant', email: 'm@test.com', role: 'merchant' as const }

describe('AppHeader', () => {
  it('shows page title derived from pathname', () => {
    render(<AppHeader user={adminUser} />)
    expect(screen.getByText('数据概览')).toBeInTheDocument()
  })

  it('shows user initials in avatar', () => {
    render(<AppHeader user={adminUser} />)
    expect(screen.getByText('TA')).toBeInTheDocument()
  })

  it('shows user name', () => {
    render(<AppHeader user={adminUser} />)
    expect(screen.getByText('Test Admin')).toBeInTheDocument()
  })

  it('shows Admin badge for admin role', () => {
    render(<AppHeader user={adminUser} />)
    expect(screen.getByText('Admin')).toBeInTheDocument()
  })

  it('shows Merchant badge for merchant role', () => {
    render(<AppHeader user={merchantUser} />)
    expect(screen.getByText('Merchant')).toBeInTheDocument()
  })

  it('renders notification bell button', () => {
    render(<AppHeader user={adminUser} />)
    expect(screen.getByLabelText('通知')).toBeInTheDocument()
  })
})
