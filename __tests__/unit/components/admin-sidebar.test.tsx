import { render, screen } from '@testing-library/react'
import { AdminSidebar } from '@/components/shared/layout/admin-sidebar'

jest.mock('next/navigation', () => ({ usePathname: () => '/admin/dashboard' }))
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}))
jest.mock('next-auth/react', () => ({ signOut: jest.fn() }))

describe('AdminSidebar', () => {
  it('renders all 8 nav items', () => {
    render(<AdminSidebar email="admin@test.com" />)
    expect(screen.getByText('数据概览')).toBeInTheDocument()
    expect(screen.getByText('邀请管理')).toBeInTheDocument()
    expect(screen.getByText('申请审核')).toBeInTheDocument()
    expect(screen.getByText('商户管理')).toBeInTheDocument()
    expect(screen.getByText('品牌管理')).toBeInTheDocument()
    expect(screen.getByText('门店管理')).toBeInTheDocument()
    expect(screen.getByText('推广活动')).toBeInTheDocument()
    expect(screen.getByText('特色产品')).toBeInTheDocument()
  })

  it('renders EchoBay logo image', () => {
    render(<AdminSidebar email="admin@test.com" />)
    expect(screen.getByAltText('EchoBay')).toBeInTheDocument()
  })

  it('renders user email in footer', () => {
    render(<AdminSidebar email="admin@test.com" />)
    expect(screen.getByText('admin@test.com')).toBeInTheDocument()
  })

  it('dashboard link points to correct href', () => {
    render(<AdminSidebar email="admin@test.com" />)
    const link = screen.getByText('数据概览').closest('a')
    expect(link).toHaveAttribute('href', '/admin/dashboard')
  })
})
