import Link from 'next/link'

interface PaginationProps {
  currentPage: number
  totalPages: number
  buildHref: (page: number) => string
}

export function Pagination({ currentPage, totalPages, buildHref }: PaginationProps): React.ReactElement | null {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <nav className="flex items-center justify-center gap-1 py-4">
      {currentPage > 1 ? (
        <Link
          href={buildHref(currentPage - 1)}
          className="px-3 py-1 text-sm rounded border border-zinc-200 hover:bg-zinc-100 text-zinc-600"
        >
          ‹
        </Link>
      ) : (
        <span className="px-3 py-1 text-sm rounded border border-zinc-100 text-zinc-300 cursor-default">‹</span>
      )}

      {pages.map((page) =>
        page === currentPage ? (
          <span
            key={page}
            className="px-3 py-1 text-sm rounded border bg-zinc-900 border-zinc-900 text-white font-medium"
          >
            {page}
          </span>
        ) : (
          <Link
            key={page}
            href={buildHref(page)}
            className="px-3 py-1 text-sm rounded border border-zinc-200 hover:bg-zinc-100 text-zinc-600"
          >
            {page}
          </Link>
        )
      )}

      {currentPage < totalPages ? (
        <Link
          href={buildHref(currentPage + 1)}
          className="px-3 py-1 text-sm rounded border border-zinc-200 hover:bg-zinc-100 text-zinc-600"
        >
          ›
        </Link>
      ) : (
        <span className="px-3 py-1 text-sm rounded border border-zinc-100 text-zinc-300 cursor-default">›</span>
      )}
    </nav>
  )
}
