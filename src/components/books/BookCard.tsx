import { Link } from 'react-router-dom'
import { BookCover } from '@/components/common/BookCover'
import { RatingStars } from '@/components/common/RatingStars'
import { formatCurrency } from '@/utils/formatCurrency'
import type { IBook } from '@/interfaces/book.interface'

interface BookCardProps {
  book: IBook
}

export const BookCard = ({ book }: BookCardProps) => {
  const hasPrice = typeof book.minPrice === 'number'
  const discount =
    hasPrice && typeof book.mrp === 'number' && book.mrp > (book.minPrice as number)
      ? (book.mrp as number) - (book.minPrice as number)
      : 0
  const isOutOfStock = (book.totalStock ?? 0) <= 0

  return (
    <Link to={`/books/${book.id}`} className="group block" aria-label={book.title}>
      <div className="relative rounded-2xl bg-gradient-to-b from-stone-100 to-stone-200/70 p-5 transition group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-stone-300/60">
        {discount > 0 ? (
          <span className="absolute left-3 top-3 z-10 inline-flex items-center rounded-full bg-[#f0532d] px-2.5 py-1 text-[11px] font-bold text-white shadow-md">
            -{formatCurrency(discount)}
          </span>
        ) : null}
        {isOutOfStock ? (
          <span className="absolute right-3 top-3 z-10 inline-flex items-center rounded-full bg-stone-800/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
            Out of stock
          </span>
        ) : null}
        <BookCover
          src={book.coverImage}
          title={book.title}
          className="mx-auto aspect-[3/4.2] w-full max-w-[170px] rounded-md shadow-[0_18px_30px_-12px_rgba(0,0,0,0.35)] transition group-hover:scale-[1.03]"
        />
      </div>

      <div className="mt-3.5 space-y-1 px-0.5">
        <RatingStars rating={book.rating} />
        <h3 className="line-clamp-1 text-[15px] font-bold text-[#16243d] group-hover:text-[#f0532d]">
          {book.title}
        </h3>
        <p className="flex items-center gap-1.5 text-xs text-stone-500">
          {book.author}
          <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-emerald-700">
            Author
          </span>
        </p>
        {hasPrice ? (
          <p className="flex items-baseline gap-2 pt-0.5">
            <span className="text-[15px] font-bold text-[#16243d]">{formatCurrency(book.minPrice as number)}</span>
            {discount > 0 ? (
              <span className="text-xs text-stone-400 line-through">{formatCurrency(book.mrp as number)}</span>
            ) : null}
          </p>
        ) : (
          <p className="pt-0.5 text-xs font-medium text-stone-400">No listings yet</p>
        )}
      </div>
    </Link>
  )
}
