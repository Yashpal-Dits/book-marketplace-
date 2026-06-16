import { useState } from 'react'
import { Form, Formik } from 'formik'
import { FiEdit3, FiMoreVertical, FiSearch, FiChevronDown, FiX } from 'react-icons/fi'
import { BookCover } from '@/components/common/BookCover'
import { Button } from '@/components/common/Button'
import { EmptyState } from '@/components/common/EmptyState'
import { FormInput } from '@/components/common/FormInput'
import { Loader } from '@/components/common/Loader'
import { Pagination } from '@/components/common/Pagination'
import { AdminBookSort } from '@/enums/admin-sort.enum'
import { BookStatus } from '@/enums/book-status.enum'
import { useAdminBooks, useUpdateBookCatalog } from '@/hooks/useAdmin'
import { useDebounce } from '@/hooks/useDebounce'
import { adminBookUpdateSchema } from '@/schemas/book.schema'
import { useAdminBookFilterStore } from '@/store/adminFilter.store'
import { formatDate } from '@/utils/formatDate'
import { cn } from '@/utils/cn'
import type { AdminBookDetailed, UpdateBookCatalogPayload } from '@/interfaces'

const PAGE_SIZE = 10

const fieldError = <T extends Record<string, unknown>>(errors: T, touched: Record<string, unknown>, name: keyof T) =>
  touched[name as string] && errors[name] ? String(errors[name]) : undefined

