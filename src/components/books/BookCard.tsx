import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FiShoppingCart } from 'react-icons/fi'
import { booksApi } from '@/api/books.api'
import { BookCover } from '@/components/common/BookCover'
import { RatingStars } from '@/components/common/RatingStars'
import { useAddToCart } from '@/hooks/useCart'
import { formatCurrency } from '@/utils/formatCurrency'
import type { BookCardProps } from '@/interfaces'

export const BookCard = ({ book }: BookCardProps) => {
  const addToCart = useAddToCart()
  const [isFindingListing, setIsFindingListing] = useState(false)
  const [isAdded, setIsAdded] = useState(false)
  const hasPrice = typeof book.minPrice === 'number'
  const discount =
    hasPrice && typeof book.mrp === 'number' && book.mrp > (book.minPrice as number)
      ? (book.mrp as number) - (book.minPrice as number)
      : 0
  const isOutOfStock = (book.totalStock ?? 0) <= 0

  const handleAddToCart = async () => {
    try {
      setIsFindingListing(true)
      const listings = await booksApi.getListingsWithSellers(book.id)
      const listing = listings.find((item) => item.stock > 0)

      if (!listing) {
        toast.error('No seller has stock for this book right now')
        return
      }

      addToCart.mutate(
        { listingId: listing.id, quantity: 1 },
        {
          onSuccess: () => {
            setIsAdded(true)
            window.setTimeout(() => setIsAdded(false), 1400)
          },
        },
      )
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not add this book to cart')
    } finally {
      setIsFindingListing(false)
    }
  }

  return (
    <article className="group block">
      <Link to={`/books/${book.id}`} aria-label={book.title}>
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
      </Link>

      <div className="mt-3.5 space-y-1 px-0.5">
        <RatingStars rating={book.rating} />
        <Link to={`/books/${book.id}`} className="block">
          <h3 className="line-clamp-1 text-[15px] font-bold text-[#16243d] group-hover:text-[#f0532d]">
            {book.title}
          </h3>
        </Link>
        <p className="flex items-center gap-1.5 text-xs text-stone-500">
          {book.author}
          <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-emerald-700">
            Author
          </span>
        </p>
        <div className="flex items-center justify-between gap-3 pt-1">
          {hasPrice ? (
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase leading-none text-stone-400">Price</p>
              <p className="mt-1 flex flex-wrap items-baseline gap-2">
                <span className="text-[17px] font-extrabold text-[#16243d]">{formatCurrency(book.minPrice as number)}</span>
                {discount > 0 ? (
                  <span className="text-xs text-stone-400 line-through">{formatCurrency(book.mrp as number)}</span>
                ) : null}
              </p>
            </div>
          ) : (
            <p className="text-xs font-medium text-stone-400">No listings yet</p>
          )}

          <button
            type="button"
            aria-label={`Add ${book.title} to cart`}
            title={isFindingListing || addToCart.isPending ? 'Adding...' : isAdded ? 'Added' : 'Add to cart'}
            onClick={handleAddToCart}
            disabled={isOutOfStock || !hasPrice || isFindingListing || addToCart.isPending}
            className={`inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg px-3.5 text-[11px] font-bold uppercase tracking-wide shadow-sm transition disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500 ${
              isAdded ? 'bg-emerald-100 text-emerald-800' : 'bg-[#9ed8c7] text-[#0d2b1f] hover:bg-[#87cbb7]'
            }`}
          >
            <FiShoppingCart className="text-xs" />
            {isFindingListing || addToCart.isPending ? 'Adding' : isAdded ? 'Added ✓' : 'Add'}
          </button>
        </div>
      </div>
    </article>
  )
}
