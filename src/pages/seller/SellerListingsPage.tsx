import { useEffect, useState, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { Form, Formik } from 'formik'
import toast from 'react-hot-toast'
import { FiEdit3, FiPlus, FiRefreshCw, FiSearch, FiLayers, FiX, FiClock } from 'react-icons/fi'
import { Badge } from '@/components/common/Badge'
import { BookCover } from '@/components/common/BookCover'
import { Button } from '@/components/common/Button'
import { EmptyState } from '@/components/common/EmptyState'
import { FormInput } from '@/components/common/FormInput'
import { Loader } from '@/components/common/Loader'
import { Pagination } from '@/components/common/Pagination'
import { RatingStars } from '@/components/common/RatingStars'
import { BookStatus } from '@/enums/book-status.enum'
import { SellerListingSort } from '@/enums/seller-sort.enum'
import { useDebounce } from '@/hooks/useDebounce'
import { useSellerListingFilterStore } from '@/store/sellerFilter.store'
import { formatCurrency } from '@/utils/formatCurrency'
import { useCategories } from '@/hooks/useCategories'
import { cn } from '@/utils/cn'
import {
  useCreateSellerBookRequest,
  useCreateSellerListing,
  useSellerApprovedBooks,
  useSellerListings,
  useSellerRequestedBooks,
  useUpdateSellerListing,
} from '@/hooks/useSeller'
import type { SellerListingDetailed } from '@/api/seller.api'
import {
  sellerBookRequestSchema,
  sellerListingSchema,
  sellerListingUpdateSchema,
} from '@/schemas/seller.schema'

const PAGE_SIZE = 8

const fieldError = <T extends Record<string, unknown>>(
  errors: T,
  touched: Record<string, unknown>,
  name: keyof T,
) => (touched[name as string] && errors[name] ? String(errors[name]) : undefined)

const SelectField = ({
  label,
  error,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string }) => (
  <label className="block text-left min-w-0">
    <span className="mb-1.5 block text-xs font-medium text-stone-700">{label}</span>
    <select
      className={cn(
        'h-11 w-full cursor-pointer rounded-xl border border-stone-200 bg-white px-3 text-xs outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10',
        error && 'border-red-400',
      )}
      {...props}
    >
      {children}
    </select>
    {error ? <span className="mt-1 block text-[11px] text-red-600">{error}</span> : null}
  </label>
)

const TextareaField = ({
  label,
  error,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string }) => (
  <label className="block text-left">
    <span className="mb-1.5 block text-sm font-medium text-stone-700">{label}</span>
    <textarea
      className={cn(
        'min-h-28 w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10',
        error ? 'border-red-400' : 'border-stone-200',
      )}
      {...props}
    />
    {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
  </label>
)

const statusStyle: Record<BookStatus, string> = {
  [BookStatus.APPROVED]: 'bg-emerald-100 text-emerald-800',
  [BookStatus.PENDING]: 'bg-amber-100 text-amber-800',
  [BookStatus.REJECTED]: 'bg-red-100 text-red-700',
}

const EditListingModal = ({
  listing,
  onClose,
}: {
  listing: SellerListingDetailed
  onClose: () => void
}) => {
  const updateListing = useUpdateSellerListing()

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl text-left space-y-6 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Listing terms</p>
            <h2 className="font-display text-xl sm:text-2xl font-black text-heading line-clamp-1">
              {listing.book.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer inline-flex h-9 w-9 items-center justify-center rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition"
          >
            <FiX size={20} />
          </button>
        </div>

        <Formik
          initialValues={{
            price: listing.price,
            mrp: listing.mrp,
            stock: listing.stock,
            isActive: listing.isActive,
          }}
          validationSchema={sellerListingUpdateSchema}
          onSubmit={(values) =>
            updateListing.mutate(
              {
                listingId: listing.id,
                price: Number(values.price),
                mrp: Number(values.mrp),
                stock: Number(values.stock),
                isActive: values.isActive,
              },
              { onSuccess: onClose },
            )
          }
        >
          {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
            <Form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label="Selling Price (₹)"
                  name="price"
                  type="number"
                  value={values.price}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={fieldError(errors, touched, 'price')}
                />
                <FormInput
                  label="MRP (₹)"
                  name="mrp"
                  type="number"
                  value={values.mrp}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={fieldError(errors, touched, 'mrp')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label="Stock Units Available"
                  name="stock"
                  type="number"
                  value={values.stock}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={fieldError(errors, touched, 'stock')}
                />

                <SelectField
                  label="Listing Visibility"
                  name="isActive"
                  value={String(values.isActive)}
                  onChange={handleChange}
                  onBlur={handleBlur}
                >
                  <option value="true">Active (Visible)</option>
                  <option value="false">Inactive (Hidden)</option>
                </SelectField>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                <Button type="button" variant="secondary" onClick={onClose} className="px-6">
                  Cancel
                </Button>
                <Button type="submit" className="px-8" disabled={updateListing.isPending || isSubmitting}>
                  {updateListing.isPending ? 'Saving changes...' : 'Save changes'}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  )
}

export const SellerListingsPage = () => {
  const { search, sort, page, setSearch, setSort, setPage } = useSellerListingFilterStore()
  const debouncedSearch = useDebounce(search, 350)

  const { data, isLoading, isError } = useSellerListings({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch,
    sort,
  })

  const {
    data: requestedBooksData,
    isLoading: isRequestedBooksLoading,
    isError: isRequestedBooksError,
  } = useSellerRequestedBooks({
    page: 1,
    limit: 1000,
    search: debouncedSearch,
  })

  const requestedBooks = requestedBooksData?.data ?? []
  const { data: approvedBooks = [] } = useSellerApprovedBooks()
  const { data: categories = [], isLoading: isCategoriesLoading } = useCategories()
  const createListing = useCreateSellerListing()
  const createBookRequest = useCreateSellerBookRequest()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'inventory' | 'create-listing' | 'request-book'>('inventory')

  const isFormModalOpen = activeTab === 'create-listing' || activeTab === 'request-book'
  const totalPages = Math.ceil((data?.total ?? 0) / PAGE_SIZE)

  useEffect(() => {
    if (!isFormModalOpen) return

    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previous
    }
  }, [isFormModalOpen])

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] bg-secondary p-6 text-white shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Listings</p>
            <h1 className="font-display mt-1 text-3xl font-extrabold uppercase sm:text-4xl">
              Inventory <span className="text-accent">Management</span>
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
              Create seller-specific book offers and track both your live listings and your requested books.
            </p>
          </div>
        </div>
      </section>

      <section className="flex flex-wrap items-center gap-3 border-b border-stone-200 pb-4">
        <button
          type="button"
          onClick={() => setActiveTab('inventory')}
          className={cn(
            'flex cursor-pointer items-center gap-2.5 rounded-2xl px-6 py-3 text-sm font-bold transition',
            activeTab === 'inventory'
              ? 'bg-secondary text-accent shadow-md'
              : 'bg-white text-stone-600 hover:bg-stone-100',
          )}
        >
          <FiLayers size={18} /> Inventory Management
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('create-listing')}
          className={cn(
            'flex cursor-pointer items-center gap-2.5 rounded-2xl px-6 py-3 text-sm font-bold transition',
            activeTab === 'create-listing'
              ? 'bg-secondary text-accent shadow-md'
              : 'bg-white text-stone-600 hover:bg-stone-100',
          )}
        >
          <FiPlus size={18} /> Add Approved Book
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('request-book')}
          className={cn(
            'flex cursor-pointer items-center gap-2.5 rounded-2xl px-6 py-3 text-sm font-bold transition',
            activeTab === 'request-book'
              ? 'bg-secondary text-accent shadow-md'
              : 'bg-white text-stone-600 hover:bg-stone-100',
          )}
        >
          <FiRefreshCw size={18} /> Request New Book
        </button>
      </section>

      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm space-y-8">
        <div className="flex flex-col gap-3 border-b border-stone-100 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block w-full lg:w-96">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title, author, ISBN..."
              className="h-12 w-full rounded-full border border-stone-200 bg-stone-50 pl-12 pr-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition"
            />
          </label>

          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SellerListingSort)}
            className="cursor-pointer h-12 rounded-full border border-stone-200 bg-white px-5 text-sm font-bold text-heading outline-none focus:border-primary shadow-sm transition"
          >
            <option value={SellerListingSort.NEWEST}>Sort: Newest</option>
            <option value={SellerListingSort.TITLE_ASC}>Sort: Title A-Z</option>
            <option value={SellerListingSort.TITLE_DESC}>Sort: Title Z-A</option>
            <option value={SellerListingSort.PRICE_LOW_TO_HIGH}>Sort: Price Low to High</option>
            <option value={SellerListingSort.PRICE_HIGH_TO_LOW}>Sort: Price High to Low</option>
            <option value={SellerListingSort.STOCK_LOW_TO_HIGH}>Sort: Stock Low to High</option>
            <option value={SellerListingSort.STOCK_HIGH_TO_LOW}>Sort: Stock High to Low</option>
          </select>
        </div>

        <div className="space-y-10">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <FiLayers className="text-primary" />
              <h2 className="font-display text-xl font-extrabold uppercase text-heading">Live Listings</h2>
            </div>

            {isLoading ? (
              <div className="py-16 text-center">
                <Loader />
              </div>
            ) : isError ? (
              <EmptyState title="Could not load listings" />
            ) : !data?.data.length ? (
              <EmptyState
                title="No listings found"
                description="Click 'Add Approved Book' at the top to create your first listing."
              />
            ) : (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 text-left">
                  {data.data.map((listing) => {
                    const isOutOfStock = listing.stock <= 0

                    return (
                      <article
                        key={listing.id}
                        className="flex flex-col justify-between overflow-hidden rounded-3xl border border-stone-200 transition shadow-sm hover:shadow-md bg-white hover:border-stone-300"
                      >
                        <div className="relative bg-gradient-to-b from-stone-100 to-stone-200/60 p-6 flex flex-col items-center">
                          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                            <Badge className={cn('text-[10px] uppercase font-black', statusStyle[listing.book.status])}>
                              {listing.book.status}
                            </Badge>
                            {!listing.isActive ? (
                              <Badge className="bg-stone-300 text-stone-800 text-[10px] font-extrabold">
                                Inactive
                              </Badge>
                            ) : null}
                            {isOutOfStock ? (
                              <Badge className="bg-red-100 text-red-700 text-[10px] font-black">
                                Sold Out
                              </Badge>
                            ) : null}
                          </div>

                          <BookCover
                            src={listing.book.coverImage}
                            title={listing.book.title}
                            className="aspect-[3/4.2] w-full max-w-[140px] rounded-xl shadow-[0_18px_30px_-10px_rgba(0,0,0,0.4)] transition hover:scale-105 duration-300 object-cover mt-4"
                          />
                        </div>

                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div>
                            <RatingStars rating={listing.book.rating} className="mb-1" />
                            <h3 className="font-display text-base font-black text-heading line-clamp-2 leading-snug">
                              {listing.book.title}
                            </h3>
                            <p className="mt-1 text-xs font-bold text-stone-500 line-clamp-1">
                              By {listing.book.author}
                            </p>
                            <p className="mt-1 font-mono text-[11px] text-stone-400">
                              ISBN: {listing.book.isbn}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-stone-100 bg-stone-50/60 -mx-5 px-5 py-3 rounded-2xl">
                            <div>
                              <p className="text-[10px] uppercase font-bold text-stone-400">Selling Price</p>
                              <p className="text-base font-black text-heading mt-0.5">
                                {formatCurrency(listing.price)}
                              </p>
                              {listing.mrp > listing.price ? (
                                <p className="text-[10px] text-stone-400 line-through font-semibold">
                                  {formatCurrency(listing.mrp)}
                                </p>
                              ) : null}
                            </div>

                            <div>
                              <p className="text-[10px] uppercase font-bold text-stone-400">Stock Qty</p>
                              <p
                                className={cn(
                                  'text-base font-black mt-0.5',
                                  isOutOfStock ? 'text-red-600' : 'text-emerald-700',
                                )}
                              >
                                {listing.stock}{' '}
                                <span className="text-xs font-semibold">
                                  {isOutOfStock ? 'Empty' : 'Units'}
                                </span>
                              </p>
                            </div>
                          </div>

                          <div className="pt-2">
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() => setEditingId(listing.id)}
                              className="w-full gap-2 text-xs py-2.5 h-11 font-black transition hover:border-primary hover:text-primary active:scale-95"
                            >
                              <FiEdit3 className="text-primary text-base shrink-0" /> Adjust Price & Stock
                            </Button>
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>

                {editingId && data.data.some((listing) => listing.id === editingId) ? (
                  <EditListingModal
                    listing={data.data.find((listing) => listing.id === editingId)!}
                    onClose={() => setEditingId(null)}
                  />
                ) : null}
              </div>
            )}

            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} className="mt-10" />
          </div>

          <div className="border-t border-stone-100 pt-8">
            <div className="mb-4 flex items-center gap-2">
              <FiClock className="text-primary" />
              <h2 className="font-display text-xl font-extrabold uppercase text-heading">Requested Books</h2>
            </div>

            {isRequestedBooksLoading ? (
              <div className="py-12 text-center">
                <Loader />
              </div>
            ) : isRequestedBooksError ? (
              <EmptyState title="Could not load requested books" />
            ) : requestedBooks.length === 0 ? (
              <EmptyState
                title="No requested books found"
                description="Books you submit for admin approval will appear here with their status."
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {requestedBooks.map((book) => (
                  <article
                    key={book.id}
                    className="flex gap-4 rounded-3xl border border-stone-200 bg-stone-50/50 p-4 shadow-sm"
                  >
                    <BookCover
                      src={book.coverImage}
                      title={book.title}
                      className="h-28 w-20 shrink-0 rounded-xl object-cover shadow-sm"
                    />

                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="line-clamp-2 font-display text-base font-black text-heading">
                            {book.title}
                          </h3>
                          <p className="text-xs font-semibold text-stone-500">By {book.author}</p>
                        </div>
                        <Badge className={cn('text-[10px] uppercase font-black', statusStyle[book.status])}>
                          {book.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 gap-1 text-xs text-stone-500 sm:grid-cols-2">
                        <p><span className="font-semibold text-stone-700">ISBN:</span> {book.isbn}</p>
                        <p><span className="font-semibold text-stone-700">Category:</span> {book.category || '—'}</p>
                        <p><span className="font-semibold text-stone-700">Publisher:</span> {book.publisher || '—'}</p>
                        <p><span className="font-semibold text-stone-700">Stock:</span> {book.totalStock ?? 0}</p>
                      </div>

                      <p className="line-clamp-2 text-sm text-stone-600">{book.description}</p>

                      <p className="text-[11px] font-medium text-stone-400">
                        {book.status === BookStatus.PENDING
                          ? 'Waiting for admin approval before it can be listed.'
                          : book.status === BookStatus.APPROVED
                            ? 'This book is approved. You can now create a listing for it from the approved books tab.'
                            : 'This request was rejected by admin.'}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {activeTab === 'create-listing' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setActiveTab('inventory')}
        >
          <div
            className="custom-scrollbar max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl sm:p-8 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-accent">
                <FiPlus size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-xl font-extrabold uppercase text-heading">Add Approved Book</h2>
                <p className="text-xs text-stone-500">
                  Create a commercial listing for an already approved catalog book.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setActiveTab('inventory')}
                className="cursor-pointer inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
              >
                <FiX size={20} />
              </button>
            </div>

            <Formik
              initialValues={{ bookId: '', price: '', mrp: '', stock: '' }}
              validationSchema={sellerListingSchema}
              onSubmit={(values, helpers) =>
                createListing.mutate(
                  {
                    bookId: values.bookId,
                    price: Number(values.price),
                    mrp: Number(values.mrp),
                    stock: Number(values.stock),
                  },
                  {
                    onSuccess: () => {
                      toast.success('Listing created successfully!')
                      helpers.resetForm()
                      setActiveTab('inventory')
                    },
                    onSettled: () => helpers.setSubmitting(false),
                  },
                )
              }
            >
              {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
                <Form className="mt-6 space-y-4">
                  <SelectField
                    label="Approved Book Catalog"
                    name="bookId"
                    value={values.bookId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={fieldError(errors, touched, 'bookId')}
                  >
                    <option value="">Select book</option>
                    {approvedBooks.map((book) => (
                      <option key={book.id} value={book.id}>
                        {book.title} — {book.author}
                      </option>
                    ))}
                  </SelectField>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormInput
                      label="Selling price (₹)"
                      name="price"
                      type="number"
                      value={values.price}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={fieldError(errors, touched, 'price')}
                    />
                    <FormInput
                      label="MRP (₹)"
                      name="mrp"
                      type="number"
                      value={values.mrp}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={fieldError(errors, touched, 'mrp')}
                    />
                  </div>

                  <FormInput
                    label="Initial stock"
                    name="stock"
                    type="number"
                    value={values.stock}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={fieldError(errors, touched, 'stock')}
                  />

                  <div className="pt-4 flex justify-end gap-3">
                    <Button type="button" variant="secondary" onClick={() => setActiveTab('inventory')}>
                      Cancel
                    </Button>
                    <Button type="submit" className="px-8" disabled={createListing.isPending || isSubmitting}>
                      {createListing.isPending ? 'Creating...' : 'Create listing'}
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}

      {activeTab === 'request-book' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setActiveTab('inventory')}
        >
          <div
            className="custom-scrollbar max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl sm:p-8 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-accent">
                <FiRefreshCw size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-xl font-extrabold uppercase text-heading">Request New Book</h2>
                <p className="text-xs text-stone-500">
                  Duplicate ISBN is blocked. New books stay pending until admin approval.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setActiveTab('inventory')}
                className="cursor-pointer inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
              >
                <FiX size={20} />
              </button>
            </div>

            <Formik
              initialValues={{
                isbn: '',
                title: '',
                author: '',
                publisher: '',
                category: '',
                coverImageFile: null as File | null,
                description: '',
              }}
              validationSchema={sellerBookRequestSchema}
              onSubmit={(values, helpers) =>
                createBookRequest.mutate(values, {
                  onSuccess: () => {
                    toast.success('Book requested successfully! It is now pending admin approval.')
                    helpers.resetForm()
                    setActiveTab('inventory')
                  },
                  onSettled: () => helpers.setSubmitting(false),
                })
              }
            >
              {({ values, errors, touched, handleChange, handleBlur, isSubmitting, setFieldValue }) => (
                <Form className="mt-6 space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormInput
                      label="ISBN"
                      name="isbn"
                      value={values.isbn}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={fieldError(errors, touched, 'isbn')}
                    />
                    <SelectField
                      label="Category"
                      name="category"
                      value={values.category}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={fieldError(errors, touched, 'category')}
                      disabled={isCategoriesLoading}
                    >
                      <option value="">
                        {isCategoriesLoading ? 'Loading categories...' : 'Select category'}
                      </option>

                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </SelectField>
                  </div>

                  <FormInput
                    label="Title"
                    name="title"
                    value={values.title}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={fieldError(errors, touched, 'title')}
                  />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormInput
                      label="Author"
                      name="author"
                      value={values.author}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={fieldError(errors, touched, 'author')}
                    />
                    <FormInput
                      label="Publisher"
                      name="publisher"
                      value={values.publisher}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={fieldError(errors, touched, 'publisher')}
                    />
                  </div>

                  <label className="block text-left">
                    <span className="mb-1.5 block text-sm font-medium text-stone-700">Cover image</span>

                    <input
                      type="file"
                      name="coverImageFile"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={(event) => {
                        const file = event.currentTarget.files?.[0] ?? null
                        void setFieldValue('coverImageFile', file)
                      }}
                      onBlur={handleBlur}
                      className="block w-full cursor-pointer rounded-xl border border-stone-200 bg-white text-sm text-stone-700 file:mr-4 file:cursor-pointer file:border-0 file:bg-[#0d2b1f] file:px-4 file:py-3 file:text-sm file:font-semibold file:text-white hover:file:bg-[#123d2c]"
                    />

                    {values.coverImageFile ? (
                      <p className="mt-2 text-xs text-stone-500">
                        Selected: <span className="font-semibold text-stone-700">{values.coverImageFile.name}</span>
                      </p>
                    ) : (
                      <p className="mt-2 text-xs text-stone-400">
                        JPG, PNG, WEBP or GIF. Maximum size 5MB.
                      </p>
                    )}

                    {fieldError(errors, touched, 'coverImageFile') ? (
                      <span className="mt-1 block text-xs text-red-600">
                        {fieldError(errors, touched, 'coverImageFile')}
                      </span>
                    ) : null}
                  </label>

                  <TextareaField
                    label="Description"
                    name="description"
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={fieldError(errors, touched, 'description')}
                  />

                  <div className="pt-4 flex justify-end gap-3">
                    <Button type="button" variant="secondary" onClick={() => setActiveTab('inventory')}>
                      Cancel
                    </Button>
                    <Button type="submit" className="px-8" disabled={createBookRequest.isPending || isSubmitting}>
                      {createBookRequest.isPending ? 'Submitting...' : 'Submit for approval'}
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}
    </div>
  )
}