const TextareaField = ({
  label,
  error,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string }) => (
  <label className="block text-left">
    <span className="mb-1.5 block text-sm font-medium text-stone-700">{label}</span>
    <textarea
      className={cn(
        'min-h-28 w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-700 focus:ring-4 focus:ring-amber-900/10',
        error ? 'border-red-400' : 'border-stone-200',
      )}
      {...props}
    />
    {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
  </label>
)

const statusClass: Record<BookStatus, string> = {
  [BookStatus.PENDING]: 'bg-amber-100 text-amber-800',
  [BookStatus.APPROVED]: 'bg-emerald-100 text-emerald-800',
  [BookStatus.REJECTED]: 'bg-red-100 text-red-700',
}

const statusLabel: Record<BookStatus, string> = {
  [BookStatus.PENDING]: 'Pending',
  [BookStatus.APPROVED]: 'Approved',
  [BookStatus.REJECTED]: 'Rejected',
}

const EditBookModal = ({ book, onClose }: { book: AdminBookDetailed; onClose: () => void }) => {
  const updateBook = useUpdateBookCatalog()

  const initialValues: UpdateBookCatalogPayload = {
    isbn: book.isbn,
    title: book.title,
    author: book.author,
    publisher: book.publisher || '',
    description: book.description,
    coverImage: book.coverImage || '',
    category: book.category || '',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-label="Edit book catalog">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-extrabold uppercase text-[#16243d] sm:text-2xl">Edit Book</h2>
            <p className="text-sm text-stone-500">Update catalog details for this book.</p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-stone-500 transition hover:bg-stone-100"
          >
            <FiX />
          </button>
        </div>

        <Formik
          initialValues={initialValues}
          validationSchema={adminBookUpdateSchema}
          onSubmit={(values, helpers) =>
            updateBook.mutate(
              { bookId: book.id, payload: values },
              { onSuccess: onClose, onSettled: () => helpers.setSubmitting(false) },
            )
          }
        >
          {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
            <Form className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  label="ISBN"
                  name="isbn"
                  value={values.isbn}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={fieldError(errors, touched, 'isbn')}
                />
                <FormInput
                  label="Category"
                  name="category"
                  value={values.category}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={fieldError(errors, touched, 'category')}
                />
              </div>

              <FormInput
                label="Title"
                name="title"
                value={values.title}
                onChange={handleChange}
                onBlur={handleBlur}
                error={fieldError(errors, touched, 'title')}
              />

              <div className="grid gap-4 sm:grid-cols-2">
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

              <FormInput
                label="Cover Image URL"
                name="coverImage"
                value={values.coverImage}
                onChange={handleChange}
                onBlur={handleBlur}
                error={fieldError(errors, touched, 'coverImage')}
              />

              <TextareaField
                label="Description"
                name="description"
                value={values.description}
                onChange={handleChange}
                onBlur={handleBlur}
                error={fieldError(errors, touched, 'description')}
              />

              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateBook.isPending || isSubmitting}>
                  {updateBook.isPending || isSubmitting ? 'Saving...' : 'Save changes'}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  )
}

const MobileBookCard = ({
  book,
  onEdit,
}: {
  book: AdminBookDetailed
  onEdit: (book: AdminBookDetailed) => void
}) => {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex gap-4">
        <BookCover src={book.coverImage} title={book.title} className="h-20 w-14 shrink-0 rounded-md shadow-sm" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="line-clamp-1 text-sm font-bold text-[#16243d]">{book.title}</p>
              <p className="text-xs text-stone-500">{book.author}</p>
            </div>
            <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium', statusClass[book.status])}>
              {statusLabel[book.status]}
            </span>
          </div>
          <p className="mt-2 text-xs text-stone-500">ISBN: {book.isbn}</p>
          <p className="text-xs text-stone-500">Category: {book.category || '—'}</p>
          <p className="text-xs text-stone-500">Seller: {book.seller?.businessName || 'Marketplace'}</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-stone-500">
              Stock: <span className="font-semibold text-[#16243d]">{book.totalStock ?? 0}</span>
            </span>
            <button
              type="button"
              onClick={() => onEdit(book)}
              className="inline-flex h-8 items-center gap-1.5 rounded-full bg-stone-100 px-3 text-xs font-semibold text-stone-700 transition hover:bg-stone-200"
            >
              <FiEdit3 /> Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export const CatalogManagementPage = () => {
  const { search, sort, status, page, setSearch, setSort, setStatus, setPage } = useAdminBookFilterStore()
  const debouncedSearch = useDebounce(search, 350)
  const { data, isLoading, isError } = useAdminBooks({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch,
    sort,
    status: status || undefined,
  })
  const [editingBook, setEditingBook] = useState<AdminBookDetailed | null>(null)
  const totalPages = Math.ceil((data?.total ?? 0) / PAGE_SIZE)

  const startEntry = data?.total ? (page - 1) * PAGE_SIZE + 1 : 0
  const endEntry = data ? Math.min(page * PAGE_SIZE, data.total) : 0

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <section className="rounded-[2rem] bg-white p-5 shadow-sm sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f0532d]">Catalog Management</p>
        <h1 className="font-display mt-1 text-2xl font-extrabold uppercase text-[#16243d] sm:text-3xl">
          Manage Book Catalog
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-stone-500">
          Edit master catalog details for any book. ISBN uniqueness is enforced when changed.
        </p>
      </section>

      {/* Toolbar */}
      <section className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-md">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title, author, ISBN or category..."
            className="h-11 w-full rounded-full border border-stone-200 bg-white pl-11 pr-4 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-[#f0532d] focus:ring-4 focus:ring-orange-500/10"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-40">
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as BookStatus | '')}
              className="h-11 w-full cursor-pointer appearance-none rounded-full border border-stone-200 bg-white pl-4 pr-9 text-sm font-medium text-stone-700 outline-none transition focus:border-[#f0532d]"
            >
              <option value="">All Status</option>
              <option value={BookStatus.PENDING}>Pending</option>
              <option value={BookStatus.APPROVED}>Approved</option>
              <option value={BookStatus.REJECTED}>Rejected</option>
            </select>
            <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-500" />
          </div>

          <div className="relative w-full sm:w-48">
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as AdminBookSort)}
              className="h-11 w-full cursor-pointer appearance-none rounded-full border border-stone-200 bg-white pl-4 pr-9 text-sm font-medium text-stone-700 outline-none transition focus:border-[#f0532d]"
            >
              <option value={AdminBookSort.NEWEST}>Sort: Newest</option>
              <option value={AdminBookSort.TITLE_ASC}>Sort: Title A-Z</option>
              <option value={AdminBookSort.TITLE_DESC}>Sort: Title Z-A</option>
              <option value={AdminBookSort.STATUS_ASC}>Sort: Status</option>
            </select>
            <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-500" />
          </div>
        </div>
      </section>

      {/* Loading / Error */}
      {isLoading ? (
        <div className="rounded-3xl border border-stone-200 bg-white p-10 shadow-sm">
          <Loader />
        </div>
      ) : isError ? (
        <div className="rounded-3xl border border-stone-200 bg-white p-10 shadow-sm">
          <EmptyState title="Could not load books" description="Make sure JSON Server is running." />
        </div>
      ) : !data?.data.length ? (
        <div className="rounded-3xl border border-stone-200 bg-white p-10 shadow-sm">
          <EmptyState title="No books found" description="Try changing the search or filter." />
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <section className="hidden overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm sm:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-stone-100 bg-stone-50/80 text-xs font-bold uppercase tracking-wide text-stone-500">
                    <th className="px-5 py-4">Book</th>
                    <th className="px-5 py-4">ISBN</th>
                    <th className="px-5 py-4">Category</th>
                    <th className="px-5 py-4">Seller</th>
                    <th className="px-5 py-4">Stock</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((book) => (
                    <tr key={book.id} className="border-b border-stone-100 transition last:border-b-0 hover:bg-stone-50/60">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <BookCover
                            src={book.coverImage}
                            title={book.title}
                            className="h-14 w-10 shrink-0 rounded-md shadow-sm"
                          />
                          <div className="min-w-0">
                            <p className="line-clamp-1 text-sm font-bold text-[#16243d]">{book.title}</p>
                            <p className="text-xs text-stone-500">{book.author}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs text-stone-700">{book.isbn}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs text-stone-600">{book.category || '—'}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs text-stone-600">{book.seller?.businessName || 'Marketplace'}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-semibold text-[#16243d]">{book.totalStock ?? 0}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={cn('rounded-full px-3 py-1 text-xs font-medium', statusClass[book.status])}>
                          {statusLabel[book.status]}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingBook(book)}
                            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-stone-100 px-3 text-xs font-semibold text-stone-700 transition hover:bg-stone-200"
                          >
                            <FiEdit3 /> Edit
                          </button>
                          <button
                            type="button"
                            aria-label="More actions"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
                          >
                            <FiMoreVertical />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Mobile Cards */}
          <section className="space-y-3 sm:hidden">
            {data.data.map((book) => (
              <MobileBookCard key={book.id} book={book} onEdit={setEditingBook} />
            ))}
          </section>
        </>
      )}

      {/* Footer pagination */}
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-center text-sm text-stone-500 sm:text-left">
          Showing <span className="font-semibold text-stone-700">{startEntry}</span>–
          <span className="font-semibold text-stone-700">{endEntry}</span> of{' '}
          <span className="font-semibold text-stone-700">{data?.total ?? 0}</span> books
        </p>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {editingBook ? <EditBookModal book={editingBook} onClose={() => setEditingBook(null)} /> : null}
    </div>
  )
}
