import { useFormik } from 'formik'
import { useNavigate } from 'react-router-dom'
import { FiChevronDown, FiSearch } from 'react-icons/fi'
import { BookCover } from '@/components/common/BookCover'
import { useApprovedBooks } from '@/hooks/useBooks'
import { useBookFilterStore } from '@/store/bookFilter.store'
import { heroSearchSchema } from '@/schemas/newsletter.schema'

interface HeroSearchValues {
  search: string
  category: string
}

export const HeroSection = () => {
  const navigate = useNavigate()
  const { data: books = [] } = useApprovedBooks()
  const { setSearch, setCategory } = useBookFilterStore()

  const categories = [...new Set(books.map((b) => b.category).filter(Boolean))] as string[]
  const floatingCovers = books.filter((b) => b.coverImage).slice(0, 8)
  const left = floatingCovers.slice(0, 4)
  const right = floatingCovers.slice(4, 8)

  const formik = useFormik<HeroSearchValues>({
    initialValues: { search: '', category: '' },
    validationSchema: heroSearchSchema,
    onSubmit: (values) => {
      setSearch(values.search.trim())
      setCategory(values.category)
      navigate('/books')
    },
  })

  return (
    <section className="relative overflow-hidden bg-[#0d2b1f] pb-24 pt-16 text-white">
      {/* decorative sparkles */}
      <span className="absolute left-[18%] top-12 text-xl text-amber-400">✦</span>
      <span className="absolute right-[20%] top-24 text-sm text-emerald-300">✦</span>
      <span className="absolute bottom-24 left-[28%] text-sm text-orange-400">✦</span>
      <span className="absolute bottom-32 right-[30%] text-xl text-amber-300">✦</span>

      {/* floating covers — left */}
      <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-56 lg:block" aria-hidden>
        {left.map((book, i) => (
          <div
            key={book.id}
            className="absolute w-24 rotate-[-6deg] overflow-hidden rounded-md shadow-2xl"
            style={{ top: `${8 + i * 22}%`, left: `${i % 2 === 0 ? 8 : 52}%`, transform: `rotate(${i % 2 === 0 ? -7 : 5}deg)` }}
          >
            <BookCover src={book.coverImage} title={book.title} className="aspect-[3/4.3] w-full" />
          </div>
        ))}
      </div>

      {/* floating covers — right */}
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-56 lg:block" aria-hidden>
        {right.map((book, i) => (
          <div
            key={book.id}
            className="absolute w-24 overflow-hidden rounded-md shadow-2xl"
            style={{ top: `${10 + i * 21}%`, right: `${i % 2 === 0 ? 10 : 50}%`, transform: `rotate(${i % 2 === 0 ? 6 : -5}deg)` }}
          >
            <BookCover src={book.coverImage} title={book.title} className="aspect-[3/4.3] w-full" />
          </div>
        ))}
      </div>

      <div className="relative mx-auto max-w-3xl px-4 text-center">
        <h1 className="font-display text-[44px] font-extrabold uppercase leading-[1.05] tracking-tight sm:text-6xl">
          The Next{' '}
          <span className="text-emerald-400">Chapter</span> in{' '}
          <span className="text-[#f5862e]">Your</span>
          <br />
          Reading <span className="relative">Journey<span className="absolute -right-6 -top-2 text-lg text-amber-400">✦</span></span>
        </h1>
        <p className="mx-auto mt-6 max-w-md text-sm leading-6 text-emerald-100/70">
          Browse a curated collection of page-turners, slow burns, and life-changing reads crafted to
          match your unique taste.
        </p>

        {/* search bar */}
        <form
          onSubmit={formik.handleSubmit}
          className="mx-auto mt-10 flex max-w-xl items-center gap-1 rounded-full bg-white p-1.5 pl-2 shadow-2xl shadow-black/30"
          role="search"
        >
          <div className="relative hidden shrink-0 sm:block">
            <select
              name="category"
              value={formik.values.category}
              onChange={formik.handleChange}
              aria-label="Category"
              className="h-10 cursor-pointer appearance-none rounded-full bg-stone-100 pl-4 pr-9 text-xs font-semibold text-stone-700 outline-none"
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
          <input
            type="text"
            name="search"
            value={formik.values.search}
            onChange={formik.handleChange}
            placeholder="Search 1 million books by title, author or ISBN"
            className="h-10 w-full flex-1 bg-transparent px-3 text-sm text-stone-800 outline-none placeholder:text-stone-400"
          />
          <button
            type="submit"
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-[#f0532d] px-5 text-sm font-semibold text-white transition hover:bg-[#d8431f]"
          >
            <FiSearch /> Search
          </button>
        </form>
        {formik.errors.search ? (
          <p className="mt-2 text-xs text-orange-300">{formik.errors.search}</p>
        ) : null}
      </div>
    </section>
  )
}
