import { useEffect, useState } from 'react'
import { FiChevronDown, FiSearch, FiX, FiFilter, FiCheck } from 'react-icons/fi'
import { BookCard } from '@/components/books/BookCard'
import { Button } from '@/components/common/Button'
import { EmptyState } from '@/components/common/EmptyState'
import { Loader } from '@/components/common/Loader'
import { Pagination } from '@/components/common/Pagination'
import { RatingStars } from '@/components/common/RatingStars'
import { useBooks, useApprovedBooks } from '@/hooks/useBooks'
import { useDebounce } from '@/hooks/useDebounce'
import { useBookFilterStore } from '@/store/bookFilter.store'
import { BookSort } from '@/enums/sort.enum'
import { formatCurrency } from '@/utils/formatCurrency'
import { EXPLORE_BOOKS_SECTION_ID, scrollToSection } from '@/utils/scrollToSection'
import { cn } from '@/utils/cn'

const PAGE_SIZE = 9

const SORT_OPTIONS: Array<{ value: BookSort; label: string }> = [
  { value: BookSort.NEWEST, label: 'Newest Arrivals' },
  { value: BookSort.PRICE_LOW_TO_HIGH, label: 'Price: Low to High' },
  { value: BookSort.PRICE_HIGH_TO_LOW, label: 'Price: High to Low' },
  { value: BookSort.TITLE_ASC, label: 'Title: A to Z' },
  { value: BookSort.TITLE_DESC, label: 'Title: Z to A' },
]

