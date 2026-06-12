import { ExploreBooksSection } from '@/components/home/ExploreBookSection'

export const BooksPage = () => (
  <>
    <section className="bg-[#0d2b1f] py-12 text-center text-white">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">Marketplace</p>
      <h1 className="font-display mt-2 text-4xl font-extrabold uppercase sm:text-5xl">
        Browse All <span className="text-[#f5862e]">Books</span>
      </h1>
      <p className="mx-auto mt-3 max-w-md px-4 text-sm leading-6 text-emerald-100/70">
        Search, sort and compare sellers across the entire catalog.
      </p>
    </section>
    <ExploreBooksSection />
  </>
)
