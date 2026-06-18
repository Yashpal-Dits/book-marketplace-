import { useState, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { Form, Formik } from 'formik'
import toast from 'react-hot-toast'
import { FiEdit3, FiPlus, FiRefreshCw, FiSearch, FiLayers } from 'react-icons/fi'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { EmptyState } from '@/components/common/EmptyState'
import { FormInput } from '@/components/common/FormInput'
import { Loader } from '@/components/common/Loader'
import { Pagination } from '@/components/common/Pagination'
import { BookStatus } from '@/enums/book-status.enum'
import { SellerListingSort } from '@/enums/seller-sort.enum'
import { useDebounce } from '@/hooks/useDebounce'
import { useCreateSellerBookRequest, useCreateSellerListing, useSellerApprovedBooks, useSellerListings, useUpdateSellerListing } from '@/hooks/useSeller'
import type { SellerListingDetailed } from '@/api/seller.api'
import { sellerBookRequestSchema, sellerListingSchema, sellerListingUpdateSchema } from '@/schemas/seller.schema'
import { useSellerListingFilterStore } from '@/store/sellerFilter.store'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'
import { cn } from '@/utils/cn'

const PAGE_SIZE = 8

const fieldError = <T extends Record<string, unknown>>(errors: T, touched: Record<string, unknown>, name: keyof T) =>
  touched[name as string] && errors[name] ? String(errors[name]) : undefined

const SelectField = ({ label, error, children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string }) => (
  <label className="block text-left">
    <span className="mb-1.5 block text-sm font-medium text-stone-700">{label}</span>
    <select
      className={`h-11 w-full rounded-xl border bg-white px-4 text-sm outline-none transition focus:border-amber-700 focus:ring-4 focus:ring-amber-900/10 ${error ? 'border-red-400' : 'border-stone-200'}`}
      {...props}
    >
      {children}
    </select>
    {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
  </label>
)

const TextareaField = ({ label, error, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string }) => (
  <label className="block text-left">
    <span className="mb-1.5 block text-sm font-medium text-stone-700">{label}</span>
    <textarea
      className={`min-h-28 w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-700 focus:ring-4 focus:ring-amber-900/10 ${error ? 'border-red-400' : 'border-stone-200'}`}
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

const EditListingForm = ({ listing, onClose }: { listing: SellerListingDetailed; onClose: () => void }) => {
  const updateListing = useUpdateSellerListing()

  return (
    <Formik
      initialValues={{ price: listing.price, mrp: listing.mrp, stock: listing.stock, isActive: listing.isActive }}
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
        <Form className="mt-4 grid gap-3 rounded-2xl border border-amber-200 bg-amber-50/50 p-4 sm:grid-cols-2 lg:grid-cols-5">
          <FormInput label="Price" name="price" type="number" value={values.price} onChange={handleChange} onBlur={handleBlur} error={fieldError(errors, touched, 'price')} />
          <FormInput label="MRP" name="mrp" type="number" value={values.mrp} onChange={handleChange} onBlur={handleBlur} error={fieldError(errors, touched, 'mrp')} />
          <FormInput label="Stock" name="stock" type="number" value={values.stock} onChange={handleChange} onBlur={handleBlur} error={fieldError(errors, touched, 'stock')} />
          <SelectField label="Status" name="isActive" value={String(values.isActive)} onChange={handleChange} onBlur={handleBlur}>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </SelectField>
          <div className="flex items-end gap-2">
            <Button type="submit" className="w-full" disabled={updateListing.isPending || isSubmitting}>{updateListing.isPending ? 'Saving...' : 'Save'}</Button>
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export const SellerListingsPage = () => {
  const { search, sort, page, setSearch, setSort, setPage } = useSellerListingFilterStore()
  const debouncedSearch = useDebounce(search, 350)
  const { data, isLoading, isError } = useSellerListings({ page, limit: PAGE_SIZE, search: debouncedSearch, sort })
  const { data: approvedBooks = [] } = useSellerApprovedBooks()
  const createListing = useCreateSellerListing()
  const createBookRequest = useCreateSellerBookRequest()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'inventory' | 'create-listing' | 'request-book'>('inventory')
  const totalPages = Math.ceil((data?.total ?? 0) / PAGE_SIZE)

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f0532d]">Listings</p>
            <h1 className="font-display mt-1 text-3xl font-extrabold uppercase text-[#16243d]">Inventory Management</h1>
            <p className="mt-2 max-w-2xl text-sm text-stone-500">
              Create seller-specific book offers and update only your own price, stock, and active status.
            </p>
          </div>
        </div>
      </section>

      {/* Tab Switcher Bar */}
      <section className="flex flex-wrap items-center gap-3 border-b border-stone-200 pb-4">
        <button
          type="button"
          onClick={() => setActiveTab('inventory')}
          className={cn(
            'flex cursor-pointer items-center gap-2.5 rounded-2xl px-6 py-3 text-sm font-bold transition',
            activeTab === 'inventory'
              ? 'bg-[#0d2b1f] text-[#f5862e] shadow-md'
              : 'bg-white text-stone-600 hover:bg-stone-100'
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
              ? 'bg-[#0d2b1f] text-[#f5862e] shadow-md'
              : 'bg-white text-stone-600 hover:bg-stone-100'
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
              ? 'bg-[#0d2b1f] text-[#f5862e] shadow-md'
              : 'bg-white text-stone-600 hover:bg-stone-100'
          )}
        >
          <FiRefreshCw size={18} /> Request New Book
        </button>
      </section>

      {/* Tab 1: Inventory Table */}
      {activeTab === 'inventory' && (
        <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 border-b border-stone-100 pb-4 lg:flex-row lg:items-center lg:justify-between">
            <label className="relative block lg:w-80">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by title, author, ISBN..."
                className="h-11 w-full rounded-full border border-stone-200 bg-stone-50 pl-11 pr-4 text-sm outline-none focus:border-[#f0532d] focus:ring-4 focus:ring-orange-500/10"
              />
            </label>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SellerListingSort)}
              className="h-11 rounded-full border border-stone-200 bg-white px-4 text-sm outline-none focus:border-[#f0532d]"
            >
              <option value={SellerListingSort.NEWEST}>Newest</option>
              <option value={SellerListingSort.TITLE_ASC}>Title A-Z</option>
              <option value={SellerListingSort.TITLE_DESC}>Title Z-A</option>
              <option value={SellerListingSort.PRICE_LOW_TO_HIGH}>Price low to high</option>
              <option value={SellerListingSort.PRICE_HIGH_TO_LOW}>Price high to low</option>
              <option value={SellerListingSort.STOCK_LOW_TO_HIGH}>Stock low to high</option>
              <option value={SellerListingSort.STOCK_HIGH_TO_LOW}>Stock high to low</option>
            </select>
          </div>

          <div className="mt-4">
            {isLoading ? (
              <Loader />
            ) : isError ? (
              <EmptyState title="Could not load listings" />
            ) : !data?.data.length ? (
              <EmptyState
                title="No listings found"
                description="Click 'Add Approved Book' at the top to create your first listing."
              />
            ) : (
              <div className="space-y-3">
                {data.data.map((listing) => (
                  <article key={listing.id} className="rounded-2xl border border-stone-200 p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="line-clamp-1 text-sm font-bold text-[#16243d]">{listing.book.title}</h3>
                          <Badge className={statusStyle[listing.book.status]}>{listing.book.status}</Badge>
                          {!listing.isActive ? <Badge className="bg-stone-200 text-stone-700">Inactive</Badge> : null}
                          {listing.stock === 0 ? <Badge className="bg-red-100 text-red-700">Out of stock</Badge> : null}
                        </div>
                        <p className="mt-1 text-xs text-stone-500">{listing.book.author} · ISBN {listing.book.isbn} · Created {formatDate(listing.createdAt)}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-sm lg:min-w-[300px]">
                        <div><p className="text-xs text-stone-500">Price</p><p className="font-bold text-[#16243d]">{formatCurrency(listing.price)}</p></div>
                        <div><p className="text-xs text-stone-500">Stock</p><p className="font-bold text-[#16243d]">{listing.stock}</p></div>
                        <div className="text-right"><Button type="button" variant="secondary" onClick={() => setEditingId(editingId === listing.id ? null : listing.id)}><FiEdit3 /> Edit</Button></div>
                      </div>
                    </div>
                    {editingId === listing.id ? <EditListingForm listing={listing} onClose={() => setEditingId(null)} /> : null}
                  </article>
                ))}
              </div>
            )}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} className="mt-6" />
        </div>
      )}

      {/* Tab 2: Create Listing (Add Approved Book) */}
      {activeTab === 'create-listing' && (
        <div className="mx-auto max-w-3xl rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#0d2b1f] text-[#f5862e]">
              <FiPlus size={20} />
            </div>
            <div>
              <h2 className="font-display text-xl font-extrabold uppercase text-[#16243d]">Add Approved Book</h2>
              <p className="text-xs text-stone-500">Create a commercial listing for an already approved catalog book.</p>
            </div>
          </div>
          <Formik
            initialValues={{ bookId: '', price: '', mrp: '', stock: '' }}
            validationSchema={sellerListingSchema}
            onSubmit={(values, helpers) =>
              createListing.mutate(
                { bookId: values.bookId, price: Number(values.price), mrp: Number(values.mrp), stock: Number(values.stock) },
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
                <SelectField label="Approved Book Catalog" name="bookId" value={values.bookId} onChange={handleChange} onBlur={handleBlur} error={fieldError(errors, touched, 'bookId')}>
                  <option value="">Select book</option>
                  {approvedBooks.map((book) => <option key={book.id} value={book.id}>{book.title} — {book.author}</option>)}
                </SelectField>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormInput label="Selling price (₹)" name="price" type="number" value={values.price} onChange={handleChange} onBlur={handleBlur} error={fieldError(errors, touched, 'price')} />
                  <FormInput label="MRP (₹)" name="mrp" type="number" value={values.mrp} onChange={handleChange} onBlur={handleBlur} error={fieldError(errors, touched, 'mrp')} />
                </div>
                <FormInput label="Initial stock" name="stock" type="number" value={values.stock} onChange={handleChange} onBlur={handleBlur} error={fieldError(errors, touched, 'stock')} />
                <div className="pt-4 flex justify-end gap-3">
                  <Button type="button" variant="secondary" onClick={() => setActiveTab('inventory')}>Cancel</Button>
                  <Button type="submit" className="px-8" disabled={createListing.isPending || isSubmitting}>{createListing.isPending ? 'Creating...' : 'Create listing'}</Button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      )}

      {/* Tab 3: Request New Book */}
      {activeTab === 'request-book' && (
        <div className="mx-auto max-w-3xl rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#0d2b1f] text-[#f5862e]">
              <FiRefreshCw size={20} />
            </div>
            <div>
              <h2 className="font-display text-xl font-extrabold uppercase text-[#16243d]">Request New Book</h2>
              <p className="text-xs text-stone-500">Duplicate ISBN is blocked. New books stay pending until admin approval.</p>
            </div>
          </div>
          <Formik
            initialValues={{ isbn: '', title: '', author: '', publisher: '', category: '', coverImage: '', description: '' }}
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
            {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
              <Form className="mt-6 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormInput label="ISBN" name="isbn" value={values.isbn} onChange={handleChange} onBlur={handleBlur} error={fieldError(errors, touched, 'isbn')} />
                  <FormInput label="Category" name="category" value={values.category} onChange={handleChange} onBlur={handleBlur} error={fieldError(errors, touched, 'category')} />
                </div>
                <FormInput label="Title" name="title" value={values.title} onChange={handleChange} onBlur={handleBlur} error={fieldError(errors, touched, 'title')} />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormInput label="Author" name="author" value={values.author} onChange={handleChange} onBlur={handleBlur} error={fieldError(errors, touched, 'author')} />
                  <FormInput label="Publisher" name="publisher" value={values.publisher} onChange={handleChange} onBlur={handleBlur} error={fieldError(errors, touched, 'publisher')} />
                </div>
                <FormInput label="Cover image URL" name="coverImage" value={values.coverImage} onChange={handleChange} onBlur={handleBlur} error={fieldError(errors, touched, 'coverImage')} />
                <TextareaField label="Description" name="description" value={values.description} onChange={handleChange} onBlur={handleBlur} error={fieldError(errors, touched, 'description')} />
                <div className="pt-4 flex justify-end gap-3">
                  <Button type="button" variant="secondary" onClick={() => setActiveTab('inventory')}>Cancel</Button>
                  <Button type="submit" className="px-8" disabled={createBookRequest.isPending || isSubmitting}>{createBookRequest.isPending ? 'Submitting...' : 'Submit for approval'}</Button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      )}
    </div>
  )
}
