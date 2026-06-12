import { useEffect, useState } from 'react'
import { FiChevronDown, FiSearch, FiX } from 'react-icons/fi'
import { BookCard } from '@/components/books/BookCard'
import { EmptyState } from '@/components/common/EmptyState'
import { Loader } from '@/components/common/Loader'
import { Pagination } from '@/components/common/Pagination'
import { useBooks, useApprovedBooks } from '@/hooks/useBooks'
import { useDebounce } from '@/hooks/useDebounce'
import { useBookFilterStore } from '@/store/bookFilter.store'
import { BookSort } from '@/enums/sort.enum'
import { EXPLORE_BOOKS_SECTION_ID, scrollToSection } from '@/utils/scrollToSection'
import { cn } from '@/utils/cn'

const PAGE_SIZE = 8

const SORT_OPTIONS: Array<{ value: BookSort; label: string }> = [
  { value: BookSort.NEWEST, label: 'Newest' },
  { value: BookSort.TITLE_ASC, label: 'Title (A–Z)' },
  { value: BookSort.TITLE_DESC, label: 'Title (Z–A)' },
  { value: BookSort.PRICE_LOW_TO_HIGH, label: 'Price (Low to High)' },
  { value: BookSort.PRICE_HIGH_TO_LOW, label: 'Price (High to Low)' },
]

export const ExploreBooksSection = () => {
  const { search, sort, category, page, setSearch, setSort, setCategory, setPage } = useBookFilterStore()

  // local input mirrors the store search so typing feels instant, then debounced
  const [searchInput, setSearchInput] = useState(search)
  const debouncedSearch = useDebounce(searchInput, 400)

  // keep input in sync when the hero search bar updates the store
  // (React-recommended "adjust state during render" pattern)
  const [prevStoreSearch, setPrevStoreSearch] = useState(search)
  if (search !== prevStoreSearch) {
    setPrevStoreSearch(search)
    setSearchInput(search)
  }

  useEffect(() => {
    if (debouncedSearch !== search) setSearch(debouncedSearch)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  const { data: allBooks = [] } = useApprovedBooks()
  const categories = [...new Set(allBooks.map((b) => b.category).filter(Boolean))] as string[]

  const { data, isLoading, isError, isFetching } = useBooks({
    page,
    limit: PAGE_SIZE,
    search,
    sort,
    category: category || undefined,
  })

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1
  const hasActiveFilters = Boolean(search || category || sort !== BookSort.NEWEST)

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage)
    scrollToSection(EXPLORE_BOOKS_SECTION_ID)
  }

  const handleClear = () => {
    setSearchInput('')
    setSearch('')
    setCategory('')
    setSort(BookSort.NEWEST)
  }

  return (
    <section id={EXPLORE_BOOKS_SECTION_ID} className="scroll-mt-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f0532d]">Marketplace</p>
          <h2 className="font-display mx-auto mt-2 max-w-xl text-3xl font-extrabold uppercase leading-tight text-[#16243d] sm:text-4xl">
            Explore All Books
          </h2>
        </div>

        {/* toolbar: search + category + sort */}
        <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by title, author or ISBN…"
              aria-label="Search books"
              className="h-11 w-full rounded-full border border-stone-200 bg-stone-50 pl-11 pr-10 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-[#f0532d] focus:bg-white focus:ring-4 focus:ring-orange-500/10"
            />
            {searchInput ? (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
              >
                <FiX />
              </button>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                aria-label="Filter by category"
                className="h-11 cursor-pointer appearance-none rounded-full border border-stone-200 bg-stone-50 pl-4 pr-9 text-sm font-medium text-stone-700 outline-none transition focus:border-[#f0532d]"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-500" />
            </div>

            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as BookSort)}
                aria-label="Sort books"
                className="h-11 cursor-pointer appearance-none rounded-full border border-stone-200 bg-stone-50 pl-4 pr-9 text-sm font-medium text-stone-700 outline-none transition focus:border-[#f0532d]"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    Sort: {option.label}
                  </option>
                ))}
              </select>
              <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-500" />
            </div>

            {hasActiveFilters ? (
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex h-11 items-center gap-1.5 rounded-full px-4 text-sm font-medium text-[#f0532d] transition hover:bg-orange-50"
              >
                <FiX /> Clear
              </button>
            ) : null}
          </div>
        </div>

        {/* result meta */}
        {data ? (
          <p className="mt-4 text-xs text-stone-500" aria-live="polite">
            Showing{' '}
            <span className="font-semibold text-stone-700">
              {data.total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, data.total)}
            </span>{' '}
            of <span className="font-semibold text-stone-700">{data.total}</span> books
            {search ? (
              <>
                {' '}for "<span className="font-semibold text-stone-700">{search}</span>"
              </>
            ) : null}
            {category ? (
              <>
                {' '}in <span className="font-semibold text-stone-700">{category}</span>
              </>
            ) : null}
          </p>
        ) : null}

        {/* grid */}
        <div className={cn('mt-8 transition-opacity', isFetching && !isLoading && 'opacity-60')}>
          {isLoading ? (
            <Loader />
          ) : isError ? (
            <EmptyState
              title="Could not load books"
              description="Make sure the JSON server is running (npm run server) on port 4000."
            />
          ) : data && data.data.length === 0 ? (
            <EmptyState
              title="No books found"
              description={
                search
                  ? `No books match "${search}". Try a different title, author or ISBN.`
                  : 'No books available for this filter yet.'
              }
            />
          ) : (
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
              {data?.data.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </div>

        <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} className="mt-12" />
      </div>
    </section>
  )
}
