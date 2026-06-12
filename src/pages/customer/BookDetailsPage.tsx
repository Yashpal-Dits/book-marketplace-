import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FiArrowLeft, FiCheck, FiChevronRight, FiMinus, FiPlus, FiShoppingCart } from 'react-icons/fi'
import { FaStore } from 'react-icons/fa'
import { BookCover } from '@/components/common/BookCover'
import { Badge } from '@/components/common/Badge'
import { EmptyState } from '@/components/common/EmptyState'
import { Loader } from '@/components/common/Loader'
import { RatingStars } from '@/components/common/RatingStars'
import { useBookDetails, useBookListings } from '@/hooks/useBookDetails'
import { useAddToCart, useCustomerId } from '@/hooks/useCart'
import { useAuthStore } from '@/store/auth.store'
import { BookStatus } from '@/enums/book-status.enum'
import { formatCurrency } from '@/utils/formatCurrency'
import { cn } from '@/utils/cn'

export const BookDetailsPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const customerId = useCustomerId()

  const { data: book, isLoading: isBookLoading, isError } = useBookDetails(id)
  const { data: listings = [], isLoading: isListingsLoading } = useBookListings(id)
  const addToCart = useAddToCart()

  const [chosenListingId, setChosenListingId] = useState<string | null>(null)
  const [rawQuantity, setRawQuantity] = useState(1)

  // Derived state (no effects): default to the cheapest in-stock listing,
  // and clamp quantity against the selected seller's available stock.
  const selectedListingId = chosenListingId ?? listings.find((l) => l.stock > 0)?.id ?? null
  const selectedListing = listings.find((l) => l.id === selectedListingId) ?? null
  const maxQuantity = selectedListing?.stock ?? 0
  const quantity = Math.min(Math.max(1, rawQuantity), Math.max(1, maxQuantity))

  const handleSelectListing = (listingId: string) => {
    setChosenListingId(listingId)
    setRawQuantity(1) // quantity resets when switching sellers
  }

  if (isBookLoading) return <Loader />

  if (isError || !book || book.status !== BookStatus.APPROVED) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-20">
        <EmptyState title="Book not found" description="This book does not exist or is not available in the marketplace." />
        <div className="mt-6 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#f0532d] hover:underline">
            <FiArrowLeft /> Back to home
          </Link>
        </div>
      </section>
    )
  }

  const handleAddToCart = () => {
    // Customer MUST select a seller before adding to cart (PDF Step 4)
    if (!selectedListing) {
      toast.error('Please select a seller first')
      return
    }
    if (!isAuthenticated || !customerId) {
      toast.error('Please login as a customer to add items to cart')
      navigate('/login', { state: { from: { pathname: `/books/${book.id}` } } })
      return
    }
    addToCart.mutate({ listingId: selectedListing.id, quantity })
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-stone-500" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-[#f0532d]">Home</Link>
        <FiChevronRight />
        <Link to="/books" className="hover:text-[#f0532d]">Books</Link>
        <FiChevronRight />
        <span className="line-clamp-1 font-medium text-stone-800">{book.title}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-[340px_1fr]">
        {/* cover */}
        <div>
          <div className="rounded-2xl bg-gradient-to-b from-stone-100 to-stone-200/70 p-8">
            <BookCover
              src={book.coverImage}
              title={book.title}
              className="mx-auto aspect-[3/4.2] w-full max-w-[240px] rounded-md shadow-[0_24px_40px_-16px_rgba(0,0,0,0.4)]"
            />
          </div>
        </div>

        {/* info + seller comparison */}
        <div>
          <div className="flex flex-wrap items-center gap-3">
            {book.category ? <Badge className="bg-emerald-100 text-emerald-800">{book.category}</Badge> : null}
            <RatingStars rating={book.rating} />
            <span className="text-xs text-stone-500">{book.rating?.toFixed(1)} rating</span>
          </div>

          <h1 className="font-display mt-3 text-3xl font-extrabold uppercase leading-tight text-[#16243d] sm:text-4xl">
            {book.title}
          </h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-stone-600">
            <span>
              by <span className="font-semibold text-stone-900">{book.author}</span>
            </span>
            {book.publisher ? <span>Publisher: {book.publisher}</span> : null}
            <span>ISBN: {book.isbn}</span>
          </p>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600">{book.description}</p>

          {/* seller comparison */}
          <div className="mt-8">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[#16243d]">
              <FaStore className="text-[#f0532d]" /> Choose a Seller
              <span className="font-normal normal-case text-stone-400">
                — {listings.length} seller{listings.length === 1 ? '' : 's'} offer this book
              </span>
            </h2>

            {isListingsLoading ? (
              <Loader />
            ) : listings.length === 0 ? (
              <div className="mt-3">
                <EmptyState title="No sellers right now" description="No approved seller currently offers this book. Check back soon." />
              </div>
            ) : (
              <div className="mt-3 space-y-3" role="radiogroup" aria-label="Available sellers">
                {listings.map((listing, index) => {
                  const isSelected = listing.id === selectedListingId
                  const isOutOfStock = listing.stock <= 0
                  const isLowStock = listing.stock > 0 && listing.stock <= 5

                  return (
                    <button
                      key={listing.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      disabled={isOutOfStock}
                      onClick={() => handleSelectListing(listing.id)}
                      className={cn(
                        'flex w-full items-center justify-between gap-4 rounded-2xl border-2 bg-white p-4 text-left transition',
                        isSelected
                          ? 'border-[#f0532d] shadow-lg shadow-orange-500/10'
                          : 'border-stone-200 hover:border-stone-300',
                        isOutOfStock && 'cursor-not-allowed opacity-60',
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-white transition',
                            isSelected ? 'border-[#f0532d] bg-[#f0532d]' : 'border-stone-300 bg-white',
                          )}
                        >
                          {isSelected ? <FiCheck className="text-xs" /> : null}
                        </span>
                        <div>
                          <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-[#16243d]">
                            {listing.seller.businessName}
                            {index === 0 ? (
                              <Badge className="bg-emerald-100 text-[10px] text-emerald-700">Best Price</Badge>
                            ) : null}
                          </p>
                          <p className="mt-0.5 text-xs text-stone-500">
                            {isOutOfStock ? (
                              <span className="font-semibold text-red-600">Out of stock</span>
                            ) : isLowStock ? (
                              <span className="font-semibold text-amber-600">Only {listing.stock} left in stock</span>
                            ) : (
                              <span className="text-emerald-700">In stock · {listing.stock} available</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-[#16243d]">{formatCurrency(listing.price)}</p>
                        {listing.mrp && listing.mrp > listing.price ? (
                          <p className="text-xs text-stone-400 line-through">{formatCurrency(listing.mrp)}</p>
                        ) : null}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* quantity + add to cart */}
          {listings.length > 0 ? (
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="flex items-center rounded-full border border-stone-300">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  disabled={quantity <= 1}
                  onClick={() => setRawQuantity(Math.max(1, quantity - 1))}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-l-full text-stone-700 transition hover:bg-stone-100 disabled:opacity-40"
                >
                  <FiMinus />
                </button>
                <span className="w-10 text-center text-sm font-bold text-[#16243d]" aria-live="polite">
                  {quantity}
                </span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  disabled={!selectedListing || quantity >= maxQuantity}
                  onClick={() => setRawQuantity(Math.min(maxQuantity, quantity + 1))}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-r-full text-stone-700 transition hover:bg-stone-100 disabled:opacity-40"
                >
                  <FiPlus />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={addToCart.isPending || !selectedListing}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-[#f0532d] px-8 text-sm font-semibold text-white transition hover:bg-[#d8431f] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiShoppingCart />
                {addToCart.isPending ? 'Adding…' : 'Add to Cart'}
              </button>

              {selectedListing ? (
                <p className="text-sm text-stone-500">
                  Subtotal:{' '}
                  <span className="font-bold text-[#16243d]">{formatCurrency(selectedListing.price * quantity)}</span>
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
