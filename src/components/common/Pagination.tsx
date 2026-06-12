import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { cn } from '@/utils/cn'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

/** Builds e.g. [1, '…', 4, 5, 6, '…', 12] so long ranges stay compact. */
const getPageItems = (page: number, totalPages: number): Array<number | '…'> => {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)

  const pages = new Set<number>([1, totalPages, page - 1, page, page + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b)

  const items: Array<number | '…'> = []
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) items.push('…')
    items.push(p)
  })
  return items
}

export const Pagination = ({ page, totalPages, onPageChange, className }: PaginationProps) => {
  if (totalPages <= 1) return null

  return (
    <nav aria-label="Pagination" className={cn('flex items-center justify-center gap-2', className)}>
      <button
        type="button"
        aria-label="Previous page"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-700 transition hover:border-[#f0532d] hover:text-[#f0532d] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <FiChevronLeft />
      </button>

      {getPageItems(page, totalPages).map((item, index) =>
        item === '…' ? (
          <span key={`ellipsis-${index}`} className="px-1 text-sm text-stone-400">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            aria-current={item === page ? 'page' : undefined}
            onClick={() => onPageChange(item)}
            className={cn(
              'inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition',
              item === page
                ? 'bg-[#f0532d] text-white shadow-md shadow-orange-500/30'
                : 'border border-stone-300 bg-white text-stone-700 hover:border-[#f0532d] hover:text-[#f0532d]',
            )}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        aria-label="Next page"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-700 transition hover:border-[#f0532d] hover:text-[#f0532d] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <FiChevronRight />
      </button>
    </nav>
  )
}
