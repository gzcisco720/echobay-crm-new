import { render, screen } from '@testing-library/react'
import { Pagination } from '@/components/shared/admin/pagination'

describe('Pagination', () => {
  it('renders nothing when totalPages is 1', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} buildHref={(p) => `/admin/applications?page=${p}`} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders page numbers and prev/next links', () => {
    render(
      <Pagination currentPage={2} totalPages={5} buildHref={(p) => `/admin/applications?page=${p}`} />
    )
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('‹')).toBeInTheDocument()
    expect(screen.getByText('›')).toBeInTheDocument()
  })

  it('prev link points to previous page', () => {
    render(
      <Pagination currentPage={3} totalPages={5} buildHref={(p) => `/admin/applications?page=${p}`} />
    )
    const prev = screen.getByText('‹').closest('a')
    expect(prev).toHaveAttribute('href', '/admin/applications?page=2')
  })

  it('next link points to next page', () => {
    render(
      <Pagination currentPage={3} totalPages={5} buildHref={(p) => `/admin/applications?page=${p}`} />
    )
    const next = screen.getByText('›').closest('a')
    expect(next).toHaveAttribute('href', '/admin/applications?page=4')
  })

  it('highlights the current page', () => {
    render(
      <Pagination currentPage={2} totalPages={5} buildHref={(p) => `/admin/applications?page=${p}`} />
    )
    const currentPageEl = screen.getByText('2').closest('span')
    expect(currentPageEl).toBeInTheDocument()
  })

  it('prev is disabled on first page', () => {
    render(
      <Pagination currentPage={1} totalPages={5} buildHref={(p) => `/admin/applications?page=${p}`} />
    )
    expect(screen.queryByText('‹')?.closest('a')).toBeNull()
    expect(screen.getByText('‹').closest('span')).toBeInTheDocument()
  })

  it('next is disabled on last page', () => {
    render(
      <Pagination currentPage={5} totalPages={5} buildHref={(p) => `/admin/applications?page=${p}`} />
    )
    expect(screen.queryByText('›')?.closest('a')).toBeNull()
    expect(screen.getByText('›').closest('span')).toBeInTheDocument()
  })
})
