import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FiX, FiCheck } from 'react-icons/fi'
import { FaStore } from 'react-icons/fa'
import { booksApi } from '@/api/books.api'
import { BookCover } from '@/components/common/BookCover'
import { Loader } from '@/components/common/Loader'
import { RatingStars } from '@/components/common/RatingStars'
import { useAddToCart } from '@/hooks/useCart'
import { formatCurrency } from '@/utils/formatCurrency'
import type { BookCardProps } from '@/interfaces'
import type { IListingWithSeller } from '@/interfaces/listing.interface'

const SelectSellerModal = ({
  book,
  onClose,
}: {
  book: BookCardProps['book']
  onClose: () => void
}) => {
  const [listings, setListings] = useState<IListingWithSeller[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null)
  const addToCart = useAddToCart()

   useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden'; 
    
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  useEffect(() => {
    booksApi
      .getListingsWithSellers(book.id)
      .then((data) => {
        setListings(data)
        const available = data.find((item) => item.stock > 0)
        if (available) setSelectedListingId(available.id)
      })
      .catch(() => toast.error('Failed to load sellers'))
      .finally(() => setIsLoading(false))
  }, [book.id])

  const handleAddSelected = () => {
    if (!selectedListingId) return
    addToCart.mutate(
      { listingId: selectedListingId, quantity: 1 },
      {
        onSuccess: () => {
          toast.success('Added to cart successfully!')
          onClose()
        },
      },
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl text-left flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-stone-100 pb-4">
          <div className="flex items-center gap-3 min-w-0">
            <BookCover src={book.coverImage} title={book.title} className="h-16 w-11 rounded shadow-sm object-cover shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-[#f0532d]">Select Seller</p>
              <h3 className="text-lg font-extrabold text-[#16243d] line-clamp-1">{book.title}</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition"
          >
            <FiX size={18} />
          </button>
        </div>

        {isLoading ? (
          <div className="py-12 text-center">
            <Loader />
            <p className="mt-3 text-xs text-stone-400">Finding available sellers...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm font-semibold text-stone-700">No sellers currently offer this book.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase text-stone-400">Available Listings ({listings.length})</p>
            {listings.map((item) => {
              const isSelected = selectedListingId === item.id
              const isOutOfStock = item.stock <= 0

              return (
                <label
                  key={item.id}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border p-4 transition ${
                    isSelected
                      ? 'border-[#f0532d] bg-orange-50/40 ring-2 ring-[#f0532d]/20'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  } ${isOutOfStock ? 'opacity-60 cursor-not-allowed' : ''}`}
                  onClick={() => !isOutOfStock && setSelectedListingId(item.id)}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
                        isSelected
                          ? 'border-[#f0532d] bg-[#f0532d] text-white'
                          : 'border-stone-300 bg-white'
                      }`}
                    >
                      {isSelected ? <FiCheck size={12} strokeWidth={3} /> : null}
                    </div>
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 text-sm font-bold text-[#16243d] line-clamp-1">
                        <FaStore className="text-[#f0532d] shrink-0" size={13} /> {item.seller?.businessName || 'Marketplace'}
                      </p>
                      <p className="mt-0.5 text-xs text-stone-500">
                        {isOutOfStock ? (
                          <span className="font-semibold text-red-600">Out of stock</span>
                        ) : (
                          <span className="text-emerald-600 font-medium">{item.stock} in stock available</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-base font-extrabold text-[#16243d]">{formatCurrency(item.price)}</p>
                    {item.mrp > item.price ? (
                      <p className="text-[11px] text-stone-400 line-through">{formatCurrency(item.mrp)}</p>
                    ) : null}
                  </div>
                </label>
              )
            })}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xl border border-stone-200 px-4 py-2.5 text-xs font-semibold text-stone-600 hover:bg-stone-50 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAddSelected}
            disabled={!selectedListingId || addToCart.isPending}
            className="cursor-pointer rounded-xl bg-[#f0532d] px-6 py-2.5 text-xs font-bold text-white transition hover:bg-[#d8431f] disabled:opacity-50 disabled:pointer-events-none"
          >
            {addToCart.isPending ? 'Adding to cart...' : 'Confirm & Add to cart'}
          </button>
        </div>
      </div>
    </div>
  )
}

export const BookCard = ({ book }: BookCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const hasPrice = typeof book.minPrice === 'number'
  const discount =
    hasPrice && typeof book.mrp === 'number' && book.mrp > (book.minPrice as number)
      ? (book.mrp as number) - (book.minPrice as number)
      : 0
  const isOutOfStock = (book.totalStock ?? 0) <= 0

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

          {hasPrice ? (
            isOutOfStock ? (
              <button
                type="button"
                disabled
                aria-disabled="true"
                className="cursor-not-allowed rounded-xl bg-stone-200 px-3.5 py-2 text-xs font-bold text-stone-500"
              >
                Out of Stock
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="cursor-pointer rounded-xl bg-[#f0532d] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#d8431f] active:scale-95 disabled:pointer-events-none disabled:opacity-50"
              >
                Add to cart
              </button>
            )
          ) : null}
        </div>
      </div>

      {isModalOpen ? <SelectSellerModal book={book} onClose={() => setIsModalOpen(false)} /> : null}
    </article>
  )
}
