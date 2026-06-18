import { BookCard } from '@/components/books/BookCard'
import { EmptyState } from '@/components/common/EmptyState'
import { Loader } from '@/components/common/Loader'
import { BookSort } from '@/enums/sort.enum'
import { useBooks } from '@/hooks/useBooks'

export const NewArrivalsPage = () => {
  const { data, isLoading, isError } = useBooks({ sort: BookSort.NEWEST, limit: 20, page: 1 })
  const books = data?.data ?? []

  return (
    <>
      <section className="bg-[#0d2b1f] py-12 text-center text-white">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">Fresh In</p>
        <h1 className="font-display mt-2 text-4xl font-extrabold uppercase sm:text-5xl">
          New <span className="text-[#f5862e]">Arrivals</span>
        </h1>
        <p className="mx-auto mt-3 max-w-md px-4 text-sm leading-6 text-emerald-100/70">
          Discover the latest titles added to our marketplace this week.
        </p>
      </section>

      <section className="mx-auto max-w-8xl px-4 py-16 sm:px-6 lg:px-8">
        {isLoading ? (
          <Loader />
        ) : isError ? (
          <EmptyState
            title="Could not load books"
            description="Make sure the JSON server is running (npm run server) on port 4000."
          />
        ) : books.length === 0 ? (
          <EmptyState title="No new arrivals" description="Check back soon for freshly added books." />
        ) : (
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
