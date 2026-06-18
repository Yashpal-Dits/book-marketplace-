import { BookCard } from '@/components/books/BookCard'
import { EmptyState } from '@/components/common/EmptyState'
import { Loader } from '@/components/common/Loader'
import { DealsOfWeekSection } from '@/components/home/DealsOfWeekSection'
import { BookSort } from '@/enums/sort.enum'
import { useBooks } from '@/hooks/useBooks'

export const DealsPage = () => {
  const { data, isLoading, isError } = useBooks({ sort: BookSort.NEWEST, limit: 8, page: 1 })
  const books = data?.data ?? []

  return (
    <>
      <section className="bg-[#0d2b1f] py-12 text-center text-white">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">Limited Time</p>
        <h1 className="font-display mt-2 text-4xl font-extrabold uppercase sm:text-5xl">
          Deals & <span className="text-[#f5862e]">Offers</span>
        </h1>
        <p className="mx-auto mt-3 max-w-md px-4 text-sm leading-6 text-emerald-100/70">
          Grab the best discounts and curated picks before they are gone.
        </p>
      </section>

      <DealsOfWeekSection />

      <section className="mx-auto max-w-8xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f0532d]">Just Added</p>
          <h2 className="font-display mt-2 text-3xl font-extrabold uppercase text-[#16243d] sm:text-4xl">
            New Books This Week
          </h2>
        </div>

        <div className="mt-10">
          {isLoading ? (
            <Loader />
          ) : isError ? (
            <EmptyState
              title="Could not load books"
              description="Make sure the JSON server is running (npm run server) on port 4000."
            />
          ) : books.length === 0 ? (
            <EmptyState title="No new books" description="Check back soon for more additions." />
          ) : (
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
