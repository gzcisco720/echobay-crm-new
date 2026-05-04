import { render, screen } from '@testing-library/react'
import { StatusBadge } from '@/components/shared/status-badge'

describe('StatusBadge', () => {
  const cases = [
    { status: 'approved', label: '已批准', classes: ['bg-emerald-100', 'text-emerald-700'] },
    { status: 'rejected', label: '已拒绝', classes: ['bg-red-100', 'text-red-700'] },
    { status: 'requires_info', label: '需补充', classes: ['bg-amber-100', 'text-amber-700'] },
    { status: 'submitted', label: '已提交', classes: ['bg-blue-100', 'text-blue-700'] },
    { status: 'under_review', label: '审核中', classes: ['bg-blue-100', 'text-blue-700'] },
    { status: 'draft', label: '草稿', classes: ['bg-slate-100', 'text-slate-600'] },
  ]

  cases.forEach(({ status, label, classes }) => {
    it(`renders "${label}" with correct classes for status "${status}"`, () => {
      const { container } = render(<StatusBadge status={status} />)
      expect(screen.getByText(label)).toBeInTheDocument()
      classes.forEach((cls) => expect(container.firstChild).toHaveClass(cls))
    })
  })

  it('renders unknown status as-is with fallback styling', () => {
    render(<StatusBadge status="unknown" />)
    expect(screen.getByText('unknown')).toBeInTheDocument()
  })
})
