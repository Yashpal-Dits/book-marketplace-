import { FiCheck, FiSearch, FiX } from 'react-icons/fi'
import { Badge } from '@/components/common/Badge'
import { BookCover } from '@/components/common/BookCover'
import { Button } from '@/components/common/Button'
import { EmptyState } from '@/components/common/EmptyState'
import { Loader } from '@/components/common/Loader'
import { Pagination } from '@/components/common/Pagination'
import { AdminBookSort } from '@/enums/admin-sort.enum'
import { BookStatus } from '@/enums/book-status.enum'
import { useAdminBooks, useUpdateBookStatus } from '@/hooks/useAdmin'
import { useDebounce } from '@/hooks/useDebounce'
import { useAdminBookFilterStore } from '@/store/adminFilter.store'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'

const PAGE_SIZE =   8

const statusClass: Record<BookStatus, string> = {
  [BookStatus.PENDING]: 'bg-amber-100 text-amber-800',
  [BookStatus.APPROVED]: 'bg-emerald-100 text-emerald-800',
  [BookStatus.REJECTED]: 'bg-red-100 text-red-700',
}

export const BookApprovalPage = () => {
  const { search, sort, status, page, setSearch, setSort, setStatus, setPage } = useAdminBookFilterStore()
  const debouncedSearch = useDebounce(search, 350)
  const { data, isLoading, isError } = useAdminBooks({ page, limit: PAGE_SIZE, search: debouncedSearch, sort, status })
  const updateStatus = useUpdateBookStatus()
  const totalPages = Math.ceil((data?.total ?? 0) / PAGE_SIZE)

  return (
    <div className="space-y-6">
      <section className=" overflow-hidden rounded-[2rem] bg-secondary p-6 text-white shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Book Management</p>
        <h1 className="font-display mt-2 text-3xl font-extrabold uppercase">
          Book <span className="text-accent">Approval</span>
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
          Books are master catalog records. Pending books are hidden from customers until admin approval.
        </p>
      </section>

      <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 border-b border-stone-100 pb-4 xl:flex-row xl:items-center xl:justify-between">
          <label className="relative block xl:w-96">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search title, author, ISBN, category..."
              className="h-11 w-full rounded-full border border-stone-200 bg-stone-50 pl-11 pr-4 text-sm outline-none focus:border-[#f0532d] focus:ring-4 focus:ring-orange-500/10"
            />
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as BookStatus | '')}
              className="h-11 rounded-full border border-stone-200 bg-white px-4 text-sm outline-none focus:border-[#f0532d]"
            >
              <option value="">All statuses</option>
              <option value={BookStatus.PENDING}>Pending</option>
              <option value={BookStatus.APPROVED}>Approved</option>
              <option value={BookStatus.REJECTED}>Rejected</option>
            </select>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as AdminBookSort)}
              className="h-11 rounded-full border border-stone-200 bg-white px-4 text-sm outline-none focus:border-[#f0532d]"
            >
              <option value={AdminBookSort.NEWEST}>Newest</option>
              <option value={AdminBookSort.TITLE_ASC}>Title A-Z</option>
              <option value={AdminBookSort.TITLE_DESC}>Title Z-A</option>
              <option value={AdminBookSort.STATUS_ASC}>Status</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          {isLoading ? (
            <Loader />
          ) : isError ? (
            <EmptyState title="Could not load books" description="Make sure JSON Server is running." />
          ) : !data?.data.length ? (
            <EmptyState title="No books found" description="Try changing the search or filter." />
          ) : (
            <div className="space-y-4">
              {data.data.map((book) => (
                <article key={book.id} className="overflow-hidden rounded-2xl border border-stone-200">
                  <div className="grid gap-4 p-4 lg:grid-cols-[92px_1fr_230px] lg:items-center">
                    <BookCover src={book.coverImage} title={book.title} className="h-32 w-24 rounded-xl lg:h-28 lg:w-20" />

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="line-clamp-1 text-base font-bold text-[#16243d]">{book.title}</h3>
                        <Badge className={statusClass[book.status]}>{book.status}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-stone-600">{book.author} · {book.publisher}</p>
                      <p className="mt-1 text-xs text-stone-500">ISBN {book.isbn} · {book.category || 'Uncategorized'} · Submitted {formatDate(book.createdAt)}</p>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-500">{book.description}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-stone-100 px-3 py-1 text-stone-600">Seller: {book.seller?.businessName ?? 'Marketplace'}</span>
                        <span className="rounded-full bg-stone-100 px-3 py-1 text-stone-600">Stock: {book.totalStock ?? 0}</span>
                        <span className="rounded-full bg-stone-100 px-3 py-1 text-stone-600">Min price: {book.minPrice ? formatCurrency(book.minPrice) : 'N/A'}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-start gap-2 lg:justify-end">
                      <Button
                        type="button"
                        className="gap-2 bg-emerald-700 hover:bg-emerald-800"
                        disabled={book.status === BookStatus.APPROVED || updateStatus.isPending}
                        onClick={() => updateStatus.mutate({ bookId: book.id, status: BookStatus.APPROVED })}
                      >
                        <FiCheck /> Approve
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        className="gap-2"
                        disabled={book.status === BookStatus.REJECTED || updateStatus.isPending}
                        onClick={() => updateStatus.mutate({ bookId: book.id, status: BookStatus.REJECTED })}
                      >
                        <FiX /> Reject
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} className="mt-6" />
      </section>
    </div>
  )
}