export const ExploreBooksSection = () => {
  const {
    search,
    sort,
    category,
    minRating,
    maxPrice,
    inStockOnly,
    page,
    setSearch,
    setSort,
    setCategory,
    setMinRating,
    setMaxPrice,
    setInStockOnly,
    setPage,
  } = useBookFilterStore()

  const [searchInput, setSearchInput] = useState(search)
  const debouncedSearch = useDebounce(searchInput, 400)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  const [prevStoreSearch, setPrevStoreSearch] = useState(search)
  if (search !== prevStoreSearch) {
    setPrevStoreSearch(search)
    setSearchInput(search)
  }

  useEffect(() => {
    if (debouncedSearch !== search) setSearch(debouncedSearch)
  }, [debouncedSearch, search, setSearch])

  const { data: allBooks = [] } = useApprovedBooks()
  const categories = [...new Set(allBooks.map((b) => b.category).filter(Boolean))] as string[]

  const { data, isLoading, isError, isFetching } = useBooks({
    page,
    limit: PAGE_SIZE,
    search,
    sort,
    category: category || undefined,
    minRating: minRating || undefined,
    maxPrice: maxPrice < 2000 ? maxPrice : undefined,
    inStockOnly: inStockOnly || undefined,
  })

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1
  const hasActiveFilters = Boolean(
    search || category || sort !== BookSort.NEWEST || minRating > 0 || maxPrice < 2000 || inStockOnly
  )

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage)
    scrollToSection(EXPLORE_BOOKS_SECTION_ID)
  }

  const handleClear = () => {
    setSearchInput('')
    setSearch('')
    setCategory('')
    setMinRating(0)
    setMaxPrice(2000)
    setInStockOnly(false)
    setSort(BookSort.NEWEST)
  }

  return (
    <section id={EXPLORE_BOOKS_SECTION_ID} className="scroll-mt-20 bg-stone-50 py-12">
      <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8 w-full">
        
        {/* Mobile Filter Toggle & Search Toolbar */}
        <div className="flex flex-col gap-4 border-b border-stone-200 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search books, authors, ISBN…"
              aria-label="Search books"
              className="h-12 w-full rounded-full border border-stone-200 bg-white pl-12 pr-10 text-sm text-stone-800 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-[#f0532d] focus:ring-4 focus:ring-orange-500/10"
            />
            {searchInput ? (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearchInput('')}
                className="cursor-pointer absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
              >
                <FiX size={18} />
              </button>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="cursor-pointer inline-flex h-12 items-center gap-2 rounded-full border border-stone-200 bg-white px-5 text-sm font-bold text-[#16243d] shadow-sm lg:hidden hover:bg-stone-50"
            >
              <FiFilter className="text-[#f0532d]" /> Filters {hasActiveFilters && <span className="h-2 w-2 rounded-full bg-[#f0532d]" />}
            </button>

            <div className="relative min-w-[220px]">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as BookSort)}
                aria-label="Sort books"
                className="h-12 w-full cursor-pointer appearance-none rounded-full border border-stone-200 bg-white pl-5 pr-10 text-sm font-bold text-[#16243d] shadow-sm outline-none transition focus:border-[#f0532d]"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <FiChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-stone-500" size={16} />
            </div>
          </div>
        </div>

        {/* Results Meta & Active Helper Pills */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-stone-500 font-medium">
            Showing <span className="font-bold text-stone-800">{data?.total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, data?.total ?? 0)}</span> of <span className="font-bold text-stone-800">{data?.total ?? 0}</span> results
          </p>

          {hasActiveFilters ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 mr-1">Active filters:</span>
              {category && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-stone-200 px-3 py-1 text-xs font-bold text-[#16243d] shadow-sm">
                  {category}
                  <button type="button" onClick={() => setCategory('')} className="hover:text-red-600"><FiX /></button>
                </span>
              )}
              {minRating > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-stone-200 px-3 py-1 text-xs font-bold text-[#16243d] shadow-sm">
                  {minRating}★ & Up
                  <button type="button" onClick={() => setMinRating(0)} className="hover:text-red-600"><FiX /></button>
                </span>
              )}
              {maxPrice < 2000 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-stone-200 px-3 py-1 text-xs font-bold text-[#16243d] shadow-sm">
                  Under {formatCurrency(maxPrice)}
                  <button type="button" onClick={() => setMaxPrice(2000)} className="hover:text-red-600"><FiX /></button>
                </span>
              )}
              {inStockOnly && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-stone-200 px-3 py-1 text-xs font-bold text-[#16243d] shadow-sm">
                  In Stock Only
                  <button type="button" onClick={() => setInStockOnly(false)} className="hover:text-red-600"><FiX /></button>
                </span>
              )}
              {search && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-stone-200 px-3 py-1 text-xs font-bold text-[#16243d] shadow-sm">
                  "{search}"
                  <button type="button" onClick={() => { setSearchInput(''); setSearch('') }} className="hover:text-red-600"><FiX /></button>
                </span>
              )}
              <button type="button" onClick={handleClear} className="cursor-pointer text-xs font-bold text-[#f0532d] hover:underline ml-1">Reset All</button>
            </div>
          ) : null}
        </div>

        {/* Two Column Layout: Left Sidebar + Right Book Grid */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
          
          {/* Desktop Filter Sidebar */}
          <aside className={cn(
            'h-fit rounded-3xl border border-stone-200 bg-white p-6 shadow-sm space-y-8 text-left transition lg:block',
            !isMobileFilterOpen && 'hidden'
          )}>
            <div className="flex items-center justify-between lg:hidden border-b border-stone-100 pb-4">
              <h3 className="font-display text-lg font-bold text-[#16243d]">Filters</h3>
              <button type="button" onClick={() => setIsMobileFilterOpen(false)} className="cursor-pointer p-1"><FiX size={20} /></button>
            </div>

            {/* Department / Categories */}
            <div>
              <h3 className="font-display text-xs font-extrabold uppercase tracking-wider text-[#16243d]">Departments / Categories</h3>
              <div className="mt-3 space-y-1 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                <button
                  type="button"
                  onClick={() => setCategory('')}
                  className={cn(
                    'flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition',
                    !category
                      ? 'bg-[#0d2b1f] text-[#f5862e] shadow-sm'
                      : 'text-stone-600 hover:bg-stone-50'
                  )}
                >
                  <span>All Categories</span>
                  <span className="font-mono opacity-80">({allBooks.length})</span>
                </button>
                {categories.map((c) => {
                  const count = allBooks.filter((b) => b.category === c).length
                  const isActive = category === c
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategory(category === c ? '' : c)}
                      className={cn(
                        'flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition',
                        isActive
                          ? 'bg-[#0d2b1f] text-[#f5862e] shadow-sm'
                          : 'text-stone-600 hover:bg-stone-50'
                      )}
                    >
                      <span>{c}</span>
                      <span className="font-mono opacity-80">({count})</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Price Range */}
            <div className="border-t border-stone-100 pt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-xs font-extrabold uppercase tracking-wider text-[#16243d]">Max Price</h3>
                <span className="rounded-lg bg-orange-50 px-2.5 py-1 font-mono text-xs font-extrabold text-[#f0532d]">
                  {formatCurrency(maxPrice)}
                </span>
              </div>
              <input
                type="range"
                min={200}
                max={2000}
                step={100}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="cursor-pointer h-2 w-full appearance-none rounded-lg bg-stone-200 accent-[#f0532d]"
              />
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {[400, 800, 1200, 2000].map((pricePill) => (
                  <button
                    key={pricePill}
                    type="button"
                    onClick={() => setMaxPrice(pricePill)}
                    className={cn(
                      'cursor-pointer flex-1 rounded-xl border px-2.5 py-1.5 text-[11px] font-bold transition text-center',
                      maxPrice === pricePill
                        ? 'border-[#f0532d] bg-[#f0532d] text-white shadow-sm'
                        : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                    )}
                  >
                    {pricePill === 2000 ? 'Any' : `≤ ${formatCurrency(pricePill)}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer Reviews Rating */}
            <div className="border-t border-stone-100 pt-6">
              <h3 className="font-display text-xs font-extrabold uppercase tracking-wider text-[#16243d]">Customer Reviews</h3>
              <div className="mt-3 space-y-1">
                {[4, 3, 2, 1].map((stars) => {
                  const isActive = minRating === stars
                  return (
                    <button
                      key={stars}
                      type="button"
                      onClick={() => setMinRating(minRating === stars ? 0 : stars)}
                      className={cn(
                        'flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 transition',
                        isActive ? 'bg-amber-50 font-bold text-amber-900 ring-2 ring-amber-400/40 shadow-sm' : 'hover:bg-stone-50'
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        <RatingStars rating={stars} />
                        <span className="text-xs font-bold text-stone-700 mt-0.5">& Up</span>
                      </div>
                      {isActive && <FiCheck className="text-amber-700 shrink-0" size={14} strokeWidth={3} />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* In-Stock Availability */}
            <div className="border-t border-stone-100 pt-6">
              <h3 className="font-display text-xs font-extrabold uppercase tracking-wider text-[#16243d]">Availability</h3>
              <label className="cursor-pointer mt-3.5 flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50/50 p-3.5 transition hover:border-[#f0532d]">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="cursor-pointer h-4 w-4 rounded border-stone-300 text-[#f0532d] focus:ring-[#f0532d]"
                />
                <span className="text-xs font-bold text-stone-800">In Stock Only (Exclude Sold Out)</span>
              </label>
            </div>

            {/* Clear All */}
            {hasActiveFilters ? (
              <div className="border-t border-stone-100 pt-6">
                <Button type="button" variant="secondary" onClick={handleClear} className="w-full justify-center text-xs py-3">
                  Reset All Filters
                </Button>
              </div>
            ) : null}
          </aside>

          {/* Product Book Grid */}
          <div className={cn('min-w-0 transition-opacity', isFetching && !isLoading && 'opacity-60')}>
            {isLoading ? (
              <div className="py-20 text-center"><Loader /></div>
            ) : isError ? (
              <EmptyState
                title="Could not load catalog"
                description="Make sure JSON Server is running on port 4000."
              />
            ) : data && data.data.length === 0 ? (
              <div className="rounded-3xl border border-stone-200 bg-white p-12 text-center shadow-sm">
                <EmptyState
                  title="No books matched your criteria"
                  description="Try adjusting your filters, searching for something else, or resetting all options."
                />
                <Button type="button" onClick={handleClear} className="mt-6">
                  Reset Filters
                </Button>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3">
                  {data?.data.map((book) => (
                    <BookCard key={book.id} book={book} />
                  ))}
                </div>

                <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} className="mt-16" />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
