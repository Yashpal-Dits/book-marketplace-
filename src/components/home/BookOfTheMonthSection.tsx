import { BookCard } from '@/components/books/BookCard'
import { EmptyState } from '@/components/common/EmptyState'
import { Loader } from '@/components/common/Loader'
import { useBestSellers } from '@/hooks/useBooks'

export const BookOfTheMonthSection = () => {
  // Same limit as BestSellersSection so both sections share ONE cached query
  // (one network request instead of two); we only render the top 4 here.
  const { data, isLoading, isError } = useBestSellers(6)
  const books = (data ?? []).slice(0, 4)

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <h2 className="font-display max-w-md text-3xl font-extrabold uppercase leading-tight text-[#16243d] sm:text-4xl">
          The #1 Book of the Month You Can't Miss
        </h2>
        <p className="max-w-sm text-sm leading-6 text-stone-500">
          An unforgettable read that's dominating the bestseller lists and changing how we see love,
          loss, and everything in between.
        </p>
      </div>

      <div className="mt-10">
        {isLoading ? (
          <Loader />
        ) : isError ? (
          <EmptyState title="Could not load books" description="Make sure the JSON server is running on port 4000." />
        ) : books.length === 0 ? (
          <EmptyState title="No books yet" description="Approved books will appear here." />
        ) : (
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
