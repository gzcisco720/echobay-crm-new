import { render, screen } from '@testing-library/react'
import { BrandStatusSelect } from '@/components/shared/admin/brand-status-select'

jest.mock('next/navigation', () => ({ useRouter: () => ({ refresh: jest.fn() }) }))
jest.mock('@/lib/actions/brand.actions', () => ({
  updateBrand: jest.fn().mockResolvedValue({ success: true, data: undefined }),
}))
jest.mock('sonner', () => ({ toast: { error: jest.fn(), success: jest.fn() } }))

describe('BrandStatusSelect', () => {
  it('renders a select element', () => {
    render(<BrandStatusSelect brandId="brand-1" currentStatus="active" />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('shows 活跃 option', () => {
    render(<BrandStatusSelect brandId="brand-1" currentStatus="active" />)
    expect(screen.getByText('活跃')).toBeInTheDocument()
  })
})
