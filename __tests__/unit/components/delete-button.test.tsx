import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DeleteButton } from '@/components/shared/delete-button'

jest.mock('sonner', () => ({ toast: { error: jest.fn() } }))

jest.mock('@/components/ui/alert-dialog', () => {
  // Capture open state so Trigger and Cancel can mutate it via onOpenChange
  const React = jest.requireActual<typeof import('react')>('react')

  function AlertDialog({ open, onOpenChange, children }: {
    open: boolean
    onOpenChange: (v: boolean) => void
    children: React.ReactNode
  }) {
    // Provide context so children can call onOpenChange
    return (
      <AlertDialogCtx.Provider value={{ open, onOpenChange }}>
        {children}
      </AlertDialogCtx.Provider>
    )
  }

  const AlertDialogCtx = React.createContext<{ open: boolean; onOpenChange: (v: boolean) => void }>({
    open: false,
    onOpenChange: () => {},
  })

  function AlertDialogTrigger({ children, disabled, className }: { children: React.ReactNode; asChild?: boolean; disabled?: boolean; className?: string }) {
    const { onOpenChange } = React.useContext(AlertDialogCtx)
    return <button onClick={() => onOpenChange(true)} disabled={disabled} className={className}>{children}</button>
  }

  function AlertDialogContent({ children }: { children: React.ReactNode }) {
    const { open } = React.useContext(AlertDialogCtx)
    return open ? <div>{children}</div> : null
  }

  function AlertDialogHeader({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>
  }

  function AlertDialogTitle({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>
  }

  function AlertDialogDescription({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>
  }

  function AlertDialogFooter({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>
  }

  function AlertDialogCancel({ children }: { children: React.ReactNode }) {
    const { onOpenChange } = React.useContext(AlertDialogCtx)
    return <button onClick={() => onOpenChange(false)}>{children}</button>
  }

  function AlertDialogAction({ children, onClick, disabled }: {
    children: React.ReactNode
    onClick?: () => void
    disabled?: boolean
  }) {
    return <button onClick={onClick} disabled={disabled}>{children}</button>
  }

  return {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
  }
})

describe('DeleteButton', () => {
  const defaultProps = {
    label: '删除门店',
    description: 'ApprovedBrand Sydney CBD',
    onConfirm: jest.fn().mockResolvedValue(undefined),
  }

  beforeEach(() => jest.clearAllMocks())

  it('renders trigger button with label', () => {
    render(<DeleteButton {...defaultProps} />)
    expect(screen.getByRole('button', { name: '删除门店' })).toBeInTheDocument()
  })

  it('opens dialog when trigger is clicked', async () => {
    render(<DeleteButton {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: '删除门店' }))
    await waitFor(() => {
      expect(screen.getAllByText('确认删除').length).toBeGreaterThan(0)
    })
    expect(screen.getByText(/ApprovedBrand Sydney CBD/)).toBeInTheDocument()
    expect(screen.getByText(/此操作不可撤销/)).toBeInTheDocument()
  })

  it('does not call onConfirm when cancel is clicked', async () => {
    render(<DeleteButton {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: '删除门店' }))
    await waitFor(() => expect(screen.getByText('取消')).toBeInTheDocument())
    fireEvent.click(screen.getByText('取消'))
    expect(defaultProps.onConfirm).not.toHaveBeenCalled()
  })

  it('calls onConfirm when confirm button is clicked', async () => {
    render(<DeleteButton {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: '删除门店' }))
    await waitFor(() => expect(screen.getByRole('button', { name: '确认删除' })).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: '确认删除' }))
    await waitFor(() => expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1))
  })

  it('is disabled when disabled prop is true', () => {
    render(<DeleteButton {...defaultProps} disabled />)
    expect(screen.getByRole('button', { name: '删除门店' })).toBeDisabled()
  })
})
