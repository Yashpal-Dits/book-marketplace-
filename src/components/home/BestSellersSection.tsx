import { Link } from 'react-router-dom'
import { FaFire } from 'react-icons/fa'
import { BookCard } from '@/components/books/BookCard'
import { BookCover } from '@/components/common/BookCover'
import { Loader } from '@/components/common/Loader'
import { useBestSellers } from '@/hooks/useBooks'
import { EXPLORE_BOOKS_SECTION_ID, scrollToSection } from '@/utils/scrollToSection'

export const BestSellersSection = () => {
  const { data: books = [], isLoading } = useBestSellers(6)
  const promoCovers = books.filter((b) => b.coverImage).slice(0, 3)

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <h2 className="font-display max-w-sm text-3xl font-extrabold uppercase leading-tight text-[#16243d] sm:text-4xl">
          Best Sellers of the Month
        </h2>
        <div className="flex flex-col items-start gap-3 md:items-end">
          <p className="max-w-xs text-sm leading-6 text-stone-500 md:text-right">
            These are the books everyone's reading, loving, and recommending right now.
          </p>
          <button
            type="button"
            onClick={() => scrollToSection(EXPLORE_BOOKS_SECTION_ID)}
            className="inline-flex h-9 items-center rounded-full bg-[#f0532d] px-5 text-xs font-semibold text-white transition hover:bg-[#d8431f]"
          >
            See More
          </button>
        </div>
      </div>

      {isLoading ? (
        <Loader />
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>

          {/* promo card */}
          <aside className="relative flex flex-col overflow-hidden rounded-2xl bg-[#101d33] p-6 text-center text-white">
            <div className="relative mx-auto mt-2 h-48 w-full max-w-[220px]">
              <div className="absolute inset-x-6 inset-y-0 rounded-xl bg-[#f5a73b]" />
              {promoCovers.map((book, i) => (
                <div
                  key={book.id}
                  className="absolute w-20 overflow-hidden rounded shadow-2xl"
                  style={{ left: `${10 + i * 32}%`, top: `${14 + (i % 2) * 12}%`, transform: `rotate(${i % 2 === 0 ? -8 : 7}deg)`, zIndex: i }}
                >
                  <BookCover src={book.coverImage} title={book.title} className="aspect-[3/4.2] w-full" />
                </div>
              ))}
            </div>

            <div className="mt-8">
              <FaFire className="mx-auto text-2xl text-[#f0532d]" />
              <h3 className="font-display mt-3 text-2xl font-extrabold uppercase leading-tight">
                Get <span className="text-[#f5a73b]">20% Off</span>
                <br /> Bestsellers
              </h3>
              <p className="mx-auto mt-3 max-w-[220px] text-xs leading-5 text-white/70">
                This week only — grab the books everyone's talking about at a lower price.
              </p>
              <Link
                to="/register"
                className="mt-5 inline-flex h-10 items-center rounded-full bg-[#f0532d] px-6 text-sm font-semibold text-white transition hover:bg-[#d8431f]"
              >
                Get This Offer
              </Link>
            </div>
          </aside>
        </div>
      )}
    </section>
  )
}
