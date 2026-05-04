import { render, screen } from '@testing-library/react'
import { BankAccountStatusSelect } from '@/components/shared/admin/bank-account-status-select'

jest.mock('next/navigation', () => ({ useRouter: () => ({ refresh: jest.fn() }) }))
jest.mock('@/lib/actions/bank-account.actions', () => ({
  updateBankAccount: jest.fn().mockResolvedValue({ success: true, data: undefined }),
}))
jest.mock('sonner', () => ({ toast: { error: jest.fn(), success: jest.fn() } }))

describe('BankAccountStatusSelect', () => {
  it('renders a select element', () => {
    render(<BankAccountStatusSelect accountId="acc-1" currentStatus="active" />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('shows 待核实 option', () => {
    render(<BankAccountStatusSelect accountId="acc-1" currentStatus="pending_verification" />)
    expect(screen.getByText('待核实')).toBeInTheDocument()
  })
})
